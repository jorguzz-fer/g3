import { loadConfig } from '../config/configuration';
import { createDb } from './client';
import { seedChannels } from './seed';

/**
 * Semeia só os canais de aquisição padrão do CRM (idempotente) — não toca em
 * cursos. Use isto em produção quando o `channels` estiver vazio (ex.: deploy
 * anterior à feature de canais) sem precisar reativar `SEED_ON_START`, que
 * também poda cursos publicados fora do seed.
 */
async function main(): Promise<void> {
  const config = loadConfig();
  const { db, sql } = createDb(config.DATABASE_URL);
  await seedChannels(db);
  await sql.end();
  console.log('Canais semeados.');
}

main().catch((err) => {
  console.error('Falha no seed de canais:', err);
  process.exit(1);
});
