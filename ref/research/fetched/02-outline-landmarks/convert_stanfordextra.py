"""Convert a StanfordExtra annotation JSON (sample or full StanfordExtra_v12.json)
to compact per-breed JSON:
  {breed: [{img, size, bbox, multi, split, kp:{name:[x,y,v]}, outline:[[[x,y],...],...]}]}
Usage:
  python3 -I convert_stanfordextra.py IN.json OUT.json [SPLIT_DIR] [--eps FRAC] [--kpdec N] [--parts N]
SPLIT_DIR holds {train,val,test}_stanford_StanfordExtra_v12.npy (indices into the IN.json list).
--eps   outline simplification, fraction of bbox diagonal (default 0.004; min 1 px)
--kpdec decimals for keypoints (default 1; 0 gives integers)
--parts split OUT into OUT_part1.json ... by breed (default 1 = single file)
Also prints checks: counts per breed, outline-vs-bbox agreement, keypoints inside outline.
Needs numpy and opencv (cv2). Coordinates are image pixels, origin top-left, y down."""
import json, sys, os
import numpy as np
import cv2

NAMES = ["left_front_paw", "left_front_middle", "left_front_top",
         "left_rear_paw", "left_rear_middle", "left_rear_top",
         "right_front_paw", "right_front_middle", "right_front_top",
         "right_rear_paw", "right_rear_middle", "right_rear_top",
         "tail_base", "tail_end", "left_ear_base", "right_ear_base",
         "nose", "chin", "left_ear_tip", "right_ear_tip",
         "left_eye", "right_eye", "withers", "throat"]

def rle_from_string(s):
    """COCO compressed RLE string -> list of run counts (port of pycocotools rleFrString)."""
    cnts, p, m = [], 0, 0
    while p < len(s):
        x, k, more = 0, 0, True
        while more:
            c = ord(s[p]) - 48
            x |= (c & 0x1f) << (5 * k)
            more = bool(c & 0x20)
            p += 1; k += 1
            if not more and (c & 0x10):
                x |= -1 << (5 * k)
        if m > 2:
            x += cnts[m - 2]
        cnts.append(x); m += 1
    return cnts

def decode(s, h, w):
    flat = np.zeros(h * w, dtype=np.uint8)
    pos, val = 0, 0
    for c in rle_from_string(s):
        if val: flat[pos:pos + c] = 1
        pos += c; val ^= 1
    return flat.reshape((w, h)).T.copy()  # column-major

def outline(mask, bbox, eps_frac):
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not cs: return []
    areas = [cv2.contourArea(c) for c in cs]
    big = max(areas)
    eps = max(1.0, eps_frac * float(np.hypot(bbox[2], bbox[3])))
    out = []
    for c, a in sorted(zip(cs, areas), key=lambda t: -t[1]):
        if a < 0.02 * big: continue
        ap = cv2.approxPolyDP(c, eps, True).reshape(-1, 2)
        if len(ap) >= 3: out.append(ap.astype(int).tolist())
    return out

def load_splits(d):
    split = {}
    if not d: return split
    for name in ("train", "val", "test"):
        p = os.path.join(d, f"{name}_stanford_StanfordExtra_v12.npy")
        if os.path.exists(p):
            for i in np.load(p, allow_pickle=False).tolist():
                if i in split: raise SystemExit(f"index {i} in two splits")
                split[int(i)] = name
    return split

def rnd(v, dec):
    return int(round(v)) if dec == 0 else round(v, dec)

def main(argv):
    pos, opt = [], {"--eps": "0.004", "--kpdec": "1", "--parts": "1"}
    it = iter(argv)
    for a in it:
        if a in opt: opt[a] = next(it)
        else: pos.append(a)
    src, dst = pos[0], pos[1]
    split = load_splits(pos[2] if len(pos) > 2 else None)
    eps_frac, kpdec, parts = float(opt["--eps"]), int(opt["--kpdec"]), int(opt["--parts"])
    data = json.load(open(src))
    res, n_pts = {}, 0
    # checks
    ext_err, kp_in, kp_tot, n_multi_poly, n_no_outline = [], 0, 0, 0, 0
    for idx, e in enumerate(data):
        img = e["img_path"]
        breed = img.split("/")[0].split("-", 1)[1]
        w, h = int(e["img_width"]), int(e["img_height"])
        joints = json.loads(e["joints"]) if isinstance(e["joints"], str) else e["joints"]
        bbox = json.loads(e["img_bbox"]) if isinstance(e["img_bbox"], str) else e["img_bbox"]
        multi = e["is_multiple_dogs"]
        multi = (multi == "True") if isinstance(multi, str) else bool(multi)
        kp = {}
        for name, (x, y, v) in zip(NAMES, joints):
            if v > 0 or x or y:
                kp[name] = [rnd(x, kpdec), rnd(y, kpdec), int(v)]
        rec = {"img": img.split("/")[1].rsplit(".", 1)[0], "size": [w, h],
               "bbox": [int(round(b)) for b in bbox], "multi": multi}
        if split: rec["split"] = split.get(idx)
        rec["kp"] = kp
        if e.get("seg"):
            mask = decode(e["seg"], h, w)
            ol = outline(mask, bbox, eps_frac)
            rec["outline"] = ol
            n_pts += sum(len(p) for p in ol)
            if ol:
                if len(ol) > 1: n_multi_poly += 1
                allp = np.array([q for p in ol for q in p])
                x0, y0 = allp.min(0); x1, y1 = allp.max(0)
                ext_err.append(max(abs(x0 - bbox[0]), abs(y0 - bbox[1]),
                                   abs(x1 - (bbox[0] + bbox[2])), abs(y1 - (bbox[1] + bbox[3]))))
                polys = [np.array(p, dtype=np.float32).reshape(-1, 1, 2) for p in ol]
                for name, (x, y, v) in zip(NAMES, joints):
                    if v == 1:
                        kp_tot += 1
                        d = max(cv2.pointPolygonTest(p, (float(x), float(y)), True) for p in polys)
                        if d >= -6: kp_in += 1
            else:
                n_no_outline += 1
        res.setdefault(breed, []).append(rec)
    # write
    breeds = sorted(res)
    if parts <= 1:
        json.dump(res, open(dst, "w"), separators=(",", ":"))
        outs = [dst]
    else:
        base = dst[:-5] if dst.endswith(".json") else dst
        chunk = -(-len(breeds) // parts)
        outs = []
        for i in range(parts):
            sub = {b: res[b] for b in breeds[i * chunk:(i + 1) * chunk]}
            p = f"{base}_part{i + 1}.json"
            json.dump(sub, open(p, "w"), separators=(",", ":"))
            outs.append(p)
    # report
    print(len(data), "dogs,", len(res), "breeds,", n_pts, "outline points")
    for p in outs: print(p, os.path.getsize(p), "bytes")
    ee = np.array(ext_err)
    print("outline extent vs bbox (max side error, px): median %.1f, p95 %.1f, max %.0f; <=8px %.1f%%"
          % (np.median(ee), np.percentile(ee, 95), ee.max(), 100 * (ee <= 8).mean()))
    print("dogs with >1 polygon:", n_multi_poly, " dogs without outline:", n_no_outline)
    print("visible keypoints inside or within 6 px of outline: %d / %d (%.2f%%)" % (kp_in, kp_tot, 100 * kp_in / kp_tot))
    if split:
        from collections import Counter
        print("split:", dict(Counter(split.values())), " entries without split:", len(data) - len(split))
    print("per breed:")
    for b in breeds: print(" ", b, len(res[b]))

if __name__ == "__main__":
    main(sys.argv[1:])
