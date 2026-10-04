function fkIcon(n){ const d = FKI[n]; return d ? `<svg class="fkgi" viewBox="0 0 ${d[0]} 512" aria-hidden="true">${d[1]}</svg>` : ""; }
let fkOn = true; /* v0.31: the Field Kit look is the game's look (classic retired) */
const FK_DOCK = [["hunt","crossed-swords","Hunt","H"],["bag","knapsack","Inventory","I"],["pack","sitting-dog","Pack","P"],["mine","mining","Mine","M"],["events","trophy","Trials & Events","E"],["@mail","mailbox","Mail","N"],["@home","dog-house","Head home","D"],["@settings","cog","Settings","O"]];
/* v0.36: the Den bar (right side) only shows at home */
const DEN_DOCK = [["tomes","spell-book","Library","L"],["stash","locked-chest","Stash","B"]];
const FK_SIZE = {bag:[600,660], stash:[560,560]};
