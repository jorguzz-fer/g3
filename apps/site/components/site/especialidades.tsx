import Link from 'next/link';
import type { ReactNode } from 'react';

type Esp = { slug: string; name: string; desc: string; count: string; icon: ReactNode };

const S = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: '1.7',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ESPECIALIDADES: Esp[] = [
  {
    slug: 'urgencia-emergencia',
    name: 'Urgência & Emergência',
    desc: 'Classificação de risco, suporte de vida e trauma.',
    count: '6 cursos',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M2 13h4l1.6-3.2L10 15l2-3.5 1.4 1.5H22" />
        <path d="M12 3v3M12 18v3" opacity=".6" />
      </svg>
    ),
  },
  {
    slug: 'terapia-intensiva',
    name: 'Terapia Intensiva',
    desc: 'Monitoração, ventilação mecânica e paciente crítico.',
    count: '5 cursos',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M4 6.5h16v11H4z" />
        <path d="M6.5 12h2l1.2-2.4L12 14l1.4-2 .9 1h3.2" />
        <path d="M9 20h6" />
      </svg>
    ),
  },
  {
    slug: 'enfermagem',
    name: 'Enfermagem',
    desc: 'Sistematização da assistência e segurança do paciente.',
    count: '9 cursos',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" />
        <path d="M12 8.5v6M9 11.5h6" />
      </svg>
    ),
  },
  {
    slug: 'fisioterapia',
    name: 'Fisioterapia',
    desc: 'Avaliação funcional, exercício terapêutico e retorno ao esporte.',
    count: '7 cursos',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <circle cx="12.5" cy="4.5" r="1.8" />
        <path d="M6 20l3-5.5 3.5-2 1.5 3 3.5 1" />
        <path d="M9 12.5L11 8l3.5 1.5L18 8" />
      </svg>
    ),
  },
  {
    slug: 'nutricao',
    name: 'Nutrição Clínica',
    desc: 'Triagem de risco, terapia nutricional e prescrição.',
    count: '6 cursos',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M6 3v7a3 3 0 006 0V3" />
        <path d="M9 13v8" />
        <path d="M17 3c-1.5 2-2 4-2 6a2 2 0 004 0c0-2-.5-4-2-6z" />
        <path d="M17 11v10" />
      </svg>
    ),
  },
  {
    slug: 'saude-mental',
    name: 'Saúde Mental',
    desc: 'Atenção psicossocial, manejo da crise e cuidado em rede.',
    count: 'Em breve',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M12 4a5 5 0 015 5v1a4 4 0 01-1 7v3h-6v-2.5A5.5 5.5 0 017 12V9a5 5 0 015-5z" />
        <path d="M10 10.5h4" />
      </svg>
    ),
  },
  {
    slug: 'obstetricia',
    name: 'Obstetrícia & Neonatologia',
    desc: 'Pré-natal, parto baseado em evidências e cuidado neonatal.',
    count: 'Em breve',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <circle cx="12" cy="7" r="3.2" />
        <path d="M8.5 21c0-3.3.8-6 3.5-6s3.5 2.7 3.5 6" />
        <path d="M6 13.5c1.2-1.4 2.6-2.2 6-2.2s4.8.8 6 2.2" />
      </svg>
    ),
  },
  {
    slug: 'saude-do-idoso',
    name: 'Saúde do Idoso',
    desc: 'Avaliação multidimensional, fragilidade e funcionalidade.',
    count: 'Em breve',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <circle cx="10" cy="5.5" r="2.4" />
        <path d="M7 21l1.5-7L7 11l3-1.5 2.5 2 2.5.5" />
        <path d="M17 9v12" />
      </svg>
    ),
  },
  {
    slug: 'gestao-saude',
    name: 'Gestão & Auditoria',
    desc: 'Indicadores, custos, auditoria de contas e acreditação.',
    count: 'Em breve',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M4 19V5h16v14z" />
        <path d="M8 15.5V11M12 15.5V8.5M16 15.5v-3" />
      </svg>
    ),
  },
];

export function Especialidades() {
  return (
    <section className="blk" id="especialidades">
      <div className="wrap">
        <div className="head-row">
          <div className="lead">
            <span className="eyebrow">Áreas de formação</span>
            <h2>A casa inteira construída em torno da saúde</h2>
          </div>
          <p className="desc">
            Não somos uma faculdade que oferece saúde entre outras áreas. Cada programa é desenhado
            por quem vive a rotina de clínicas, hospitais e consultórios.
          </p>
        </div>
        <div className="esp-grid">
          {ESPECIALIDADES.map((e) => (
            <Link key={e.slug} href={`/cursos?specialty=${e.slug}`} className="esp">
              <div className="ic">{e.icon}</div>
              <b>{e.name}</b>
              <span>{e.desc}</span>
              {/* Enquanto o catálogo é preenchido, todas as áreas exibem "Em breve". */}
              <span className="cnt">Em breve</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
