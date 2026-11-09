#!/usr/bin/env node
// Confere um blueprint.json: formato, ids únicos e referências entre ids.
// Sem dependências. Uso: node validar.mjs caminho/blueprint.json
// Sai com código 1 se houver erro; avisos não bloqueiam.

import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
	console.error("uso: node validar.mjs caminho/blueprint.json");
	process.exit(2);
}

let doc;
try {
	doc = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
	console.error(`não consegui ler ${file}: ${e.message}`);
	process.exit(1);
}

const errors = [];
const warnings = [];
const err = (path, msg) => errors.push(`${path}: ${msg}`);
const warn = (path, msg) => warnings.push(`${path}: ${msg}`);
const isStr = (v) => typeof v === "string" && v.length > 0;
const KINDS = ["entity", "system", "actor"];
const CARDS = ["1", "0..1", "0..*", "1..*"];

if (!doc || typeof doc !== "object") err("$", "o documento precisa ser um objeto");
if (!isStr(doc?.project?.name)) err("project.name", "obrigatório");
for (const key of ["concepts", "relations", "flows"]) {
	if (!Array.isArray(doc?.[key])) err(key, "precisa ser uma lista");
}
if (errors.length) finish();

const ids = new Map();
const codes = new Set();
const unique = (id, path) => {
	if (!isStr(id)) return err(path, "id obrigatório");
	if (ids.has(id)) err(path, `id repetido: ${id} (já usado em ${ids.get(id)})`);
	ids.set(id, path);
};

const concepts = new Map();
doc.concepts.forEach((c, i) => {
	const p = `concepts[${i}]`;
	unique(c.id, `${p}.id`);
	if (isStr(c.id) && !/^[a-z][a-z0-9_]*$/.test(c.id)) err(`${p}.id`, "use minúsculas, números e _ (ex.: ent_orders)");
	if (!isStr(c.name)) err(`${p}.name`, "obrigatório");
	if (!KINDS.includes(c.kind)) err(`${p}.kind`, `use ${KINDS.join(", ")}`);
	if (c.kind !== "entity" && c.attributes?.length) warn(`${p}.attributes`, "atributos só aparecem em entidades");
	if (!c.description) warn(`${p}.description`, "sem descrição: diga em uma frase o que o conceito é no negócio");
	if (c.code) codes.add(c.code);
	concepts.set(c.id, c);
});
doc.concepts.forEach((c, i) => {
	(c.attributes ?? []).forEach((a, j) => {
		if (a.fk && !codes.has(a.fk)) warn(`concepts[${i}].attributes[${j}].fk`, `nenhum conceito com code ${a.fk}`);
	});
});

const pairs = new Map();
const relations = new Map();
doc.relations.forEach((r, i) => {
	const p = `relations[${i}]`;
	unique(r.id, `${p}.id`);
	if (!concepts.has(r.from)) err(`${p}.from`, `conceito inexistente: ${r.from}`);
	if (!concepts.has(r.to)) err(`${p}.to`, `conceito inexistente: ${r.to}`);
	if (r.from === r.to) warn(p, "relação de um conceito com ele mesmo não aparece no diagrama");
	if (!isStr(r.label)) err(`${p}.label`, "obrigatório: o verbo que liga os dois");
	if (r.cardinality && !(Array.isArray(r.cardinality) && r.cardinality.length === 2 && r.cardinality.every((x) => CARDS.includes(x))))
		err(`${p}.cardinality`, `use dois valores entre ${CARDS.join(", ")}`);
	const key = [r.from, r.to].sort().join("|");
	if (pairs.has(key)) warn(p, `mais de uma relação entre os mesmos conceitos (${pairs.get(key)}); os fluxos usam a primeira`);
	else pairs.set(key, r.id);
	relations.set(r.id, r);
});

const flowIds = new Set(doc.flows.map((f) => f.id));
const used = new Set();
doc.relations.forEach((r) => used.add(r.from).add(r.to));
let arrows = 0;
doc.flows.forEach((f, i) => {
	const p = `flows[${i}]`;
	unique(f.id, `${p}.id`);
	if (!isStr(f.name)) err(`${p}.name`, "obrigatório");
	if (f.variantOf !== undefined && (!flowIds.has(f.variantOf) || f.variantOf === f.id))
		err(`${p}.variantOf`, `fluxo principal inexistente: ${f.variantOf}`);
	if (!f.summary) warn(`${p}.summary`, "sem resumo");
	if (!f.sources?.length && !/fonte|source|`[^`]+\.(ts|js|py|rb|go|java|kt|php|cs)`/i.test(f.summary ?? ""))
		warn(p, "sem fonte: cite os arquivos de onde o fluxo saiu (sources ou no resumo)");
	if (!Array.isArray(f.steps) || f.steps.length === 0) return err(`${p}.steps`, "precisa de pelo menos um passo");
	f.steps.forEach((s, j) => {
		const sp = `${p}.steps[${j}]`;
		if (!isStr(s.title)) err(`${sp}.title`, "obrigatório");
		if (!concepts.has(s.from)) err(`${sp}.from`, `conceito inexistente: ${s.from}`);
		if (s.to !== undefined && !concepts.has(s.to)) err(`${sp}.to`, `conceito inexistente: ${s.to}`);
		(s.also ?? []).forEach((id, k) => {
			if (!concepts.has(id)) err(`${sp}.also[${k}]`, `conceito inexistente: ${id}`);
		});
		if (typeof s.action !== "string") err(`${sp}.action`, "obrigatório (pode ser vazio, mas prefira um verbo)");
		used.add(s.from);
		if (s.to) used.add(s.to);
		if (s.to && s.to !== s.from && !pairs.has([s.from, s.to].sort().join("|"))) arrows++;
	});
});

for (const [id, c] of concepts) {
	if (!used.has(id)) warn(`concept ${id}`, `"${c.name}" não aparece em relação nem em fluxo`);
}
if (arrows) warnings.push(`info: ${arrows} passo(s) ligam conceitos sem relação; o visualizador desenha seta tracejada`);

finish();

function finish() {
	for (const w of warnings) console.log(`aviso  ${w}`);
	for (const e of errors) console.log(`ERRO   ${e}`);
	const n = doc && Array.isArray(doc.concepts) ? `${doc.concepts.length} conceitos, ${doc.relations.length} relações, ${doc.flows.length} fluxos` : "";
	console.log(errors.length ? `\n${errors.length} erro(s). ${n}` : `\nok. ${n}`);
	process.exit(errors.length ? 1 : 0);
}
