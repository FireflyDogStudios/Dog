# Makes sim/game.html from a saved copy of the game (index.html in this folder).
# It adds one line that lets the bot reach the game's insides. Never publish this copy.
s = open("index.html", encoding="utf-8").read()
k = s.rfind("})();")
open("sim/game.html", "w", encoding="utf-8").write(s[:k] + "window.__E=(c)=>eval(c);\n" + s[k:])
print("wrote sim/game.html")
