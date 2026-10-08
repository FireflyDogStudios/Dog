import sys, json, os, hashlib, requests, concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFont
# usage: sheet.py items.json out_prefix [cols] ; items: list of [label, url]
items=json.load(open(sys.argv[1])); pre=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 5
H={'User-Agent':'DenPhotographer/1.0 (reference research)'}
TD=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','thumbs')
def get(u):
  p=os.path.join(TD,hashlib.md5(u.encode()).hexdigest()+'.jpg')
  if not os.path.exists(p):
    try:
      r=requests.get(u,headers=H,timeout=40)
      if r.status_code==200: open(p,'wb').write(r.content)
      else: return None
    except Exception: return None
  return p
with cf.ThreadPoolExecutor(8) as ex: paths=list(ex.map(lambda it:get(it[1]),items))
W,Hh=320,240; per=cols*5
font=ImageFont.load_default()
for s in range(0,len(items),per):
  chunk=list(zip(items,paths))[s:s+per]; rows=(len(chunk)+cols-1)//cols
  im=Image.new('RGB',(cols*W,rows*(Hh+14)),'white'); d=ImageDraw.Draw(im)
  for i,((lab,u),p) in enumerate(chunk):
    x,y=(i%cols)*W,(i//cols)*(Hh+14)
    if p:
      try:
        t=Image.open(p).convert('RGB'); t.thumbnail((W-4,Hh-4)); im.paste(t,(x+2,y+2))
      except Exception: pass
    d.text((x+3,y+Hh),str(lab)[:52],fill='black',font=font)
  im.save(f'{pre}_{s//per:02d}.jpg',quality=85)
  print(f'{pre}_{s//per:02d}.jpg')
