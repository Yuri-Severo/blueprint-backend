#!/usr/bin/env node
// Monta o HTML final do blueprint: valida o modelo e injeta as cores do
// projeto e o modelo no visualizador. Sem dependências.
// Uso: node montar.mjs blueprint.json tokens.css saida.html

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [modelo, tokens, saida] = process.argv.slice(2);
if (!modelo || !tokens || !saida) {
	console.error("uso: node montar.mjs blueprint.json tokens.css saida.html");
	process.exit(2);
}
const aqui = dirname(fileURLToPath(import.meta.url));

try {
	execFileSync(process.execPath, [join(aqui, "validar.mjs"), modelo], { stdio: "inherit" });
} catch {
	console.error("\nmodelo com erro: corrija antes de montar.");
	process.exit(1);
}

const dados = JSON.parse(readFileSync(modelo, "utf8"));
delete dados.$schema;
const css = readFileSync(tokens, "utf8");
let html = readFileSync(join(aqui, "visualizador.html"), "utf8");

const INI = "/* BP-TOKENS:INICIO", FIM = "/* BP-TOKENS:FIM */";
const a = html.indexOf(INI), b = html.indexOf(FIM);
if (a < 0 || b < 0) throw new Error("marcadores de tokens não encontrados no visualizador");
html = html.slice(0, a) + `/* BP-TOKENS:INICIO — de ${tokens} */\n${css.trim()}\n` + html.slice(b);

// `</` dentro do JSON fecharia o <script>; < mantém o JSON válido.
const json = JSON.stringify(dados).replace(/</g, "\\u003c");
html = html.replace(/(<script type="application\/json" id="bp-dados">)[\s\S]*?(<\/script>)/, (_, x, y) => `${x}\n${json}\n${y}`);

writeFileSync(saida, html);
console.log(`montado: ${saida}`);
