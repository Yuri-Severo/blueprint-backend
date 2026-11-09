# Blueprint do backend — skill

Skill para que uma IA gere, para **qualquer projeto**, um diagrama navegável do
backend: o modelo conceitual (entidades, sistemas e atores) com os fluxos de
negócio desenhados por cima, num único HTML com as cores do próprio projeto.

- **Para a IA:** comece por [`SKILL.md`](SKILL.md).
- **Para pessoas:** abra [`guia.html`](guia.html) no navegador.
- **Exemplo pronto:** [`exemplos/loja-aurora/loja-aurora-blueprint.html`](exemplos/loja-aurora/loja-aurora-blueprint.html) — uma loja virtual fictícia.

## Uso rápido

```bash
# 1. valide o modelo
node modelos/validar.mjs meu-projeto/blueprint.json
# 2. monte o HTML com as cores do projeto
node modelos/montar.mjs meu-projeto/blueprint.json meu-projeto/tokens.css meu-projeto/blueprint.html
```

Precisa só de Node 18+. O HTML final abre direto no navegador, sem rede.

## Instalar como skill

Copie (ou faça um link simbólico de) esta pasta para a pasta de skills do seu
agente, por exemplo `~/.claude/skills/blueprint-backend/`. O `SKILL.md` tem o
cabeçalho com nome e gatilhos.
