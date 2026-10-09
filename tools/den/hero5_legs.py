#!/usr/bin/env python3
"""hero5's lower legs and paws as clean shapes (Oct 9, 2026; GrumpyDingo's joint notes: spurs at the paws, a hook at the knee, dents at the hock).
   The photo cuts bent badly: their ends were straight cuts with corners, and the joint discs added to cover them sat off the leg's centre line,
   so a bending joint showed a corner or a ball. Here every bone below the thigh and upper arm is a tapered capsule CENTRED on its two joints
   (the hero3 way): a joint is a circle the next bone turns inside, so nothing pokes out at any angle. Widths are photo 01's, measured across the
   leg at each joint (hero5_build's report). The thigh and upper arm keep the photo's shape down to their joint, where they end in the same
   circle. The paws are drawn as a wolf's foot (a compact oval, the toes arched, the heel pad round, the sole flat on the ground), sized from
   GrumpyDingo's heel and toe points. Imported by tools/den/hero5_engine.py after the ground fit."""
import math, numpy as np
from shapely.geometry import Polygon, Point, LineString
from shapely.ops import split

def capsule(a, b, w0, w1, n=12):
    """a tapered capsule from joint a (width w0) to joint b (width w1): the outline is tangent to both end circles"""
    a, b = np.array(a, float), np.array(b, float); d = b - a; L = np.linalg.norm(d); u = d / L; r0, r1 = w0 / 2, w1 / 2
    s = math.asin(max(-1, min(1, (r0 - r1) / L)))  # the tangent lines' tilt, so the sides meet each circle smoothly
    ang = math.atan2(u[1], u[0]); pts = []
    for t in np.linspace(-math.pi / 2 - s, math.pi / 2 + s, n): pts.append(b + r1 * np.array([math.cos(ang + t), math.sin(ang + t)]))
    for t in np.linspace(math.pi / 2 + s, 3 * math.pi / 2 - s, n): pts.append(a + r0 * np.array([math.cos(ang + t), math.sin(ang + t)]))
    return Polygon(pts).buffer(0)

def bez(p0, p1, p2, p3, n=10):
    return [tuple((1 - t) ** 3 * np.array(p0) + 3 * (1 - t) ** 2 * t * np.array(p1) + 3 * (1 - t) * t * t * np.array(p2) + t ** 3 * np.array(p3)) for t in np.linspace(0, 1, n)[1:]]

def paw(p, heel, toe, k=1.0):
    """a wolf paw on the toe joint p (the sole on the ground at p.y + 1.05), from the heel's back (x) to the toe tip (x); facing right"""
    x, y = p; L0 = toe - heel; s = L0 / 3.4 * k  # 3.4 units heel to toe on the front paw of photo 01
    P = lambda dx, dy: (x + dx * s, y + 1.05 - (1.05 - dy) * s)  # scaled about the sole, so it stays on the ground
    start = P(-.75, -.25); path = [start]
    path += bez(start, P(-1.25, .15), P(-1.2, 1.05), P(-.55, 1.05))            # the round heel pad
    path += [P(.5, 1.05)]; path += bez(P(.5, 1.05), P(1.1, 1.05), P(1.5, 1.05), P(1.75, 1.05))  # the flat sole
    path += bez(P(1.75, 1.05), P(2.4, 1.05), P(2.6, .55), P(2.3, .15))          # the toe tip, rounded down onto the ground
    path += bez(P(2.3, .15), P(2.0, -.25), P(1.3, -.42), P(.65, -.5))           # the arched knuckles
    path += bez(P(.65, -.5), P(.15, -.56), P(-.45, -.5), start)                  # back up to the heel
    return Polygon(path).buffer(0)

