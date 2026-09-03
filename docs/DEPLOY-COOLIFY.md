# Deploy no Coolify

O Coolify já roda o próprio proxy (Traefik) na 80/443 e cuida de domínios + TLS.
Por isso **não usamos o nosso `caddy`** — use o compose específico
[`infra/docker-compose.coolify.yml`](../infra/docker-compose.coolify.yml).

## 1. Criar a aplicação

1. **+ New → Application → Git Based → Private Repository (with GitHub App)**
   (ou _Public Repository_ se o repo for público). O GitHub App dá **auto-deploy no push**.
2. Selecione o repositório `jorguzz-fer/g3-plataform` e a branch `main`.
3. **Build Pack: Docker Compose**.
4. **Docker Compose Location:** `infra/docker-compose.coolify.yml`.
   (Base Directory `/` — a raiz do repo.)

## 2. Variáveis de ambiente

Na aba **Environment Variables**, cole (ajustando valores e domínios):

```
APP_URL=https://g3saude.edu.br
PUBLIC_API_URL=https://api.g3saude.edu.br
# Aluno (Vite) — build args: URL da API e do site (CTA "explorar cursos").
VITE_API_URL=https://api.g3saude.edu.br
VITE_SITE_URL=https://g3saude.edu.br
# Site (Next.js) — checkout no navegador. NEXT_PUBLIC_* é assado em `next build`.
NEXT_PUBLIC_API_URL=https://api.g3saude.edu.br
NEXT_PUBLIC_APP_URL=https://app.g3saude.edu.br
CORS_ORIGINS=https://g3saude.edu.br,https://app.g3saude.edu.br,https://admin.g3saude.edu.br

POSTGRES_USER=g3
POSTGRES_PASSWORD=<senha forte>
POSTGRES_DB=g3
DATABASE_URL=postgresql://g3:<senha forte>@postgres:5432/g3

REDIS_URL=redis://redis:6379

SESSION_SECRET=<openssl rand -hex 32>
COOKIE_DOMAIN=.g3saude.edu.br
```

Opcionais (checkout/hardening), quando tiver: `GOOGLE_*`, `ASAAS_*`, `VIMEO_ACCESS_TOKEN`, `SENTRY_DSN`.

> **Upload de imagens no admin (capas):** a API grava os arquivos enviados em
> `UPLOADS_DIR` e os serve em `/uploads`. Como o disco do container é efêmero,
> configure na **API-G3**:
>
> ```
> PUBLIC_API_URL=https://api.g3saude.edu.br   # URL pública da API (monta a URL do arquivo)
> UPLOADS_DIR=/data/uploads                  # pasta gravável (aponte um volume persistente)
> ```
>
> E adicione um **Persistent Storage** na API-G3 montado em `/data/uploads`
> (Coolify → aba Storages). Sem o volume, as imagens somem no próximo deploy.

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
