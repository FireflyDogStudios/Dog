// Hand-drawn dingo, traced from GrumpyDingo's reference photo (Carolina Dog, side-on), mirrored to face right.
// Photo → canvas: X = 500 - 1.25·x, Y = 150 + 1.25·(y - 85). Ground y=350, withers y=150 (shoulder height 200).
const C = { base:"#cf8a48", saddle:"#b86f32", shade:"#8f4f1f", light:"#e8b070", buff:"#f3e4c4", buffS:"#dcc49a", dark:"#2e1c0c", line:"#2e1c0c", bg:"#efe3c6", ground:"#cdb286" };
const SW = 3;
const P = {
  // torso + neck + head + thigh, one silhouette (clockwise from the occiput)
  body: `M331 100 C338 90 352 86 366 96 C376 104 384 112 392 120 C402 128 412 133 419 137 C421 142 418 148 410 151 C400 156 388 158 378 158 C372 158 368 157 366 158 C362 172 360 186 360 198 C358 212 352 222 346 231 C318 236 294 236 275 231 C250 226 228 218 206 212 C194 212 184 220 178 232 C174 244 166 256 152 264 C140 268 126 266 118 256 C108 240 106 216 110 198 C112 184 118 174 125 169 C130 162 134 160 140 160 C170 154 230 152 300 150 C312 136 322 116 331 100 Z`,
  // near foreleg: hangs under the shoulder, elbow at the brisket, straight forearm, pastern, compact paw
  foreNear: `M322 198 C322 216 324 226 326 232 C326 260 326 290 328 318 L326 340 C330 350 352 350 356 342 C356 336 348 332 344 326 L344 304 C344 280 346 252 348 232 C350 220 348 208 346 198 Z`,
  foreFar: `M304 198 C304 216 306 226 308 232 C308 260 308 290 310 318 L308 340 C312 350 334 350 338 342 C338 336 330 332 326 326 L326 304 C326 280 328 252 330 232 C332 220 330 208 328 198 Z`,
  // near hind leg from the stifle: gaskin back to the hock, rear pastern down, paw
  hindNear: `M176 244 C160 262 142 280 130 292 C126 298 126 304 128 308 L130 330 C130 340 134 348 142 350 C150 354 164 354 170 348 C170 342 162 338 154 336 L148 324 L144 304 C144 298 146 294 150 290 C160 278 172 266 184 256 Z`,
  hindFar: `M164 200 C150 220 150 250 140 268 C132 282 132 294 134 300 L136 330 C136 340 140 348 148 350 C156 354 170 354 176 348 C176 342 168 338 160 336 L154 324 L152 304 C152 298 154 294 158 290 C168 278 180 266 190 256 C196 240 196 220 188 206 Z`,
  // tail: hangs from the croup in a soft fish-hook, reaching the hock
  tail: `M126 170 C108 184 96 208 92 236 C88 262 84 284 74 302 C68 314 86 318 96 308 C106 290 112 266 114 242 C116 220 122 198 136 180 Z`,
  tailUnder: `M108 232 C104 256 100 280 88 298 C90 304 98 304 100 298 C110 280 114 256 116 236 Z`,
  // ears: big, set high, pointing forward (facing right = tips lean right)
  earFar: `M333 100 Q338 78 349 56 Q352 76 353 90 Z`,
  earNear: `M352 90 Q358 72 370 56 Q374 78 374 98 Z`,
  earNearIn: `M357 90 Q361 78 368 66 Q370 80 370 96 Z`,
  // face
  eye: `M374 112 Q380 106 389 110 Q384 118 374 112 Z`,
  muzzle: `M372 120 C388 128 404 138 414 146 C408 154 394 157 380 157 C372 157 366 155 362 150 C362 138 366 128 372 120 Z`,
  // pale throat, chest and belly
  chest: `M366 160 C360 176 356 192 352 208 C348 220 342 228 336 234 C322 238 300 238 280 233 L282 226 C300 228 318 228 332 224 C340 214 344 198 348 182 C352 170 358 162 366 160 Z`,
  belly: `M275 231 C250 226 228 218 206 212 C196 211 186 211 176 212 L172 220 C186 218 198 218 210 220 C230 226 252 232 275 236 Z`,
  // darker saddle along the back, lighter strip on top
  saddle: `M140 160 C170 154 230 152 300 150 C312 136 322 116 331 100 L336 108 C326 124 316 142 306 158 C250 160 190 164 150 172 Z`,
  lightBack: `M150 158 C190 154 240 152 298 150 C306 142 312 132 318 122 L322 126 C316 136 310 146 304 156 C250 156 196 158 156 164 Z`,
  // shading (Smithy split): under the belly, front of the neck, under the jaw, back of the thigh
  shadeBody: `M346 231 C318 236 294 236 275 231 C250 226 228 218 206 212 C194 212 184 220 178 232 C174 244 166 256 152 264 C140 268 126 266 118 256 L116 264 C128 276 146 276 160 268 C172 258 180 246 186 236 C198 228 214 228 232 234 C258 242 290 244 320 242 C332 241 342 238 350 236 Z`,
  shadeNeck: `M366 158 C362 172 360 186 360 198 C358 212 352 222 346 231 L340 226 C348 212 350 196 352 180 C354 170 358 162 366 158 Z`,
  shadeThigh: `M176 244 C160 262 142 280 130 292 C126 298 126 304 128 308 L130 330 L140 328 L144 304 C144 298 146 294 150 290 C160 278 172 266 184 256 Z`,
};
function svg(w, h, opt){ opt = opt || {};
  const line = `stroke="${C.line}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${C.line}" stroke-width="${SW*0.6}" stroke-linejoin="round" stroke-linecap="round"`;
  const part = (d, fill, ex) => `<path d="${d}" fill="${fill}" ${ex || line}/>`;
  let b = `<ellipse cx="240" cy="352" rx="190" ry="11" fill="${C.ground}"/>`;
  b += `<defs><clipPath id="bodyclip"><path d="${P.body}"/></clipPath><clipPath id="hindclip"><path d="${P.hindNear}"/></clipPath><mask id="bm"><rect width="480" height="400" fill="#fff"/><path d="${P.body}" fill="#000"/></mask></defs>`;
  b += part(P.hindFar, C.shade) + part(P.foreFar, C.shade);
  b += part(P.tail, C.base) + part(P.tailUnder, C.buff, `stroke="none"`);
  b += part(P.body, C.base);
  b += part(P.hindNear, C.base, `stroke="none"`) + part(P.foreNear, C.buffS, `stroke="none"`);
  b += `<g clip-path="url(#hindclip)"><rect x="110" y="304" width="90" height="60" fill="${C.buffS}"/></g>`;
  b += `<g clip-path="url(#hindclip)"><path d="${P.shadeThigh}" fill="${C.shade}" opacity=".35"/></g>`;
  b += `<g mask="url(#bm)">` + part(P.hindNear, "none") + part(P.foreNear, "none") + `</g>`;
  b += `<g clip-path="url(#bodyclip)">` + part(P.saddle, C.saddle, `stroke="none"`) + part(P.lightBack, C.light, `stroke="none" opacity=".8"`) + part(P.chest, C.buff, `stroke="none"`) + part(P.belly, C.buff, `stroke="none"`) + part(P.muzzle, C.buff, `stroke="none"`);
  if (!opt.flat) b += part(P.shadeBody, C.shade, `stroke="none" opacity=".55"`) + part(P.shadeNeck, C.shade, `stroke="none" opacity=".45"`);
  b += `</g>`;
  b += part(P.earFar, C.base) + part(P.earNear, C.base) + part(P.earNearIn, C.buffS, `stroke="none"`);
  b += part(P.eye, C.dark, `stroke="${C.dark}" stroke-width="1.3"`) + `<circle cx="384" cy="111" r="1.1" fill="#fff"/>`;
  b += `<path d="M372 104 Q381 100 390 104" fill="none" ${thin}/>`;
  b += `<path d="M414 131 C420 131 424 135 422 141 C420 145 414 145 412 141 Z" fill="${C.dark}"/>`;
  b += `<path d="M412 150 Q402 154 392 153" fill="none" ${thin}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 400" width="${w||480}" height="${h||400}" style="background:${C.bg}">${b}</svg>`;
}
module.exports = {svg, P, C};
if (require.main === module){ require('fs').writeFileSync(__dirname + '/hand.html', `<body style="margin:0;background:#333;padding:10px;display:flex;gap:10px;align-items:flex-start"><img src="file:///root/.claude/uploads/a9103c21-f632-55a9-95a5-5d7a9adce206/3973685e-image.png" style="height:400px;transform:scaleX(-1)">${svg(560, 467)}</body>`); console.log('ok'); }