def above(P, a, b, keep):
    """the part of P on keep's side of the line through b perpendicular to a→b (cuts a bone's photo shape square at its joint)"""
    a, b = np.array(a, float), np.array(b, float); u = (b - a) / np.linalg.norm(b - a); n = np.array([-u[1], u[0]])
    cut = LineString([b - n * 50, b + n * 50]); pieces = split(P, cut).geoms if P.intersects(cut) else [P]
    good = [g for g in pieces if (np.array(g.representative_point().coords[0]) - b) @ u < 0]
    from shapely.ops import unary_union
    return unary_union(good).buffer(0) if good else P

def rebuild(J, parts, W, far_dx=0.0):
    """J joints, parts {name: [[x,y]]} (rig units, after the ground fit), W the photo's widths at the joints (units). Rewrites the leg parts."""
    q = lambda k: np.array(J[k], float); P = lambda k: Polygon(parts[k]).buffer(0); out = {}
    # widths: the photo's, a little under (its fur fringe), tapering to the next joint
    wk, wh, wpH = W['knee'] * 1.0, W['hock'] * .86, W['hock'] * .72     # the hock's measured width includes its point; the bone round it is narrower
    we, ww, wpF = W['elbow'] * 1.0, W['wrist'] * 1.08, W['wrist'] * 1.0  # full fur width (a little under read as sticks: GrumpyDingo's 'robot dog')
    out['shank'] = capsule(q('nKn'), q('nHo'), wk, wh); out['cannon'] = capsule(q('nHo'), q('nHp'), wh * .96, wpH)
    out['forearm'] = capsule(q('nEl'), q('nCa'), we, ww); out['pastern'] = capsule(q('nCa'), q('nFp'), ww * .96, wpF)
    # the point of the hock: the heel bone sticks out behind the joint (GrumpyDingo's hock point), part of the cannon so it turns with it
    hp = q('r_hockPoint'); hk = q('nHo'); d = hp - hk; dn = np.linalg.norm(d)
    uc = q('nHp') - hk; uc = uc / np.linalg.norm(uc); bc = np.array([uc[1], -uc[0]]); bc = bc if (bc @ d) > 0 else -bc  # along the cannon; toward the heel
    apex = hk + bc * (wh / 2 + .32) - uc * .2  # the heel's point: just behind and a touch above the joint, as the calcaneus sits
    # the Achilles tendon: from the back of the gaskin straight down to the heel's point, then the back of the cannon. A part of its own, skinned
    # from the shank (weight 0) to the cannon (weight 1), so the line stays straight however the hock bends (no notch above the heel)
    us = hk - q('nKn'); us = us / np.linalg.norm(us); bs = np.array([us[1], -us[0]]); bs = bs if (bs @ d) > 0 else -bs
    A = hk - us * 2.2 + bs * (wh / 2 + (wk - wh) / 2 * .45) * .97; Cb = hk + uc * 1.2 + bc * wh * .47
    pts = [(tuple(hk - us * 2.4), 0), (tuple(A), 0), (tuple(hk - us * .9 + bs * (wh / 2 + .12)), .25), (tuple(apex), 1), (tuple(Cb), 1), (tuple(hk + uc * 1.2), 1), (tuple(hk), .5)]
    out['achilles'] = pts
    # thigh and upper arm: the photo's shape down to the joint, ending in the joint's own circle (the same one the next bone starts with)
    # the flank fold: the web of skin from the tuck-up down to the front of the knee (dogs and wolves have it); without it the far knee showed
    # as a thin crescent between the near thigh and the belly. Its edge is a gentle concave curve; it is part of the thigh, so it stretches with it.
    kn = q('nKn'); uf = q('nKn') - q('nHi'); uf = uf / np.linalg.norm(uf); nf = np.array([-uf[1], uf[0]]); nf = nf if nf[0] > 0 else -nf
    kf, tk, tf = kn + (nf * .8 - uf * .6) / np.linalg.norm(nf * .8 - uf * .6) * wk / 2, q('r_tuck'), q('r_thighFront'); mid = (tk + kf) / 2 + (tf - (tk + kf) / 2) * .35
    fold = Polygon([tf, *[tuple((1 - t) ** 2 * tk + 2 * (1 - t) * t * mid + t * t * kf) for t in np.linspace(0, 1, 12)], tuple(kn)]).buffer(0)
    # the thigh tapers into the knee: the photo's shape is cut 1.4 above the knee, and the last stretch is the hull of that cross-section and the
    # knee's circle (its back ran down past the gaskin and ended in a corner, a 'beak', beside the shank)
    hipv = q('nHi') - q('nKn'); hipv = hipv / np.linalg.norm(hipv); kc = Point(q('nKn')).buffer(wk / 2, 24)
    up_cut = above(P('thigh'), q('nHi'), q('nKn') + hipv * 1.4, True); sect = P('thigh').intersection(Point(q('nKn') + hipv * 1.4).buffer(2.6)).difference(above(P('thigh'), q('nHi'), q('nKn') + hipv * 1.0, True).buffer(-.01))
    sect = up_cut.difference(above(P('thigh'), q('nHi'), q('nKn') + hipv * 2.0, True)) if sect.is_empty else sect
    thigh0 = up_cut.union(sect.union(kc).convex_hull.intersection(up_cut.union(kc).convex_hull))
    out['thighFar'] = thigh0.union(kc).buffer(.6).buffer(-.6).buffer(-.45).buffer(.45)  # the far thigh: no fold (it peeked under the belly as a point)
    out['thigh'] = thigh0.union(kc).union(fold).buffer(.6).buffer(-.6).buffer(-.45).buffer(.45)  # concave corners filled, convex ones rounded: the fold runs into the knee
    out['upperarm'] = above(P('upperarm'), q('nSh'), q('nEl'), True).union(Point(q('nEl')).buffer(we / 2, 24)).buffer(.2).buffer(-.2)
    # the trunk below the flank, behind the tuck-up, is the photo's far-thigh area: it hung below the near thigh as a flap (the 'hook'). The thigh
    # covers that region, so the trunk ends at the flank line there.
    from shapely.geometry import box as _box
    tk = q('r_tuck'); T = Polygon(parts['trunk']).buffer(0)
    # behind the tuck-up the trunk ends at tuck level: below that the thigh covers it, and what showed was the builder's flat knee-line cut,
    # a little flat-bottomed triangle in the V between the tail and the thigh
    cutw = _box(-99, tk[1] + .3, tk[0] + .2, 99)
    # the chest ends at the brisket: the photo's outline keeps the near elbow hanging below it as a lobe, which showed as a tab under the chest
    # whenever the leg swung away from it (the elbow is the leg's own circle now)
    bk = q('r_brisket'); cutc = _box(bk[0] - 2.5, bk[1] + .2, bk[0] + 4.5, 99)
    _big = lambda g: max(g.geoms, key=lambda x: x.area) if hasattr(g, 'geoms') else g
    out['trunk'] = _big(T.difference(cutw).difference(cutc)).buffer(.2).buffer(-.2)
    out['fpaw'] = paw(q('nFp'), q('r_fHeel')[0], q('r_fToe')[0]); out['hpaw'] = paw(q('nHp'), q('r_hHeel')[0], q('r_hToe')[0], .95)
    big = lambda g: max(g.geoms, key=lambda x: x.area) if hasattr(g, 'geoms') else g
    # the far thigh is drawn shifted by far_dx: above the hip it must stay inside the body after that shift (it poked out behind the rump)
    from shapely import affinity as _af
    keep = out['trunk'].union(out['thigh']).union(_box(-99, q('nHi')[1], 99, 99)).buffer(-.05)
    out['thighFar'] = big(out['thighFar'].intersection(_af.translate(keep, -far_dx, 0)))
    ach = out.pop('achilles')
    for k, g in out.items(): parts[k] = [[round(x, 2), round(y, 2)] for x, y in list(big(g).exterior.coords)[:-1]]
    parts['achilles'] = [[round(x, 2), round(y, 2), w] for (x, y), w in ach]  # [x, y, skin weight]
    return parts
