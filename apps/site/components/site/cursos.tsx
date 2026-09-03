import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CourseSummary } from '@/lib/api';
import { OfferLabel } from '@/components/site/offer-label';

const GRADIENTS = [
  'linear-gradient(150deg,#122c60,#0a152b)',
  'linear-gradient(150deg,#3a455a,#0f1a2f)',
  'linear-gradient(150deg,#8a6d2e,#4a3a18)',
];

const cimgSvgProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: '1.4',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PULSE = (
  <svg viewBox="0 0 24 24" {...cimgSvgProps}>
    <path d="M20.8 6.6a4.6 4.6 0 00-7.8-2.4L12 5.2l-1-1A4.6 4.6 0 003.2 6.6c0 4.9 8.8 10.4 8.8 10.4s8.8-5.5 8.8-10.4z" />
    <path d="M2 13h4l1.6-3.4L10 16l2-4 1.4 1.6H22" stroke="#DCB35F" />
  </svg>
);
const MOVEMENT = (
  <svg viewBox="0 0 24 24" {...cimgSvgProps}>
    <circle cx="12.5" cy="4.5" r="1.8" />
    <path d="M6 20l3-5.5 3.5-2 1.5 3 3.5 1" />
    <path d="M9 12.5L11 8l3.5 1.5L18 8" />
  </svg>
);
const NUTRITION = (
  <svg viewBox="0 0 24 24" {...cimgSvgProps}>
    <path d="M6 3v7a3 3 0 006 0V3" />
    <path d="M9 13v8" />
    <path d="M17 3c-1.5 2-2 4-2 6a2 2 0 004 0c0-2-.5-4-2-6z" />
    <path d="M17 11v10" />
  </svg>
);
const BOOK = (
  <svg viewBox="0 0 24 24" {...cimgSvgProps}>
    <path d="M4 5h16v14H4z" />
    <path d="M10 9l5 3-5 3z" />
  </svg>
);

function iconFor(specialtySlug?: string): ReactNode {
  if (!specialtySlug) return BOOK;
  if (specialtySlug.includes('urgencia') || specialtySlug.includes('intensiva')) return PULSE;
  if (specialtySlug.includes('fisio')) return MOVEMENT;
  if (specialtySlug.includes('nutricao')) return NUTRITION;
  return BOOK;
}

export function Cursos({ courses }: { courses: CourseSummary[] }) {
  return (
    <section
      className="blk"
      id="cursos"
      style={{ background: 'var(--paper-2)', borderBlock: '1px solid var(--line-2)' }}
    >
      <div className="wrap">
        <div className="head-row">
          <div className="lead">
            <span className="eyebrow">Cursos em destaque</span>
            <h2>As formações mais procuradas da casa</h2>
          </div>
          <Link href="/cursos" className="btn btn-ghost">
            Ver catálogo completo
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        {courses.length === 0 ? (
          <p
            style={{
              border: '1px dashed var(--line)',
              borderRadius: 16,
              background: 'var(--card)',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--slate)',
            }}
          >
            Nenhum curso disponível no momento. Volte em breve, novos cursos estão a caminho.
          </p>
        ) : (
          <div className="courses">
            {courses.map((c, i) => {
              const gradient = GRADIENTS[i % GRADIENTS.length];
              const cimgStyle = c.coverUrl
                ? {
                    backgroundImage: `url(${c.coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : { background: gradient };
              const initial = c.instructor?.name?.trim().charAt(0).toUpperCase() ?? 'V';
              const content = (
                <>
                  <div className="cimg" style={cimgStyle}>
                    {c.coverUrl ? null : iconFor(c.specialty?.slug)}
                  </div>
                  <div className="cbody">
                    <h3>{c.title}</h3>
                    {c.instructor ? (
                      <div className="inst">
                        <span className="ci">{initial}</span> {c.instructor.name}
                      </div>
                    ) : null}
                    {c.subtitle ? (
                      <p style={{ fontSize: '13.5px', color: 'var(--slate)', lineHeight: 1.5 }}>
                        {c.subtitle}
                      </p>
                    ) : null}
                    <div className="cfoot">
                      <div className="price">
                        {c.comingSoon ? (
                          'Em breve'
                        ) : (
                          <OfferLabel
                            priceCents={c.priceCents}
                            maxInstallments={c.maxInstallments}
                          />
                        )}
                      </div>
                      {c.comingSoon ? null : (
                        <div className="go">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
              // Curso "Em breve": card não clicável (sem link).
              return c.comingSoon ? (
                <div key={c.id} className="course" style={{ cursor: 'default' }}>
                  {content}
                </div>
              ) : (
                <Link key={c.id} href={`/cursos/${c.slug}`} className="course">
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
