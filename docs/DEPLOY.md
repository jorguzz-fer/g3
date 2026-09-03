# Deploy — G3 (VPS + Docker Compose)

Guia para subir a plataforma numa VPS. Apenas o Caddy fica público (80/443);
Postgres, Redis e apps ficam na rede privada do Compose.

## Recursos (o que provisionar)

| Serviço        | Imagem/base          | Exposição          | Notas                         |
| -------------- | -------------------- | ------------------ | ----------------------------- |
| **caddy**      | `caddy:2-alpine`     | **público 80/443** | ingress único, TLS automático |
| **site**       | Next.js (node)       | privado :3000      | SSR/SEO                       |
| **aluno**      | SPA estática (caddy) | privado :80        | PWA                           |
| **backoffice** | SPA estática (caddy) | privado :80        | restringir por IP/VPN         |
| **api**        | NestJS (node)        | privado :3333      | server-authoritative          |
| **postgres**   | `postgres:16-alpine` | privado :5432      | volume `pgdata`               |
| **redis**      | `redis:7-alpine`     | privado :6379      | volume `redisdata`            |

**VPS sugerida para começar:** 2 vCPU · 4 GB RAM · 40 GB SSD. Firewall liberando
apenas 80, 443 e 22 (SSH restrito).

**DNS (A records → IP da VPS):** `g3saude.edu.br`, `www`, `app.g3saude.edu.br`,
`admin.g3saude.edu.br`, `api.g3saude.edu.br`.

## Variáveis de ambiente

Ver [`.env.production.example`](../.env.production.example). Copie para `.env` na
VPS e preencha. Segredos: `openssl rand -hex 32`. Nunca commite o `.env`.

Pontos de atenção:

- `DATABASE_URL` usa o host **`postgres`** (nome do serviço), não `localhost`.
- `REDIS_URL` usa o host **`redis`**.
- `PUBLIC_API_URL` é **assado no build** do aluno/backoffice (rebuild ao mudar).
- `COOKIE_DOMAIN=.g3saude.edu.br` compartilha a sessão entre subdomínios.
- `CORS_ORIGINS` deve listar os 3 domínios de frontend.

## Passo a passo

```bash
# 1) na VPS: instalar Docker + Compose plugin, clonar o repo
git clone https://github.com/jorguzz-fer/g3-plataform.git
cd g3-plataform

# 2) configurar segredos
cp .env.production.example .env
nano .env            # preencher senhas, SESSION_SECRET, domínios

# 3) ajustar domínios no ingress
nano infra/Caddyfile # trocar g3saude.edu.br pelos seus domínios

# 4) build + subir tudo
docker compose --env-file .env -f infra/docker-compose.prod.yml up -d --build

# 5) migrar o banco (uma vez; idempotente)
docker compose --env-file .env -f infra/docker-compose.prod.yml \
  run --rm api node dist/db/migrate.js

# 6) (opcional) popular dados de demonstração
docker compose --env-file .env -f infra/docker-compose.prod.yml \
  run --rm api node dist/db/seed.js
```

Healthcheck: `curl https://api.g3saude.edu.br/v1/health` → `{"status":"ok","db":"up","redis":"up"}`.

## Operação

```bash
# logs
docker compose -f infra/docker-compose.prod.yml logs -f api

# atualizar após git pull
git pull && docker compose --env-file .env -f infra/docker-compose.prod.yml up -d --build

# backup do banco
docker compose -f infra/docker-compose.prod.yml exec postgres \
  pg_dump -U g3 g3 > backup_$(date +%F).sql
```

> Segurança: mantenha `admin.g3saude.edu.br` atrás de IP allow-list/VPN; configure
> backups automáticos off-site do volume `pgdata`; rotacione `SESSION_SECRET` só
> com plano de invalidar sessões. MFA/OIDC entram no hardening de auth.
