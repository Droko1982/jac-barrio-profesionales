#!/usr/bin/env python3
"""
Sincroniza el «Registro de actuaciones» (hoja de Google Drive) con el portal.

Uso:
    python herramientas/actualizar_actuaciones.py importar registro.csv
        Lee el CSV descargado de la hoja y reescribe js/actuaciones.js.

    python herramientas/actualizar_actuaciones.py exportar registro.csv
        Hace lo contrario: genera el CSV a partir del portal (para subirlo a Drive).

    python herramientas/actualizar_actuaciones.py desde-json datos.json
        Igual que importar, pero desde una lista JSON con los mismos campos.

Columnas de la hoja (fila 1):
    estado | fecha | numero | titulo | entidad | plazo_dias | novedades | pendiente | enviados | fotos | documentos

    estado      «Ya se hizo», «En trámite» o «Esperando respuesta»
                (también vale: hecho, tramite, espera)
    fecha       AAAA-MM-DD  (también acepta D/M/AAAA)
    plazo_dias  15 en general, 10 si se pidieron documentos o información, 0 si no aplica
    novedades   una por línea dentro de la celda:  AAAA-MM-DD [tipo]: texto
                tipo (opcional, alimenta «La gestión mes a mes»):
                  enviado      la Junta envió un oficio, petición o escrito
                               («enviado x2» si en ese paso salieron dos)
                  respuesta    una entidad respondió o actuó
                  visita       visita técnica, reunión o asamblea
                  avance       otro avance (publicación, resultado)
                  antecedente  pasó antes de que existiera esta Junta
                Si una línea no trae tipo, se conserva el que ya estaba publicado.
    pendiente   lo que falta (puede quedar vacío)
    enviados    opcional. Cuántos oficios, peticiones o escritos envió la Junta en esta
                actuación (el portal los suma). Si la hoja no tiene la columna, se conservan.
    fotos       opcional. Una por línea:  archivo.jpg | descripción
                (el archivo va en img/actuaciones/, más su versión archivo-sm.jpg).
                Si la hoja no tiene esta columna, se conservan las fotos ya publicadas.
    documentos  opcional. Uno por línea:  archivo.pdf | descripción
                (el PDF va en documentos/, ya tachado con herramientas/publicar_documento.py).
                Si la hoja no tiene esta columna, se conservan los documentos ya publicados.

El script se niega a publicar si encuentra algo que parezca un teléfono o una cédula.
Solo usa la biblioteca estándar de Python.
"""

import csv
import datetime as dt
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARCHIVO_JS = RAIZ / "js" / "actuaciones.js"
INICIO = "/* INICIO-ACTUACIONES */"
FIN = "/* FIN-ACTUACIONES */"

CAMPOS = ["estado", "fecha", "numero", "titulo", "entidad", "plazo", "enviados", "novedades", "pendiente", "fotos", "documentos"]
COLUMNAS = ["estado", "fecha", "numero", "titulo", "entidad", "plazo_dias", "novedades", "pendiente"]
COLUMNA_FOTOS = "fotos"
COLUMNA_DOCS = "documentos"
LISTAS = (COLUMNA_FOTOS, COLUMNA_DOCS)  # columnas opcionales con «archivo | descripción»
COLUMNA_ENVIADOS = "enviados"
OPCIONALES = (COLUMNA_ENVIADOS,) + LISTAS  # si faltan en la hoja, se conservan los valores publicados
DIR_FOTOS = RAIZ / "img" / "actuaciones"
DIR_DOCS = RAIZ / "documentos"

ESTADOS = {
    "hecho": "hecho", "ya se hizo": "hecho", "cumplido": "hecho", "resuelta": "hecho",
    "tramite": "tramite", "trámite": "tramite", "en tramite": "tramite", "en trámite": "tramite",
    "espera": "espera", "esperando respuesta": "espera", "en espera": "espera", "radicada": "espera",
}
ESTADO_HOJA = {"hecho": "Ya se hizo", "tramite": "En trámite", "espera": "Esperando respuesta"}

