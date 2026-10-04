"""Den Lens, geometry side: exact numbers from the rigs' own data instead of eyeballing.
   python3 tools/lens/lens.cjs export        (writes tools/lens/.cache/rigs.json first)
   from geom import Rigs; R = Rigs(); R.neck_chord('hero2', (43.4, 10.9), 35.3)
   Angles are degrees BELOW horizontal for a line running down to the right (the way a collar sits on a dog facing right)."""
import json, math, pathlib, subprocess, os
from shapely.geometry import Polygon, LineString, Point
from svgpathtools import parse_path

CACHE = pathlib.Path(__file__).parent / '.cache' / 'rigs.json'

class Rigs:
    def __init__(self, path=CACHE):
        root = pathlib.Path(__file__).resolve().parents[2]  # re-export when the engine files are newer than the cache, so numbers never come from stale data
        if path == CACHE and (not path.exists() or path.stat().st_mtime < max(f.stat().st_mtime for f in (root / 'engine').glob('*.js'))):
            subprocess.run(['node', str(root / 'tools/lens/lens.cjs'), 'export'], check=True, cwd=root, env={**os.environ, 'NODE_PATH': str(root / 'node_modules')}, capture_output=True)
        d = json.load(open(path)); self.rigs, self.mounts = d['rigs'], d['mounts']

    def parts(self, rig, joint=None):
        return [p for p in self.rigs[rig]['parts'] if joint is None or (p.get('in') or 'root') == joint]

    def path(self, rig, index_or_id, joint='body'):
        """a part's outline as an svgpathtools Path; by id, or by index among the parts of `joint`"""
        ps = self.parts(rig, joint)
        p = next((q for q in ps if q.get('id') == index_or_id), None) if isinstance(index_or_id, str) else ps[index_or_id]
        return parse_path(p['d'])

    def sample(self, path, n=240):
        return [(z.real, z.imag) for z in (path.point(i / n) for i in range(n))]

    def silhouette(self, rig, joint='body', index=0):
        """the body outline as a shapely polygon (rest pose); index 0 of the body joint is the one big fur path"""
        return Polygon(self.sample(self.path(rig, index, joint)))

    def neck_chord(self, rig, through, angle_deg, length=30):
        """the chord of the body outline along a line through `through` at `angle_deg` below horizontal: where a band at that angle
           meets the neck's two edges. Returns ((x1,y1),(x2,y2)) crest side first, plus its length."""
        a = math.radians(angle_deg); dx, dy = math.cos(a), math.sin(a)
        line = LineString([(through[0] - dx * length, through[1] - dy * length), (through[0] + dx * length, through[1] + dy * length)])
        hit = line.intersection(self.silhouette(rig))
        segs = [hit] if hit.geom_type == 'LineString' else list(hit.geoms)
        seg = min(segs, key=lambda s: s.distance(Point(through)))
        p, q = sorted(seg.coords, key=lambda c: c[0])
        return p, q, math.dist(p, q)

    @staticmethod
    def angle(p, q):
        """degrees below horizontal of the line p→q, p being the left (crest) end"""
        return math.degrees(math.atan2(q[1] - p[1], q[0] - p[0]))

    def band_footprint(self, rig, joint='body'):
        """the dog's own collar band (the part painted 'collar'): its polygon, centre line angle and thickness"""
        p = next(q for q in self.parts(rig, joint) if q.get('paint') == 'collar')
        poly = Polygon(self.sample(parse_path(p['d']))); r = poly.minimum_rotated_rectangle; c = list(r.exterior.coords)[:4]
        e = sorted([(math.dist(c[i], c[i + 1]), c[i], c[i + 1]) for i in range(2)], reverse=True)
        L, a, b = e[0]; ang = self.angle(*sorted([a, b], key=lambda z: z[0]))
        return {'centroid': tuple(poly.centroid.coords[0]), 'angle_below_horizontal': ang, 'length': L, 'thickness': e[1][0], 'area': poly.area}

    def clip_report(self, rig, piece_polys, joint='body'):
        """how much of a piece lies outside the dog's silhouette (area, and as a share). Flush means ~0 beyond the band's own overhang."""
        sil = self.silhouette(rig, joint); out = piece_polys.difference(sil)
        return {'outside_area': out.area, 'share': out.area / piece_polys.area if piece_polys.area else 0}
