import csv, glob, os, re, sys, time, requests, html
H={'User-Agent':'Mozilla/5.0'}
FL={4:'CC BY 2.0',9:'CC0',10:'PDM',11:'CC BY 4.0'}
for cat in sorted(glob.glob(sys.argv[1])):
  base=os.path.dirname(cat)
  for x in csv.DictReader(open(cat)):
    u=x['url']; lic=x['licence']; res='?'
    miss=[k for k in ('author','licence','licence_url','url') if not x[k].strip()]
    nofile='' if os.path.exists(os.path.join(base,x['file'])) else ' NOFILE'
    try:
      m=re.search(r'flickr\.com/photos/([^/]+)/(\d+)',u)
      if m:
        s=requests.get(f'https://www.flickr.com/photos/{m.group(1)}/{m.group(2)}/',headers=H,timeout=30).text
        ids=set(int(i) for i in re.findall(r'"license":"?(\d+)',s)); res=','.join(FL.get(i,f'BAD{i}') for i in ids)
      elif 'commons.wikimedia.org' in u:
        s=requests.get(u,headers=H,timeout=30).text
        cats=re.findall(r'"wgCategories":\[([^\]]*)\]',s); c=cats[0] if cats else ''
        lc=re.findall(r'(CC-BY-SA[-\d.]*|CC-BY-[\d.]+|CC-Zero|PD-[A-Za-z-]+|Public domain|GFDL)',c)
        res=';'.join(sorted(set(lc)))[:80]
      elif 'inaturalist.org' in u:
        pid=re.search(r'photos/(\d+)',u)
        if pid:
          s=requests.get(f'https://www.inaturalist.org/photos/{pid.group(1)}.json',headers=H,timeout=30)
          res='inat:'+str(s.status_code)
        else: res='inat-obs'
      else: res='OTHER'
    except Exception as e: res='ERR '+str(e)[:40]
    flag=''
    if 'SA' in res or 'BAD' in res or 'GFDL' in res and 'CC-BY-' not in res: flag=' <<<CHECK'
    print(f"{x['file'][:58]:58} | {lic[:28]:28} | {res}{flag}{nofile}{' MISSING'+str(miss) if miss else ''}",flush=True)
    time.sleep(1)
