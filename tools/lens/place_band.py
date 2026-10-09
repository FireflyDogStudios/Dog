"""Den Lens: place a collar band on a dog's neck from an ANGLE, so its ends land on the neck outline (no eyeballing).
   python3 tools/lens/place_band.py hero2 --through 43.4,10.9 --angle 35.3 [--hw .98] [--bow .6] [--overhang .6]
   Finds where a line through the point at that angle (degrees below horizontal) meets the body outline, builds the band's two edges R (rear,
   upper) and F (front, lower) as cubics crest → throat, and prints (1) the mount rows for GEAR.MOUNTS and (2) the SVG path for the dog's own band.
   The ends overhang the outline a little, so the band reads as a loop around the neck."""
import argparse, math, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from geom import Rigs

ap = argparse.ArgumentParser(); ap.add_argument('rig'); ap.add_argument('--through', required=True); ap.add_argument('--angle', type=float, required=True)
ap.add_argument('--hw', type=float, default=.98); ap.add_argument('--bow', type=float, default=.6); ap.add_argument('--overhang', type=float, default=.6)
a = ap.parse_args(); thru = tuple(map(float, a.through.split(',')))
P0, P1, L = Rigs().neck_chord(a.rig, thru, a.angle)
t = math.radians(a.angle); u = (math.cos(t), math.sin(t)); n = (u[1], -u[0])  # u: along the band, crest → throat; n: across, toward the head (up and right)
A = (P0[0] - u[0] * a.overhang, P0[1] - u[1] * a.overhang); B = (P1[0] + u[0] * a.overhang, P1[1] + u[1] * a.overhang)
def edge(off):  # a cubic from A to B shifted by `off` across the band, bowed toward the head by `bow` at its controls
    pt = lambda k, bow: (A[0] + (B[0] - A[0]) * k + n[0] * (off + bow), A[1] + (B[1] - A[1]) * k + n[1] * (off + bow))
    return [pt(0, 0), pt(1 / 3, a.bow), pt(2 / 3, a.bow), pt(1, 0)]
R, F = edge(a.hw), edge(-a.hw)
f = lambda p: f'{p[0]:.2f} {p[1]:.2f}'
cap = lambda p, q, d: f'Q{f(((p[0] + q[0]) / 2 + u[0] * d * .45, (p[1] + q[1]) / 2 + u[1] * d * .45))} {f(q)}'   # a rounded end, bulging outward
d = f'M{f(F[0])} {cap(F[0], R[0], -1)} C{f(R[1])} {f(R[2])} {f(R[3])} {cap(R[3], F[3], 1)} C{f(F[2])} {f(F[1])} {f(F[0])} Z'
print(f'chord on the outline: {f(P0)} → {f(P1)}  length {L:.2f}   angle {Rigs.angle(P0, P1):.1f}° below horizontal')
print('MOUNTS row:  R:[' + ', '.join(f'[{p[0]:.2f}, {p[1]:.2f}]' for p in R) + '], F:[' + ', '.join(f'[{p[0]:.2f}, {p[1]:.2f}]' for p in F) + ']')
print('own band path:', d)
print(f"tag hangs under the throat end at ({F[3][0]:.2f}, {F[3][1] + .85:.2f})")
