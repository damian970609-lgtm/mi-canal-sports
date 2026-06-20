import requests
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Configuración Maestra
FUENTES_EXTERNAS = [
    "https://iptv-org.github.io/iptv/regions/amer.m3u",
    "https://iptv-org.github.io/iptv/regions/eur.m3u",
    "https://iptv-org.github.io/iptv/regions/asia.m3u",
    "https://iptv-org.github.io/iptv/regions/afr.m3u",
    "https://iptv-org.github.io/iptv/regions/oce.m3u"
]

ESTRUCTURA = {"Deportes_Live": [], "Eventos_Especiales": [], "TV_General": []}

def es_deporte(texto):
    return any(k in texto.lower() for k in ['sport', 'futbol', 'soccer', 'bein', 'espn', 'tnt', 'fox', 'gol'])

def trabajar():
    # 1. Proceso de Fútbol Libre / Jeinz Macías (Prioridad)
    logging.info("Sincronizando fuentes premium...")
    # (El script buscará dinámicamente aquí)
    ESTRUCTURA["Deportes_Live"].append({"label": "En vivo - Evento 1", "stream": "procesando_link", "protected": True})

    # 2. Proceso de TDTChannels
    try:
        data = requests.get("https://www.tdtchannels.com/lists/tv.json", headers=HEADERS).json()
        for c in data.get('channels', []):
            if es_deporte(c['name']):
                ESTRUCTURA["Deportes_Live"].append({"label": c['name'], "stream": c['url'], "protected": True})
    except: pass

    # 3. Proceso de Listas IPTV-ORG
    for url in FUENTES_EXTERNAS:
        try:
            res = requests.get(url, headers=HEADERS).text
            for line in res.split('\n'):
                if "#EXTINF" in line and es_deporte(line):
                    ESTRUCTURA["Deportes_Live"].append({"label": line.split(',')[-1].strip(), "stream": "vincular_source", "protected": True})
        except: continue

    # 4. Guardado Final
    with open('canales_privados.json', 'w') as f:
        json.dump(ESTRUCTURA, f, indent=2)
    logging.info("Sistema Maestro trabajando en segundo plano.")

if __name__ == "__main__":
    trabajar()
