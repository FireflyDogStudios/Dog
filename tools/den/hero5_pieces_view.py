import json, sys
from PIL import Image, ImageDraw
G=json.load(open('/home/user/Dog/engine/hero5_geo.json')); out=sys.argv[1]
COL={'trunk':(120,160,220),'head':(240,200,90),'thigh':(220,110,170),'shank':(160,90,200),'cannon':(90,120,230),'hpaw':(60,200,220),'forearm':(240,120,60),'pastern':(240,170,60),'fpaw':(200,230,80),'upperarm':(250,90,90),'tail':(90,190,110)}
S=22; W=int(62*S); H=int(40*S); tiles=[]
for k in ('placed','nudged'):
    g=G[k]; im=Image.new('RGB',(W,H),(250,250,248)); d=ImageDraw.Draw(im,'RGBA')
    for name in ('trunk','thigh','tail','head','shank','cannon','hpaw','upperarm','forearm','pastern','fpaw'):
        pts=[(x*S,y*S) for x,y in g['parts'][name]]; d.polygon(pts,fill=COL[name]+(170,),outline=(30,30,30,255))
    d.line([(x*S,y*S) for x,y in g['outline']]+[(g['outline'][0][0]*S,g['outline'][0][1]*S)],fill=(0,0,0,120),width=1)
    for j in ('nIl','nHi','nKn','nHo','nHp','r_scap','nSh','nEl','nCa','nFp','tail','wither'):
        x,y=g['joints'][j]; d.ellipse([x*S-5,y*S-5,x*S+5,y*S+5],fill=(0,0,0,255))
    d.line([(0,35.55*S),(W,35.55*S)],fill=(120,100,60,255),width=2); d.text((10,10),f"{k}: knee {g['report']['angles']['stifle']} deg",fill=(0,0,0)); tiles.append(im)
c=Image.new('RGB',(W,H*2)); c.paste(tiles[0],(0,0)); c.paste(tiles[1],(0,H)); c.save(out)
