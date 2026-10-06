"""参考画像（vim-reference-3.png）の白い形を輪郭にして、ロゴ部品（vim-parts.json）を作る：python3 _dev/brand/trace_logo.py
その後 apply_logo.py で各所に反映。"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure
B = os.path.dirname(os.path.abspath(__file__))
a = np.array(Image.open(os.path.join(B, 'vim-reference-3.png')).convert('L')).astype(float) / 255 > .5
def trace(mask, sig, tol, allc=False):
    m = ndimage.gaussian_filter(np.pad(mask.astype(float), 1), sig); cs = measure.find_contours(m, .5)
    cs = cs if allc else [max(cs, key=len)]
    return ' '.join('M' + ' L'.join('%.1f %.1f' % (x - 1, y - 1) for y, x in measure.approximate_polygon(c, tolerance=tol)) + 'Z' for c in cs if len(c) >= 8)
top = a.copy(); top[740:] = False
lab, n = ndimage.label(top); objs = ndimage.find_objects(lab)
big = sorted([(o[1].start, i + 1) for i, o in enumerate(objs) if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) > 2000])
P = {k: trace(lab == i, .8, 1.2) for k, (_, i) in zip(("V", "LAMP", "M"), big)}
tl = np.zeros_like(a); tl[740:860] = a[740:860]
P["TAG"] = trace(tl, .6, .6, allc=True)
json.dump(P, open(os.path.join(B, 'vim-parts.json'), 'w'))
print("ok")
