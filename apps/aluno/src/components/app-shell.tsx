import type { ReactNode, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth';

type IconProps = SVGProps<SVGSVGElement>;

function HomeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

function CoursesIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 1 4 16V5.5Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 0 20 16V5.5Z" />
    </svg>
  );
}

function SecretariaIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M6 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7.5 3.5Z" />
      <path d="M13.5 3.5V8h4.5" />
      <path d="M9 12.5h6M9 16h4" />
    </svg>
  );
}

function ProfileIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M15 4.5h2.5A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M10 12H3.5M6 8.5 3 12l3 3.5" />
    </svg>
  );
}

const navItems = [
  { to: '/inicio', label: 'Início', icon: HomeIcon },
  { to: '/meus-cursos', label: 'Meus cursos', icon: CoursesIcon },
  { to: '/secretaria', label: 'Secretaria', icon: SecretariaIcon },
  { to: '/perfil', label: 'Perfil', icon: ProfileIcon },
];

/**
 * Lockup oficial G3. `inverted` usa a versão Principal (ouro e branco sobre
 * azul-marinho, manual §01 — uso preferencial), para o fundo escuro.
 */
function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <img
      src={inverted ? '/g3-badge.png' : '/g3-logo.png'}
      alt="G3 Educação | Saúde"
      className={className}
    />
  );
}

/** Símbolo isolado — para o header mobile, onde a assinatura ficaria ilegível. */
function Mark({ className }: { className?: string }) {
  return <img src="/g3-badge-mark.png" alt="G3 Educação | Saúde" className={className} />;
}

/**
 * Casca do app: sidebar de navegação à esquerda no desktop (lg+) e barra de
 * navegação inferior no mobile. Container largo e confortável (DS §7).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-white lg:flex">
        {/* Logo dentro de um bloco (não é filho direto do flex-col) para nunca ser esticado. */}
        <div className="px-6 py-6">
          <Logo className="block h-auto w-[128px]" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-navy-50 text-navy-700'
                    : 'text-muted hover:bg-navy-50/60 hover:text-navy-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gold-500"
                    />
                  ) : null}
                  <Icon className="h-5 w-5" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-navy-50/60 hover:text-navy-700"
          >
            <LogoutIcon className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Header — mobile */}
      <header className="flex items-center justify-between bg-navy-800 px-5 py-4 text-paper lg:hidden">
        <Mark className="h-10 w-auto" />
        <button
          type="button"
          onClick={() => void logout()}
          className="text-sm font-medium text-[#C6CAD3] hover:text-paper"
        >
          Sair
        </button>
      </header>

      {/* Conteúdo */}
      <div className="flex-1">
        <main className="mx-auto w-full max-w-[1440px] px-5 py-6 pb-24 lg:px-10 lg:py-10 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-border bg-navy-900 lg:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold ${
                isActive ? 'text-gold-500' : 'text-[#B9BEC7]'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
