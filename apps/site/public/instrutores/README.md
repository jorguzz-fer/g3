# Fotos do corpo docente

A seção "Corpo docente" do site (`components/site/instrutores.tsx`) usa estas
fotos. Enquanto o arquivo não existe, o card mostra a inicial do docente
(fallback automático) — nada quebra. Hoje **nenhuma foto está publicada**: os
cards do site exibem a inicial.

Coloque cada foto aqui com **exatamente** o nome referenciado no componente
(quadrada, de preferência ≥ 512×512; o recorte circular é feito por CSS) e
aponte o campo `photo` do docente para ela:

| Arquivo               | Docente                                    |
| --------------------- | ------------------------------------------ |
| `mariana-costa.webp`  | Dra. Mariana Costa — Enfermagem            |
| `eduardo-lins.webp`   | Prof. Dr. Eduardo Lins — Terapia Intensiva |
| `helena-brandao.webp` | Dra. Helena Brandão — Fisioterapia         |
| `camila-antunes.webp` | Dra. Camila Antunes — Nutrição Clínica     |

O seed da API (`apps/api/src/db/seed.ts`) usa o mesmo diretório pelo campo
`photo` de cada instrutor.

Pode subir pelo GitHub (**Add file → Upload files**) direto nesta pasta.
Depois, **rebuild + redeploy do site** no Coolify.