# Tipo de cada paso (novedad): [fecha, texto, tipo] o [fecha, texto, "enviado", n] si salieron n escritos
TIPOS = {
    "enviado": "enviado", "enviada": "enviado", "envio": "enviado", "envío": "enviado",
    "respuesta": "respuesta", "respondio": "respuesta", "respondió": "respuesta",
    "visita": "visita", "reunion": "visita", "reunión": "visita", "asamblea": "visita",
    "avance": "avance", "novedad": "avance", "logro": "avance",
    "antecedente": "antecedente",
}
RE_NOVEDAD = re.compile(r"^\s*([\d/-]+)\s*(?:\[\s*([^\]x\d]+?)(?:\s*x\s*(\d+))?\s*\])?\s*[:|–-]\s*(.+)$", re.IGNORECASE)


def leer_tipo(tipo, cantidad, donde):
    if not tipo:
        return []
    t = TIPOS.get(str(tipo).strip().lower())
    if not t:
        raise ErrorDatos(f"{donde}: el tipo «{tipo}» no existe (usa enviado, respuesta, visita, avance o antecedente)")
    n = int(cantidad or 1)
    return [t, n] if t == "enviado" and n > 1 else [t]

# Patrones de datos personales que nunca deben publicarse
PRIVADOS = [
    (re.compile(r"\b3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b"), "un número de celular"),
    (re.compile(r"(?<!\$)(?<!\$ )\b\d{1,3}(?:\.\d{3}){2,3}\b"), "un número de cédula"),
    (re.compile(r"\b(c\.?\s?c\.?|c[ée]dula)\s*(n[°o.º]*)?\s*\d", re.IGNORECASE), "una cédula"),
]


class ErrorDatos(Exception):
    pass


def leer_fecha(texto, donde):
    texto = (texto or "").strip()
    m = re.fullmatch(r"(\d{4})-(\d{1,2})-(\d{1,2})", texto)
    if m:
        a, mes, d = map(int, m.groups())
    else:
        m = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", texto)
        if not m:
            raise ErrorDatos(f"{donde}: la fecha «{texto}» debe ir como AAAA-MM-DD")
        d, mes, a = map(int, m.groups())
    try:
        return dt.date(a, mes, d).isoformat()
    except ValueError:
        raise ErrorDatos(f"{donde}: la fecha «{texto}» no existe")


def revisar_privacidad(texto, donde):
    for patron, que in PRIVADOS:
        if patron.search(texto or ""):
            raise ErrorDatos(f"{donde}: parece contener {que}. No se publican datos personales.")


def lista_archivos(valor):
    """Convierte «archivo | descripción» (una por línea) o una lista JSON en [[archivo, descripción]]."""
    valor = valor or []
    if isinstance(valor, str):
        lista = []
        for linea in (l for l in valor.splitlines() if l.strip()):
            archivo, _, desc = linea.partition("|")
            lista.append([archivo.strip(), desc.strip()])
        valor = lista
    return [[str(a).strip(), str(d).strip()] for a, d in valor]


