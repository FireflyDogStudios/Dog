"""Convert a StanfordExtra annotation JSON (sample or full StanfordExtra_v12.json)
to compact per-breed JSON: {breed: [{img, size, bbox, multi, kp:{name:[x,y,v]}, outline:[[[x,y],...],...]}]}.
Usage: python3 -I convert_stanfordextra.py IN.json OUT.json
Needs numpy and opencv (cv2). Coordinates are image pixels, origin top-left, y down."""
import json, sys
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
    return flat.reshape((w, h)).T  # column-major

def outline(mask, bbox):
    cs, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not cs: return []
    areas = [cv2.contourArea(c) for c in cs]
    big = max(areas)
    eps = max(1.0, 0.004 * float(np.hypot(bbox[2], bbox[3])))
    out = []
    for c, a in sorted(zip(cs, areas), key=lambda t: -t[1]):
        if a < 0.02 * big: continue
        ap = cv2.approxPolyDP(c, eps, True).reshape(-1, 2)
        if len(ap) >= 3: out.append(ap.astype(int).tolist())
    return out

def main(src, dst):
    data = json.load(open(src))
    res, n_pts = {}, 0
    for e in data:
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
                kp[name] = [round(x, 1), round(y, 1), int(v)]
        rec = {"img": img.split("/")[1].rsplit(".", 1)[0], "size": [w, h],
               "bbox": [round(b, 1) for b in bbox], "multi": multi, "kp": kp}
        if e.get("seg"):
            rec["outline"] = outline(decode(e["seg"], h, w), bbox)
            n_pts += sum(len(p) for p in rec["outline"])
        res.setdefault(breed, []).append(rec)
    json.dump(res, open(dst, "w"), separators=(",", ":"))
    print(len(data), "dogs,", len(res), "breeds,", n_pts, "outline points")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
