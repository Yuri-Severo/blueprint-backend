# 04 — Identidade visual: as cores do projeto, não as nossas

O visualizador só lê variáveis `--bp-*`. Seu trabalho é achar as **fontes de
verdade** do design do projeto e traduzi-las para essas variáveis num
`tokens.css`, comentando de onde veio cada valor. Comece copiando
[`../modelos/tokens.css`](../modelos/tokens.css).

## 1. Onde procurar (em ordem de confiança)

1. **Arquivo de tokens declarado**: `tokens.css`, `tokens.json`,
   `design-tokens/`, `theme.ts`, pacotes `@*/ui`, `@*/theme`, `@*/design-system`.
2. **Tailwind**: `tailwind.config.{js,ts}` (`theme.extend.colors`,
   `fontFamily`, `borderRadius`) ou, no Tailwind 4, `@theme { --color-… }` no
   CSS principal.
3. **CSS global** do app principal: variáveis em `:root` e `.dark`
   (shadcn/ui usa `--background`, `--foreground`, `--primary`, `--muted`,
   `--accent`, `--border`, `--radius`).
4. **Bibliotecas de componentes**: tema do MUI (`createTheme`), Chakra
   (`extendTheme`), Mantine, Vuetify, Bootstrap (`$primary` no SCSS).
5. **Mobile**: `theme.ts`/`colors.ts` em React Native, `Color.xcassets`,
   `colors.xml`.
6. **Documentação de design** do repositório (`docs/design`, `brand`, `README`
   de UI) e regras escritas ("o azul é a cor de ação; o amarelo marca seleção").
7. **Logo/SVG da marca** quando nada acima existe: tire a cor de marca do
   `fill` do logo.

Prefira o app que a equipe interna usa (painel, backoffice): o blueprint é
ferramenta interna e deve parecer com ele. Se o projeto tem vários apps com
paletas diferentes, use a do produto principal e diga qual escolheu.

## 2. Mapeamento para `--bp-*`

| Variável | Papel no visualizador | Procure no projeto |
|---|---|---|
| `--bp-font` / `--bp-font-mono` | Texto e nomes técnicos | `font-family` do app; fonte de código |
| `--bp-bg` | Fundo da área do diagrama | neutro claro de fundo de página (`muted`, `gray-50`, `background`) |
| `--bp-dot` | Pontos da grade | cinza entre o fundo e a borda (`gray-300`) |
| `--bp-surface` | Cartões e painéis | `card`/`background`/branco do produto |
| `--bp-surface-2` | Chips e linhas dentro de cartões | `muted`/`secondary` claro |
| `--bp-border` | Divisórias | `border` (de preferência com transparência) |
| `--bp-text` / `-soft` / `-faint` | Texto principal, apoio, metadado | `foreground`, `muted-foreground`, cinza de legenda |
| `--bp-accent` | **Cor de ação**: números dos passos, botão principal | `primary`/cor da marca |
| `--bp-accent-text` | Texto sobre a cor de ação | `primary-foreground` |
| `--bp-highlight` | **Ativo/selecionado**: fundo do item ativo e do ícone | `accent`, tom claro da marca |
| `--bp-highlight-text` | Texto/ícone sobre o highlight | `accent-foreground` |
| `--bp-edge` / `--bp-edge-strong` | Relações e o caminho do fluxo | cor da marca e uma versão mais escura (hover/pressed) |
| `--bp-ok` / `--bp-warn` / `--bp-warn-bg` / `--bp-danger` | Marcadores de regra e de erro | `success`, `warning`, `destructive` |
| `--bp-radius` / `--bp-radius-sm` | Cartões / botões | `--radius` e o raio de botão |
| `--bp-shadow` / `--bp-shadow-float` | Cartões / painéis flutuantes | sombras do design system |

### Formatos de cor

O CSS aceita qualquer formato válido. Se o projeto usa `oklch(...)`,
`hsl(var(--x))` ou nomes do Tailwind, **resolva para o valor final** (o
visualizador não carrega o CSS do projeto). Ex.: `bg-slate-50` → `#f8fafc`.

## 3. Regras de bom senso

- **Uma cor de acento.** Se a marca tem duas (ex.: azul de ação e amarelo de
  destaque), a de ação vai em `--bp-accent` e a de destaque em
  `--bp-highlight`. Não espalhe vermelho/âmbar fora de erro e atenção.
- **Contraste AA**: `--bp-text-soft` sobre `--bp-surface` e
  `--bp-accent-text` sobre `--bp-accent` precisam de 4,5:1. Se a cor da marca
  for clara demais para texto branco, use a versão escura dela no accent.
- **Não invente tom.** Se o projeto não tem um papel (ex.: não há cinza de
  borda), derive de um que tem (texto com 8% de opacidade) e escreva isso no
  comentário.
- **Fonte**: use o nome exato da família do projeto e deixe alternativas de
  sistema depois. O HTML não baixa fontes (funciona sem rede); se a fonte não
  estiver instalada, o navegador usa a próxima da lista — diga isso ao usuário.
- **Tema escuro**: só se o projeto tiver um; preencha o bloco
  `@media (prefers-color-scheme: dark)` com os mesmos papéis.
- **Sem identidade definida**: mantenha os valores padrão do
  `modelos/tokens.css` e avise na entrega.

## 4. Exemplo

[`../exemplos/loja-aurora/tokens.css`](../exemplos/loja-aurora/tokens.css)
(projeto fictício): a paleta vem de um `theme.ts` com índigo, pêssego e
neutros, e o raio vem do CSS do painel administrativo. A regra da marca
("índigo é a cor de ação; pêssego marca o item selecionado") decidiu o
mapeamento de `--bp-accent` e `--bp-highlight`. Repare que cada linha diz de
onde veio o valor, e que a borda, que o tema não define, foi derivada do texto
com 10% de opacidade — e isso está escrito.
