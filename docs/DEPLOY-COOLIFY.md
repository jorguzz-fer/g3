# Deploy no Coolify

Topologia de produção: **6 recursos separados** no mesmo Project + Environment —
4 aplicações e 2 bancos gerenciados pelo Coolify. É o mesmo desenho já rodando
na Vethis. O Coolify cuida de domínio e TLS por aplicação (proxy próprio na
80/443); não usamos o nosso `caddy` de ingress.

> Alternativa: subir tudo como um stack único de Docker Compose. Fica no
> [Apêndice](#apêndice--alternativa-em-docker-compose) — não é o que usamos.

## 1. Mapa dos recursos

| Recurso    | Tipo                | Dockerfile                   | Porta | Domínio                        |
| ---------- | ------------------- | ---------------------------- | ----- | ------------------------------ |
| `g3-db`    | Database · Postgres | —                            | 5432  | (interno)                      |
| `g3-redis` | Database · Redis    | —                            | 6379  | (interno)                      |
| `API-G3`   | Application         | `apps/api/Dockerfile`        | 3333  | `api.g3educacaosaude.com.br`   |
| `g3-site`  | Application         | `apps/site/Dockerfile`       | 3000  | `g3educacaosaude.com.br`       |
| `g3-app`   | Application         | `apps/aluno/Dockerfile`      | 80    | `app.g3educacaosaude.com.br`   |
| `g3-admin` | Application         | `apps/backoffice/Dockerfile` | 80    | `admin.g3educacaosaude.com.br` |

Ordem de criação: **bancos primeiro** (as aplicações precisam das URLs internas
deles), depois a API, depois os três fronts.

DNS: um registro A para cada subdomínio, apontando para o IP do servidor.

## 2. Bancos

Crie os dois por **+ New → Database**, no mesmo Project + Environment das
aplicações:

- `g3-db` — PostgreSQL 16
- `g3-redis` — Redis 7

Não atribua domínio a nenhum dos dois: ficam só na rede interna. Copie a
**URL de conexão interna** que o Coolify mostra em cada um — é o que vai em
`DATABASE_URL` e `REDIS_URL` da API (host é o nome interno do serviço, não
`localhost` nem `postgres`).

No `g3-db`, ative o **backup automático** (aba Backups) e defina a retenção.

## 3. Aplicações — configuração de build

As quatro saem do mesmo repositório. Em **+ New → Application → Public
Repository** (ou Private with GitHub App, que dá auto-deploy no push):

| Campo               | Valor                   |
| ------------------- | ----------------------- |
| Repository          | `jorguzz-fer/g3`        |
| Branch              | `main`                  |
| Build Pack          | **Dockerfile**          |
| Base Directory      | `/` — a raiz do repo    |
| Dockerfile Location | conforme a tabela do §1 |
| Port Exposes        | conforme a tabela do §1 |

> **Base Directory tem de ser `/`.** Os Dockerfiles são multi-stage e copiam o
> `pnpm-lock.yaml` e o workspace inteiro a partir da raiz do monorepo. Apontar o
> contexto para `apps/api` quebra o build.

## 4. Variáveis de ambiente, por recurso

No Coolify, uma variável só chega ao `docker build` se estiver marcada como
**Build Variable**. As marcadas com 🔨 abaixo são assadas no bundle: mudar o
valor exige **rebuild**, não basta reiniciar.

### API-G3

Tudo runtime — a API lê a configuração no boot e falha rápido se faltar algo.

```
NODE_ENV=production
API_PORT=3333

APP_URL=https://g3educacaosaude.com.br
PUBLIC_API_URL=https://api.g3educacaosaude.com.br
CORS_ORIGINS=https://g3educacaosaude.com.br,https://app.g3educacaosaude.com.br,https://admin.g3educacaosaude.com.br
COOKIE_DOMAIN=.g3educacaosaude.com.br

DATABASE_URL=<URL interna do g3-db>
REDIS_URL=<URL interna do g3-redis>

SESSION_SECRET=<openssl rand -hex 32>
UPLOADS_DIR=/data/uploads
SEED_ON_START=true
```

Adicione um **Persistent Storage** montado em `/data/uploads` (aba Storages).
Sem ele, as capas enviadas pelo admin somem no próximo deploy — o disco do
container é efêmero.

`SEED_ON_START=true` publica o catálogo no primeiro deploy. Depois volte para
`false`: o seed é idempotente, mas ele é a fonte de verdade do catálogo e faz
soft-delete de cursos criados fora dele.

Opcionais, quando tiver: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_CALLBACK_URL`, `PAYMENT_GATEWAY=asaas` + `ASAAS_API_KEY` /
`ASAAS_BASE_URL` / `ASAAS_WEBHOOK_TOKEN`, `VIMEO_ACCESS_TOKEN`,
`ANTHROPIC_API_KEY` (botão "Gerar com IA" no admin), `SENTRY_DSN`.

### g3-site

```
🔨 NEXT_PUBLIC_API_URL=https://api.g3educacaosaude.com.br
🔨 NEXT_PUBLIC_APP_URL=https://app.g3educacaosaude.com.br

NODE_ENV=production
PORT=3000
API_URL=https://api.g3educacaosaude.com.br
```

`NEXT_PUBLIC_*` é lido pelo navegador (checkout e link "Área do aluno") e assado
em `next build`. `API_URL` é a chamada server-side do Next — pode usar a URL
pública ou o FQDN interno da API, que evita a volta pelo proxy.

### g3-app (área do aluno)

```
🔨 VITE_API_URL=https://api.g3educacaosaude.com.br
🔨 VITE_SITE_URL=https://g3educacaosaude.com.br
```

Nenhuma variável de runtime: o build gera arquivos estáticos servidos por Caddy.

### g3-admin (backoffice)

```
🔨 VITE_API_URL=https://api.g3educacaosaude.com.br
```

## 5. Deploy

1. Suba `g3-db` e `g3-redis` e confirme que ficaram _healthy_.
2. **Deploy da `API-G3`.** O entrypoint aplica as migrations sozinho a cada
   deploy e, com `SEED_ON_START=true`, roda o seed. Não há passo manual.
3. Confira: `https://api.g3educacaosaude.com.br/v1/health` →
   `{"status":"ok","db":"up","redis":"up"}`.
4. Deploy de `g3-site`, `g3-app` e `g3-admin` (podem ir em paralelo).
5. Volte `SEED_ON_START` para `false` na API.

## 6. Depois de subir

- **Restrinja o `admin.g3educacaosaude.com.br`** por IP allow-list ou VPN. O MFA ainda
  não existe (ver ADR 0006) — hoje o backoffice depende só de senha.
- Troque a senha do usuário `staff` criado pelo seed.
- Confirme que `g3-db` e `g3-redis` continuam sem domínio público.
- Teste a restauração de um backup do Postgres — backup não testado não é backup.
- Ao mudar qualquer variável 🔨, faça **rebuild** da aplicação correspondente.

## Apêndice — alternativa em Docker Compose

[`infra/docker-compose.coolify.yml`](../infra/docker-compose.coolify.yml) sobe os
mesmos seis serviços como um stack único (Build Pack: Docker Compose, arquivo
`infra/docker-compose.coolify.yml`). As variáveis vão todas num bloco só e o
compose distribui por serviço; os hosts do banco viram `postgres` e `redis`.
Útil para replicar o ambiente fora do Coolify, mas em produção usamos os
recursos separados do §1.

[`infra/docker-compose.prod.yml`](../infra/docker-compose.prod.yml) (com `caddy`
como ingress) continua válido para VPS **sem** Coolify.
