import sys, os, glob, json, numpy as np, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bvhfk import parse, fk
from scipy.ndimage import median_filter, uniform_filter1d
from scipy.signal import find_peaks
SRC=sys.argv[1]
trans=collections.defaultdict(list); wags=[]; still_tail=[]; headbob=[]
for f in sorted(glob.glob(SRC+'/*.bvh')):
    J,data,ft=parse(f); pos,rot=fk(J,data); nm=[j['name'] for j in J]; ix={n:i for i,n in enumerate(nm)}
    hy=median_filter(pos[:,ix['Hips'],1],9); wy=median_filter((pos[:,ix['LeftShoulder'],1]+pos[:,ix['RightShoulder'],1])/2,9)
    st=np.full(len(hy),'x')
    st[(hy>0.38)&(wy>0.36)]='S'; st[(hy<0.2)&(wy>0.30)]='T'; st[(hy<0.22)&(wy<0.2)]='L'
    runs=[]; i=0
    while i<len(st):
        j=i
        while j<len(st) and st[j]==st[i]: j+=1
        if st[i]!='x' and j-i>=30: runs.append((st[i],i,j))
        i=j
    for (s0,a0,b0),(s1,a1,b1) in zip(runs[:-1],runs[1:]):
        if s0==s1 or a1-b0>4/ft: continue
        sig = hy if {'S','T'}=={s0,s1} else wy if {'T','L'}=={s0,s1} else (hy+wy)/2
        v0=np.median(sig[max(a0,b0-30):b0]); v1=np.median(sig[a1:min(b1,a1+30)])
        seg=sig[max(a0,b0-60):min(b1,a1+60)]; off=max(a0,b0-60)
        fr=(seg-v0)/(v1-v0)
        try:
            t10=np.where(fr>0.05)[0][0]; t90=np.where(fr>0.95)[0][0]
        except IndexError: continue
        trans[s0+'->'+s1].append(dict(file=os.path.basename(f),start_s=round((off+t10)*ft,2),dur_5_95_s=round((t90-t10)*ft,3),from_h=round(float(v0),3),to_h=round(float(v1),3)))
    # tail wag via peaks of lateral tail angle while body nearly still
    fwd=pos[:,ix['Neck']]-pos[:,ix['Hips']]; fwd[:,1]=0; fwd/=np.linalg.norm(fwd,axis=1,keepdims=True)
    lat=np.cross(fwd,[0,1,0])
    d=pos[:,ix['Tail1_End']]-pos[:,ix['Tail']]
    ty=np.degrees(np.arctan2(-np.sum(d*lat,1),-np.sum(d*fwd,1)))
    tp=np.degrees(np.arctan2(d[:,1],-np.sum(d*fwd,1)))  # elevation above caudal horizontal
    sp=uniform_filter1d(np.r_[0,np.linalg.norm(np.diff(pos[:,0,[0,2]],axis=0),axis=1)/ft],31)
    pk,_=find_peaks(ty,prominence=15,distance=int(0.1/ft)); tr,_=find_peaks(-ty,prominence=15,distance=int(0.1/ft))
    ev=sorted([(p,1) for p in pk]+[(p,-1) for p in tr])
    # bouts: alternating extrema with half-periods < 0.6 s, >= 3 full cycles
    bout=[ev[0]] if ev else []
    def flush(b):
        if len(b)>=7:
            idx=[e[0] for e in b]; half=np.diff(idx)*ft
            amps=np.abs(np.diff(ty[idx]))
            mid=(idx[0]+idx[-1])//2
            wags.append(dict(file=os.path.basename(f),t=round(idx[0]*ft,2),dur_s=round((idx[-1]-idx[0])*ft,2),freq_hz=round(float(1/(2*np.mean(half))),2),p2p_deg=round(float(np.median(amps)),1),
                elev_deg=round(float(np.median(tp[idx[0]:idx[-1]])),1),posture=str(st[mid]),body_speed=round(float(sp[mid]),2)))
    for e in ev[1:]:
        if e[1]!=bout[-1][1] and (e[0]-bout[-1][0])*ft<0.6: bout.append(e)
        else: flush(bout); bout=[e]
    if bout: flush(bout)
    # tail carriage by posture
    for s in 'STL':
        m=(st==s)&(sp<0.1)
        if m.sum()>60: still_tail.append((s,float(np.median(tp[m]))))
out=dict(transitions=trans,wag_bouts=wags,tail_elev_still=still_tail)
json.dump(out,open(sys.argv[2],'w'),indent=1)
for k,v in trans.items():
    d=[x['dur_5_95_s'] for x in v]; print(k,len(v),'median %.2f s (range %.2f-%.2f)'%(np.median(d),min(d),max(d)))
print('wag bouts',len(wags))
if wags:
    for key in ['freq_hz','p2p_deg','dur_s','elev_deg','body_speed']:
        a=[w[key] for w in wags]; print(' ',key,'median %.2f IQR %.2f-%.2f min %.2f max %.2f'%(np.median(a),*np.percentile(a,[25,75]),min(a),max(a)))
    print(collections.Counter(w['posture'] for w in wags))
for s in 'STL':
    a=[t for p,t in still_tail if p==s]
    if a: print('tail elev still',s,'%.1f'%np.median(a), len(a))
