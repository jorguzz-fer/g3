/**
 * @g3/api-client — cliente HTTP tipado da API G3.
 *
 * Os tipos em `schema.ts` são GERADOS do contrato OpenAPI 3.1 da API
 * (`apps/api/openapi.json`) — fonte de verdade. Regerar com `pnpm generate`
 * sempre que o contrato mudar. Não editar `schema.ts` à mão.
 */
import createClient, { type Client } from 'openapi-fetch';
import type { paths } from './schema';

export interface G3ClientConfig {
  /** Base URL da API, ex.: https://api.g3saude.edu.br */
  baseUrl: string;
  /** fetch customizado (SSR/testes). Padrão: fetch global. */
  fetch?: typeof globalThis.fetch;
}

/**
 * Cria um client tipado. `credentials: 'include'` envia o cookie de sessão
 * httpOnly (first-party) nas requisições autenticadas.
 */
export function createG3Client(config: G3ClientConfig): Client<paths> {
  return createClient<paths>({
    baseUrl: config.baseUrl,
    credentials: 'include',
    ...(config.fetch ? { fetch: config.fetch } : {}),
  });
}

export type G3Client = Client<paths>;
export type { paths, components } from './schema';
