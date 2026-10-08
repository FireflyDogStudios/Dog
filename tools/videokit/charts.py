# Charts: head and back heights over time (shoulder heights), ground speed, and the footfall (gait) diagram from the planted-paw chains.
import sys, json, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
out, dst, fps = sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 15
B = json.load(open(out + '/body.json')); S = json.load(open(out + '/stances.json')); WH = B['WH_px']; rows = B['rows']
t = [r['f'] / fps for r in rows]
fig, ax = plt.subplots(3, 1, figsize=(9, 8.5), sharex=True, gridspec_kw={'height_ratios': [3, 1.2, 1.6]})
k = lambda key: [r[key] / WH if r[key] else None for r in rows]
ax[0].plot(t, k('ear_h'), color='#8a5a1a', label='ear tips'); ax[0].plot(t, k('back_h'), color='#e07b00', lw=2, label='back (flat stretch)'); ax[0].plot(t, k('nose_h'), color='#c2187a', lw=2, label='nose')
ax[0].axhline(1, color='#999', lw=.8, ls=':'); ax[0].set_ylabel('height / standing back height'); ax[0].legend(loc='lower right', fontsize=9); ax[0].grid(alpha=.3)
ax[0].set_title('Fox clip: head and back while walking, slowing and standing', fontsize=11)
ax[1].plot(t, S['speed_px_per_frame'], color='#333'); ax[1].set_ylabel('ground speed\n(px/frame)'); ax[1].grid(alpha=.3)
lanes = {'front (near)': [], 'front (far)': [], 'hind': []}
for c in S['stances']:
    rel = c['x0_rel_nose']; lane = 'hind' if rel < -120 else ('front (near)' if rel > -35 else 'front (far)')
    lanes[lane].append((c['start'] / fps, (c['end'] - c['start'] + 1) / fps))
for i, (name, bars) in enumerate(lanes.items()): ax[2].broken_barh(bars, (i * 10 + 1, 8), color=['#2a7', '#7c7', '#58c'][i])
ax[2].set_yticks([5, 15, 25]); ax[2].set_yticklabels(list(lanes)); ax[2].set_xlabel('time (s)'); ax[2].set_title('paw down (planted), from the tracked paws', fontsize=10); ax[2].grid(alpha=.3, axis='x')
for a in ax: a.axvspan(29 / fps, 53 / fps, color='#f3e2c0', alpha=.35, lw=0)
ax[0].text(29 / fps + .02, .45, 'slowing → stop', fontsize=9, color='#8a5a1a')
plt.tight_layout(); plt.savefig(dst + '/fox_charts.png', dpi=110); print('ok')
