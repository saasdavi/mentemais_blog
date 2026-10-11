# -*- coding: utf-8 -*-
"""Corrige a data dos artigos já gerados: datePublished e dateModified passam a ser a
data e hora agendadas na planilha (a mesma que a grade mostra).

Não gera artigo nem chama IA. Por padrão só mostra o que mudaria:
    python scripts/corrigir_datas_artigos.py            # relatório, não grava
    python scripts/corrigir_datas_artigos.py --gravar   # grava nos HTMLs
"""
import csv
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_artigo_gemini import data_agendada, fixar_datas  # noqa: E402

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV = os.path.join(BASE, 'dados', 'calendario_blog_1_ano.csv')
HTML_DIR = os.path.join(BASE, 'dados', 'saida', 'html')


def data_atual(html):
    m = re.search(r'"datePublished"\s*:\s*"([^"]+)"', html)
    return m.group(1) if m else None


def main():
    gravar = '--gravar' in sys.argv
    with open(CSV, encoding='utf-8-sig', newline='') as f:
        linhas = list(csv.DictReader(f))

    ajustados, iguais, ausentes = 0, 0, 0
    for linha in linhas:
        arquivo = (linha.get('Artigo_Arquivo_HTML') or '').strip()
        if not arquivo:
            continue
        caminho = os.path.join(HTML_DIR, arquivo)
        if not os.path.isfile(caminho):
            ausentes += 1
            continue
        agenda = data_agendada(linha)
        with open(caminho, encoding='utf-8') as f:
            html = f.read()
        if data_atual(html) == agenda:
            iguais += 1
            continue
        novo = fixar_datas(html, agenda)
        print(f"{arquivo}: {data_atual(html)} -> {agenda}")
        ajustados += 1
        if gravar:
            with open(caminho, 'w', encoding='utf-8') as f:
                f.write(novo)

    modo = 'gravado' if gravar else 'simulação (use --gravar para gravar)'
    print(f"\n{modo}: {ajustados} ajustado(s), {iguais} já certo(s), {ausentes} sem arquivo.")


if __name__ == '__main__':
    main()
