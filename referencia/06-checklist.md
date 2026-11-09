# 06 — Checklist antes de entregar

## Modelo

- [ ] `node modelos/validar.mjs blueprint.json` sem ERRO.
- [ ] Todo conceito tem descrição de uma ou duas frases, com os estados principais.
- [ ] Nenhum conceito solto (o validador avisa quem não aparece em relação nem fluxo).
- [ ] Relações com verbo de negócio, apontando do dono para o dependente.
- [ ] Chaves estrangeiras conferidas na coluna, não pelo nome do conceito.
- [ ] Sistemas externos e jobs presentes onde os fluxos passam por eles.

## Fluxos

- [ ] Cada fluxo cita os arquivos de onde saiu.
- [ ] Mudanças de estado com os valores reais do enum (`paid → refunded`).
- [ ] Mensagens de erro copiadas do código, literalmente.
- [ ] Quem grava o resultado está explícito (webhook, job), não só a requisição.
- [ ] Divergências entre caminhos do código aparecem no passo, com a fonte.
- [ ] Nada inventado: o que não foi encontrado está dito como tal.
- [ ] Variantes ligadas ao fluxo principal (`variantOf`).

## Visual

- [ ] `tokens.css` preenchido com as cores do projeto, cada valor com a origem comentada.
- [ ] Cor de ação em `--bp-accent`, destaque em `--bp-highlight`; uma cor de acento só.
- [ ] Contraste AA de texto de apoio e de texto sobre a cor de ação.
- [ ] Fonte do projeto em `--bp-font` (e o aviso, se ela não estiver instalada).

## Conferência no navegador

- [ ] O HTML abre sem rede e sem erro no console.
- [ ] O diagrama inteiro cabe ao ajustar (`F`) e os nomes não aparecem cortados.
- [ ] Cada fluxo destaca um caminho que faz sentido (sem passos soltos inesperados).
- [ ] A apresentação percorre todos os passos e o link `#fluxo=…&passo=…` funciona.
- [ ] Documento e exportação `.md` saem com todos os passos.

## Entrega

- [ ] Onde estão os três arquivos e como abrir.
- [ ] O que foi coberto e o que ficou de fora.
- [ ] As divergências encontradas no código, em lista curta.
