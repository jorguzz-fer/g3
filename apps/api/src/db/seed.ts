import { hash } from '@node-rs/argon2';
import { and, eq, inArray, isNull, notInArray } from 'drizzle-orm';
import { loadConfig, type AppConfig } from '../config/configuration';
import { createDb } from './client';
import { courseModules, courses, instructors, lessons, specialties } from './schema/catalog';
import { enrollments } from './schema/enrollment';
import { users } from './schema/identity';
import { leads } from './schema/crm';
import { channelRules, channels } from './schema/channels';
import type { ChannelGroup, CourseLevel } from './schema/enums';

/** Especialidades/áreas do catálogo G3 — pós-graduação na área da saúde. */
const SPECIALTIES = [
  { slug: 'enfermagem', name: 'Enfermagem' },
  { slug: 'urgencia-emergencia', name: 'Urgência & Emergência' },
  { slug: 'terapia-intensiva', name: 'Terapia Intensiva' },
  { slug: 'fisioterapia', name: 'Fisioterapia' },
  { slug: 'nutricao', name: 'Nutrição Clínica' },
  { slug: 'saude-mental', name: 'Saúde Mental' },
  { slug: 'obstetricia', name: 'Obstetrícia & Neonatologia' },
  { slug: 'saude-do-idoso', name: 'Saúde do Idoso' },
  { slug: 'gestao-saude', name: 'Gestão & Auditoria em Saúde' },
  { slug: 'oncologia', name: 'Oncologia' },
  { slug: 'saude-publica', name: 'Saúde Pública & Família' },
  { slug: 'dermatologia-estetica', name: 'Dermatologia & Estética' },
];

/** Corpo docente — mesmos nomes da seção "Coordenação" do site. */
interface SeedInstructor {
  slug: string;
  name: string;
  bio: string;
  photo?: string;
}
const INSTRUCTORS: SeedInstructor[] = [
  {
    slug: 'dra-mariana-costa',
    name: 'Dra. Mariana Costa',
    bio: 'Coordenadora acadêmica da Pós-graduação em Enfermagem em Urgência e Emergência. Enfermeira, especialista em urgência e emergência e mestre em enfermagem. Atua há mais de quinze anos em pronto-socorro e coordena o acolhimento com classificação de risco em serviço de porta aberta. Traz para o curso a prática do plantão: decisão sob pressão, priorização e trabalho em equipe.',
  },
  {
    slug: 'prof-eduardo-lins',
    name: 'Prof. Dr. Eduardo Lins',
    bio: 'Coordenador científico da Pós-graduação em Enfermagem em Terapia Intensiva do Adulto. Enfermeiro intensivista, doutor em ciências da saúde, responde pela integração entre os módulos e pelo alinhamento entre bases fisiopatológicas, monitoração hemodinâmica e condutas à beira do leito.',
  },
  {
    slug: 'dra-helena-brandao',
    name: 'Dra. Helena Brandão',
    bio: 'Fisioterapeuta, especialista em traumato-ortopedia e mestre em reabilitação. Atua em consultório e em clube esportivo, com foco em avaliação funcional, prescrição de exercício terapêutico e retorno seguro à atividade.',
  },
  {
    slug: 'dra-camila-antunes',
    name: 'Dra. Camila Antunes',
    bio: 'Nutricionista clínica, especialista em terapia nutricional enteral e parenteral. Integra equipe multiprofissional de terapia nutricional hospitalar e ensina a partir de casos: triagem de risco, cálculo de necessidades e monitoramento de resposta.',
  },
  {
    slug: 'prof-rafael-moraes',
    name: 'Prof. Dr. Rafael Moraes',
    bio: 'Médico emergencista e docente de suporte avançado de vida. Instrutor de cursos de ressuscitação e coordenador de simulação realística, dedica-se ao ensino de protocolos que sobrevivem à realidade do plantão.',
  },
  {
    slug: 'dra-beatriz-siqueira',
    name: 'Dra. Beatriz Siqueira',
    bio: 'Enfermeira, especialista em saúde mental e atenção psicossocial, com atuação em CAPS e em matriciamento na atenção básica. Trabalha o cuidado em rede, a redução de danos e o manejo da crise sem infantilizar quem cuida.',
  },
];

interface SeedLesson {
  title: string;
  min: number;
  free?: boolean;
}
interface SeedModule {
  title: string;
  lessons: SeedLesson[];
}
interface SeedFaqItem {
  question: string;
  answer: string;
}
interface SeedCourse {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  priceCents: number;
  /** Teto de parcelas sem juros deste curso. Padrão 24 (teto global). */
  maxInstallments?: number;
  level: CourseLevel;
  specialty: string;
  /** Coordenação. Omitido quando ainda não definida (a seção some da página). */
  instructor?: string;
  /** Destaque: maior aparece antes na home e no catálogo. Padrão 0. */
  featuredRank?: number;
  /** Vitrine "Em breve": sem preço nem checkout. Padrão false. */
  comingSoon?: boolean;
  cover?: string;
  workloadHours?: number;
  learningObjectives?: string[];
  faq?: SeedFaqItem[];
  modules: SeedModule[];
  /**
   * Preserva capa e instrutor já existentes no banco (não sobrescreve em re-seed).
   * Para cursos cujo comercial/coordenação é gerido no backoffice.
   */
  preserveCoverInstructor?: boolean;
  /**
   * Recria os módulos/aulas a partir do seed a cada re-seed (em vez de só popular
   * quando o curso ainda não tem módulos). Use para manter a grade sincronizada.
   */
  replaceModules?: boolean;
}

