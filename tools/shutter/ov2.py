import sys, json, time, urllib.parse, requests
# usage: ov2.py out.json key=value [key=value...]  (one query per arg group separated by ';')
out=sys.argv[1]
try: seen=json.load(open(out))
except Exception: seen={}
H={'User-Agent':'DenPhotographer/1.0 (reference research)'}
for spec in sys.argv[2:]:
  params=dict(p.split('=',1) for p in spec.split(';'))
  params.setdefault('license','by,cc0,pdm'); params['page_size']=20
  for page in range(1,6):
    params['page']=page
    r=requests.get('https://api.openverse.org/v1/images/?'+urllib.parse.urlencode(params),headers=H,timeout=30)
    if r.status_code!=200: print(spec,page,r.status_code,r.text[:150]); break
    d=r.json()
    for it in d['results']:
      if it['id'] in seen: continue
      v={k:it.get(k) for k in ['title','foreign_landing_url','url','thumbnail','creator','license','license_version','license_url','source','width','height']}
      v['q']=spec; v['tags']=[t['name'] for t in (it.get('tags') or [])][:20]
      seen[it['id']]=v
    print(spec,page,len(d['results']),d['result_count'])
    if page>=d['page_count']: break
    time.sleep(1)
json.dump(seen,open(out,'w'),indent=1)
print('total',len(seen))
