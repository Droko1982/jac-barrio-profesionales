"""
Prepara un PDF para publicarlo en el portal SIN datos sensibles ni firmas.

Tacha de verdad (borra el texto y los pixeles, no solo los tapa):
  - números de cédula (80.718.017, C.C. 80718017); no toca pesos ni NIT de empresas,
  - celulares (311 311 1669),
  - correos personales (se conservan los institucionales y el de la Junta),
  - direcciones de residencias particulares listadas en PARTICULARES,
  - códigos de validación / ID de firma (con ellos se baja el original sin tachar),
  - las firmas, códigos QR, zonas y nombres que se indiquen a mano
    (--quitar / --zona / --texto).
Además borra metadatos, adjuntos y texto oculto.

Uso:
  1) Ver qué tiene el documento (imágenes numeradas y cuadrícula en puntos):
       python herramientas/publicar_documento.py analizar ENTRADA.pdf CARPETA_VISTA
  2) Publicarlo:
       python herramientas/publicar_documento.py publicar ENTRADA.pdf documentos/SALIDA.pdf \
           [--quitar PAG:IMG ...] [--zona PAG:x0,y0,x1,y1 ...] [--vista CARPETA_VISTA]
     PAG empieza en 1. IMG es el número que muestra «analizar».
  3) Mirar SIEMPRE la vista previa antes de publicar.

Requiere PyMuPDF (pip install pymupdf).
"""
import argparse
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

GRIS = (0.82, 0.82, 0.82)

# Correos que sí pueden quedar (entidades públicas y la Junta).
CORREOS_PUBLICOS = re.compile(
    r'(?i)^(jaclosprofesionales@gmail\.com|federacioncomunalquindio@gmail\.com|comuna10armenia@outlook\.com|'
    r'.*@(?:[\w-]+\.)*(?:armenia\.gov\.co|quindio\.gov\.co|gobernacionquindio\.gov\.co|epa\.com\.co|epa\.gov\.co|'
    r'edeq\.com\.co|ramajudicial\.gov\.co|personeriaarmenia\.gov\.co|personeriarmenia\.gov\.co|crq\.gov\.co|mininterior\.gov\.co|'
    r'procuraduria\.gov\.co|contraloria\.gov\.co|fiscalia\.gov\.co|4-72\.com\.co))$')

# Residencias particulares que nunca se publican (no son de entidades ni del árbol).
PARTICULARES = [
    r'(?i)calle\s*6\s*norte\s*(?:#|No\.?|N\.?\s*°)?\s*16\s*[-–]\s*51\b',
    r'(?i)sierra\s*grande',
    r'(?i)apartamento\s+\d+',
    r'(?i)apto\.?\s*\d+',
    r'\b16\s*[-–]\s*51\b',
    r'(?i)calle\s*5\s*norte\s*(?:#|No\.?|N\.?\s*°)?\s*18\s*[-–]?\s*A\s*[-–]?\s*11\b',
    r'(?i)\b18\s*[-–]?\s*A\s*[-–]?\s*11\b',
    r'\b18\s*[-–]\s*42\b',
]

# Códigos con los que cualquiera puede descargar el original (sin tachar) en el portal de la entidad.
CODIGOS = [
    # Un código lleva un dígito o mezcla minúscula-MAYÚSCULA (JengZALO); así no se confunde con «Anexos».
    r'(?i:c[óo]digo\s+de\s+validaci[óo]n):?\s*((?=[\w+/=]*(?:\d|[a-z][A-Z]))[\w+/=]{5,})',
    r'(?i:\bID\s*firma):?\s*((?=[\w+/=]*(?:\d|[a-z][A-Z]))[\w+/=]{6,})',
    r'(?i)c[óo]digo\s+de\s+verificaci[óo]n:?\s*([0-9a-f]{20,})',
]

