# 01 — O que é o blueprint do backend

## A ideia em uma frase

Um **modelo conceitual** do backend (o que existe e como se relaciona) com os
**fluxos de negócio** desenhados por cima (quem faz o quê, em que ordem, o que
muda), para que um desenvolvedor entenda o sistema sem ler o código inteiro.

## Por que conceitual, e não ER nem diagrama de sequência

- O **ER** mostra tabelas e colunas, mas não mostra o gateway de pagamento, a
  fila que expira o pedido não pago, nem quem aperta o botão. É onde o
  desenvolvedor fica perdido.
- O **diagrama de sequência** mostra a ordem, mas de um fluxo só e sem o mapa
  ao redor: não dá para ver que "Pedido" aparece em seis fluxos.
- O **conceitual com fluxos** junta os dois: o mapa fica parado e cada fluxo
  acende o seu caminho nele. Ao trocar de fluxo, o desenvolvedor vê o mesmo
  "Pedido" sendo tocado por caminhos diferentes.

## Os três tipos de conceito

| Tipo | O que é | Exemplos | Como aparece |
|---|---|---|---|
| `entity` | Algo que o backend guarda (tabela, coleção, agregado) | Pedido, Produto, Conta | Cartão sólido com ícone de banco |
| `system` | Algo com que o backend conversa ou que roda sozinho | Gateway de pagamento, fila de jobs, provedor de e-mail, transportadora | Cartão de borda tracejada |
| `actor` | Quem age de fora | Comprador, equipe de suporte, operador de caixa | Pílula com ícone de pessoa |

Use `system` também para trabalho em segundo plano que não é de terceiros
(cron, worker, fila): ele "age" nos fluxos como um ator automático.

## O que é um passo de fluxo

Uma interação entre dois conceitos: **quem age → sobre o quê, com qual ação**.

```
Equipe → Pedido      : pede o estorno
Pedido → Gateway     : estorna
Gateway → Pedido     : confirma por webhook      ← quem grava é o webhook
Pedido → Estoque     : devolve ao estoque
```

Cada passo carrega o que um desenvolvedor precisa antes de mexer:

- **mudanças de estado** (`Pedido: paid → refunded`);
- **regras** (prazos, permissões, validações);
- **o que pode dar errado**, com a mensagem real que o código devolve;
- outros conceitos que o passo toca;
- a **fonte** (arquivo) de onde a regra saiu.

Quando existe uma relação entre os dois conceitos do passo, o número do passo
aparece na própria relação. Quando não existe, o visualizador desenha uma seta
tracejada — e isso já é informação: dois conceitos conversam num fluxo sem
estarem modelados como relacionados.

## O que mostrar e o que deixar de fora

Mostre o que muda a forma como o desenvolvedor pensa o sistema:

- os 5 a 10 fluxos que movem dinheiro, estado ou acesso;
- as tabelas que esses fluxos tocam (não todas as tabelas do banco);
- os sistemas externos e os jobs, porque é onde os fluxos costumam "sumir";
- divergências entre caminhos do código (o app aceita X, o servidor recusa).

Deixe de fora: tabelas de junção sem significado próprio, colunas de auditoria,
detalhes de framework, endpoints um a um. O diagrama é de domínio, não de API.

## Para quem é

Para **o desenvolvedor do projeto** e para **a IA que ajuda esse
desenvolvedor**: o `blueprint.json` também serve de contexto compacto do
domínio para outras tarefas ("onde eu mexo para mudar o prazo de reembolso?").
