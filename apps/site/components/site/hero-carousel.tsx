import { getHeroSlides } from '@/lib/api';
import { HeroCarouselClient, type CarouselImageSlide } from './hero-carousel-client';

const URGENCIA = '/cursos/pos-enfermagem-urgencia-emergencia';

/**
 * Slides padrão embutidos — usados quando o admin ainda não cadastrou nenhum
 * slide (ou a API está indisponível). Assim o carrossel nunca fica vazio.
 * As coordenadas dos hotspots acompanham os botões desenhados nas artes.
 */
const DEFAULT_SLIDES: CarouselImageSlide[] = [
  {
    src: '/cursos/hero-1-urgencia-emergencia.png',
    alt: 'Pós-graduação em Enfermagem em Urgência e Emergência. 420 horas · 100% online · certificação reconhecida. Inscrições abertas para 2027.',
    hotspots: [
      {
        label: 'Garantir minha vaga',
        href: URGENCIA,
        left: '7.8%',
        top: '76.8%',
        width: '23.6%',
        height: '7.5%',
      },
      {
        label: 'Ver a grade curricular',
        href: `${URGENCIA}#disciplinas`,
        left: '32.6%',
        top: '76.8%',
        width: '26.1%',
        height: '7.5%',
      },
    ],
  },
  {
    src: '/cursos/hero-2-pos-graduacao.png',
    alt: 'G3 Educação | Saúde — formar quem cuida, cuidar de quem forma. Pós-graduação em enfermagem, fisioterapia e nutrição.',
    hotspots: [
      {
        label: 'Conhecer as pós-graduações',
        href: '/cursos',
        left: '7.8%',
        top: '76.8%',
        width: '31.6%',
        height: '7.5%',
      },
    ],
  },
];

/** Server component: busca os slides do admin; cai para os padrão se vazio. */
export async function HeroCarousel() {
  const slides = await getHeroSlides();
  const imageSlides: CarouselImageSlide[] = slides.length
    ? slides.map((s) => ({ src: s.imageUrl, alt: s.alt, hotspots: s.hotspots }))
    : DEFAULT_SLIDES;

  return <HeroCarouselClient imageSlides={imageSlides} />;
}
