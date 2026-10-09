import json,sys
def fm(s): s=int(s); return f"{s//3600}h{(s%3600)//60:02d}m" if s>=3600 else f"{s//60}m{s%60:02d}s"
for mode in sys.argv[1:]:
    d=json.load(open(f'sim/out_{mode}.json')); D=d['data']; T=D['tele']
    print(f"\n===== {mode.upper()} ===== final lvl {D['lvl']} xp {D['earned']} kills {D['H']['kills']} weapons {D['H']['weapons']} pups {D['pups']} coins {D['coins']} tp {D['trials'].get('tp')}")
    print('errors:',d['errs'][:5],d['pageErrs'][:5])
    ev=T['ev']; lv=[e for e in ev if e[1]=='level']
    print('LEVELS:', ', '.join(f"L{e[2]}@{fm(e[0])}" for e in lv))
    print('UNLOCK/LETTERS:')
    for e in ev:
        if e[1] in ('unlock','letter','ready','overpowered','mega','god','trial','meta','zone'): print('  ',fm(e[0]),e[1],e[2])
    print('SNAPS every 15m: t lvl xp dps enemyHp ttk kills meats coins weapons pups zone tp op')
    for s in T['snap']:
        if s[0]%900<60: print('  ',fm(s[0]),s[1:6],s[6],s[7],s[8],s[10],s[11],s[12],s[13],s[14])
    print('trials:',{k:D['trials'].get(k) for k in ('best','clears','metaBest')})
    print('zm:',D['H']['zm'])
    print('tomes eq:',(D.get('tomes') or {}).get('eq'),'upg:',D.get('upg'))
