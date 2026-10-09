import json, sys, numpy as np
from PIL import Image, ImageDraw
from shapely.geometry import Polygon
from shapely.ops import unary_union
S=sys.argv[1]; G=json.load(open('/home/user/Dog/engine/hero5_geo.json'))['nudged']
FUR=(145,138,127); FAR=(108,103,95); sc=16
def hero5(off=0):
    im=Image.new('RGB',(int(62*sc),int(39*sc)),(29,33,40)); d=ImageDraw.Draw(im)
    for n,dx in (('thigh',1.3),('shank',1.3),('cannon',1.3),('hpaw',1.3),('upperarm',-1.3),('forearm',-1.3),('pastern',-1.3),('fpaw',-1.3)): d.polygon([((x+dx)*sc,y*sc) for x,y in G['parts'][n]],fill=FAR)
    for n in ('trunk','head','thigh','tail','shank','cannon','hpaw','upperarm','forearm','pastern','fpaw'): d.polygon([(x*sc,y*sc) for x,y in G['parts'][n]],fill=FUR)
    d.line([(0,35.55*sc),(im.width,35.55*sc)],fill=(217,196,147),width=2); return im
a=Image.open(S+'/ov/ours.png').convert('L'); a=np.array(a)<128; ys,xs=np.nonzero(a); a=a[ys.min():ys.max()+1,xs.min():xs.max()+1]
h5=hero5(); hb=np.array(h5.convert('L'))>60; ys,xs=np.nonzero(hb[:int(35.4*sc)]); H5h=ys.max()-ys.min()
im3=Image.fromarray(np.where(a,145,29).astype(np.uint8)).convert('RGB').resize((int(a.shape[1]*H5h/a.shape[0]),H5h))
c=Image.new('RGB',(h5.width*2+20,h5.height+40),(17,17,17)); bg=Image.new('RGB',h5.size,(29,33,40)); bg.paste(im3,(40,int(35.55*sc)-H5h)); c.paste(bg,(0,40)); c.paste(h5,(h5.width+20,40)); dr=ImageDraw.Draw(c)
dr.text((10,12),"hero3 (today's model), same height",fill=(230,230,230)); dr.text((h5.width+30,12),"hero5 v0: cut from wolf 01 on your points (knee nudged)",fill=(230,230,230)); c.save(S+'/ov/h3_vs_h5.png')
# overlap with the photo's outline (rig units), near-side pieces only and the photo outline minus nothing
O=Polygon(G['outline']).buffer(0); U=unary_union([Polygon(G['parts'][n]).buffer(0) for n in G['parts']]); print('hero5 standing vs the photo outline: IoU',round(U.intersection(O).area/U.union(O).area,3),'(the photo outline includes the far legs and the tail fur we redraw)')
