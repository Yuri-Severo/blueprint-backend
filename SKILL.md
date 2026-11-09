---
name: blueprint-backend
description: Gera um diagrama navegável do backend de qualquer projeto — modelo conceitual (entidades, sistemas e atores) com os fluxos de negócio desenhados por cima, passo a passo — num único HTML com as cores e a tipografia do próprio projeto. Use quando um desenvolvedor precisa entender como o backend funciona, ao entrar num projeto, antes de mexer num fluxo, para revisar regras de negócio ou documentar "como X acontece". Gatilhos: "diagrama do backend", "mapa do domínio", "modelo conceitual", "fluxos de negócio", "como funciona o fluxo de…", "onboarding no backend", "blueprint".
---

# Blueprint do backend

Você vai produzir **um arquivo HTML** que mostra o backend como um diagrama:
conceitos (tabelas, serviços externos, filas, quem age) ligados por relações, e
os **fluxos** — "finalizar a compra", "reembolsar um pedido" — desenhados sobre
esse modelo com os passos numerados. O desenvolvedor abre o arquivo no
navegador, escolhe um fluxo e vê quem conversa com quem, em que ordem, o que
muda de estado, as regras e as mensagens de erro reais.

O visual segue o projeto que está sendo documentado: as cores, a fonte e os
raios vêm dos tokens dele, não de uma paleta genérica.

## O que entregar

```
<pasta de saída escolhida com o usuário>/
├── blueprint.json        o modelo (conceitos, relações, fluxos)
├── tokens.css            cores, fontes e raios do projeto, com a origem de cada valor
└── blueprint.html        o visualizador montado (abre direto no navegador, sem rede)
```

Não grave dentro do repositório do projeto sem o usuário pedir: o diagrama é
material de apoio, não código do produto.

## Passo a passo

1. **Combine o escopo** com o usuário em uma frase: o backend inteiro ou um
   recorte (ex.: "venda e reembolso"), e onde salvar. Se ele não disser, faça
   o recorte dos fluxos principais (5 a 10) e salve fora do repositório.
2. **Levante o backend** seguindo [`referencia/03-levantar-o-backend.md`](referencia/03-levantar-o-backend.md):
   entidades a partir do schema, sistemas a partir das integrações, atores a
   partir dos papéis, fluxos a partir dos casos de uso. Tudo com fonte no
   código; nada inventado.
3. **Escreva o `blueprint.json`** no formato de [`referencia/02-modelo-json.md`](referencia/02-modelo-json.md)
   (schema em `modelos/blueprint.schema.json`).
4. **Valide**: `node modelos/validar.mjs blueprint.json`. Corrija todo ERRO;
   leia os avisos e resolva os que forem lacuna de verdade (conceito sem
   descrição, fluxo sem fonte).
5. **Extraia a identidade visual** do projeto seguindo
   [`referencia/04-identidade-visual.md`](referencia/04-identidade-visual.md)
   e preencha uma cópia de `modelos/tokens.css`, comentando a origem de cada
   valor.
6. **Monte**: `node modelos/montar.mjs blueprint.json tokens.css blueprint.html`.
7. **Confira** abrindo o HTML (ou com Playwright, se disponível): o diagrama
   aparece, cada fluxo destaca o caminho, a apresentação percorre os passos,
   não há erro no console. Use [`referencia/06-checklist.md`](referencia/06-checklist.md).
8. **Entregue** dizendo o que cobriu, o que ficou de fora e as divergências
   que o levantamento encontrou no código (elas costumam ser a parte mais útil).

## Regras que não se negociam

- **Fonte no código.** Cada fluxo cita os arquivos de onde saiu; regras e
  mensagens de erro são copiadas do código, não parafraseadas de memória.
  Quando dois caminhos do código divergem, o passo diz isso.
- **Nada inventado.** Se não achou, escreva "não encontrado" ou deixe de fora.
  Um diagrama bonito com regra falsa é pior que nenhum.
- **Cores do projeto.** Não use a paleta padrão do visualizador quando o
  projeto tem identidade própria. Sem identidade definida, use a padrão e diga.
- **Idioma do produto** nos nomes humanos ("Pedido", "Envio"); nomes
  técnicos (`orders`, `paid`) e mensagens de erro ficam como estão no código.
  A interface do visualizador sai em `pt-BR` ou `en` (`project.locale`):
  escolha o idioma de quem vai ler.
- **Não edite `modelos/visualizador.html`** para um projeto específico: tudo o
  que muda por projeto entra pelo `blueprint.json` e pelo `tokens.css`.

## Mapa da pasta

| Arquivo | Para quê |
|---|---|
| `referencia/01-o-que-e.md` | A ideia: um modelo, fluxos por cima; o que mostrar e o que não mostrar |
| `referencia/02-modelo-json.md` | Formato do `blueprint.json`, campo a campo, com exemplos |
| `referencia/03-levantar-o-backend.md` | Como achar entidades, sistemas, atores, relações e fluxos em qualquer stack |
| `referencia/04-identidade-visual.md` | Onde achar as cores e fontes do projeto e como mapear para `--bp-*` |
| `referencia/05-visualizacao.md` | Como o visualizador desenha e se comporta; como evoluir para um app |
| `referencia/06-checklist.md` | Conferência antes de entregar |
| `modelos/visualizador.html` | O visualizador (arquivo único, sem dependências) |
| `modelos/tokens.css` | Modelo dos tokens a preencher |
| `modelos/blueprint.schema.json` | JSON Schema do modelo |
| `modelos/validar.mjs` | Validação de formato e referências (Node, sem dependências) |
| `modelos/montar.mjs` | Valida e injeta modelo + tokens no visualizador |
| `exemplos/loja-aurora/` | Exemplo completo e fictício: backend de uma loja virtual (6 fluxos, com variante, jobs, webhooks e uma divergência entre app e API) |
| `guia.html` | Este guia em HTML, para pessoas |
