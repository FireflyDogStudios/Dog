import sys, os
from PIL import Image, ImageDraw
import numpy as np
from rembg import new_session, remove
# usage: prep.py img tag [flip]   -> bl/<tag>_mask.png and bl/<tag>_ov.jpg (rulers every 100 px, outline red)
f,tag=sys.argv[1],sys.argv[2]
im=Image.open(f).convert('RGB')
mp=f'bl/{tag}_mask.png'
if not os.path.exists(mp):
    s=new_session('isnet-general-use'); remove(im,session=s,only_mask=True).save(mp)
m=np.array(Image.open(mp))>128
a=np.array(im).copy()
e=(m ^ np.roll(m,1,0)) | (m ^ np.roll(m,1,1)); a[e]=[255,0,0]
o=Image.fromarray(a); d=ImageDraw.Draw(o); W,H=o.size
for x in range(0,W,100):
    d.line([(x,0),(x,H)],fill=(255,255,0),width=1 if x%500 else 2); d.text((x+2,2),str(x),fill=(255,255,255),stroke_width=2,stroke_fill=(0,0,0))
for y in range(0,H,100):
    d.line([(0,y),(W,y)],fill=(0,255,255),width=1 if y%500 else 2); d.text((2,y+2),str(y),fill=(255,255,255),stroke_width=2,stroke_fill=(0,0,0))
sc=min(1.0,1600/W); o=o.resize((round(W*sc),round(H*sc)),Image.LANCZOS); o.save(f'bl/{tag}_ov.jpg',quality=85); print(tag,im.size,'scale',sc)
