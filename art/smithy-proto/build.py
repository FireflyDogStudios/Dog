# Rebuilds smithy.html (the showroom page) from the files in src/.
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
r = lambda f: open(f, encoding="utf-8").read()
page = r("page.html").replace("/*STYLE*/", r("style.css")).replace("/*JS*/", r("engine.js") + "\n" + r("render.js") + "\n" + r("ui.js"))
open("../smithy.html", "w", encoding="utf-8").write(page)
print("wrote smithy.html")
