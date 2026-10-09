# hero5 bend test: pieces on a tiny FK rig; standing, then the legs swung both ways, flat wolf colours; far legs = near copies, darker, behind
import json, sys, math
from PIL import Image, ImageDraw
G=json.load(open('/home/user/Dog/engine/hero5_geo.json')); out=sys.argv[1]
FUR=(145,138,127); FAR=(108,103,95); S=14
CH={'thigh':('nHi',None),'shank':('nKn','thigh'),'cannon':('nHo','shank'),'hpaw':('nHp','cannon'),'upperarm':('nSh',None),'forearm':('nEl','upperarm'),'pastern':('nCa','forearm'),'fpaw':('nFp','pastern')}
def pose(g,rot):
    J=g['joints']; M={}
    def mat(name):
        if name in M: return M[name]
        piv,par=CH[name]; a=math.radians(rot.get(name,0)); c,s=math.cos(a),math.sin(a); px,py=J[piv]
        T=(c,s,-s,c,px-(c*px-s*py),py-(s*px+c*py))
        if par: P=mat(par); T=(P[0]*T[0]+P[2]*T[1],P[1]*T[0]+P[3]*T[1],P[0]*T[2]+P[2]*T[3],P[1]*T[2]+P[3]*T[3],P[0]*T[4]+P[2]*T[5]+P[4],P[1]*T[4]+P[3]*T[5]+P[5])
        M[name]=T; return T
    return {n:mat(n) for n in CH}
ap=lambda T,p:(T[0]*p[0]+T[2]*p[1]+T[4],T[1]*p[0]+T[3]*p[1]+T[5])
def draw(g,rot,rotF,dx_far=(1.3,-1.3)):
    im=Image.new('RGB',(int(60*S),int(39*S)),(29,33,40)); d=ImageDraw.Draw(im); M=pose(g,rot); MF=pose(g,rotF)
    leg=lambda names,M,off,col:[d.polygon([((ap(M[n],q)[0]+off)*S,ap(M[n],q)[1]*S) for q in g['parts'][n]],fill=col) for n in names]
    leg(['thigh','shank','cannon','hpaw'],MF,dx_far[0],FAR); leg(['upperarm','forearm','pastern','fpaw'],MF,dx_far[1],FAR)
    for n in ('tail','trunk','head'): d.polygon([(x*S,y*S) for x,y in g['parts'][n]],fill=FUR)
    leg(['thigh','shank','cannon','hpaw','upperarm','forearm','pastern','fpaw'],M,0,FUR)
    d.line([(0,35.55*S),(im.width,35.55*S)],fill=(217,196,147),width=2); return im
poses=[({},{}),({'thigh':18,'shank':-25,'cannon':20,'upperarm':-16,'forearm':10,'pastern':-15},{'thigh':-15,'shank':10,'upperarm':14,'forearm':-30,'pastern':60}),
       ({'thigh':-15,'shank':10,'upperarm':14,'forearm':-30,'pastern':60},{'thigh':18,'shank':-25,'cannon':20,'upperarm':-16,'forearm':10,'pastern':-15})]
rows=[]
for k in ('placed','nudged'):
    ims=[draw(G[k],a,b) for a,b in poses]; row=Image.new('RGB',(sum(i.width for i in ims),ims[0].height+24),(17,17,17)); x=0
    for i in ims: row.paste(i,(x,24)); x+=i.width
    ImageDraw.Draw(row).text((8,6),f"{k}: knee {G[k]['report']['angles']['stifle']} deg   standing | legs swung one way | the other way (far legs darker, behind)",fill=(230,230,230)); rows.append(row)
c=Image.new('RGB',(rows[0].width,rows[0].height*2)); c.paste(rows[0],(0,0)); c.paste(rows[1],(0,rows[0].height)); c.save(out)
