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
    estado | fecha | numero | titulo | entidad | plazo_dias | novedades | pendiente | fotos

    estado      «Ya se hizo», «En trámite» o «Esperando respuesta»
                (también vale: hecho, tramite, espera)
    fecha       AAAA-MM-DD  (también acepta D/M/AAAA)
    plazo_dias  15 en general, 10 si se pidieron documentos o información, 0 si no aplica
    novedades   una por línea dentro de la celda:  AAAA-MM-DD: texto
    pendiente   lo que falta (puede quedar vacío)
    fotos       opcional. Una por línea:  archivo.jpg | descripción
                (el archivo va en img/actuaciones/, más su versión archivo-sm.jpg).
                Si la hoja no tiene esta columna, se conservan las fotos ya publicadas.

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

CAMPOS = ["estado", "fecha", "numero", "titulo", "entidad", "plazo", "novedades", "pendiente", "fotos"]
COLUMNAS = ["estado", "fecha", "numero", "titulo", "entidad", "plazo_dias", "novedades", "pendiente"]
COLUMNA_FOTOS = "fotos"
DIR_FOTOS = RAIZ / "img" / "actuaciones"

ESTADOS = {
    "hecho": "hecho", "ya se hizo": "hecho", "cumplido": "hecho", "resuelta": "hecho",
    "tramite": "tramite", "trámite": "tramite", "en tramite": "tramite", "en trámite": "tramite",
    "espera": "espera", "esperando respuesta": "espera", "en espera": "espera", "radicada": "espera",
}
ESTADO_HOJA = {"hecho": "Ya se hizo", "tramite": "En trámite", "espera": "Esperando respuesta"}

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

    novedades = item.get("novedades") or []
    if isinstance(novedades, str):
        lista = []
        for n, linea in enumerate(l for l in novedades.splitlines() if l.strip()):
            m = re.match(r"^\s*([\d/-]+)\s*[:|–-]\s*(.+)$", linea)
            if not m:
                raise ErrorDatos(f"{donde}: la novedad «{linea.strip()}» debe ir como AAAA-MM-DD: texto")
            lista.append([leer_fecha(m.group(1), donde), m.group(2).strip()])
        novedades = lista
    else:
        novedades = [[leer_fecha(f, donde), str(t).strip()] for f, t in novedades]
    novedades.sort(key=lambda n: n[0])

    fotos = item.get("fotos") or []
    if isinstance(fotos, str):
        lista = []
        for linea in (l for l in fotos.splitlines() if l.strip()):
            archivo, _, desc = linea.partition("|")
            lista.append([archivo.strip(), desc.strip()])
        fotos = lista
    fotos = [[str(a).strip(), str(d).strip()] for a, d in fotos]
    for archivo, desc in fotos:
        if not re.fullmatch(r"[a-z0-9-]+\.jpg", archivo):
            raise ErrorDatos(f"{donde}: el nombre de foto «{archivo}» debe ser como nombre-de-foto.jpg")
        for variante in (archivo, archivo[:-4] + "-sm.jpg"):
            if not (DIR_FOTOS / variante).exists():
                raise ErrorDatos(f"{donde}: falta el archivo img/actuaciones/{variante}")
        if not desc:
            raise ErrorDatos(f"{donde}: la foto «{archivo}» necesita una descripción")
        revisar_privacidad(desc, f"{donde} (fotos)")

    limpio = {
        "estado": estado,
        "fecha": leer_fecha(item.get("fecha"), donde),
        "numero": str(item.get("numero", "") or "").strip(),
        "titulo": titulo,
        "entidad": str(item.get("entidad", "") or "").strip(),
        "plazo": plazo,
        "novedades": novedades or [[leer_fecha(item.get("fecha"), donde), "Radicado."]],
        "pendiente": str(item.get("pendiente", "") or "").strip(),
        "fotos": fotos,
    }
    for campo in ("numero", "titulo", "entidad", "pendiente"):
        revisar_privacidad(limpio[campo], f"{donde} ({campo})")
    for _, texto in limpio["novedades"]:
        revisar_privacidad(texto, f"{donde} (novedades)")
    return limpio


def formatear(items):
    """JSON legible: un campo por línea y cada novedad en una sola línea."""
    bloques = []
    for it in items:
        lineas = []
        for k in CAMPOS:
            if k in ("novedades", "fotos"):
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
    previas = {}
    if COLUMNA_FOTOS not in filas[0]:
        try:
            previas = {(i["fecha"], i["titulo"]): i.get("fotos", []) for i in leer_js()}
        except ErrorDatos:
            previas = {}
    items = []
    for n, fila in enumerate(filas, start=2):
        if not any((v or "").strip() for v in fila.values()):
            continue
        it = normalizar(fila, f"Fila {n}")
        if COLUMNA_FOTOS not in filas[0]:
            it["fotos"] = previas.get((it["fecha"], it["titulo"]), [])
        items.append(it)
    escribir_js(items)


def exportar_csv(ruta):
    items = leer_js()
    with open(ruta, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(COLUMNAS + [COLUMNA_FOTOS])
        for it in items:
            w.writerow([
                ESTADO_HOJA[it["estado"]], it["fecha"], it["numero"], it["titulo"], it["entidad"],
                it["plazo"], "\n".join(f"{fe}: {t}" for fe, t in it["novedades"]), it["pendiente"],
                "\n".join(f"{a} | {d}" for a, d in it.get("fotos", [])),
            ])
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