def normalizar(item, donde):
    estado = ESTADOS.get(str(item.get("estado", "")).strip().lower())
    if not estado:
        raise ErrorDatos(f"{donde}: estado «{item.get('estado')}» no válido "
                         "(usa Ya se hizo, En trámite o Esperando respuesta)")
    titulo = str(item.get("titulo", "")).strip()
    if not titulo:
        raise ErrorDatos(f"{donde}: falta el título")
    try:
        plazo = int(str(item.get("plazo", item.get("plazo_dias", 0)) or 0).strip())
    except ValueError:
        raise ErrorDatos(f"{donde}: plazo_dias debe ser un número")
    try:
        enviados = int(str(item.get("enviados", 0) or 0).strip())
    except ValueError:
        raise ErrorDatos(f"{donde}: enviados debe ser un número")

    novedades = item.get("novedades") or []
    if isinstance(novedades, str):
        lista = []
        for linea in (l for l in novedades.splitlines() if l.strip()):
            m = RE_NOVEDAD.match(linea)
            if not m:
                raise ErrorDatos(f"{donde}: la novedad «{linea.strip()}» debe ir como AAAA-MM-DD: texto")
            lista.append([leer_fecha(m.group(1), donde), m.group(4).strip()] + leer_tipo(m.group(2), m.group(3), donde))
        novedades = lista
    else:
        novedades = [[leer_fecha(n[0], donde), str(n[1]).strip()] +
                     leer_tipo(n[2] if len(n) > 2 else "", n[3] if len(n) > 3 else 1, donde) for n in novedades]
    novedades.sort(key=lambda n: n[0])

    fotos = lista_archivos(item.get("fotos"))
    for archivo, desc in fotos:
        if not re.fullmatch(r"[a-z0-9-]+\.jpg", archivo):
            raise ErrorDatos(f"{donde}: el nombre de foto «{archivo}» debe ser como nombre-de-foto.jpg")
        for variante in (archivo, archivo[:-4] + "-sm.jpg"):
            if not (DIR_FOTOS / variante).exists():
                raise ErrorDatos(f"{donde}: falta el archivo img/actuaciones/{variante}")
        if not desc:
            raise ErrorDatos(f"{donde}: la foto «{archivo}» necesita una descripción")
        revisar_privacidad(desc, f"{donde} (fotos)")

    documentos = lista_archivos(item.get("documentos"))
    for archivo, desc in documentos:
        if not re.fullmatch(r"[A-Za-z0-9-]+\.pdf", archivo):
            raise ErrorDatos(f"{donde}: el nombre de documento «{archivo}» debe ser como nombre-del-documento.pdf")
        if not (DIR_DOCS / archivo).exists():
            raise ErrorDatos(f"{donde}: falta el archivo documentos/{archivo} (tácharlo antes con publicar_documento.py)")
        if not desc:
            raise ErrorDatos(f"{donde}: el documento «{archivo}» necesita una descripción")
        revisar_privacidad(desc, f"{donde} (documentos)")

    limpio = {
        "estado": estado,
        "fecha": leer_fecha(item.get("fecha"), donde),
        "numero": str(item.get("numero", "") or "").strip(),
        "titulo": titulo,
        "entidad": str(item.get("entidad", "") or "").strip(),
        "plazo": plazo,
        "enviados": enviados,
        "novedades": novedades or [[leer_fecha(item.get("fecha"), donde), "Radicado."]],
        "pendiente": str(item.get("pendiente", "") or "").strip(),
        "fotos": fotos,
        "documentos": documentos,
    }
    for campo in ("numero", "titulo", "entidad", "pendiente"):
        revisar_privacidad(limpio[campo], f"{donde} ({campo})")
    for nov in limpio["novedades"]:
        revisar_privacidad(nov[1], f"{donde} (novedades)")
    return limpio


def revisar_enviados(items):
    """Avisa si los pasos «enviado» no suman lo mismo que la columna enviados."""
    for it in items:
        if not any(len(n) > 2 for n in it["novedades"]):
            continue
        suma = sum((n[3] if len(n) > 3 else 1) for n in it["novedades"] if len(n) > 2 and n[2] == "enviado")
        if suma != it["enviados"]:
            print(f"AVISO: «{it['titulo'][:60]}»: enviados = {it['enviados']}, "
                  f"pero los pasos marcados [enviado] suman {suma}. Revisa la hoja.")


def conservar_tipos(it, previa):
    """Si la hoja no trae el tipo de un paso, se deja el que ya estaba publicado (misma fecha y texto)."""
    tipos = {(n[0], n[1]): n[2:] for n in (previa or {}).get("novedades", []) if len(n) > 2}
    it["novedades"] = [n if len(n) > 2 else n + tipos.get((n[0], n[1]), []) for n in it["novedades"]]


def formatear(items):
    """JSON legible: un campo por línea y cada novedad en una sola línea."""
    bloques = []
    for it in items:
        lineas = []
        for k in CAMPOS:
            if k in ("novedades",) + LISTAS:
                if not it.get(k):
                    lineas.append(f'        "{k}": []')
                    continue
                nov = ",\n".join("            " + json.dumps(n, ensure_ascii=False) for n in it[k])
                lineas.append(f'        "{k}": [\n{nov}\n        ]')
            else:
                lineas.append(f"        {json.dumps(k)}: {json.dumps(it[k], ensure_ascii=False)}")
        bloques.append("    {\n" + ",\n".join(lineas) + "\n    }")
    return "[\n" + ",\n".join(bloques) + "\n]"


ORDEN = {"espera": 0, "tramite": 1, "hecho": 2}


