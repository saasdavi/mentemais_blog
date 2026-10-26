export const prerender = true;

const body = `# Mente Leve

> Blog Mente Leve: artigos informativos sobre ansiedade, estresse, sono, meditação e bem-estar mental. Conteúdo educativo, não substitui consulta com profissional de saúde.

## Páginas principais

- [Início](https://www.mentemais.blog/): artigos mais recentes e temas do blog
- [Sobre](https://www.mentemais.blog/sobre): quem escreve o blog e com que objetivo
- [Política editorial](https://www.mentemais.blog/politica-editorial): como os artigos são criados e revisados
- [Contato](https://www.mentemais.blog/contato): canal oficial de contato

## Avisos e políticas

- [Aviso médico](https://www.mentemais.blog/aviso-medico): o conteúdo é informativo e não é diagnóstico
- [Termos de uso](https://www.mentemais.blog/termos-de-uso)
- [Privacidade](https://www.mentemais.blog/privacidade)
- [Divulgação de afiliados](https://www.mentemais.blog/divulgacao-afiliados)

## Feeds

- [RSS](https://www.mentemais.blog/rss.xml)
- [Sitemap](https://www.mentemais.blog/sitemap.xml)
`;

export function GET() {
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
