# Deploy no Coolify

O Coolify já roda o próprio proxy (Traefik) na 80/443 e cuida de domínios + TLS.
Por isso **não usamos o nosso `caddy`** — use o compose específico
[`infra/docker-compose.coolify.yml`](../infra/docker-compose.coolify.yml).

## 1. Criar a aplicação

1. **+ New → Application → Git Based → Private Repository (with GitHub App)**
   (ou _Public Repository_ se o repo for público). O GitHub App dá **auto-deploy no push**.
2. Selecione o repositório `jorguzz-fer/g3` e a branch `main`.
3. **Build Pack: Docker Compose**.
4. **Docker Compose Location:** `infra/docker-compose.coolify.yml`.
   (Base Directory `/` — a raiz do repo.)

## 2. Variáveis de ambiente

Na aba **Environment Variables**, cole (ajustando valores e domínios). O compose
já repassa cada uma para o serviço certo — não é preciso configurar por serviço:

```
# ── Domínios (a base de tudo) ────────────────────────────────
APP_URL=https://g3saude.edu.br
PUBLIC_API_URL=https://api.g3saude.edu.br
PUBLIC_APP_URL=https://app.g3saude.edu.br
CORS_ORIGINS=https://g3saude.edu.br,https://app.g3saude.edu.br,https://admin.g3saude.edu.br
COOKIE_DOMAIN=.g3saude.edu.br

# ── Banco e cache (hosts são os nomes dos serviços do compose) ─
POSTGRES_USER=g3
POSTGRES_PASSWORD=<senha forte>
POSTGRES_DB=g3
DATABASE_URL=postgresql://g3:<senha forte>@postgres:5432/g3
REDIS_URL=redis://redis:6379

# ── Sessão ───────────────────────────────────────────────────
SESSION_SECRET=<openssl rand -hex 32>

# ── Uploads (capas enviadas pelo admin) ──────────────────────
UPLOADS_DIR=/data/uploads

# ── Primeiro deploy: publica o catálogo ──────────────────────
SEED_ON_START=true
```

`PUBLIC_API_URL`, `PUBLIC_APP_URL` e `APP_URL` são **build args**: viram
`NEXT_PUBLIC_*` no bundle do site e `VITE_*` no do aluno/backoffice. Marque as
três como disponíveis em **build time** no Coolify (a UI tem essa opção por
variável) e faça **rebuild** ao alterá-las — mudar só o runtime não tem efeito.

Opcionais, quando tiver: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` /
`GOOGLE_CALLBACK_URL` (login social), `PAYMENT_GATEWAY=asaas` + `ASAAS_API_KEY` /
`ASAAS_BASE_URL` / `ASAAS_WEBHOOK_TOKEN` (cobrança real), `VIMEO_ACCESS_TOKEN`
(vídeo), `ANTHROPIC_API_KEY` (botão "Gerar com IA" no admin) e `SENTRY_DSN`.

> **Upload de imagens no admin (capas):** a API grava em `UPLOADS_DIR` e serve
> em `/uploads`. O compose já declara o volume `uploads` montado nesse caminho.
> Se preferir um disco seu, adicione um **Persistent Storage** na API montado em
> `/data/uploads` (Coolify → aba Storages). Sem volume, as capas somem no
> próximo deploy — o disco do container é efêmero.

> **Publicar o catálogo (primeiro deploy):** defina `SEED_ON_START=true`. O
> entrypoint da API roda o seed idempotente (cria/atualiza o curso). As
> migrations rodam sempre; o seed só quando esta var é `true`. Depois do
> primeiro deploy você pode voltar para `false` (ou remover) — o seed é
> idempotente, então rodar de novo não duplica nada.

> `PUBLIC_API_URL` (aluno/backoffice) e `NEXT_PUBLIC_*` (site) são **build args**
> assados no bundle. Marque-os como disponíveis em build time no Coolify (a UI tem
> essa opção por variável) e faça **rebuild** ao alterá-los.

## 3. Domínios por serviço

O compose expõe 4 serviços. No Coolify, atribua um domínio a cada um
(a UI lista os serviços do compose; defina o FQDN e a porta de destino):

| Serviço      | Domínio                                | Porta |
| ------------ | -------------------------------------- | ----- |
| `site`       | `g3saude.edu.br`, `www.g3saude.edu.br` | 3000  |
| `api`        | `api.g3saude.edu.br`                   | 3333  |
| `aluno`      | `app.g3saude.edu.br`                   | 80    |
| `backoffice` | `admin.g3saude.edu.br`                 | 80    |

`postgres` e `redis` **não** recebem domínio (ficam internos).

DNS: aponte todos esses subdomínios (A record) para o IP do servidor do Coolify.

## 4. Deploy + migração

1. **Deploy**. O Coolify builda as imagens e sobe os serviços.
2. Rode a migração uma vez (Coolify → serviço `api` → **Execute Command** /
   terminal do container):
   ```bash
   node dist/db/migrate.js
   # opcional (dados demo):
   node dist/db/seed.js
   ```
3. Healthcheck: `https://api.g3saude.edu.br/v1/health` → `{"status":"ok","db":"up","redis":"up"}`.

## Notas

- Ao trocar `PUBLIC_API_URL`, é preciso **rebuild** do aluno/backoffice (valor assado no bundle).
- Mantenha `admin.g3saude.edu.br` restrito (IP allow-list/VPN) se possível.
- Backups: configure snapshot/backup do volume do `postgres` no Coolify.
- O `docker-compose.prod.yml` (com `caddy`) continua válido para VPS **sem** Coolify.
