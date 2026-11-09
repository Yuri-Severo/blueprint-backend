# 02 — O formato `blueprint.json`

Schema formal: [`../modelos/blueprint.schema.json`](../modelos/blueprint.schema.json).
Validação de referências: `node modelos/validar.mjs blueprint.json`.
Exemplo completo: [`../exemplos/loja-aurora/blueprint.json`](../exemplos/loja-aurora/blueprint.json) (projeto fictício).

## Estrutura

```json
{
  "project":   { "name": "…", "description": "…", "source": "repo · caminho", "generatedAt": "AAAA-MM-DD", "locale": "pt-BR" },
  "concepts":  [ … ],
  "relations": [ … ],
  "flows":     [ … ]
}
```

## `concepts`

```json
{
  "id": "ent_orders",
  "name": "Pedido",
  "code": "ORDERS",
  "kind": "entity",
  "description": "Uma compra fechada. Nasce `pending_payment`, vira `paid` quando o pagamento confirma.",
  "source": "src/orders/order.entity.ts",
  "attributes": [
    { "name": "id", "label": "Id", "type": "id", "pk": true },
    { "name": "userId", "label": "Comprador", "type": "id", "fk": "USERS" },
    { "name": "status", "label": "Situação", "type": "enum", "values": ["pending_payment", "paid", "canceled"] }
  ]
}
```

| Campo | Regra |
|---|---|
| `id` | Minúsculas, números e `_`. Prefixo pelo tipo ajuda a ler: `ent_`, `sys_`, `act_`. Estável: fluxos apontam para ele. |
| `name` | Nome humano no idioma do produto, curto ("Pedido de reembolso"). |
| `code` | Nome técnico: tabela (`ORDER_ITEMS`), serviço (`PSP`, `API DE FRETE`), canal (`APP`, `PAINEL ADMIN`). |
| `kind` | `entity`, `system` ou `actor` (ver 01). |
| `description` | **Uma ou duas frases** do que o conceito é no negócio, com os estados principais. O validador avisa quando falta. |
| `attributes` | Só em `entity`, e só os que importam para os fluxos (chave, chaves estrangeiras, status, valores, datas que mudam regra). `fk` aponta para o `code` de outro conceito. |

## `relations`

```json
{ "id": "rel_12", "from": "ent_payments", "to": "sys_gateway", "label": "é processado no", "cardinality": ["1", "1"] }
```

- `label` é um **verbo lido de `from` para `to`** ("Pedido *gera* Envio").
- Uma relação por par de conceitos. Se dois verbos ligam o mesmo par, fique com
  o que os fluxos usam e cite o outro na descrição. (O validador avisa; os
  fluxos usam a primeira relação do par.)
- A direção importa para o layout: o visualizador põe `from` à esquerda de
  `to`. Aponte do "dono" para o "dependente" (Conta → Carrinho → Pedido), de
  ator para o que ele toca, e do backend para o sistema externo.
- `cardinality` é opcional: `["1", "0..*"]` aparece no painel do conceito.

## `flows`

```json
{
  "id": "flw_confirmar",
  "name": "Confirmar o pagamento",
  "summary": "O gateway avisa por webhook que o dinheiro entrou. É este fluxo, e não o checkout, que grava o pedido como pago.",
  "actor": "Gateway de pagamento (webhook)",
  "trigger": "O gateway chama `POST /webhooks/payments`",
  "outcome": "Pedido `paid` e estoque baixado",
  "sources": ["src/webhooks/payments.webhook.ts"],
  "steps": [
    {
      "title": "Receber o webhook",
      "from": "sys_gateway",
      "to": "ent_payments",
      "action": "confirma por webhook",
      "description": "Quem grava o resultado é o webhook, não a requisição do checkout.",
      "changes": ["Pagamento: `pending → paid`"],
      "rules": ["Assinatura conferida antes de qualquer escrita.", "Idempotente por `providerEventId`."],
      "errors": ["Assinatura inválida."],
      "also": ["ent_orders"],
      "source": "src/webhooks/payments.webhook.ts"
    }
  ]
}
```

| Campo | Regra |
|---|---|
| `name` | Verbo no infinitivo + objeto, do ponto de vista de quem executa ("Devolver e reembolsar"). |
| `summary` | Para que serve e **de onde saiu** (arquivos). |
| `actor` / `trigger` / `outcome` | Texto livre curto. `outcome` com o estado final (`refunded`). |
| `variantOf` | `id` do fluxo principal quando este é um desvio dele ("cancelar antes do envio" é variante de "devolver e reembolsar"). |
| `steps[].from` / `to` | Conceitos. Sem `to`, o passo acontece dentro de `from` (um job que roda, uma validação). |
| `steps[].action` | Verbo curto que cabe numa pílula ("confirma por webhook"). |
| `steps[].changes` | Mudanças de estado no formato `Conceito: \`antes → depois\``. |
| `steps[].rules` | Uma regra por item, como o código aplica. |
| `steps[].errors` | Mensagens reais, copiadas do código (mesmo se estiverem em outro idioma ou com erro de digitação — diga isso). |
| `steps[].also` | Outros conceitos lidos ou gravados no passo. |

Textos aceitam markdown curto: `**negrito**`, `` `código` ``, `_itálico_` e
listas com `-` (na descrição).

## Idioma (`project.locale`)

A interface do visualizador (botões, títulos de seção) sai em `"pt-BR"`
(padrão) ou `"en"`. Escolha o idioma de quem vai ler. Os textos do modelo —
nomes, regras, erros — ficam como você escreveu: nomes humanos no idioma do
produto, nomes técnicos e mensagens de erro exatamente como estão no código.

## Ordem e ids

- Fluxos na ordem em que um desenvolvedor novo deveria ler (o "caminho feliz"
  principal primeiro).
- Ids estáveis entre versões do levantamento: links diretos usam
  `blueprint.html#fluxo=<id>&passo=<n>`.
