# ADR 0010 — Identidade visual G3 Educação | Saúde

- Status: aceito
- Data: 2026-09-03

## Contexto

A plataforma nasceu como um port da base Vethis (educação veterinária), cuja
identidade era verde-floresta + dourado, com tipografia serifada de sistema. A
G3 Educação | Saúde tem manual de marca próprio (Manual de Identidade Visual G3
v1.0), com paleta, tipografia e elementos gráficos definidos. Era preciso decidir
como o design system absorve essa identidade sem que cada app passe a carregar
cor solta no código.

## Opções consideradas

1. **Reaproveitar a escala existente, trocando só os valores** — rápido, mas os
   tokens continuariam chamando `green-*` enquanto pintam azul-marinho. Nome
   mentindo sobre o valor é dívida garantida na primeira manutenção.
2. **Renomear a escala para `navy-*` e ancorar os valores no manual** — um
   refactor mecânico a mais, com os nomes descrevendo o que realmente pintam.
3. Criar um segundo tema paralelo, mantendo o antigo — só faria sentido se as
   duas marcas coexistissem no mesmo produto, o que não é o caso.

## Decisão

Opção 2. `packages/design-tokens` é a fonte única:

- **Cores.** `navy-900 #001133` (Azul G3, Pantone 2767 C) é a base; `navy-700
#1C3466` é o Azul médio do manual, usado em hover, gráficos e camadas.
  `gold-500 #C9A04A` (Ouro G3, Pantone 7555 C) é acento e `gold-400 #F5C56E` é o
  Ouro claro do gradiente metálico. Neutros: marfim `#F6F5F1` e cinza azulado
  `#4A5570` para texto secundário. A proporção de aplicação é azul 65% · branco
  25% · ouro 10% — o ouro pontua filetes, detalhes e CTAs, nunca grandes áreas de
  texto.
- **Tipografia.** Cormorant Garamond nos títulos (ecoa o monograma G3) e Josefin
  Sans em texto e rótulos (ecoa a assinatura espaçada). Rótulos em caixa-alta com
  0,2–0,3 em de espaçamento. O site serve as fontes pelo `next/font`; aluno e
  backoffice, por `<link>` do Google Fonts.
- **Logotipo.** Lockup Monocromática azul (`g3-logo.png`, manual §01) em fundos
  claros; versão Principal — ouro e branco sobre azul-marinho, uso preferencial
  (`g3-badge.png`, extraída em resolução nativa do manual, com fundo
  transparente) onde há largura para os 120 px mínimos do manual e o fundo é
  escuro; símbolo isolado, claro (`g3-mark.png`) ou Principal (`g3-badge-mark.png`),
  nos espaços reduzidos que o manual prevê — nav do site, header mobile do
  aluno, favicon e avatares. Os elementos nunca são separados, reproporcionados
  ou recompostos com outra fonte.
- **Verdes semânticos preservados.** `success`, a variação positiva do dashboard
  e o estágio "ganho" do CRM continuam verdes: são significado, não marca.

## Consequências

Trocar um token reflete em site, área do aluno e backoffice de uma vez. Os apps
usam `navy-*`/`gold-*` do preset Tailwind — cor hardcodada em componente passa a
ser desvio, não hábito. O custo foi um refactor amplo (a escala `green-*`
desapareceu) e a perda da equivalência 1:1 com o protótipo aprovado original, que
foi reancorado na paleta G3 em `docs/prototype/`.
