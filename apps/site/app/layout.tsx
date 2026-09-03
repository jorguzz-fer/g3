import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Josefin_Sans } from 'next/font/google';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { AttributionTracker } from '@/components/site/attribution-tracker';
import './globals.css';
import './prototype.css';

// Tipografia da marca (manual §05): a serifa clássica ecoa o monograma G3, a
// sem-serifa geométrica ecoa a assinatura espaçada. Servidas pelo next/font
// (self-host, sem request a terceiros no runtime).
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'G3 Educação | Saúde — Pós-graduação na área da saúde',
  description:
    'Graduação, pós-graduação e cursos livres para quem cuida de gente. Formação conduzida por quem vive a rotina de clínicas, hospitais e consultórios.',
  icons: { icon: '/g3-mark.png' },
};

// Aplica o tema (claro/escuro) por `data-theme` antes da pintura, replicando o
// <script> do protótipo: usa a preferência salva em localStorage e cai para o
// esquema do sistema. Evita flash de tema incorreto no carregamento.
const themeInit = `(function(){try{var t=localStorage.getItem('g3-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <AttributionTracker />
        <Header />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
