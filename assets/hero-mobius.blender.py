"""CMD · hero Möbius. Fios finos em terracota formam uma fita de Möbius; três fios de cobre
percorrem a borda única e a linha central. Fundo transparente para assentar no creme da página.
Uso: python3 mobius.py <saida_dir> <frame_ini> <frame_fim> [largura] [samples]"""
import bpy, math, sys, os
from mathutils import Vector

out = sys.argv[1]; f0 = int(sys.argv[2]); f1 = int(sys.argv[3])
W = int(sys.argv[4]) if len(sys.argv) > 4 else 1600
SPP = int(sys.argv[5]) if len(sys.argv) > 5 else 48
FRAMES = 144  # volta completa

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"
sc.cycles.samples = SPP; sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6; sc.cycles.transmission_bounces = 6; sc.cycles.glossy_bounces = 4
sc.render.film_transparent = True
sc.render.resolution_x = W; sc.render.resolution_y = int(W * 0.49)
sc.render.use_border = True; sc.render.use_crop_to_border = True
sc.render.border_min_x = 0.42; sc.render.border_max_x = 1.0; sc.render.border_min_y = 0.0; sc.render.border_max_y = 1.0; sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast"

def mat(name, base, metal=0.0, rough=0.4, emit=None, alpha=1.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*base, 1)
    p.inputs["Metallic"].default_value = metal; p.inputs["Roughness"].default_value = rough
    p.inputs["Alpha"].default_value = alpha
    if coat: p.inputs["Coat Weight"].default_value = coat
    return m

srgb = lambda h: tuple(((int(h[i:i+2], 16) / 255) ** 2.2) for i in (0, 2, 4))
M_THREAD = mat("fio", srgb("E07A61"), rough=0.4, alpha=0.92)
M_DEEP = mat("fio_fundo", srgb("A24E3B"), rough=0.5, alpha=0.9)
M_COPPER = mat("cobre", srgb("C98A6B"), metal=1.0, rough=0.16, coat=0.5)

R, WD = 1.0, 0.46
def mob(u, v):
    w = WD * (1 + 0.06 * math.sin(3 * u))
    r = R + v * w * math.cos(u / 2)
    return Vector((r * math.cos(u), r * math.sin(u), v * w * math.sin(u / 2)))

root = bpy.data.objects.new("mobius", None); sc.collection.objects.link(root)

def thread(v, radius, material, n=900):
    cu = bpy.data.curves.new("c", "CURVE"); cu.dimensions = "3D"
    cu.bevel_depth = radius; cu.bevel_resolution = 3; cu.use_fill_caps = True
    sp = cu.splines.new("POLY"); sp.points.add(n - 1); sp.use_cyclic_u = True
    for i in range(n):
        u = 4 * math.pi * i / n
        p = mob(u, v); sp.points[i].co = (p.x, p.y, p.z, 1)
    ob = bpy.data.objects.new("f", cu); ob.data.materials.append(material); ob.parent = root
    sc.collection.objects.link(ob); return ob

# fios da superfície: cada fio dá duas voltas e fecha, um só percurso
N = 26
for k in range(N):
    v = (k + 0.5) / N
    thread(v, 0.0032, M_THREAD if k % 3 else M_DEEP)
# cobre: a borda única (duas voltas) e a linha central
thread(1.0, 0.017, M_COPPER, 1400)
thread(0.0, 0.009, M_COPPER, 1400)

tilt = bpy.data.objects.new("tilt", None); sc.collection.objects.link(tilt)
tilt.rotation_euler = (math.radians(62), math.radians(-14), 0)
tilt.location = (1.25, 0.0, -0.05); tilt.scale = (0.78, 0.78, 0.78)
root.parent = tilt

# câmara
cam = bpy.data.cameras.new("cam"); cam.lens = 50
co = bpy.data.objects.new("cam", cam); sc.collection.objects.link(co); sc.camera = co
co.location = (0.0, -6.2, 0.6); co.rotation_euler = (math.radians(84), 0, 0)
cam.dof.use_dof = True; cam.dof.focus_distance = 6.2; cam.dof.aperture_fstop = 1.4

# luz: caixa de luz quente por cima à esquerda, recorte frio-neutro à direita, enchimento suave
def area(name, loc, rot, size, energy, color):
    l = bpy.data.lights.new(name, "AREA"); l.size = size; l.energy = energy; l.color = color
    o = bpy.data.objects.new(name, l); o.location = loc; o.rotation_euler = rot; sc.collection.objects.link(o)
area("key", (-3, -3, 4), (math.radians(45), 0, math.radians(-40)), 3, 1300, (1, .9, .82))
area("rim", (4, 2, 2), (math.radians(70), 0, math.radians(115)), 2.5, 600, (1, .95, .92))
area("fill", (0, -5, -1.5), (math.radians(100), 0, 0), 6, 90, (1, .93, .88))
wo = bpy.data.worlds.new("w"); sc.world = wo; wo.use_nodes = True
bg = wo.node_tree.nodes["Background"]; bg.inputs[0].default_value = (0.98, 0.95, 0.92, 1); bg.inputs[1].default_value = 0.3

os.makedirs(out, exist_ok=True)
for f in range(f0, f1 + 1):
    # a fita roda sobre o próprio eixo: os fios deslizam e a torção percorre o anel
    root.rotation_euler = (0, 0, 2 * math.pi * f / FRAMES)
    sc.render.filepath = os.path.join(out, f"f{f:03d}.png")
    bpy.ops.render.render(write_still=True)
    print("frame", f, flush=True)
