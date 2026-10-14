import json
import urllib.parse
import urllib.request

with open('scripts/download_report.json', 'r') as f:
    data = json.load(f)

for item in data:
    wiki = item.get('wikiFile')
    if wiki:
        url = f"https://commons.wikimedia.org/w/api.php?action=query&titles=File:{urllib.parse.quote(wiki)}&prop=categories|imageinfo&iiprop=extmetadata&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'SmartDiningInspector/1.0'})
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                d = json.loads(resp.read().decode())
                pages = list(d.get('query', {}).get('pages', {}).values())
                if pages:
                    meta = pages[0].get('imageinfo', [{}])[0].get('extmetadata', {})
                    desc = meta.get('ImageDescription', {}).get('value', '')
                    title = pages[0].get('title', '')
                    print(f"[{item['id']}] {item['name']} -> {title}")
                    if desc:
                        print(f"    Desc: {desc[:150]}")
        except Exception as e:
            print(f"[{item['id']}] error: {e}")