def escribir_js(items, actualizado=None):
    items = sorted(items, key=lambda i: (ORDEN[i["estado"]], i["fecha"]), reverse=False)
    texto = ARCHIVO_JS.read_text(encoding="utf-8")
    a, b = texto.find(INICIO), texto.find(FIN)
    if a < 0 or b < a:
        raise ErrorDatos(f"No encuentro los marcadores {INICIO} / {FIN} en {ARCHIVO_JS}")
    texto = texto[: a + len(INICIO)] + "\n" + formatear(items) + "\n" + texto[b:]
    fecha = actualizado or dt.date.today().isoformat()
    texto = re.sub(r"actualizado: '[\d-]+'", f"actualizado: '{fecha}'", texto, count=1)
    ARCHIVO_JS.write_text(texto, encoding="utf-8", newline="\n")
    cuenta = {e: sum(1 for i in items if i["estado"] == e) for e in ORDEN}
    print(f"OK: {len(items)} actuaciones escritas en {ARCHIVO_JS.relative_to(RAIZ)} "
          f"(ya se hizo {cuenta['hecho']}, en trámite {cuenta['tramite']}, "
          f"esperando {cuenta['espera']}). Actualizado: {fecha}")


def leer_js():
    texto = ARCHIVO_JS.read_text(encoding="utf-8")
    a, b = texto.find(INICIO), texto.find(FIN)
    if a < 0 or b < a:
        raise ErrorDatos("No encuentro los marcadores en js/actuaciones.js")
    return json.loads(texto[a + len(INICIO): b])


def importar_csv(ruta):
    with open(ruta, encoding="utf-8-sig", newline="") as f:
        filas = list(csv.DictReader(f))
    if not filas:
        raise ErrorDatos("El CSV está vacío")
    faltan = [c for c in COLUMNAS if c not in filas[0]]
    if faltan:
        raise ErrorDatos(f"Faltan columnas en el CSV: {', '.join(faltan)}")
    # Si la hoja no trae «fotos» o «documentos», se conservan los ya publicados (misma fecha y título).
    sin_columna = [c for c in OPCIONALES if c not in filas[0]]
    try:
        previas = {(i["fecha"], i["titulo"]): i for i in leer_js()}
    except ErrorDatos:
        previas = {}
    items = []
    for n, fila in enumerate(filas, start=2):
        if not any((v or "").strip() for v in fila.values()):
            continue
        it = normalizar(fila, f"Fila {n}")
        previa = previas.get((it["fecha"], it["titulo"]), {})
        for c in sin_columna:
            it[c] = previa.get(c, 0 if c == COLUMNA_ENVIADOS else [])
        conservar_tipos(it, previa)
        items.append(it)
    revisar_enviados(items)
    escribir_js(items)


def linea_novedad(n):
    """[fecha, texto, tipo, cantidad] → «AAAA-MM-DD [tipo xN]: texto» (como se escribe en la hoja)."""
    tipo = ""
    if len(n) > 2:
        tipo = f" [{n[2]}" + (f" x{n[3]}" if len(n) > 3 and n[3] > 1 else "") + "]"
    return f"{n[0]}{tipo}: {n[1]}"


def exportar_csv(ruta):
    items = leer_js()
    with open(ruta, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(COLUMNAS + list(OPCIONALES))
        for it in items:
            w.writerow([
                ESTADO_HOJA[it["estado"]], it["fecha"], it["numero"], it["titulo"], it["entidad"],
                it["plazo"], "\n".join(linea_novedad(n) for n in it["novedades"]), it["pendiente"],
                it.get(COLUMNA_ENVIADOS, 0),
            ] + ["\n".join(f"{a} | {d}" for a, d in it.get(c, [])) for c in LISTAS])
    print(f"OK: {len(items)} actuaciones exportadas a {ruta}")


def main(argv):
    if len(argv) != 3 or argv[1] not in ("importar", "exportar", "desde-json"):
        print(__doc__)
        return 2
    try:
        if argv[1] == "importar":
            importar_csv(argv[2])
        elif argv[1] == "exportar":
            exportar_csv(argv[2])
        else:
            datos = json.loads(Path(argv[2]).read_text(encoding="utf-8"))
            escribir_js([normalizar(d, f"Elemento {i + 1}") for i, d in enumerate(datos)])
    except ErrorDatos as e:
        print(f"ERROR: {e}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