/** Catálogo G3 — pós-graduações publicadas com módulos e aulas. */
const COURSES: SeedCourse[] = [
  {
    slug: 'pos-enfermagem-urgencia-emergencia',
    cover: '/cursos/pos-enfermagem-urgencia-emergencia.png',
    title: 'Pós-graduação em Enfermagem em Urgência e Emergência',
    subtitle: 'Decidir rápido sem abrir mão do método. Priorizar sem perder o paciente de vista.',
    description:
      'A Pós-graduação em Enfermagem em Urgência e Emergência forma o enfermeiro que assume a porta de entrada e a sala de emergência com segurança. A formação começa pela organização do serviço e pelo acolhimento com classificação de risco, avança pelo suporte básico e avançado de vida e percorre as emergências que realmente chegam ao plantão: cardiovasculares, respiratórias, trauma, neurológicas, metabólicas, toxicológicas, obstétricas e pediátricas. Mais do que listar protocolos, o curso desenvolve o raciocínio clínico do enfermeiro: avaliar em segundos, priorizar com critério, executar a conduta certa e registrar o que aconteceu. São 420 horas, com duração de até 12 meses, na modalidade EaD, combinando videoaulas gravadas, leitura dirigida, casos clínicos, simulações comentadas, quizzes, fóruns, encontros síncronos e projeto aplicado ao serviço em que o aluno atua.',
    priceCents: 898800,
    level: 'avancado',
    specialty: 'urgencia-emergencia',
    instructor: 'dra-mariana-costa',
    featuredRank: 30,
    preserveCoverInstructor: true,
    replaceModules: true,
    workloadHours: 420,
    learningObjectives: [
      'Aplicar o acolhimento com classificação de risco e sustentar a decisão de prioridade.',
      'Conduzir o suporte básico e avançado de vida conforme as diretrizes vigentes.',
      'Reconhecer precocemente sinais de deterioração clínica e acionar a resposta rápida.',
      'Executar e monitorar condutas de enfermagem nas principais emergências clínicas e cirúrgicas.',
      'Coordenar o atendimento inicial ao politraumatizado dentro da equipe.',
      'Sistematizar a assistência de enfermagem e registrar com qualidade sob pressão de tempo.',
      'Aplicar metas de segurança do paciente e analisar eventos adversos do serviço.',
    ],
    faq: [
      {
        question: 'Para quem é esta pós-graduação?',
        answer:
          'Para enfermeiros que atuam, ou pretendem atuar, em pronto-socorro, unidade de pronto atendimento, sala de estabilização, atendimento pré-hospitalar e serviços de resposta rápida, incluindo quem deseja revisar bases e atualizar protocolos.',
      },
      {
        question: 'Qual a duração e a carga horária?',
        answer:
          'A formação tem duração máxima de 12 meses e 420 horas no total: 140 horas de videoaulas gravadas somadas a atividades acadêmicas complementares orientadas (leitura dirigida, casos clínicos, simulações comentadas, exercícios, fóruns, encontros síncronos e projeto aplicado).',
      },
      {
        question: 'Como funciona a metodologia?',
        answer:
          'Modalidade EaD, com liberação progressiva dos módulos no ambiente virtual. Cada módulo reúne videoaulas, material de apoio (protocolos, diretrizes e artigos), casos clínicos, quiz e exercícios de decisão, no seu ritmo e de qualquer dispositivo.',
      },
      {
        question: 'Como é a avaliação?',
        answer:
          'A avaliação é contínua e considera o desempenho nos quizzes, a resolução dos casos clínicos, a participação nos fóruns, avaliações periódicas e o projeto aplicado ao serviço em que o aluno atua.',
      },
      {
        question: 'O certificado é reconhecido?',
        answer:
          'Sim. A pós-graduação lato sensu é certificada pela G3 Educação | Saúde, instituição de ensino superior credenciada, e o certificado tem validade em todo o território nacional.',
      },
    ],
    modules: [
      {
        title: 'Módulo 1: Organização do Serviço e Classificação de Risco',
        lessons: [
          { title: 'A rede de urgência e emergência e o lugar do enfermeiro', min: 15, free: true },
          { title: 'Acolhimento com classificação de risco: protocolos e critérios', min: 18 },
          { title: 'Avaliação primária e secundária em poucos minutos', min: 16 },
          { title: 'Sinais vitais, escores de alerta precoce e deterioração clínica', min: 15 },
          { title: 'Fluxos internos, superlotação e gestão de leitos na emergência', min: 14 },
        ],
      },
      {
        title: 'Módulo 2: Suporte Básico e Avançado de Vida',
        lessons: [
          {
            title: 'Parada cardiorrespiratória: reconhecimento e cadeia de sobrevivência',
            min: 16,
          },
          { title: 'Compressões, ventilação e desfibrilação de qualidade', min: 18 },
          { title: 'Vias aéreas: manejo básico, avançado e o papel do enfermeiro', min: 20 },
          { title: 'Drogas da parada e preparo seguro sob pressão', min: 15 },
          { title: 'Cuidados pós-ressuscitação e transporte intra-hospitalar', min: 16 },
          { title: 'Liderança e comunicação em equipe durante a ressuscitação', min: 14 },
        ],
      },
      {
        title: 'Módulo 3: Emergências Cardiovasculares e Respiratórias',
        lessons: [
          { title: 'Dor torácica: triagem, ECG precoce e tempo porta-agulha', min: 20 },
          { title: 'Síndromes coronarianas agudas: condutas de enfermagem', min: 18 },
          { title: 'Insuficiência cardíaca descompensada e edema agudo de pulmão', min: 17 },
          { title: 'Arritmias instáveis: cardioversão e marca-passo transcutâneo', min: 16 },
          { title: 'Insuficiência respiratória aguda e oxigenoterapia', min: 18 },
          { title: 'Ventilação não invasiva e preparo para intubação', min: 17 },
          { title: 'Asma grave, DPOC exacerbada e tromboembolismo pulmonar', min: 19 },
        ],
      },
      {
        title: 'Módulo 4: Trauma e Atendimento Pré-Hospitalar',
        lessons: [
          { title: 'Cinemática do trauma e avaliação primária XABCDE', min: 18 },
          { title: 'Controle de hemorragias e choque hemorrágico', min: 17 },
          { title: 'Trauma cranioencefálico e raquimedular: imobilização e vigilância', min: 18 },
          { title: 'Trauma torácico e abdominal: sinais que não podem passar', min: 16 },
          { title: 'Queimaduras, afogamento e emergências ambientais', min: 16 },
          { title: 'Atendimento pré-hospitalar, regulação e transferência', min: 15 },
          { title: 'Múltiplas vítimas: triagem em incidente de massa', min: 14 },
        ],
      },
      {
        title: 'Módulo 5: Emergências Neurológicas, Metabólicas e Toxicológicas',
        lessons: [
          { title: 'Acidente vascular cerebral: protocolo e janela terapêutica', min: 20 },
          { title: 'Crise convulsiva e estado de mal epiléptico', min: 16 },
          { title: 'Rebaixamento do nível de consciência: investigação sistematizada', min: 16 },
          { title: 'Cetoacidose diabética, estado hiperosmolar e hipoglicemia', min: 18 },
          { title: 'Distúrbios hidroeletrolíticos e ácido-básicos na emergência', min: 17 },
          { title: 'Sepse: identificação precoce e pacote da primeira hora', min: 20 },
          { title: 'Intoxicações exógenas e antídotos', min: 16 },
        ],
      },
      {
        title: 'Módulo 6: Emergências Obstétricas, Pediátricas e em Saúde Mental',
        lessons: [
          { title: 'Síndromes hipertensivas da gestação e eclâmpsia', min: 17 },
          { title: 'Hemorragia obstétrica e parto de emergência', min: 16 },
          { title: 'Particularidades da criança grave: avaliação e vias aéreas', min: 18 },
          {
            title: 'Desidratação, convulsão febril e desconforto respiratório na criança',
            min: 16,
          },
          { title: 'Crise em saúde mental: manejo verbal e contenção segura', min: 17 },
          { title: 'Violência e notificação compulsória: o papel do enfermeiro', min: 15 },
        ],
      },
      {
        title: 'Módulo 7: Sistematização da Assistência e Segurança do Paciente',
        lessons: [
          { title: 'Processo de enfermagem na emergência: diagnósticos e prescrição', min: 18 },
          { title: 'Registro e passagem de plantão sob pressão de tempo', min: 15 },
          { title: 'Metas internacionais de segurança do paciente', min: 16 },
          { title: 'Segurança medicamentosa e medicamentos potencialmente perigosos', min: 17 },
          { title: 'Prevenção e controle de infecção na porta de entrada', min: 15 },
          { title: 'Notificação e análise de eventos adversos', min: 14 },
        ],
      },
      {
        title: 'Módulo 8: Gestão do Serviço e Projeto Aplicado',
        lessons: [
          { title: 'Dimensionamento e escala em serviços de urgência', min: 16 },
          { title: 'Indicadores do pronto-socorro e leitura de dados', min: 16 },
          { title: 'Educação permanente e simulação realística no serviço', min: 15 },
          { title: 'Aspectos éticos e legais do exercício profissional na urgência', min: 17 },
          { title: 'Projeto aplicado: diagnóstico e plano de melhoria do seu serviço', min: 20 },
        ],
      },
    ],
  },
  {
    slug: 'pos-terapia-intensiva-adulto',
    cover: '/cursos/pos-terapia-intensiva-adulto.png',
    title: 'Pós-graduação em Enfermagem em Terapia Intensiva do Adulto',
    subtitle: 'Do monitor ao leito: interpretar o número e agir sobre o paciente.',
    description:
      'Formação para o enfermeiro que cuida do paciente crítico. O programa parte da avaliação sistematizada e da monitoração hemodinâmica, percorre ventilação mecânica, sedação e analgesia, sepse e choque, disfunções orgânicas, terapia nutricional e prevenção de complicações da imobilidade, e fecha com humanização, cuidados paliativos na UTI e gestão da unidade. São 400 horas em EaD, com casos comentados à beira do leito, interpretação de parâmetros e projeto aplicado.',
    priceCents: 878800,
    level: 'avancado',
    specialty: 'terapia-intensiva',
    instructor: 'prof-eduardo-lins',
    featuredRank: 20,
    replaceModules: true,
    workloadHours: 400,
    learningObjectives: [
      'Avaliar o paciente crítico de forma sistematizada e reconhecer deterioração precoce.',
      'Interpretar parâmetros hemodinâmicos e ventilatórios e traduzi-los em conduta.',
      'Assistir o paciente em ventilação mecânica, da instalação ao desmame.',
      'Aplicar escalas de sedação, analgesia e delirium na rotina da unidade.',
      'Conduzir o pacote de sepse e o manejo dos diferentes tipos de choque.',
      'Prevenir infecções relacionadas à assistência e complicações da imobilidade.',
      'Integrar família e equipe no cuidado, inclusive em cuidados de fim de vida.',
    ],
    faq: [
      {
        question: 'Para quem é esta pós-graduação?',
        answer:
          'Para enfermeiros que atuam ou pretendem atuar em unidade de terapia intensiva adulto, unidade coronariana, unidade semi-intensiva e serviços de resposta rápida.',
      },
      {
        question: 'Qual a duração e a carga horária?',
        answer:
          'Duração máxima de 12 meses e 400 horas no total, somando videoaulas gravadas e atividades acadêmicas complementares orientadas.',
      },
      {
        question: 'Preciso de experiência prévia em UTI?',
        answer:
          'Não. O programa começa pelas bases da avaliação do paciente crítico e avança progressivamente, mas quem já atua na unidade aproveita mais os casos aplicados.',
      },
    ],
    modules: [
      {
        title: 'Módulo 1: O Paciente Crítico e a Unidade',
        lessons: [
          { title: 'Avaliação sistematizada do paciente crítico', min: 18, free: true },
          { title: 'Escores de gravidade e escores de alerta precoce', min: 15 },
          { title: 'Times de resposta rápida e transferência segura', min: 14 },
        ],
      },
      {
        title: 'Módulo 2: Monitoração Hemodinâmica',
        lessons: [
          { title: 'Pressão arterial invasiva: montagem, zero e curva', min: 18 },
          { title: 'Pressão venosa central, débito cardíaco e responsividade a volume', min: 20 },
          { title: 'Drogas vasoativas: preparo, titulação e desmame', min: 19 },
          { title: 'Arritmias na UTI e leitura do monitor', min: 16 },
        ],
      },
      {
        title: 'Módulo 3: Ventilação Mecânica',
        lessons: [
          { title: 'Modos ventilatórios e parâmetros iniciais', min: 20 },
          { title: 'Assistência à intubação e cuidados com a via aérea artificial', min: 18 },
          { title: 'Ventilação protetora, SDRA e posição prona', min: 20 },
          { title: 'Aspiração, umidificação e prevenção de pneumonia associada', min: 16 },
          { title: 'Desmame, extubação e ventilação não invasiva no pós-extubação', min: 18 },
        ],
      },
      {
        title: 'Módulo 4: Sedação, Analgesia e Delirium',
        lessons: [
          { title: 'Escalas de sedação e analgesia na prática diária', min: 16 },
          { title: 'Delirium: prevenção, rastreio e manejo não farmacológico', min: 17 },
          { title: 'Mobilização precoce e o pacote ABCDEF', min: 16 },
        ],
      },
      {
        title: 'Módulo 5: Sepse, Choque e Disfunções Orgânicas',
        lessons: [
          { title: 'Sepse e choque séptico: pacote da primeira hora', min: 20 },
          { title: 'Choque cardiogênico, hipovolêmico e obstrutivo', min: 18 },
          { title: 'Injúria renal aguda e terapias de substituição renal', min: 20 },
          { title: 'Disfunção hepática, coagulopatias e hemocomponentes', min: 17 },
          { title: 'Emergências neurológicas na UTI e monitoração intracraniana', min: 18 },
        ],
      },
      {
        title: 'Módulo 6: Terapia Nutricional, Pele e Prevenção',
        lessons: [
          { title: 'Terapia nutricional enteral e parenteral no paciente crítico', min: 18 },
          { title: 'Lesão por pressão: avaliação de risco e prevenção', min: 16 },
          { title: 'Feridas complexas e curativos na UTI', min: 16 },
          { title: 'Prevenção de infecções relacionadas a cateter e sonda', min: 17 },
        ],
      },
      {
        title: 'Módulo 7: Humanização, Ética e Gestão da Unidade',
        lessons: [
          { title: 'Comunicação difícil e acolhimento da família', min: 16 },
          { title: 'Cuidados paliativos e decisões de fim de vida na UTI', min: 18 },
          { title: 'Doação de órgãos e manutenção do potencial doador', min: 16 },
          { title: 'Indicadores, dimensionamento e projeto aplicado', min: 18 },
        ],
      },
    ],
  },
  {
    slug: 'pos-fisioterapia-traumato-ortopedica',
    cover: '/cursos/pos-fisioterapia-traumato-ortopedica.png',
    title: 'Pós-graduação em Fisioterapia Traumato-Ortopédica e Desportiva',
    subtitle: 'Avaliar com critério, prescrever exercício e devolver o paciente à vida dele.',
    description:
      'Formação para o fisioterapeuta que atende dor e lesão musculoesquelética em consultório, clínica ou clube. O programa cobre avaliação funcional e raciocínio clínico, reabilitação por segmento (coluna, ombro, quadril, joelho, pé e tornozelo), pós-operatório ortopédico, prescrição de exercício terapêutico, controle de carga e critérios objetivos de retorno ao esporte. São 380 horas em EaD, com testes demonstrados, progressões de exercício e casos reais.',
    priceCents: 798800,
    level: 'avancado',
    specialty: 'fisioterapia',
    instructor: 'dra-helena-brandao',
    featuredRank: 10,
    replaceModules: true,
    workloadHours: 380,
    learningObjectives: [
      'Conduzir avaliação funcional completa e formular hipóteses com raciocínio clínico.',
      'Selecionar e aplicar testes especiais com consciência das suas limitações.',
      'Prescrever exercício terapêutico com dose, progressão e critério de avanço.',
      'Reabilitar as principais lesões por segmento e o pós-operatório ortopédico.',
      'Monitorar carga de treino e prevenir recidiva no atleta.',
      'Definir critérios objetivos de alta e de retorno ao esporte.',
    ],
    faq: [
      {
        question: 'Para quem é esta pós-graduação?',
        answer:
          'Para fisioterapeutas que atendem dor e lesão musculoesquelética em consultório, clínica, hospital ou ambiente esportivo.',
      },
      {
        question: 'Qual a duração e a carga horária?',
        answer:
          'Duração máxima de 12 meses e 380 horas no total, entre videoaulas gravadas e atividades acadêmicas complementares orientadas.',
      },
      {
        question: 'O curso é prático?',
        answer:
          'As aulas demonstram testes, manobras e progressões de exercício em vídeo, e as atividades pedem a aplicação em pacientes da sua própria rotina, discutida nos fóruns e no projeto aplicado.',
      },
    ],
    modules: [
      {
        title: 'Módulo 1: Avaliação e Raciocínio Clínico',
        lessons: [
          { title: 'Anamnese dirigida e construção da hipótese', min: 16, free: true },
          { title: 'Avaliação funcional, goniometria e força', min: 18 },
          { title: 'Testes especiais: o que cada um responde (e o que não)', min: 18 },
          { title: 'Dor: mecanismos, sensibilização e educação em dor', min: 17 },
          { title: 'Bandeiras vermelhas e quando encaminhar', min: 14 },
        ],
      },
      {
        title: 'Módulo 2: Exercício Terapêutico e Controle de Carga',
        lessons: [
          { title: 'Princípios de dose: volume, intensidade e frequência', min: 18 },
          { title: 'Força, potência e resistência na reabilitação', min: 18 },
          { title: 'Progressão de carga e critérios de avanço', min: 16 },
          { title: 'Recursos complementares: quando somam e quando distraem', min: 15 },
        ],
      },
      {
        title: 'Módulo 3: Coluna Vertebral',
        lessons: [
          { title: 'Cervicalgia e cefaleia cervicogênica', min: 18 },
          { title: 'Lombalgia inespecífica: avaliação e conduta baseada em evidência', min: 20 },
          { title: 'Radiculopatias e estenose de canal', min: 17 },
          { title: 'Exercício para coluna: estabilização e movimento', min: 18 },
        ],
      },
      {
        title: 'Módulo 4: Membro Superior',
        lessons: [
          { title: 'Ombro doloroso: manguito rotador e conflito subacromial', min: 19 },
          { title: 'Instabilidade glenoumeral e ombro do atleta de arremesso', min: 17 },
          { title: 'Cotovelo: tendinopatias e sobrecarga', min: 15 },
          { title: 'Punho e mão: lesões frequentes e reabilitação', min: 16 },
        ],
      },
      {
        title: 'Módulo 5: Membro Inferior',
        lessons: [
          { title: 'Quadril: dor femoroacetabular e glútea', min: 17 },
          { title: 'Joelho: lesão do LCA, da reconstrução ao retorno ao esporte', min: 22 },
          { title: 'Dor femoropatelar e tendinopatia patelar', min: 18 },
          { title: 'Tornozelo e pé: entorse, instabilidade e tendinopatia do Aquiles', min: 19 },
          { title: 'Lesão muscular dos isquiotibiais e prevenção de recidiva', min: 18 },
        ],
      },
      {
        title: 'Módulo 6: Pós-operatório Ortopédico',
        lessons: [
          { title: 'Fases da cicatrização e o que elas permitem', min: 16 },
          { title: 'Artroplastias de quadril e joelho: protocolo e marcos', min: 19 },
          { title: 'Pós-operatório de ombro e de coluna', min: 18 },
          { title: 'Fraturas e osteossíntese: carga, prazos e cuidados', min: 16 },
        ],
      },
      {
        title: 'Módulo 7: Fisioterapia Desportiva e Retorno ao Esporte',
        lessons: [
          { title: 'Avaliação do atleta e triagem pré-temporada', min: 17 },
          { title: 'Monitoramento de carga e prevenção de lesões', min: 18 },
          { title: 'Testes funcionais e critérios objetivos de retorno', min: 20 },
          { title: 'Projeto aplicado: protocolo de retorno para um caso real', min: 20 },
        ],
      },
    ],
  },
  {
    slug: 'pos-nutricao-clinica',
    cover: '/cursos/pos-nutricao-clinica.png',
    title: 'Pós-graduação em Nutrição Clínica e Terapia Nutricional',
    subtitle: 'Da triagem de risco à conduta que muda o desfecho do paciente.',
    description:
      'Formação para o nutricionista que atua em hospital, ambulatório ou consultório. O programa cobre avaliação e diagnóstico nutricional, necessidades energéticas e proteicas, terapia nutricional enteral e parenteral, nutrição nas principais doenças crônicas e agudas, nutrição do paciente crítico, oncológico e do idoso, além de prescrição dietética e acompanhamento. São 360 horas em EaD, com cálculo aplicado a casos reais.',
    priceCents: 748800,
    level: 'intermediario',
    specialty: 'nutricao',
    instructor: 'dra-camila-antunes',
    replaceModules: true,
    workloadHours: 360,
    learningObjectives: [
      'Aplicar ferramentas de triagem de risco e firmar o diagnóstico nutricional.',
      'Calcular necessidades energéticas, proteicas e de micronutrientes com critério.',
      'Indicar, prescrever e monitorar terapia nutricional enteral e parenteral.',
      'Adequar a conduta nutricional às principais doenças crônicas e agudas.',
      'Reconhecer e prevenir a síndrome de realimentação e outras complicações.',
      'Elaborar prescrição dietética individualizada e acompanhar a resposta.',
    ],
    faq: [
      {
        question: 'Para quem é esta pós-graduação?',
        answer:
          'Para nutricionistas que atuam ou pretendem atuar em nutrição clínica hospitalar, ambulatorial ou em consultório, e que participam de equipes multiprofissionais de terapia nutricional.',
      },
      {
        question: 'Qual a duração e a carga horária?',
        answer:
          'Duração máxima de 12 meses e 360 horas no total, entre videoaulas gravadas e atividades acadêmicas complementares orientadas.',
      },
    ],
    modules: [
      {
        title: 'Módulo 1: Avaliação e Diagnóstico Nutricional',
        lessons: [
          {
            title: 'Triagem de risco nutricional: qual ferramenta para qual cenário',
            min: 16,
            free: true,
          },
          { title: 'Antropometria, composição corporal e força de preensão', min: 18 },
          { title: 'Exame físico nutricional e marcadores bioquímicos', min: 17 },
          { title: 'Diagnóstico de desnutrição e de sarcopenia', min: 17 },
        ],
      },
      {
        title: 'Módulo 2: Necessidades e Prescrição Dietética',
        lessons: [
          { title: 'Gasto energético: equações preditivas e calorimetria', min: 18 },
          { title: 'Necessidades proteicas por perfil de paciente', min: 16 },
          { title: 'Micronutrientes, hidratação e suplementação', min: 16 },
          { title: 'Montagem do plano alimentar e adesão', min: 17 },
        ],
      },
      {
        title: 'Módulo 3: Terapia Nutricional Enteral e Parenteral',
        lessons: [
          { title: 'Indicação, vias de acesso e escolha da fórmula enteral', min: 19 },
          { title: 'Progressão, tolerância e complicações da nutrição enteral', min: 18 },
          { title: 'Nutrição parenteral: indicação, composição e monitoramento', min: 20 },
          { title: 'Síndrome de realimentação: prevenir antes de tratar', min: 16 },
        ],
      },
      {
        title: 'Módulo 4: Nutrição nas Doenças Crônicas',
        lessons: [
          { title: 'Diabetes e resistência insulínica', min: 18 },
          { title: 'Obesidade e pré e pós-operatório de cirurgia bariátrica', min: 19 },
          { title: 'Doença renal crônica e diálise', min: 18 },
          { title: 'Doenças cardiovasculares e dislipidemias', min: 16 },
          { title: 'Doenças gastrointestinais e hepáticas', min: 18 },
        ],
      },
      {
        title: 'Módulo 5: Paciente Crítico, Oncológico e Idoso',
        lessons: [
          { title: 'Nutrição do paciente crítico: quando, quanto e como', min: 20 },
          { title: 'Nutrição em oncologia e manejo de sintomas', min: 18 },
          { title: 'Nutrição do idoso, disfagia e adaptação de consistência', min: 18 },
          { title: 'Cuidados paliativos e decisões sobre alimentar', min: 16 },
        ],
      },
      {
        title: 'Módulo 6: Prática, Ética e Projeto Aplicado',
        lessons: [
          { title: 'Registro em prontuário e comunicação com a equipe', min: 15 },
          { title: 'Indicadores de qualidade em terapia nutricional', min: 16 },
          { title: 'Ética profissional e limites de atuação', min: 15 },
          { title: 'Projeto aplicado: caso clínico completo, da triagem à alta', min: 20 },
        ],
      },
    ],
  },
  {
    slug: 'pos-saude-mental',
    cover: '/cursos/pos-saude-mental.png',
    title: 'Pós-graduação em Saúde Mental e Atenção Psicossocial',
    subtitle: 'Cuidado em rede, manejo da crise e clínica ampliada.',
    description:
      'Formação para profissionais de saúde que atuam na rede de atenção psicossocial: bases da reforma psiquiátrica, projeto terapêutico singular, manejo da crise, redução de danos, matriciamento na atenção básica e cuidado ao profissional que cuida.',
    priceCents: 698800,
    level: 'intermediario',
    specialty: 'saude-mental',
    instructor: 'dra-beatriz-siqueira',
    comingSoon: true,
    workloadHours: 360,
    modules: [
      {
        title: 'A rede de atenção psicossocial',
        lessons: [
          { title: 'Reforma psiquiátrica e o cuidado em liberdade', min: 16, free: true },
          { title: 'Projeto terapêutico singular na prática', min: 20 },
        ],
      },
      {
        title: 'Manejo clínico',
        lessons: [
          { title: 'Crise: acolhimento, manejo verbal e segurança', min: 22 },
          { title: 'Álcool e outras drogas: redução de danos', min: 18 },
        ],
      },
    ],
  },
  {
    slug: 'pos-obstetricia-neonatologia',
    cover: '/cursos/pos-obstetricia-neonatologia.png',
    title: 'Pós-graduação em Enfermagem Obstétrica e Neonatal',
    subtitle: 'Do pré-natal ao alojamento conjunto, com evidência e respeito.',
    description:
      'Programa voltado ao cuidado da mulher e do recém-nascido: pré-natal de risco habitual, assistência ao parto baseada em evidências, emergências obstétricas, cuidados imediatos ao recém-nascido, aleitamento materno e cuidado neonatal de alto risco.',
    priceCents: 748800,
    level: 'avancado',
    specialty: 'obstetricia',
    comingSoon: true,
    workloadHours: 400,
    modules: [
      {
        title: 'Assistência ao ciclo gravídico-puerperal',
        lessons: [
          { title: 'Pré-natal de risco habitual e rastreios', min: 18, free: true },
          { title: 'Assistência ao parto e boas práticas', min: 22 },
        ],
      },
      {
        title: 'Cuidado neonatal',
        lessons: [
          { title: 'Cuidados imediatos e reanimação neonatal', min: 20 },
          { title: 'Aleitamento materno e alojamento conjunto', min: 18 },
        ],
      },
    ],
  },
  {
    slug: 'pos-saude-do-idoso',
    cover: '/cursos/pos-saude-do-idoso.png',
    title: 'Pós-graduação em Saúde do Idoso e Gerontologia',
    subtitle: 'Avaliação multidimensional e cuidado que preserva autonomia.',
    description:
      'Formação multiprofissional em gerontologia: avaliação geriátrica ampla, síndromes geriátricas, polifarmácia, funcionalidade e fragilidade, cuidado domiciliar, suporte ao cuidador e cuidados paliativos.',
    priceCents: 698800,
    level: 'intermediario',
    specialty: 'saude-do-idoso',
    comingSoon: true,
    workloadHours: 360,
    modules: [
      {
        title: 'Avaliação e síndromes geriátricas',
        lessons: [
          { title: 'Avaliação geriátrica ampla na prática', min: 18, free: true },
          { title: 'Quedas, fragilidade e sarcopenia', min: 20 },
        ],
      },
      {
        title: 'Cuidado longitudinal',
        lessons: [
          { title: 'Polifarmácia e desprescrição', min: 18 },
          { title: 'Cuidado domiciliar e suporte ao cuidador', min: 17 },
        ],
      },
    ],
  },
  {
    slug: 'gestao-auditoria-saude',
    cover: '/cursos/gestao-auditoria-saude.png',
    title: 'Pós-graduação em Gestão e Auditoria em Serviços de Saúde',
    subtitle: 'Indicadores, contas e qualidade — a saúde vista pela operação.',
    description:
      'Programa para quem coordena serviços e equipes: planejamento e indicadores assistenciais, custos e faturamento, auditoria de contas e de qualidade, acreditação, LGPD aplicada à saúde e gestão de pessoas.',
    priceCents: 648800,
    level: 'intermediario',
    specialty: 'gestao-saude',
    comingSoon: true,
    workloadHours: 360,
    modules: [
      {
        title: 'Gestão de serviços de saúde',
        lessons: [
          { title: 'Indicadores assistenciais e painéis de gestão', min: 18, free: true },
          { title: 'Custos, faturamento e glosas', min: 20 },
        ],
      },
      {
        title: 'Auditoria e qualidade',
        lessons: [
          { title: 'Auditoria de contas e de prontuário', min: 19 },
          { title: 'Acreditação e segurança do paciente', min: 18 },
        ],
      },
    ],
  },
];

