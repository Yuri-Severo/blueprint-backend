# 05 — A visualização

## O visualizador pronto (`modelos/visualizador.html`)

Arquivo único, sem dependências e sem rede. O `montar.mjs` troca duas partes:

- `<style id="bp-tokens">` entre `/* BP-TOKENS:INICIO */` e `/* BP-TOKENS:FIM */`
  → o `tokens.css` do projeto;
- `<script type="application/json" id="bp-dados">` → o `blueprint.json`.

### Como ele desenha

| Elemento | Regra |
|---|---|
| Layout | Em camadas, da esquerda para a direita, seguindo a direção das relações (`from` antes de `to`). Ciclos são quebrados; atores entram primeiro. Dentro de cada coluna, os conceitos são ordenados pelo baricentro dos vizinhos para cruzar menos. |
| Conceito | Cartão com ícone num círculo `--bp-highlight`, nome e selo do tipo. Sistema: borda tracejada. Ator: pílula. Largura cresce com o nome. |
| Relação | Curva da lateral de um conceito à do outro, com seta e o verbo numa pílula. De longe (zoom < 70%), as pílulas comuns somem para não virar ruído. |
| Fluxo destacado | O resto esmaece; os conceitos do caminho ganham os números dos passos; as relações usadas ficam fortes com pílulas "n · ação". Passo entre conceitos sem relação vira **seta tracejada** com a pílula. |
| Fundo | Grade de pontos `--bp-dot` sobre `--bp-bg`. |

### Interação

| Ação | Como |
|---|---|
| Escolher fluxo | Lista à esquerda (`L` mostra/esconde) ou busca |
| Apresentar | Botão **Apresentar** ou `P`; `←` `→` navegam; `Esc` sai. A câmera enquadra os dois conceitos do passo na metade de cima; o cartão do passo fica embaixo. |
| Detalhe de conceito | Clique no conceito: descrição, atributos, relações e fluxos em que aparece |
| Documento | Botão **Documento** ou `D`: o fluxo (ou todos) como texto corrido — é o que sai na impressão/PDF |
| Exportar | **Exportar .md** baixa o fluxo ativo (ou todos) em markdown |
| Buscar | `/` — conceitos (inclusive por nome de atributo) e fluxos |
| Câmera | Arrastar move; roda do mouse dá zoom no cursor; `F` ajusta; `+`/`-` |
| Link direto | `blueprint.html#fluxo=<id>&passo=<n>` abre no passo |

### Limites conhecidos

- O layout é bom até ~40 conceitos; acima disso, faça recortes.
- Fontes não são embutidas (o arquivo funciona sem rede): sem a fonte instalada,
  vale a próxima da lista em `--bp-font`.
- É só leitura: para editar, edite o `blueprint.json` e monte de novo.

## Evoluindo para um app (quando o HTML não bastar)

Se a equipe quiser editar no navegador, salvar versões e compartilhar, esta
arquitetura funciona bem para a mesma ideia:

| Peça | Escolha | Por quê |
|---|---|---|
| Canvas | React Flow (`@xyflow/react`) com nós e arestas customizados | viewport, seleção e portas prontos |
| Auto-layout | ELK (`elkjs`, algoritmo `layered`, direção `RIGHT`) num Web Worker, carregado sob demanda | colunas por camada sem travar a tela; o pacote é grande |
| Modelo | Um documento JSON por projeto, validado por zod num pacote compartilhado entre frontend e API | uma fonte de verdade; validação igual nos dois lados |
| Vistas | Conceitual (principal), ER (só entidades, com atributos e cardinalidades) e Telas (onde os passos aparecem) derivadas do mesmo documento | nada é desenhado duas vezes |
| Passo de fluxo | `from → to : action`, ligado automaticamente à relação entre os dois; sem relação, seta tracejada | o mesmo do HTML |
| Regras de consistência | Apagar conceito apaga os passos com ele; apagar relação solta os passos; trocar `from`/`to` religa | o documento nunca fica inválido |
| Persistência | Documento em `jsonb`, autosave com debounce e `If-Match` (409 em conflito), versões | simples e seguro sem colaboração em tempo real |
| Gravação de fluxo | Clicar nos conceitos em ordem cria os passos | rápido para quem conhece o sistema |
| Cores | As mesmas variáveis semânticas deste guia, mapeadas para os tokens do produto | o app parece parte do produto |

Comece pelo HTML: ele valida o modelo e o vocabulário com a equipe antes de
qualquer investimento em app.
