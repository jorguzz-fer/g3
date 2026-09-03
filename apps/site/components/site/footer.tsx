import Link from 'next/link';
import { LeadFormTrigger } from './lead-form';
import { Credenciamento } from './credenciamento';

export function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-grid">
          <div>
            <Link href="/#top" className="brand" aria-label="G3 Educação | Saúde · início">
              {/* Versão Principal do lockup — ouro e branco sobre azul-marinho,
                  uso preferencial do manual §01 — para o fundo escuro do rodapé. */}
              <img
                src="/g3-badge.png"
                alt="G3 Educação | Saúde"
                style={{ width: 132, height: 'auto' }}
              />
            </Link>
            <p className="ft-about">
              Instituição de ensino superior dedicada exclusivamente à formação de profissionais da
              saúde. Estude no seu ritmo, com casos reais e certificação.
            </p>
          </div>
          <div className="ft-col">
            <h5>Plataforma</h5>
            <Link href="/cursos">Pós-graduação</Link>
            <Link href="/cursos">Cursos livres</Link>
            <Link href="/#especialidades">Áreas de formação</Link>
            <a href="#">Certificados</a>
          </div>
          <div className="ft-col">
            <h5>Instituições</h5>
            <Link href="/#clinicas">Para instituições</Link>
            <a href="#">Planos de equipe</a>
            <a href="#">Relatórios</a>
            <LeadFormTrigger
              source="site-footer"
              className="ft-link-btn"
              style={{
                background: 'none',
                border: 0,
                padding: 0,
                font: 'inherit',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              Fale com vendas
            </LeadFormTrigger>
          </div>
          <div className="ft-col">
            <h5>A G3</h5>
            <a href="#">Sobre nós</a>
            <Link href="/#instrutores">Corpo docente</Link>
            <a href="#">Blog da saúde</a>
            <a href="#">Central de ajuda</a>
          </div>
        </div>
        <Credenciamento dark className="border-t border-white/10 py-6" />
        <div className="ft-bot">
          <span>© 2026 G3 Educação | Saúde.</span>
          <div className="soc">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="6" width="18" height="12" rx="3" />
                <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
