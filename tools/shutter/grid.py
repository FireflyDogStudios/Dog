import sys
from PIL import Image, ImageDraw
# usage: grid.py img out x0 y0 x1 y1 step [maxw]
f,out=sys.argv[1],sys.argv[2]; x0,y0,x1,y1,step=map(int,sys.argv[3:8]); maxw=int(sys.argv[8]) if len(sys.argv)>8 else 1500
im=Image.open(f).convert('RGB'); im=im.crop((x0,y0,x1,y1)); s=min(1.0,maxw/im.width) if im.width>maxw else maxw/im.width if im.width<900 else 1.0
im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS); d=ImageDraw.Draw(im)
gx=(x0//step+1)*step
while gx<x1:
    X=(gx-x0)*s; d.line([(X,0),(X,im.height)],fill=(255,255,0) if gx%(step*2)==0 else (255,200,0),width=1); d.text((X+2,2),str(gx),fill=(255,255,255),stroke_width=1,stroke_fill=(0,0,0)); gx+=step
gy=(y0//step+1)*step
while gy<y1:
    Y=(gy-y0)*s; d.line([(0,Y),(im.width,Y)],fill=(0,255,255) if gy%(step*2)==0 else (0,200,255),width=1); d.text((2,Y+2),str(gy),fill=(255,255,255),stroke_width=1,stroke_fill=(0,0,0)); gy+=step
im.save(out,quality=88); print(im.size,'scale',s)
