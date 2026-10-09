// Hand-drawn dingo, round 1. Facing right. Ground y=350, withers y=150 (shoulder height 200).
const C = { base:"#c97a3a", shade:"#8f4f1f", light:"#e8a86a", buff:"#f1e1bf", buffS:"#d6bd92", dark:"#2e1c0c", line:"#2e1c0c", bg:"#efe3c6", ground:"#cdb286" };
const SW = 3.2;
const P = {
  body: `M330 114 C342 102 364 102 380 110 C390 116 396 128 404 138 C416 148 428 160 436 170 C438 176 434 182 426 184 C414 188 400 188 388 188 C374 188 362 186 352 182 C350 192 348 204 348 214 C346 228 338 240 326 250 C296 256 264 254 228 240 C214 246 206 256 206 268 C200 276 190 282 178 284 C164 282 150 272 142 254 C136 236 138 212 144 194 C150 176 162 164 184 158 C224 152 262 150 298 150 C308 138 318 126 330 114 Z`,
  foreNear: `M300 200 C304 220 310 236 314 250 C312 280 312 304 314 318 L312 340 C318 350 340 350 346 342 C346 336 338 332 334 326 L336 304 C338 282 338 262 342 248 C344 232 342 214 338 200 Z`,
  foreFar: `M284 200 C288 220 294 236 298 250 C296 280 296 304 298 318 L296 340 C302 350 324 350 330 342 C330 336 322 332 318 326 L320 304 C322 282 322 262 326 248 C328 232 326 214 322 200 Z`,
  hindNear: `M196 258 C180 272 162 288 158 300 L164 326 C164 336 170 344 176 346 C186 352 202 352 208 346 C208 340 198 338 190 336 L184 322 L180 300 C186 290 200 278 210 268 Z`,
  hindFar: `M150 200 C132 220 130 268 144 300 L150 326 C150 336 154 344 160 346 C168 352 184 352 190 346 C190 340 182 338 174 336 L166 324 L164 302 C170 286 184 270 196 254 C206 238 204 218 192 208 Z`,
  tail: `M148 184 C124 200 108 228 108 260 C108 282 118 298 134 296 C144 294 146 284 138 282 C130 284 124 274 124 260 C126 236 138 214 158 196 Z`,
  tailUnder: `M132 232 C124 246 122 264 124 274 C130 286 136 290 136 284 C130 278 128 264 132 250 Z`,
  earFar: `M338 118 Q342 94 352 64 Q362 90 370 110 Z`,
  earNear: `M362 110 Q370 86 382 60 Q388 88 394 114 Z`,
  earNearIn: `M369 110 Q374 92 381 74 Q385 94 389 112 Z`,
  eye: `M386 134 Q392 126 403 131 Q397 140 386 134 Z`,
  muzzle: `M384 144 C400 150 418 162 430 176 C420 184 400 186 388 186 C374 186 360 184 350 180 C354 168 364 156 384 144 Z`,
  chest: `M352 184 C350 200 348 220 334 246 C310 252 284 254 262 250 C272 240 292 232 310 226 C326 220 338 204 352 184 Z`,
  shadeBody: `M326 236 C300 246 262 248 228 240 C214 246 206 256 206 268 C200 276 190 282 178 284 C164 282 150 272 142 254 L142 262 C150 280 166 290 180 290 C196 288 208 278 212 268 C216 258 222 250 232 248 C264 258 300 258 326 250 Z`,
  shadeNeck: `M352 182 C350 192 348 204 348 214 C346 228 338 240 326 250 L318 236 C330 222 336 206 340 190 C344 184 348 182 352 182 Z`,
  shadeJaw: `M350 180 C370 186 400 188 426 184 C418 190 396 192 380 190 C366 190 356 188 348 184 Z`,
  shadeThigh: `M196 258 C180 272 162 288 158 300 L164 326 L174 324 L170 300 C176 288 188 276 200 266 Z`,
  lightBack: `M188 158 C224 152 262 150 298 150 C308 138 318 126 330 114 L336 122 C324 134 314 146 306 160 C266 160 228 162 194 168 Z`,
};
function svg(w, h){
  const line = `stroke="${C.line}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
  const thin = `stroke="${C.line}" stroke-width="${SW*0.6}" stroke-linejoin="round" stroke-linecap="round"`;
  const part = (d, fill, ex) => `<path d="${d}" fill="${fill}" ${ex || line}/>`;
  let b = `<ellipse cx="250" cy="352" rx="180" ry="11" fill="${C.ground}"/>`;
  b += `<defs><clipPath id="bodyclip"><path d="${P.body}"/></clipPath><clipPath id="hindclip"><path d="${P.hindNear}"/></clipPath><mask id="bm"><rect width="480" height="400" fill="#fff"/><path d="${P.body}" fill="#000"/></mask></defs>`;
  b += part(P.hindFar, C.shade) + part(P.foreFar, C.shade);
  b += part(P.tail, C.base) + part(P.tailUnder, C.buff, `stroke="none"`);
  b += part(P.body, C.base);
  b += part(P.hindNear, C.base, `stroke="none"`) + part(P.foreNear, C.base, `stroke="none"`);
  b += `<g clip-path="url(#hindclip)"><path d="${P.shadeThigh}" fill="${C.shade}"/></g>`;
  b += `<g mask="url(#bm)">` + part(P.hindNear, "none") + part(P.foreNear, "none") + `</g>`;
  b += `<g clip-path="url(#bodyclip)">` + part(P.chest, C.buff, `stroke="none"`) + part(P.muzzle, C.buff, `stroke="none"`) + part(P.shadeBody, C.shade, `stroke="none"`) + part(P.shadeNeck, C.shade, `stroke="none"`) + part(P.shadeJaw, C.shade, `stroke="none"`) + part(P.lightBack, C.light, `stroke="none" opacity=".85"`) + `</g>`;
  b += part(P.earFar, C.base) + part(P.earNear, C.base) + part(P.earNearIn, C.buffS, `stroke="none"`);
  b += part(P.eye, "#f3e9d0", `stroke="${C.dark}" stroke-width="1.4"`) + `<circle cx="395" cy="133" r="2.8" fill="${C.dark}"/><circle cx="396" cy="132" r=".9" fill="#fff"/>`;
  b += `<path d="M382 126 Q394 120 406 126" fill="none" ${thin}/>`;
  b += `<path d="M430 166 C436 166 440 170 438 176 C436 180 430 180 428 176 Z" fill="${C.dark}"/>`;
  b += `<path d="M428 182 Q418 186 406 184" fill="none" ${thin}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 400" width="${w||480}" height="${h||400}" style="background:${C.bg}">${b}</svg>`;
}
module.exports = {svg, P, C};
if (require.main === module){ require('fs').writeFileSync('hand.html', `<body style="margin:0;background:#333;padding:10px">${svg(960, 800)}</body>`); console.log('ok'); }
