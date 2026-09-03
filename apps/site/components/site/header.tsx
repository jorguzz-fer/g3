import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

/** URL da área do aluno (app). "Área do aluno" leva direto ao login/app. */
const alunoUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

export function Header() {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href="/#top" className="brand" aria-label="G3 Educação | Saúde · início">
          {/* Símbolo isolado: a nav de 88px não comporta o lockup completo nos
              120px de largura mínima do manual (§02). */}
          <img src="/g3-mark.png" alt="G3 Educação | Saúde" style={{ height: 52, width: 'auto' }} />
        </Link>
        <nav className="nav-links" aria-label="Principal">
          <Link href="/cursos">Pós-graduação</Link>
          <Link href="/cursos">Cursos livres</Link>
          <Link href="/#clinicas">Para Instituições</Link>
          <Link href="/#instrutores">Corpo docente</Link>
        </nav>
        <div className="nav-right">
          <ThemeToggle />
          <a href={alunoUrl} className="signin">
            Área do aluno
          </a>
          <Link href="/cursos" className="btn btn-primary">
            Matricule-se
          </Link>
        </div>
      </div>
    </header>
  );
}
