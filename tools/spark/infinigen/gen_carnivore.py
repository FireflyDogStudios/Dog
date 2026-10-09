# Spark, Oct 8 2026: generate Infinigen carnivores headless and render a side view on a flat dark background.
# Run with Infinigen's venv:  python gen_carnivore.py <seed> <out.png> [wolf] [clay] [hair]
#   wolf = force the wolf body and head templates (Infinigen otherwise blends tiger/cheetah/housecat/wolf)
import sys, math, numpy as np, bpy
from infinigen.assets.objects.creatures import carnivore
from infinigen.assets.objects.creatures.util import part_util
from infinigen.core.util import blender as butil
from infinigen.core.util.math import FixedSeed

seed, out = int(sys.argv[1]), sys.argv[2]
flags = set(sys.argv[3:])
if 'wolf' in flags:
    orig = part_util.random_convex_coord
    def only_wolf(keys, select=None, temp=1):
        w = [k for k in keys if 'wolf' in k]
        return {k: (1.0 if k in w else 0.0) for k in keys} if w else orig(keys, select=select, temp=temp)
    part_util.random_convex_coord = only_wolf
    carnivore.U = lambda *a, **k: (0.9 if not a else np.random.uniform(*a, **k))  # take the NURBS head branch (wolf head)

butil.clear_scene()
fac = carnivore.CarnivoreFactory(seed, hair='hair' in flags, animation_mode=None)
with FixedSeed(seed):
    obj = fac.spawn_asset(0)

# --- studio: flat dark background, key/fill/rim, orthographic side camera
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 48; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1600, 1000
sc.render.film_transparent = False
w = bpy.data.worlds.new('flat') if not sc.world else sc.world
sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes.get('Background'); bg.inputs[0].default_value = (0.012, 0.014, 0.018, 1); bg.inputs[1].default_value = 1.0
sc.view_settings.view_transform = 'Standard'

meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.visible_get()]
if 'clay' in flags:
    m = bpy.data.materials.new('clay'); m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.48, 0.40, 0.35, 1)
    m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.55
    for o in meshes:
        o.data.materials.clear(); o.data.materials.append(m)
bpy.context.view_layer.update()
pts = np.array([o.matrix_world @ v.co for o in meshes for v in o.data.vertices[::7]])
lo, hi = pts.min(0), pts.max(0); c = (lo + hi) / 2; size = hi - lo
print('BBOX', lo.round(3), hi.round(3))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = max(size[0], size[2] * 1.6) * 1.15
# Infinigen creatures run along +X with Z up; look from -Y so the head points right
cam.location = (c[0], c[1] - 10, c[2]); cam.rotation_euler = (math.radians(90), 0, 0)
def light(name, loc, energy, size=2):
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, 'AREA')); l.data.energy = energy; l.data.size = size
    l.location = loc; sc.collection.objects.link(l)
    d = c - np.array(loc); l.rotation_euler = (math.atan2(math.hypot(d[0], d[1]), -d[2]), 0, math.atan2(d[1], d[0]) + math.pi / 2)
light('key', (c[0] + 1.5, c[1] - 3, c[2] + 2.5), 900, 3)
light('fill', (c[0] - 2.5, c[1] - 2, c[2] + 0.5), 250, 4)
light('rim', (c[0] - 1, c[1] + 3, c[2] + 2), 500, 2)
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print('WROTE', out)
