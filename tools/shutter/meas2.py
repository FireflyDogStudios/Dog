import sys, json
from PIL import Image, ImageDraw
import numpy as np
# usage: meas2.py img tag facing(L|R) fpx hpx [tr_override]
# fpx/hpx = x of the NEAR front/hind paw (leg axes). ground line through the lowest mask pixels of those paws.
# tail root = first point (scanning from mid-body toward the tail) where the back outline falls >=45 deg (25 px window).
# withers station = fpx + 0.12 L toward the tail (highest mask pixel within +-0.03 L); L = |fpx - tail_root|.
f,tag,facing=sys.argv[1:4]; fpx,hpx=int(sys.argv[4]),int(sys.argv[5]); trov=int(sys.argv[6]) if len(sys.argv)>6 else 0
wx0=int(sys.argv[7]) if len(sys.argv)>8 else 0; wx1=int(sys.argv[8]) if len(sys.argv)>8 else 0
m=np.array(Image.open(f'bl/{tag}_mask.png'))>128; H,W=m.shape
def top(x):
    col=np.where(m[:,int(x)])[0]; return int(col.min()) if len(col) else None
def low(x,r=60):
    return max(int(np.where(m[:,i])[0].max()) for i in range(max(0,x-r),min(W,x+r)) if m[:,i].any())
gf,gh=low(fpx),low(hpx)
g=lambda x: gf+(x-fpx)*(gh-gf)/(hpx-fpx)
dd=-1 if facing=='R' else 1
def steep(thr):
    x=(fpx+hpx)//2
    while 0<x+dd*25<W-1:
        a,b=top(x),top(x+dd*25)
        if a is not None and b is not None and (b-a)>=25*thr: return x
        x+=dd
    return x
tr=trov or steep(1.0); tr60=steep(1.73)
L=abs(fpx-tr); wc=fpx+dd*0.12*L; hw=0.03*L
xs=[int(x) for x in (np.arange(min(wx0,wx1),max(wx0,wx1)+1) if wx0 else np.arange(wc-hw,wc+hw+1))]; ys=[top(x) for x in xs]
wxi=xs[int(np.argmin(ys))]; wy=min(ys); WH=g(wxi)-wy
out={'tag':tag,'facing':facing,'WH_px':round(float(WH),1),'L_px':int(L),'withers_x':wxi,'tail_root_x':tr,'ground_slope_pct':round(float((gh-gf)/abs(hpx-fpx)*100),1)}
prof={}
for sv in [0,0.25,0.5,0.65,0.78,0.9,1.0]:
    x=int(round(wxi+sv*(tr-wxi))); prof[str(sv)]=round(float((g(x)-top(x))/WH),3)
cx=[int(round(wxi+sv*(tr-wxi))) for sv in np.linspace(0.6,0.9,31)]; cy=[top(x) for x in cx]; k=int(np.argmin(cy))
prof['croup_max_s']=round(float((cx[k]-wxi)/(tr-wxi)),2); prof['croup_max_h']=round(float((g(cx[k])-cy[k])/WH),3)
prof['tail60_h']=round(float((g(tr60)-top(tr60))/WH),3); prof['tail60_s']=round(float((tr60-wxi)/(tr-wxi)),2)
out['h']=prof; print(json.dumps(out))
im=Image.open(f).convert('RGB'); d=ImageDraw.Draw(im)
d.line([(0,g(0)),(W,g(W))],fill=(0,255,0),width=3); d.line([(wxi,wy),(wxi,g(wxi))],fill=(255,0,255),width=3)
for sv in [0.5,0.78,1.0]:
    x=int(round(wxi+sv*(tr-wxi))); d.line([(x,top(x)),(x,g(x))],fill=(255,128,0),width=3)
sc=min(1.0,1400/W); im.resize((round(W*sc),round(H*sc))).save(f'bl/{tag}_diag.jpg',quality=85)
