type Inst = {
  initial: string;
  name: string;
  role: string;
  bio: string;
  gradient: string;
  /** Foto em /public/instrutores; cai para a inicial se o arquivo não existir. */
  photo?: string;
};

const INSTRUTORES: Inst[] = [
  {
    initial: 'M',
    name: 'Dra. Mariana Costa',
    role: 'Coordenação · Enfermagem',
    bio: 'Coordenadora acadêmica da Pós-graduação em Enfermagem em Urgência e Emergência. Enfermeira, especialista em urgência e emergência e mestre em enfermagem, atua há mais de quinze anos em pronto-socorro e coordena o acolhimento com classificação de risco em serviço de porta aberta.',
    gradient: 'linear-gradient(150deg,#12275c,#000a22)',
  },
  {
    initial: 'E',
    name: 'Prof. Dr. Eduardo Lins',
    role: 'Coordenação · Terapia Intensiva',
    bio: 'Enfermeiro intensivista e doutor em ciências da saúde. Responde pela integração entre os módulos da pós em terapia intensiva e pelo alinhamento entre bases fisiopatológicas, monitoração hemodinâmica e conduta à beira do leito.',
    gradient: 'linear-gradient(150deg,#1c3466,#050f33)',
  },
  {
    initial: 'H',
    name: 'Dra. Helena Brandão',
    role: 'Coordenação · Fisioterapia',
    bio: 'Fisioterapeuta, especialista em traumato-ortopedia e mestre em reabilitação. Atua em consultório e em clube esportivo, com foco em avaliação funcional, prescrição de exercício terapêutico e retorno seguro à atividade.',
    gradient: 'linear-gradient(150deg,#8a6d2e,#4a3818)',
  },
];

export function Instrutores() {
  return (
    <section className="blk" id="instrutores">
      <div className="wrap">
        <div className="head-row">
          <div className="lead">
            <span className="eyebrow">Corpo docente</span>
            <h2>Quem ensina, atende todos os dias</h2>
          </div>
          <p className="desc">
            Coordenação e professores com atuação assistencial e produção científica. O conteúdo vem
            da rotina de clínicas, hospitais e consultórios — não só do papel.
          </p>
        </div>
        <div className="insts">
          {INSTRUTORES.map((i) => (
            <article className="inst-c" key={i.name}>
              <div className="top" style={{ background: i.gradient }}>
                <div className="ph">
                  <span>{i.initial}</span>
                  {i.photo ? (
                    // Foto como background: se o arquivo não existir, a camada fica
                    // transparente e a inicial embaixo aparece (sem imagem quebrada).
                    <span
                      className="ph-photo"
                      role="img"
                      aria-label={i.name}
                      style={{ backgroundImage: `url(${i.photo})` }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="ib">
                <b>{i.name}</b>
                <div className="role">{i.role}</div>
                <p className="bio">{i.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
