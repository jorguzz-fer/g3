import Link from 'next/link';
import { LeadFormTrigger } from './lead-form';

export function Cta() {
  return (
    <section className="cta" id="cta">
      <div className="wrap cta-in">
        <h2>Comece sua pós-graduação hoje</h2>
        <p>
          Conheça a grade completa antes de decidir. Sem cartão, sem compromisso — só a formação que
          você vai usar no plantão.
        </p>
        <div className="row">
          <Link
            href="/cursos"
            className="btn btn-gold"
            style={{ padding: '14px 26px', fontSize: 16 }}
          >
            Criar conta grátis
          </Link>
          <LeadFormTrigger
            source="site-cta"
            className="btn btn-ghost"
            style={{
              padding: '14px 26px',
              fontSize: 16,
              color: '#EAECF1',
              borderColor: 'rgba(255,255,255,.28)',
            }}
          >
            Falar com a equipe
          </LeadFormTrigger>
        </div>
        <p className="fine">Já formamos mais de 15.000 profissionais da saúde em todo o Brasil.</p>
      </div>
    </section>
  );
}
