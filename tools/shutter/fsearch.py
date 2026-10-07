import sys, json, re, time, urllib.parse, requests
# usage: fsearch.py out.json pages "query" ["query"...]  licence filter 4,9,10,11 (BY2, CC0, PDM, BY4) -- verify per photo later
out=sys.argv[1]; pages=int(sys.argv[2])
try: seen=json.load(open(out))
except Exception: seen={}
H={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64)'}
dec=json.JSONDecoder()
for q in sys.argv[3:]:
  for p in range(1,pages+1):
    u='https://www.flickr.com/search/?'+urllib.parse.urlencode({'text':q,'license':'4,9,10,11','media':'photos','page':p})
    r=requests.get(u,headers=H,timeout=40); s=r.text; n=0
    for m in re.finditer(r'\{"data":\{"_flickrModelRegistry":"photo-lite-models"',s):
      try: obj,_=dec.raw_decode(s,m.start())
      except Exception: continue
      d=obj['data']; pid=d.get('id')
      if not pid: continue
      sizes=d.get('sizes',{}).get('data',{})
      best=None
      for k in ['l','c','z']:
        if k in sizes: best=sizes[k]['data']; break
      n+=1
      if pid in seen: continue
      seen[pid]={'title':d.get('title'),'owner':d.get('ownerNsid'),'username':d.get('username'),'pathAlias':d.get('pathAlias'),'desc':(d.get('description') or '')[:300],'url':'https:'+best['url'] if best else None,'w':best and best['width'],'h':best and best['height'],'q':q}
    print(q,p,r.status_code,n,flush=True)
    if n==0: break
    time.sleep(1.5)
json.dump(seen,open(out,'w'),indent=1); print('total',len(seen))
