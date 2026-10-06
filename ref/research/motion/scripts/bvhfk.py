"""Minimal BVH parser + forward kinematics (numpy). Firefly, for The Den Ledger research."""
import numpy as np
from scipy.spatial.transform import Rotation as R


def parse(path):
    joints = []  # dict(name, parent, offset, channels)
    stack = []
    with open(path) as f:
        lines = f.read().split('\n')
    i = 0
    while i < len(lines):
        t = lines[i].strip().split()
        i += 1
        if not t:
            continue
        if t[0] in ('ROOT', 'JOINT'):
            joints.append(dict(name=t[1], parent=stack[-1] if stack else -1, offset=None, channels=[]))
            cur = len(joints) - 1
        elif t[0] == 'End':
            joints.append(dict(name=joints[stack[-1]]['name'] + '_End', parent=stack[-1], offset=None, channels=[]))
            cur = len(joints) - 1
        elif t[0] == '{':
            stack.append(cur)
        elif t[0] == '}':
            stack.pop()
        elif t[0] == 'OFFSET':
            joints[stack[-1]]['offset'] = np.array([float(x) for x in t[1:4]])
        elif t[0] == 'CHANNELS':
            joints[stack[-1]]['channels'] = t[2:]
        elif t[0] == 'MOTION':
            break
    nf = int(lines[i].split()[1]); i += 1
    ft = float(lines[i].split()[2]); i += 1
    data = np.array([[float(x) for x in l.split()] for l in lines[i:i + nf] if l.strip()])
    return joints, data, ft


def fk(joints, data):
    nf = data.shape[0]
    nj = len(joints)
    pos = np.zeros((nf, nj, 3))
    rot = [None] * nj
    col = 0
    for j, J in enumerate(joints):
        ch = J['channels']
        trans = np.tile(J['offset'], (nf, 1))
        order = ''
        angles = []
        for c in ch:
            v = data[:, col]; col += 1
            if c.endswith('position'):
                trans[:, 'XYZ'.index(c[0])] = v
            else:
                order += c[0]
                angles.append(v)
        if order:
            local = R.from_euler(order, np.stack(angles, 1), degrees=True)  # intrinsic
        else:
            local = R.identity(nf)
        p = J['parent']
        if p < 0:
            pos[:, j] = trans
            rot[j] = local
        else:
            pos[:, j] = pos[:, p] + rot[p].apply(trans)
            rot[j] = rot[p] * local
    return pos, rot
