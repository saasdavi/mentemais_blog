// Converte o corpo de um artigo do Notion (blocos) em HTML.
// Usa a mesma chave NOTION_API_KEY de notion-artigos.js.
const NOTION_VERSION = '2022-06-28';

function escapar(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function trechoHtml(t) {
  let s = escapar(t.plain_text ?? '');
  const a = t.annotations ?? {};
  if (a.code) s = `<code>${s}</code>`;
  if (a.bold) s = `<strong>${s}</strong>`;
  if (a.italic) s = `<em>${s}</em>`;
  if (t.href) s = `<a href="${escapar(t.href)}">${s}</a>`;
  return s;
}

function textoHtml(lista = []) {
  return lista.map(trechoHtml).join('');
}

// Busca todos os blocos filhos de uma página (paginando de 100 em 100).
export async function listarBlocos(blockId) {
  const blocos = [];
  let cursor;
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    url.searchParams.set('page_size', '100');
    if (cursor) url.searchParams.set('start_cursor', cursor);
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
      },
    });
    if (!r.ok) throw new Error(`Notion ${r.status}: ${await r.text()}`);
    const j = await r.json();
    blocos.push(...j.results);
    cursor = j.has_more ? j.next_cursor : undefined;
  } while (cursor);
  return blocos;
}

// Converte uma lista de blocos em HTML. Agrupa itens de lista em <ul> / <ol>.
export async function blocosParaHtml(blocos) {
  const partes = [];
  let lista = null; // 'ul' | 'ol' | null
  const fechar = () => {
    if (lista) partes.push(`</${lista}>`);
    lista = null;
  };
  for (const b of blocos) {
    const tipo = b.type;
    if (tipo === 'bulleted_list_item' || tipo === 'numbered_list_item') {
      const alvo = tipo === 'bulleted_list_item' ? 'ul' : 'ol';
      if (lista !== alvo) {
        fechar();
        partes.push(`<${alvo}>`);
        lista = alvo;
      }
      partes.push(`<li>${textoHtml(b[tipo].rich_text)}</li>`);
      continue;
    }
    fechar();
    const d = b[tipo];
    switch (tipo) {
      case 'heading_1':
      case 'heading_2':
      case 'heading_3': {
        const nivel = tipo.slice(-1);
        partes.push(`<h${nivel}>${textoHtml(d.rich_text)}</h${nivel}>`);
        break;
      }
      case 'paragraph': {
        const txt = textoHtml(d.rich_text);
        if (txt) partes.push(`<p>${txt}</p>`);
        break;
      }
      case 'quote':
        partes.push(`<blockquote>${textoHtml(d.rich_text)}</blockquote>`);
        break;
      case 'divider':
        partes.push('<hr />');
        break;
      default:
        // Outros tipos de bloco são ignorados (o runbook diz que o build ignora sem erro).
        break;
    }
  }
  fechar();
  return partes.join('\n');
}

// Atalho: busca os blocos da página do artigo e devolve o HTML do corpo.
export async function corpoDoArtigo(pageId) {
  return blocosParaHtml(await listarBlocos(pageId));
}
