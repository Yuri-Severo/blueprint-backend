# 03 — Como levantar o backend (qualquer stack)

O objetivo é um modelo **verdadeiro e com fonte**. Leia o código; não deduza
pelo nome das pastas. Para repositórios grandes, divida a leitura em frentes
paralelas (subagentes) — uma para o schema, uma para integrações e jobs, uma
por grupo de fluxos — e peça a cada uma os caminhos de arquivo do que relatar.

## 1. Entidades (`entity`)

Onde procurar, conforme a stack:

| Stack | Onde está o schema |
|---|---|
| Drizzle | `*.schema.ts` com `pgTable(...)`; enums em `pgEnum(...)` |
| Prisma | `schema.prisma` (`model`, `enum`) |
| TypeORM / MikroORM | classes com `@Entity`, `@Column`, `@ManyToOne` |
| Sequelize | `Model.init` / `define` |
| Django | `models.py` (`models.Model`, `ForeignKey`, `choices`) |
| Rails | `db/schema.rb`, `app/models/*.rb` (`belongs_to`, `has_many`, `enum`) |
| Laravel | `database/migrations`, `app/Models` |
| Spring / JPA | `@Entity`, `@OneToMany` |
| Go | structs com tags `gorm:`/`db:`, migrations SQL |
| SQL puro | `migrations/*.sql` (`CREATE TABLE`, `REFERENCES`) |

Para cada tabela que os fluxos tocam, anote: nome humano, nome técnico, chave,
chaves estrangeiras (viram relações), **campos de status com os valores do
enum** (são o coração das mudanças de estado) e datas que mudam regra
(`expiresAt`, `endDate`). Ignore colunas de auditoria.

**Confira o dono das chaves estrangeiras.** Um "lançamento financeiro" pode
pertencer ao pedido e não ao cliente; o nome do conceito engana, a coluna
`orderId` não.

## 2. Sistemas (`system`)

Procure onde o backend sai de si:

- clientes HTTP e SDKs (`fetch(`, `axios`, `got`, SDKs de pagamento, e-mail,
  armazenamento, mensageria) e as variáveis de ambiente que eles leem;
- **webhooks** recebidos (rotas `/webhook`, `/callback`): costumam ser quem
  grava o estado final de um fluxo;
- filas e jobs (`BullMQ`, `Sidekiq`, `Celery`, `cron`, `@Cron`, `setInterval`,
  workers): costumam virar status por data ou em segundo plano.

Agrupe por papel no negócio: "Gateway de pagamento" (com `code` listando os
provedores) em vez de um conceito por SDK.

## 3. Atores (`actor`)

Saem dos papéis e dos canais: enum de `role`, guards (`isAdmin`, `can(...)`,
middlewares de permissão) e os apps clientes (site, app, painel, maquininha).
Um ator por papel que **inicia** fluxos diferentes. Não crie ator para quem só
lê.

## 4. Relações

- Cada chave estrangeira entre entidades vira uma relação com um verbo do
  negócio ("Pedido **gera** Envio"), apontando do dono para o dependente.
- Atores ligam-se ao que iniciam ("Comprador **compra** Pedido").
- Entidades ligam-se aos sistemas com que conversam ("Pedido **é cobrado no**
  Gateway"), e filas ao que atualizam ("Filas **liberam a reserva** do Estoque").
- Cardinalidade só quando o código deixa claro (`unique`, `notNull`, `has_one`).

## 5. Fluxos

Comece pelos **casos de uso** e controllers (`*usecase*`, `services/`,
`handlers/`, `controllers/`, `routes`), não pela UI. Para cada fluxo:

1. **Ponto de entrada**: rota/handler e quem pode chamá-la (guard).
2. **Validações na ordem em que rodam**, com a mensagem de erro literal.
3. **Escritas**: cada `update`/`insert` vira uma mudança de estado no passo.
4. **Saídas para sistemas**: chamada ao gateway, publicação em fila, e-mail.
5. **Quem grava o resultado**: muitas vezes é o webhook ou o job, não a
   requisição original — isso vira um passo próprio (`Gateway → Pedido:
   confirma por webhook`).
6. **Efeitos em cascata**: estoque devolvido, registros de histórico,
   sincronização com terceiros.

Monte os passos como interações `from → to : action`. Um passo por mudança que
o desenvolvedor precisa saber; junte validações do mesmo ponto em `rules`.

### Divergências: procure de propósito

As descobertas mais úteis costumam ser estas, e devem aparecer no passo:

- a mesma regra implementada de jeitos diferentes em dois lugares (o botão do
  app aceita uma lista de categorias, o servidor outra);
- checagem comentada ou desligada por flag;
- estados do enum que nenhum fluxo usa;
- rota de webhook comentada, cobrança que nunca acontece;
- mensagens de erro em outro idioma ou permissões que a UI não confere.

Escreva o fato e a fonte ("a checagem de elegibilidade está comentada em
`payment.controller.ts`"), sem julgar.

## 6. Fontes

- `flows[].summary` termina com "Fonte: `arquivo1`, `arquivo2`" ou use
  `flows[].sources`.
- `steps[].source` quando a regra vem de um arquivo diferente do fluxo.
- Datas: `project.generatedAt` com o dia do levantamento; o código muda.

## 7. Quando parar

Um bom primeiro blueprint tem de 15 a 30 conceitos e de 5 a 10 fluxos. Se
passou de 40 conceitos, faça recortes (um blueprint por área) em vez de um
mapa ilegível.
