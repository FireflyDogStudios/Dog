# node-free overlay: hero3 standing silhouette vs the 04 Keulemans wolf silhouette (public domain, Mivart 1890). python3 tools/den/wolf_overlay04.py <scratch dir with ov/ours.png>
import sys, numpy as np
from PIL import Image, ImageDraw
S=sys.argv[1]
W=np.array(Image.open('ref/research/firefly/wolf-silhouettes/04_wolf_Mivart1890_n73_AmericanWolf_R.png').convert('L'))<128
ours0=np.array(Image.open(S+'/ov/ours.png').convert('L'))<128
def bb(m): ys,xs=np.nonzero(m); return xs.min(),xs.max(),ys.min(),ys.max()
def crop(m): x0,x1,y0,y1=bb(m); return m[y0:y1+1,x0:x1+1]
W=crop(W); ours0=crop(ours0)
k=520/W.shape[0]; W=np.array(Image.fromarray((W*255).astype(np.uint8)).resize((int(W.shape[1]*k),520),Image.BILINEAR))>127
H,Wd=980,1400; G=900; X0=250
T=np.zeros((H,Wd),bool); T[G-W.shape[0]:G,X0:X0+W.shape[1]]=W
best=None
for hgt in range(380,640,8):
    s=hgt/ours0.shape[0]; b=np.array(Image.fromarray((ours0*255).astype(np.uint8)).resize((int(ours0.shape[1]*s),hgt),Image.BILINEAR))>127
    for dx in range(-250,251,6):
        x0=X0+dx
        if x0<0 or x0+b.shape[1]>Wd: continue
        C=np.zeros((H,Wd),bool); C[G-hgt:G,x0:x0+b.shape[1]]=b
        iou=(C&T).sum()/(C|T).sum()
        if best is None or iou>best[0]: best=(iou,hgt,dx,C)
iou,hgt,dx,O=best; print('overlap',round(iou,3),'our height',hgt,'vs wolf',W.shape[0])
img=np.full((H,Wd,3),250.0)
img[T&O]=(120,116,110); img[T&~O]=(235,110,60); img[O&~T]=(50,125,220)
im=Image.fromarray(img.astype(np.uint8)); x0,x1,y0,y1=bb(T|O); im=im.crop((x0-30,y0-60,x1+30,y1+20)); d=ImageDraw.Draw(im)
d.text((10,8),"grey = both    orange = the wolf (Keulemans 1890), not ours    blue = ours, not the wolf",fill=(20,20,20)); im.save(S+'/ov/w04_overlay.png')
def legs(m):
    g=bb(m)[3]; band=m[g-60:g-8]; cols=np.nonzero(band.any(0))[0]; gr=np.split(cols,np.where(np.diff(cols)>12)[0]+1); return [(q.min(),q.max()) for q in gr if len(q)>6], g
for name,m in (('wolf 04',T),('ours',O)):
    L,g=legs(m); hind,front=L[0],L[-1]
    def col(x):
        ys=np.nonzero(m[:,x])[0]; runs=np.split(ys,np.where(np.diff(ys)>1)[0]+1); r=runs[0]; return g-r.min(), r.max()-r.min()+1, g-r.max()
    fx=int(np.mean(front)); wh=col(fx)[0]; mid=int((np.mean(front)+np.mean(hind))/2); t,dp,cl=col(mid)
    print(f"{name:8s} | withers {wh}px | mid-trunk depth {dp/wh:.2f} of withers height, belly gap {cl/wh:.2f} | paws hind-to-front {(np.mean(front)-np.mean(hind))/wh:.2f} | front leg width {(front[1]-front[0])/wh:.2f} | legs found {len(L)}")
