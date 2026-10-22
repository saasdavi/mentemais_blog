// Lê os artigos publicados na base Artigos do Notion. Usado no build.
// Variáveis: NOTION_API_KEY (token da integração) e NOTION_ARTIGOS_DB (ID da base).
const NOTION_VERSION = '2022-06-28';

function cabecalhos() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

function textoDe(prop) {
  if (!prop) return '';
  const lista = prop.title ?? prop.rich_text ?? [];
  return lista.map(t => t.plain_text).join('').trim();
}

function linha(page) {
  const p = page.properties;
  return {
    id: page.id,
    titulo: textoDe(p['Título']),
    tituloSeo: textoDe(p['Título SEO']),
    slug: textoDe(p['Slug']),
    descricao: textoDe(p['Descrição']),
    categoria: p['Categoria']?.select?.name ?? '',
    tags: textoDe(p['Tags']),
    palavraChave: textoDe(p['Palavra-chave']),
    data: p['Data']?.date?.start ?? null,
    capaUrl: p['Capa URL']?.url ?? '',
    capaCredito: textoDe(p['Capa crédito']),
    altCapa: textoDe(p['Alt da capa']),
  };
}

// Consulta todas as páginas com Status = Publicado (paginando de 100 em 100).
export async function listarPublicados() {
  const base = process.env.NOTION_ARTIGOS_DB;
  const resultados = [];
  let cursor;
  do {
    const corpo = {
      filter: { property: 'Status', select: { equals: 'Publicado' } },
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    };
    const r = await fetch(`https://api.notion.com/v1/databases/${base}/query`, {
      method: 'POST',
      headers: cabecalhos(),
      body: JSON.stringify(corpo),
    });
    if (!r.ok) throw new Error(`Notion ${r.status}: ${await r.text()}`);
    const j = await r.json();
    resultados.push(...j.results.map(linha));
    cursor = j.has_more ? j.next_cursor : undefined;
  } while (cursor);
  return resultados;
}
