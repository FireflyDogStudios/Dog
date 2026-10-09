import sys, hashlib, urllib.parse, requests
# usage: cthumb.py "File name.jpg" width outpath   -> fetches a Commons thumbnail
name=sys.argv[1].replace(' ','_'); w=sys.argv[2]; out=sys.argv[3]
h=hashlib.md5(name.encode()).hexdigest(); q=urllib.parse.quote(name)
u=f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}'
if name.lower().endswith(('.png','.tif','.tiff')) and not name.lower().endswith('.png'): u+='.jpg'
r=requests.get(u,headers={'User-Agent':'DenPhotographer/1.0 (reference research)'},timeout=60)
print(r.status_code,len(r.content),u)
if r.status_code==200 and r.content[:2]==b'\xff\xd8' or (r.status_code==200 and r.content[:4]==b'\x89PNG'): open(out,'wb').write(r.content)