PATRONES = [
    # Cédulas con puntos. No toca valores en pesos ($62.749.769.099) ni NIT de empresas (900.276.962-1).
    ('cédula', r'(?<![\d.,$])(?<!\$ )\d{1,3}(?:\.\d{3}){2,3}(?!\d|\.\d|-\d)'),
    ('cédula', r'(?i)(?:\bC\.?\s?C\.?|c[ée]dula(?:\s+de\s+ciudadan[ií]a)?)\s*(?:N\.?\s*[o°º]\.?\s*|No\.?\s*)?(\d{6,10})\b'),
    ('celular', r'(?<!\d)3\d{2}[\s.-]{0,3}\d{3}[\s.-]{0,3}\d{4}(?!\d)'),
    ('correo', r'[\w.+-]+@[\w-]+(?:\.[\w-]+)+'),
] + [('dirección particular', p) for p in PARTICULARES] + [('código de validación', p) for p in CODIGOS]


def hallazgos(texto):
    """Devuelve [(tipo, cadena)] de datos sensibles en un texto."""
    out = []
    for tipo, pat in PATRONES:
        for m in re.finditer(pat, texto):
            s = m.group(1) if m.groups() and m.group(1) else m.group(0)
            if tipo == 'correo' and CORREOS_PUBLICOS.match(s):
                continue
            out.append((tipo, s))
    return out


def rects_de(page, cadena):
    """Ubica una cadena en la página; si cruza líneas, prueba por partes."""
    cad = re.sub(r'\s+', ' ', cadena).strip()
    r = page.search_for(cad)
    if r:
        return r
    partes = [p for p in re.split(r'\s+', cad) if len(p) >= 3]
    res = []
    for p in partes:
        res += page.search_for(p)
    return res


def analizar(entrada, vista):
    doc = fitz.open(entrada)
    vista = Path(vista)
    vista.mkdir(parents=True, exist_ok=True)
    print(f'{entrada}: {doc.page_count} páginas')
    for pno, page in enumerate(doc, 1):
        texto = page.get_text()
        infos = page.get_image_info(xrefs=True)
        print(f'  pág {pno}: {len(texto)} car. de texto, {len(infos)} imágenes')
        for i, inf in enumerate(infos, 1):
            b = fitz.Rect(inf['bbox'])
            print(f'     IMG {i}: x {b.x0:.0f}-{b.x1:.0f}  y {b.y0:.0f}-{b.y1:.0f}  ({b.width:.0f}x{b.height:.0f} pt)')
        for tipo, s in hallazgos(texto):
            print(f'     DATO {tipo}: {s!r}')
        # Vista con cuadrícula cada 50 pt e imágenes numeradas.
        shape = page.new_shape()
        w, h = page.rect.width, page.rect.height
        for x in range(0, int(w) + 1, 50):
            shape.draw_line((x, 0), (x, h))
        for y in range(0, int(h) + 1, 50):
            shape.draw_line((0, y), (w, y))
        shape.finish(color=(0.2, 0.6, 1), width=0.3)
        for i, inf in enumerate(infos, 1):
            shape.draw_rect(fitz.Rect(inf['bbox']))
        shape.finish(color=(1, 0, 0), width=1.2)
        shape.commit()
        for x in range(0, int(w) + 1, 100):
            page.insert_text((x + 2, 9), str(x), fontsize=7, color=(0, 0.3, 1))
        for y in range(100, int(h) + 1, 100):
            page.insert_text((2, y - 2), str(y), fontsize=7, color=(0, 0.3, 1))
        for i, inf in enumerate(infos, 1):
            b = fitz.Rect(inf['bbox'])
            page.insert_text((b.x0 + 3, b.y0 + 12), f'IMG {i}', fontsize=11, color=(1, 0, 0))
        page.get_pixmap(dpi=60).save(vista / f'{Path(entrada).stem}_p{pno}.png')
    doc.close()