/** Seed de desenvolvimento idempotente (ON CONFLICT DO NOTHING por slug). */
async function main(): Promise<void> {
  const config: AppConfig = loadConfig();
  const { db, sql } = createDb(config.DATABASE_URL);

  await db
    .insert(specialties)
    .values(SPECIALTIES)
    .onConflictDoNothing({ target: specialties.slug });

  // Instrutores (upsert idempotente): cria e ATUALIZA nome, bio e foto, para que
  // uma troca de coordenação no seed se reflita em re-seed.
  for (const i of INSTRUCTORS) {
    const avatarUrl = i.photo ? `${config.APP_URL}/instrutores/${i.photo}` : null;
    await db
      .insert(instructors)
      .values({ slug: i.slug, name: i.name, bio: i.bio, avatarUrl })
      .onConflictDoUpdate({
        target: instructors.slug,
        set: { name: i.name, bio: i.bio, avatarUrl },
      });
  }

  // Mapas slug → id para especialidades e instrutores.
  const specialtyId = new Map<string, string>();
  for (const s of await db
    .select({ id: specialties.id, slug: specialties.slug })
    .from(specialties)) {
    specialtyId.set(s.slug, s.id);
  }
  const instructorId = new Map<string, string>();
  for (const i of await db
    .select({ id: instructors.id, slug: instructors.slug })
    .from(instructors)) {
    instructorId.set(i.slug, i.id);
  }

  // Cursos + módulos + aulas.
  for (const c of COURSES) {
    // Campos escalares do curso — idempotentes: atualiza se já existir (para que
    // mudanças de preço, capa, destaque, ementa etc. sejam aplicadas em re-seed).
    const scalars = {
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      priceCents: c.priceCents,
      maxInstallments: c.maxInstallments ?? 24,
      level: c.level,
      status: 'published' as const,
      featuredRank: c.featuredRank ?? 0,
      comingSoon: c.comingSoon ?? false,
      specialtyId: specialtyId.get(c.specialty) ?? null,
      instructorId: (c.instructor ? instructorId.get(c.instructor) : undefined) ?? null,
      coverUrl: c.cover ? `${config.APP_URL}${c.cover}` : null,
      workloadHours: c.workloadHours ?? null,
      learningObjectives: c.learningObjectives ?? [],
      faq: c.faq ?? [],
    };
    // Em re-seed, opcionalmente preserva capa/instrutor já definidos no admin
    // (não sobrescreve esses campos; os demais continuam sincronizados pelo seed).
    const setScalars: Partial<typeof scalars> = { ...scalars };
    if (c.preserveCoverInstructor) {
      delete setScalars.coverUrl;
      delete setScalars.instructorId;
    }
    const [course] = await db
      .insert(courses)
      .values({ slug: c.slug, publishedAt: new Date(), ...scalars })
      .onConflictDoUpdate({ target: courses.slug, set: setScalars })
      .returning({ id: courses.id });
    if (!course) continue;

    // Módulos/aulas: por padrão só popula quando o curso ainda não tem nenhum
    // (evita duplicar em re-seed). Com `replaceModules`, recria a grade a partir
    // do seed — apaga os módulos/aulas atuais e insere os do seed.
    const [hasModule] = await db
      .select({ id: courseModules.id })
      .from(courseModules)
      .where(eq(courseModules.courseId, course.id))
      .limit(1);
    if (hasModule && !c.replaceModules) continue;
    if (hasModule && c.replaceModules) {
      const existing = await db
        .select({ id: courseModules.id })
        .from(courseModules)
        .where(eq(courseModules.courseId, course.id));
      const ids = existing.map((m) => m.id);
      if (ids.length) {
        await db.delete(lessons).where(inArray(lessons.moduleId, ids));
        await db.delete(courseModules).where(eq(courseModules.courseId, course.id));
      }
    }
    let mPos = 0;
    for (const m of c.modules) {
      mPos += 1;
      const [mod] = await db
        .insert(courseModules)
        .values({ courseId: course.id, title: m.title, position: mPos })
        .returning({ id: courseModules.id });
      if (!mod) continue;
      let lPos = 0;
      for (const l of m.lessons) {
        lPos += 1;
        await db.insert(lessons).values({
          moduleId: mod.id,
          title: l.title,
          durationSeconds: l.min * 60,
          position: lPos,
          isFree: l.free ?? false,
        });
      }
    }
  }
  console.log(`Cursos: ${COURSES.length} definidos (idempotente).`);

  // Poda: em pré-lançamento o seed é a FONTE DE VERDADE do catálogo. Todo curso
  // publicado fora do seed é legado/duplicata → soft-delete. Reversível
  // (deleted_at); o catálogo já filtra por ele. Os cursos do seed são
  // preservados (estão em seedSlugs).
  // OBS: mantenha SEED_ON_START=false após o lançamento para não podar cursos
  // criados pelo backoffice.
  const seedSlugs = COURSES.map((c) => c.slug);
  const pruned = await db
    .update(courses)
    .set({ deletedAt: new Date() })
    .where(and(notInArray(courses.slug, seedSlugs), isNull(courses.deletedAt)))
    .returning({ slug: courses.slug });
  if (pruned.length > 0) {
    console.log(`Cursos podados (fora do seed): ${pruned.map((p) => p.slug).join(', ')}`);
  }

  // Aluno demo + matrícula no primeiro curso (para testar a área do aluno).
  const [firstCourse] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, COURSES[0]!.slug))
    .limit(1);

  const passwordHash = await hash('aluno12345');
  const [student] = await db
    .insert(users)
    .values({ email: 'aluno@g3educacaosaude.dev', passwordHash, name: 'Aluno Demo', role: 'aluno' })
    .onConflictDoNothing({ target: users.email })
    .returning();

  const studentRow =
    student ??
    (await db.select().from(users).where(eq(users.email, 'aluno@g3educacaosaude.dev')).limit(1))[0];
  if (studentRow && firstCourse) {
    await db
      .insert(enrollments)
      .values({ userId: studentRow.id, courseId: firstCourse.id, status: 'active' })
      .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] });
    console.log('Aluno demo: aluno@g3educacaosaude.dev / aluno12345 (matriculado).');
  }

  // Usuário staff para o backoffice.
  const staffHash = await hash('staff12345');
  await db
    .insert(users)
    .values({
      email: 'staff@g3educacaosaude.dev',
      passwordHash: staffHash,
      name: 'Equipe G3',
      role: 'staff',
    })
    .onConflictDoNothing({ target: users.email });
  console.log('Staff demo: staff@g3educacaosaude.dev / staff12345.');

  // Leads de exemplo para o CRM.
  await db
    .insert(leads)
    .values([
      { name: 'Enf. Larissa Prado', email: 'larissa@example.com', stage: 'new' },
      { name: 'Hospital Municipal Norte', email: 'ensino@hmnorte.example', stage: 'contacted' },
      { name: 'Clínica Reabilita', email: 'contato@reabilita.example', stage: 'qualified' },
    ])
    .onConflictDoNothing();

  // Canais de aquisição do CRM (template do mapa de fluxo) + regras UTM→canal.
  type SeedChannel = {
    name: string;
    group: ChannelGroup;
    color: string;
    sortOrder: number;
    rules: Array<{ s: string; m: string | null }>;
  };
  const GOLD = '#C9A04A';
  const NAVY = '#345089';
  const BLUE = '#2B6CB0';
  const SEED_CHANNELS: SeedChannel[] = [
    {
      name: 'Google Ads',
      group: 'pago',
      color: GOLD,
      sortOrder: 1,
      rules: [
        { s: 'google', m: 'cpc' },
        { s: 'google', m: 'paid' },
      ],
    },
    {
      name: 'Meta Ads',
      group: 'pago',
      color: GOLD,
      sortOrder: 2,
      rules: [
        { s: 'facebook', m: 'paid' },
        { s: 'instagram', m: 'paid' },
        { s: 'ig', m: 'paid' },
        { s: 'meta', m: null },
      ],
    },
    {
      name: 'TikTok Ads',
      group: 'pago',
      color: GOLD,
      sortOrder: 3,
      rules: [{ s: 'tiktok', m: null }],
    },
    {
      name: 'LinkedIn',
      group: 'pago',
      color: GOLD,
      sortOrder: 4,
      rules: [{ s: 'linkedin', m: null }],
    },
    {
      name: 'Landing pages',
      group: 'organico',
      color: NAVY,
      sortOrder: 5,
      rules: [{ s: 'landing', m: null }],
    },
    {
      name: 'Blog',
      group: 'organico',
      color: NAVY,
      sortOrder: 6,
      rules: [{ s: 'blog', m: null }],
    },
    {
      name: 'Instagram',
      group: 'organico',
      color: NAVY,
      sortOrder: 7,
      rules: [
        { s: 'instagram', m: 'organic' },
        { s: 'instagram', m: null },
      ],
    },
    {
      name: 'E-mail mkt',
      group: 'organico',
      color: NAVY,
      sortOrder: 8,
      rules: [
        { s: 'newsletter', m: null },
        { s: 'email', m: null },
      ],
    },
    {
      name: 'Quiz vocacional',
      group: 'organico',
      color: NAVY,
      sortOrder: 9,
      rules: [{ s: 'quiz', m: null }],
    },
    {
      name: 'Base própria',
      group: 'base_propria',
      color: BLUE,
      sortOrder: 10,
      rules: [
        { s: 'crm', m: null },
        { s: 'base', m: null },
      ],
    },
    {
      name: 'Upsell',
      group: 'base_propria',
      color: BLUE,
      sortOrder: 11,
      rules: [{ s: 'upsell', m: null }],
    },
    {
      name: 'Egressos',
      group: 'base_propria',
      color: BLUE,
      sortOrder: 12,
      rules: [{ s: 'egressos', m: null }],
    },
    {
      name: 'Cross-sell',
      group: 'base_propria',
      color: BLUE,
      sortOrder: 13,
      rules: [{ s: 'crosssell', m: null }],
    },
  ];
  for (const ch of SEED_CHANNELS) {
    const [inserted] = await db
      .insert(channels)
      .values({ name: ch.name, group: ch.group, color: ch.color, sortOrder: ch.sortOrder })
      .onConflictDoNothing({ target: channels.name })
      .returning({ id: channels.id });
    let channelId = inserted?.id;
    if (!channelId) {
      const [ex] = await db
        .select({ id: channels.id })
        .from(channels)
        .where(eq(channels.name, ch.name))
        .limit(1);
      channelId = ex?.id;
    }
    if (channelId) {
      await db
        .insert(channelRules)
        .values(ch.rules.map((r) => ({ channelId, utmSource: r.s, utmMedium: r.m })))
        .onConflictDoNothing();
    }
  }
  console.log(`Canais: ${SEED_CHANNELS.length} definidos (idempotente).`);

  console.log('Seed concluído.');
  await sql.end();
}

main().catch((err) => {
  console.error('Falha no seed:', err);
  process.exit(1);
});
