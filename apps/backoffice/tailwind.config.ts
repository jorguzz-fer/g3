import type { Config } from 'tailwindcss';
import { g3Preset } from '@g3/design-tokens';

const config: Config = {
  presets: [g3Preset as unknown as Partial<Config>],
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
