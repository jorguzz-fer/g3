/**
 * Faixa de credenciamento: selo "Reconhecido pelo MEC" + nota de revisão pelo
 * corpo docente. Usada no rodapé (fundo escuro) e na página do curso (fundo
 * claro) — `dark` ajusta a cor do texto.
 */
export function Credenciamento({
  dark = false,
  className = '',
}: {
  dark?: boolean;
  className?: string;
}) {
  const text = dark ? 'text-[#C6CAD3]' : 'text-muted';
  const strong = dark ? 'text-white' : 'text-ink';
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-white p-1 shadow-sm">
          <img src="/mec.jpg" alt="Reconhecido pelo MEC" className="max-h-full w-auto" />
        </span>
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-white p-1 shadow-sm">
          <img src="/g3-mark.png" alt="G3 Educação | Saúde" className="max-h-full w-auto" />
        </span>
      </div>
      <p className={`max-w-md text-[13px] leading-relaxed ${text}`}>
        Pós-graduação lato sensu{' '}
        <span className={`font-semibold ${strong}`}>certificada e reconhecida pelo MEC</span>,
        emitida pela <span className={`font-semibold ${strong}`}>G3 Educação | Saúde</span>.
        Conteúdo revisado pelo corpo docente.
      </p>
    </div>
  );
}
