#!/usr/bin/env python3
"""WCAG contrast check. Usage: contrast.py FG BG [FG BG ...]   e.g. contrast.py '#d9a441' '#141b17'
Prints the ratio and AA/AAA pass marks for each pair. (Palette)"""
import sys

def lum(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= .03928 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]

def ratio(a, b):
    a, b = lum(a), lum(b)
    return (max(a, b) + .05) / (min(a, b) + .05)

args = sys.argv[1:]
if not args or len(args) % 2:
    sys.exit(__doc__)
for fg, bg in zip(args[::2], args[1::2]):
    r = ratio(fg, bg)
    print(f"{fg} on {bg}: {r:5.2f}  AA text {'ok' if r >= 4.5 else 'FAIL'}  AA large {'ok' if r >= 3 else 'FAIL'}  AAA {'ok' if r >= 7 else '-'}")