def publicar(entrada, salida, quitar, zonas, vista, textos=(), comprimir=False, paginas=''):
    doc = fitz.open(entrada)
    total = 0
    for pno, page in enumerate(doc, 1):
        infos = page.get_image_info(xrefs=True)
        encontrados = [s for _, s in hallazgos(page.get_text())]
        for s in encontrados + list(textos):
            for r in rects_de(page, s) if s in encontrados else page.search_for(s):
                page.add_redact_annot(r, fill=GRIS)
                total += 1
        for q in quitar:
            partes = q.split(':')
            p, i = int(partes[0]), int(partes[1])
            etiqueta = 'código QR retirado' if partes[2:] == ['qr'] else 'firma retirada'
            if p == pno:
                b = fitz.Rect(infos[i - 1]['bbox'])
                page.add_redact_annot(b, text=etiqueta, fontsize=7, fill=GRIS, align=fitz.TEXT_ALIGN_CENTER)
                total += 1
        for z in zonas:
            p, coords = z.split(':')
            if int(p) == pno:
                x0, y0, x1, y1 = (float(v) for v in coords.split(','))
                page.add_redact_annot(fitz.Rect(x0, y0, x1, y1), text='dato protegido', fontsize=8,
                                      fill=GRIS, align=fitz.TEXT_ALIGN_CENTER)
                total += 1
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS)
    if paginas:
        ini, fin = (int(v) for v in paginas.split('-'))
        doc.select(list(range(ini - 1, fin)))
    doc.scrub(attached_files=True, clean_pages=True, embedded_files=True, hidden_text=True, javascript=True,
              metadata=True, redactions=True, remove_links=False, reset_fields=True, thumbnails=True, xml_metadata=True)
    # Solo para escaneos: baja las imágenes a 150 ppp (más liviano en celulares).
    # No usar en diseños con fondos degradados (se dañan); nunca usar subset_fonts (borra letras).
    if comprimir:
        doc.rewrite_images(dpi_threshold=170, dpi_target=150, quality=65)
    doc.set_metadata({'title': Path(salida).stem.replace('-', ' '), 'author': 'JAC Barrio Los Profesionales'})
    Path(salida).parent.mkdir(parents=True, exist_ok=True)
    doc.save(salida, garbage=4, deflate=True, clean=True)
    doc.close()

    # Verificación: el resultado no debe tener datos sensibles en el texto.
    out = fitz.open(salida)
    restos = [(n, t, s) for n, pg in enumerate(out, 1) for t, s in hallazgos(pg.get_text())]
    restos += [(n, 'texto pedido', s) for n, pg in enumerate(out, 1) for s in textos
               if s.lower() in re.sub(r'\s+', ' ', pg.get_text()).lower()]
    if vista:
        vista = Path(vista)
        vista.mkdir(parents=True, exist_ok=True)
        for n, pg in enumerate(out, 1):
            pg.get_pixmap(dpi=80).save(vista / f'{Path(salida).stem}_p{n}.png')
    print(f'{salida}: {out.page_count} pág, {total} zonas tachadas, {Path(salida).stat().st_size // 1024} KB')
    out.close()
    for n, t, s in restos:
        print(f'  ¡QUEDA! pág {n} {t}: {s!r}')
    return not restos


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    a = sub.add_parser('analizar')
    a.add_argument('entrada')
    a.add_argument('vista')
    p = sub.add_parser('publicar')
    p.add_argument('entrada')
    p.add_argument('salida')
    p.add_argument('--quitar', nargs='*', default=[], help='PAG:IMG (firma) o PAG:IMG:qr (código QR) a retirar')
    p.add_argument('--zona', nargs='*', default=[], help='PAG:x0,y0,x1,y1 en puntos')
    p.add_argument('--texto', nargs='*', default=[], help='otras palabras a tachar (p. ej. el nombre de un particular)')
    p.add_argument('--comprimir', action='store_true', help='bajar la resolución de escaneos (solo documentos escaneados)')
    p.add_argument('--paginas', default='', help='publicar solo estas páginas, p. ej. 1-3')
    p.add_argument('--vista', default='')
    args = ap.parse_args()
    if args.cmd == 'analizar':
        analizar(args.entrada, args.vista)
    else:
        ok = publicar(args.entrada, args.salida, args.quitar, args.zona, args.vista, args.texto, args.comprimir,
                      args.paginas)
        sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
