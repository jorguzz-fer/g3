/**
 * @g3/design-tokens — tokens da marca G3 Educação | Saúde como valores TS.
 * Fonte de verdade: Manual de Identidade Visual G3 v1.0. Espelham os CSS vars
 * em tokens.css.
 *
 * Proporção de uso (§04 do manual): azul 65% · branco 25% · ouro 10%. O ouro é
 * acento — filetes, detalhes e destaques —, nunca grandes áreas de texto.
 */

export const colors = {
  /** Azul-marinho: base da marca, domina as aplicações. */
  navy: {
    900: '#001133', // Azul G3 (Pantone 2767 C)
    800: '#06173F',
    700: '#1C3466', // Azul médio — hover, gráficos, camadas
    500: '#345089',
    50: '#E9EDF7',
  },
  /** Ouro: acento em detalhes, filetes e destaques. */
  gold: {
    600: '#A98332',
    500: '#C9A04A', // Ouro G3 (Pantone 7555 C)
    400: '#F5C56E', // Ouro claro — brilho do gradiente metálico
    50: '#F4EDDC',
  },
  ink: '#141A26',
  paper: '#F6F5F1', // Marfim — fundos claros alternados
  border: '#E4E2DA',
  muted: '#4A5570', // Cinza azulado — texto secundário
  success: '#2E7D46',
  warning: '#C9982E',
  error: '#C0392B',
  info: '#2B6CB0',
} as const;

/**
 * Duas famílias que refletem o logotipo (§05 do manual): a serifa clássica ecoa
 * o monograma G3; a sem-serifa geométrica ecoa a assinatura espaçada. Ambas do
 * Google Fonts, com substitutas de sistema no fim da pilha.
 */
export const fonts = {
  serif: `'Cormorant Garamond', Georgia, 'Times New Roman', serif`,
  sans: `'Josefin Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
} as const;

export const radius = { sm: 8, md: 12, lg: 18, full: 100 } as const;

/** Escala de espaçamento base 8px. */
export const space = [4, 8, 16, 24, 40, 64] as const;
