# ADR 0006 — Autenticação própria, sessão server-side, RBAC e MFA

- Status: aceito
- Data: 2026-07-12

## Contexto

Auth é fronteira de confiança e precisa ser server-authoritative. Queremos
controle total, sem custo por usuário e com dados no Brasil (LGPD).

## Opções consideradas

1. **Auth própria no backend** — e-mail+senha (Argon2id), Google OIDC, sessão em cookie httpOnly (store Redis), RBAC, MFA TOTP para papéis sensíveis.
2. Provedor gerenciado (Clerk/Auth0) — mais rápido, porém custo por MAU e dados fora.
3. Keycloak self-hosted — OIDC completo, mais um serviço para operar/customizar.

## Decisão

**Auth própria** na API. Senha com **Argon2id**; **Google OIDC** para login
social; sessão web em **cookie httpOnly + Secure + SameSite** com store no Redis
(revogação imediata em logout/troca de senha). **RBAC** com papéis
`aluno`/`staff`/`admin` (menor privilégio). **MFA TOTP obrigatório** para
`staff`/`admin`. Mobile/M2M via OAuth2/OIDC com refresh rotativo (quando entrar).

## Consequências

Sem dependência externa de identidade nem custo por usuário; dados no BR.
Responsabilidade de implementar reset seguro (sem enumeração), rate limiting e
lockout — previstos no M1.

## Estado da implementação (2026-09-03)

Entregue: senha Argon2id, sessão server-side no Redis (cookie httpOnly +
assinado + SameSite, `Secure` em produção), revogação no logout, RBAC por
`SessionGuard`/`RolesGuard`, rate limiting global (120/min) e por rota de auth
(login 10/min, registro 5/min, lead 5/min), CORS por allow-list e login com
mensagem uniforme (sem enumeração).

**Pendente** — esta decisão ainda não está cumprida por inteiro:

- **MFA TOTP**: só as colunas `mfa_secret`/`mfa_enabled` existem; nenhum fluxo
  de enrolamento ou verificação. Até implementar, o acesso de `staff`/`admin`
  depende só de senha — restrinja `admin.*` por IP/VPN.
- **Google OIDC**: as variáveis `GOOGLE_*` são lidas pela config, mas não há
  rota de callback.
- **Reset de senha self-service**: existe apenas reset iniciado por admin
  autenticado (`POST /v1/admin/users/:id/reset-password`). Não há fluxo público
  de "esqueci minha senha" — quando entrar, precisa nascer com rate limit e
  resposta genérica.
- **Lockout progressivo por conta**: o rate limit hoje é por IP, não por conta.
- **Enumeração no registro**: `POST /v1/auth/register` devolve `409 E-mail já
cadastrado`, o que permite descobrir se um e-mail tem conta. Mitigado pelo
  limite de 5/min por IP; fechar de vez exige verificação de e-mail, para não
  trocar o vazamento por um cadastro que falha em silêncio.
