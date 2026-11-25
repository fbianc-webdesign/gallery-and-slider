/* 25 Gallerie — raccolta 03. Tutte le immagini sono in IMGS: sostituisci i percorsi con le tue foto. */
(() => {
const NAMES = ["Alba sulle dune","Notte di cobalto","Laguna di giada","Ocra del meriggio","Crepuscolo viola","Nebbie d'argento","Fuoco di settembre","Fiordo boreale","Rosa del deserto","Mezzanotte smeraldo","Sabbia e indaco","Lago di rame","Cime di lavanda","Ultimo sole","Valle di menta","Terra bruciata","Baia di perla","Aurora magenta",
  "Seta corallo","Marea turchese","Velluto prugna","Oro liquido","Ghiaccio blu","Lava lenta","Bosco in nebbia","Lilla e panna","Petrolio","Pesca e salvia","Inchiostro","Tramonto acido"];
const IMGS = NAMES.map((title, i) => { const n = String(i + 1).padStart(2, "0"); return { src: `img/${n}.jpg`, th: `img/t${n}.jpg`, title, n, w: 1280, h: 880 }; });
const MIX = [0, 18, 2, 20, 4, 22, 7, 24, 9, 26, 13, 28, 16, 19, 1, 21, 3, 23, 5, 25, 6, 27, 8, 29, 10, 11, 12, 14, 15, 17].map(i => IMGS[i]); // paesaggi e marmi alternati
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pick = (start, n) => Array.from({ length: n }, (_, i) => MIX[(start + i) % MIX.length]);
const fig = (m, small) => `<figure class="fig"><img src="${small ? m.th : m.src}" alt="${m.title}" draggable="false"><figcaption class="cap"><b>${m.title}</b><span>N° ${m.n}</span></figcaption></figure>`;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const load = (src) => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* ciclo requestAnimationFrame che gira solo quando la galleria è visibile */
const loop = (fn) => { let raf, on = false; const tick = (t) => { fn(t); if (on) raf = requestAnimationFrame(tick); }; return { play() { if (!on) { on = true; raf = requestAnimationFrame(tick); } }, pause() { on = false; cancelAnimationFrame(raf); } }; };

const G = [
/* 01 */ { t: "Ruota panoramica", lib: "Flicking 4 (egjs)", url: "https://naver.github.io/egjs-flicking/", d: "I pannelli scorrono lungo un arco: più si allontanano dal centro, più ruotano e scendono, come le cabine di una ruota.", hint: "Trascina e lascia andare",
  init(s) {
    s.style.paddingInline = 0;
    s.innerHTML = `<div class="flicking-viewport fk"><div class="flicking-camera">${pick(0, 10).map(m => `<div class="pn">${fig(m)}</div>`).join("")}</div></div>`;
    const f = new Flicking($(".fk", s), { circular: true, align: "center", moveType: "freeScroll", deceleration: 0.004, preventClickOnDrag: true });
    const vp = $(".fk", s);
    const arc = () => { const v = vp.getBoundingClientRect(), c = v.left + v.width / 2; f.panels.forEach(p => { const r = p.element.getBoundingClientRect(), k = clamp((r.left + r.width / 2 - c) / (r.width + 28), -3, 3); p.element.firstElementChild.style.transform = `rotate(${k * 7}deg) scale(${1 - Math.min(1, Math.abs(k)) * .08})`; p.element.style.zIndex = 10 - Math.round(Math.abs(k)); }); };
    f.on("move", arc); f.on("ready", arc); f.on("afterResize", arc); arc();
  } },
/* 02 */ { t: "Album da sfogliare", lib: "StPageFlip 2", url: "https://nodlik.github.io/StPageFlip/", d: "Un vero libro fotografico: le pagine si piegano seguendo il dito, con ombre realistiche e copertina rigida.", hint: "Trascina l'angolo di una pagina o clicca",
  init(s) {
    s.classList.add("s02");
    const set = pick(2, 8);
    s.innerHTML = `<div class="book"><div class="page cover" data-density="hard"><div class="in"><small>RACCOLTA 03</small><h3>Orizzonti<br>&amp; marmi</h3><small>SFOGLIA →</small></div></div>
      ${set.map((m, i) => `<div class="page"><div class="in"><img src="${m.src}" alt="${m.title}"><h4>${m.title}</h4><small>TAV. ${i + 1} · N° ${m.n}</small></div></div>`).join("")}
      <div class="page cover" data-density="hard"><div class="in"><h3>Fine</h3><small>← TORNA INDIETRO</small></div></div></div>
      <div class="row"><button class="btn" data-d="-1">← Indietro</button><button class="btn" data-d="1">Avanti →</button></div>`;
    const pf = new St.PageFlip($(".book", s), { width: 400, height: 520, size: "stretch", minWidth: 150, maxWidth: 450, minHeight: 195, maxHeight: 585, showCover: true, maxShadowOpacity: .5, mobileScrollSupport: true, flippingTime: 900 });
    pf.loadFromHTML($$(".page", s));
    $$("[data-d]", s).forEach(b => b.onclick = () => b.dataset.d > 0 ? pf.flipNext() : pf.flipPrev());
  } },
/* 03 */ { t: "Nastro curvo WebGL", lib: "OGL 1", url: "https://github.com/oframe/ogl", d: "Le foto sono piegate su un tamburo 3D che gira con inerzia; quando acceleri il nastro ondeggia. Libreria WebGL minuscola.", hint: "Trascina in orizzontale",
  init(s) {
    const { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } = OGL;
    s.innerHTML = `<div class="cv"></div>`;
    const box = $(".cv", s), set = pick(5, 10), N = set.length, PW = 2.5, PH = 3.3, GAP = 2.85, TOTAL = N * GAP, R = 7.2;
    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(2, devicePixelRatio) }), gl = renderer.gl; box.append(gl.canvas);
    const camera = new Camera(gl, { fov: 35 }); camera.position.z = 8.4;
    const scene = new Transform(), geo = new Plane(gl, { widthSegments: 32, heightSegments: 8 });
    const vertex = `attribute vec3 position; attribute vec2 uv; uniform mat4 modelMatrix, viewMatrix, projectionMatrix; uniform float uR, uSpeed, uTime; varying vec2 vUv; varying float vD;
      void main(){ vUv = uv; vec4 p = modelMatrix * vec4(position, 1.); float a = p.x / uR; p.y += sin(a * 3. + uTime * 2.) * uSpeed * .5; p.x = sin(a) * uR; p.z = cos(a) * uR - uR; vD = cos(a); gl_Position = projectionMatrix * viewMatrix * p; }`;
    const fragment = `precision highp float; uniform sampler2D tMap; uniform float uRatio; varying vec2 vUv; varying float vD;
      void main(){ vec2 uv = vec2((vUv.x - .5) * uRatio + .5, vUv.y); vec3 c = texture2D(tMap, uv).rgb; gl_FragColor = vec4(c * smoothstep(-.1, 1., vD), smoothstep(-.05, .25, vD)); }`;
    const meshes = set.map((m, i) => {
      const tex = new Texture(gl, { generateMipmaps: false }); load(m.src).then(im => tex.image = im);
      const mesh = new Mesh(gl, { geometry: geo, program: new Program(gl, { vertex, fragment, transparent: true, uniforms: { tMap: { value: tex }, uRatio: { value: (PW / PH) / (1280 / 880) }, uR: { value: R }, uSpeed: { value: 0 }, uTime: { value: 0 } } }) });
      mesh.scale.set(PW, PH, 1); mesh.setParent(scene); return mesh;
    });
    const size = () => { renderer.setSize(box.clientWidth, box.clientHeight); camera.perspective({ aspect: box.clientWidth / box.clientHeight }); camera.position.z = box.clientWidth < 600 ? 10.5 : 7.4; };
    new ResizeObserver(size).observe(box); size();
    let target = 0, cur = 0, down = null;
    box.addEventListener("pointerdown", e => { down = { x: e.clientX, t: target }; box.setPointerCapture(e.pointerId); });
    box.addEventListener("pointermove", e => { if (down) target = down.t - (e.clientX - down.x) * .012; });
    ["pointerup", "pointercancel"].forEach(ev => box.addEventListener(ev, () => down = null));
    return loop((t) => {
      if (!down && !RM) target += .004;
      const prev = cur; cur += (target - cur) * .07; const sp = clamp(cur - prev, -.5, .5);
      meshes.forEach((m, i) => { m.position.x = ((i * GAP - cur) % TOTAL + TOTAL * 1.5) % TOTAL - TOTAL / 2; m.program.uniforms.uSpeed.value = sp; m.program.uniforms.uTime.value = t / 1000; });
      renderer.render({ scene, camera });
    });
  } },
/* 04 */ { t: "Lente d'acqua", lib: "PixiJS 8", url: "https://pixijs.com", d: "Il cursore trascina una goccia che deforma la foto come una lente liquida. Al clic un'onda attraversa l'immagine e la cambia.", hint: "Muovi il cursore · clicca per cambiare foto",
  async init(s) {
    s.innerHTML = `<div class="cv px"><div class="cap" style="z-index:2"><b></b><span></span></div></div>`;
    const box = $(".cv", s), set = pick(1, 6);
    const app = new PIXI.Application();
    await app.init({ resizeTo: box, backgroundAlpha: 0, antialias: false, resolution: Math.min(2, devicePixelRatio), autoDensity: true });
    box.prepend(app.canvas);
    const tex = await Promise.all(set.map(m => PIXI.Assets.load(m.src)));
    const a = new PIXI.Sprite(tex[0]), b = new PIXI.Sprite(tex[1]); b.alpha = 0;
    const pics = new PIXI.Container(); pics.addChild(a, b); app.stage.addChild(pics);
    // mappa di spostamento: goccia radiale disegnata su canvas (rosso = X, verde = Y, 128 = neutro)
    const c = document.createElement("canvas"), S = 256; c.width = c.height = S; const x = c.getContext("2d"), id = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const dx = (i - S / 2) / (S / 2), dy = (j - S / 2) / (S / 2), d = Math.hypot(dx, dy), f = d < 1 ? Math.sin(d * Math.PI) * (1 - d) * 1.6 + Math.sin(d * 14) * (1 - d) ** 2 * .5 : 0, o = (j * S + i) * 4; id.data[o] = 128 + 127 * clamp(dx / (d || 1) * f, -1, 1); id.data[o + 1] = 128 + 127 * clamp(dy / (d || 1) * f, -1, 1); id.data[o + 2] = 128; id.data[o + 3] = 255; }
    x.putImageData(id, 0, 0);
    const drop = new PIXI.Sprite(PIXI.Texture.from(c)); drop.anchor.set(.5); drop.alpha = 0.001; app.stage.addChild(drop);
    const filt = new PIXI.DisplacementFilter({ sprite: drop, scale: 60 }); pics.filters = [filt];
    const fit = () => { const W = app.screen.width, H = app.screen.height; [a, b].forEach(sp => { const k = Math.max(W / sp.texture.width, H / sp.texture.height) * 1.06; sp.scale.set(k); sp.anchor.set(.5); sp.position.set(W / 2, H / 2); }); };
    app.renderer.on("resize", fit); fit();
    let cur = 0, mx = app.screen.width / 2, my = app.screen.height / 2, wave = 0, inside = false;
    const cap = () => { $(".cap b", s).textContent = set[cur].title; $(".cap span", s).textContent = `${cur + 1} / ${set.length}`; }; cap();
    box.addEventListener("pointermove", e => { const r = box.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; inside = true; });
    box.addEventListener("pointerleave", () => inside = false);
    const next = () => { if (wave > 0) return; b.texture = tex[(cur + 1) % set.length]; fit(); wave = 1; };
    box.addEventListener("click", next);
    app.ticker.add((tk) => {
      const t = performance.now() / 1000;
      if (!inside) { mx = app.screen.width * (.5 + .32 * Math.sin(t * .7)); my = app.screen.height * (.5 + .28 * Math.sin(t * 1.1)); }
      drop.x += (mx - drop.x) * .12; drop.y += (my - drop.y) * .12;
      let size = 2.2, power = 55;
      if (wave > 0) { wave = Math.max(0, wave - tk.deltaMS / 1100); const k = 1 - wave, e = Math.sin(k * Math.PI); size = 2.2 + e * 9; power = 55 + e * 240; b.alpha = clamp((k - .25) * 2, 0, 1);
        if (wave === 0) { cur = (cur + 1) % set.length; a.texture = tex[cur]; b.alpha = 0; fit(); cap(); } }
      drop.scale.set(size); filt.scale.set(power);
    });
    let timer; return { play() { app.ticker.start(); if (!RM) timer = setInterval(next, 5000); }, pause() { app.ticker.stop(); clearInterval(timer); } };
  } },
/* 05 */ { t: "Bolle che si fanno spazio", lib: "D3 7 · d3-force", url: "https://d3js.org/d3-force", d: "Ogni foto è una bolla in una simulazione fisica: quella che tocchi si gonfia e spinge via le vicine. Si possono trascinare.", hint: "Passa sopra una bolla o trascinala",
  init(s) {
    s.innerHTML = `<div class="bubs"></div>`;
    const box = $(".bubs", s), set = pick(0, 16);
    let W = box.clientWidth, H = box.clientHeight;
    const base = () => Math.sqrt(W * H / set.length) * .36;
    const nodes = set.map((m, i) => ({ m, k: [1, .8, 1.15, .7, .95][i % 5], big: false, x: W / 2 + (Math.random() - .5) * W * .8, y: H / 2 + (Math.random() - .5) * H * .8 }));
    const rad = d => base() * d.k * (d.big ? 1.9 : 1);
    const els = nodes.map(d => { const e = document.createElement("div"); e.className = "bub"; e.style.backgroundImage = `url(${d.m.th})`; e.innerHTML = `<span>${d.m.title}</span>`; box.append(e); return e; });
    const sizeEls = () => nodes.forEach((d, i) => { const r = rad(d); els[i].style.width = els[i].style.height = r * 2 + "px"; els[i].style.margin = `${-r}px 0 0 ${-r}px`; els[i].classList.toggle("big", d.big); els[i].style.zIndex = d.big ? 2 : 1; });
    const sim = d3.forceSimulation(nodes).force("x", d3.forceX(() => W / 2).strength(.045)).force("y", d3.forceY(() => H / 2).strength(.07)).force("c", d3.forceCollide(d => rad(d) + 4).strength(.85).iterations(2)).alphaDecay(.02).velocityDecay(.3)
      .on("tick", () => nodes.forEach((d, i) => { d.x = clamp(d.x, rad(d), W - rad(d)); d.y = clamp(d.y, rad(d), H - rad(d)); els[i].style.transform = `translate(${d.x}px,${d.y}px)`; }));
    const kick = () => { sizeEls(); sim.force("c").radius(d => rad(d) + 4); sim.alpha(.7).restart(); };
    els.forEach((e, i) => { e.addEventListener("pointerenter", () => { nodes.forEach(d => d.big = false); nodes[i].big = true; kick(); }); e.addEventListener("pointerleave", ev => { if (ev.pointerType === "mouse") { nodes[i].big = false; kick(); } }); });
    d3.selectAll(els).data(nodes).call(d3.drag().on("start", (ev, d) => { sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; }).on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; }).on("end", (ev, d) => { sim.alphaTarget(0); d.fx = d.fy = null; }));
    new ResizeObserver(() => { W = box.clientWidth; H = box.clientHeight; kick(); }).observe(box);
    sizeEls();
    return { play() { sim.restart(); }, pause() { sim.stop(); } };
  } },
/* 06 */ { t: "Scorrimento di seta", lib: "Lenis 1", url: "https://lenis.darkroom.engineering", d: "Scorrimento orizzontale ammorbidito: le cornici si inclinano in base alla velocità e l'immagine interna scivola in parallasse.", hint: "Trascina, usa i pulsanti o scorri in orizzontale",
  init(s) {
    s.style.paddingInline = 0;
    s.innerHTML = `<div class="ln"><div class="ln-c">${pick(3, 12).map(m => fig(m).replace('class="fig"', "")).join("")}</div></div><div class="row"><button class="btn" data-d="-1">←</button><button class="btn" data-d="1">→</button></div>`;
    const wrap = $(".ln", s);
    const lenis = new Lenis({ wrapper: wrap, content: $(".ln-c", s), orientation: "horizontal", gestureOrientation: "horizontal", lerp: .075, autoRaf: false });
    let sk = 0;
    lenis.on("scroll", ({ velocity }) => { sk = clamp(velocity * .22, -14, 14); });
    $$("[data-d]", s).forEach(b => b.onclick = () => lenis.scrollTo(lenis.scroll + b.dataset.d * wrap.clientWidth * .7, { duration: 1.5 }));
    let down = null;
    wrap.addEventListener("pointerdown", e => { if (e.pointerType === "mouse") { down = { x: e.clientX, s: lenis.scroll }; wrap.setPointerCapture(e.pointerId); } });
    wrap.addEventListener("pointermove", e => { if (down) lenis.scrollTo(down.s - (e.clientX - down.x) * 1.8, { lerp: .09 }); });
    ["pointerup", "pointercancel"].forEach(ev => wrap.addEventListener(ev, () => down = null));
    let shown = 0;
    return loop((t) => { lenis.raf(t); shown += (sk - shown) * .12; sk *= .9; wrap.style.setProperty("--sk", shown.toFixed(2) + "deg"); wrap.style.setProperty("--px", (shown * 3).toFixed(1) + "px"); });
  } },
/* 07 */ { t: "Cerca e riordina", lib: "Shuffle.js 7", url: "https://vestride.github.io/Shuffle/", d: "Scrivi nel campo e la griglia si filtra in tempo reale; i pulsanti la riordinano con le tessere che scivolano al nuovo posto.", hint: "Prova a scrivere «notte» o «oro»",
  init(s) {
    const set = pick(0, 20);
    s.innerHTML = `<div class="row" style="margin:0 0 16px"><input class="field" type="search" placeholder="Cerca per nome…" aria-label="Cerca per nome"><button class="btn" data-o="az">A → Z</button><button class="btn" data-o="za">Z → A</button><button class="btn" data-o="mix">Mescola</button></div>
      <div class="sh">${set.map(m => `<div class="sh-i" data-groups='["foto"]' data-t="${m.title.toLowerCase()}"><div><img src="${m.th}" alt="${m.title}"><div class="cap"><b>${m.title}</b></div></div></div>`).join("")}</div><p class="none" hidden>Nessuna foto con questo nome.</p>`;
    const sh = new Shuffle($(".sh", s), { itemSelector: ".sh-i", speed: 480, easing: "cubic-bezier(.2,.9,.3,1)", staggerAmount: 18 });
    $("input", s).addEventListener("input", e => { const q = e.target.value.trim().toLowerCase(); sh.filter(el => el.dataset.t.includes(q)); $(".none", s).hidden = sh.visibleItems > 0; });
    $$("[data-o]", s).forEach(b => b.onclick = () => { const o = b.dataset.o; sh.sort(o === "mix" ? { randomize: true } : { by: el => el.dataset.t, reverse: o === "za" }); });
  } },
/* 08 */ { t: "Righe giustificate", lib: "justified-layout 4 (Flickr)", url: "https://github.com/flickr/justified-layout", d: "L'impaginazione di Flickr: foto di proporzioni diverse riempiono ogni riga al millimetro. Cambia l'altezza e tutto si ricompone animato.", hint: "Sposta il cursore dell'altezza",
  init(s) {
    const ratios = [1.45, .8, 1, 1.9, 1.45, .72, 1.3, 2.2, 1, 1.45, .8, 1.6, 1, 1.45, 2, .75, 1.2, 1.45], set = pick(4, ratios.length);
    s.innerHTML = `<div class="row" style="margin:0 0 16px;align-items:center"><label for="jlr" style="font-size:13.5px;color:var(--mute)">Altezza righe</label><input id="jlr" type="range" min="90" max="300" value="170"></div><div class="jl">${set.map(m => `<figure><img src="${m.src}" alt="${m.title}"></figure>`).join("")}</div>`;
    const jl = $(".jl", s), figs = $$("figure", jl), rng = $("input", s);
    const lay = () => { const g = justifiedLayout(ratios, { containerWidth: jl.clientWidth, targetRowHeight: Math.min(+rng.value, jl.clientWidth / 2.4), boxSpacing: 8, containerPadding: 0 }); jl.style.height = g.containerHeight + "px"; g.boxes.forEach((b, i) => Object.assign(figs[i].style, { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px", transitionDelay: i * 18 + "ms" })); };
    rng.addEventListener("input", lay); new ResizeObserver(lay).observe(s); lay();
    requestAnimationFrame(() => requestAnimationFrame(() => jl.classList.add("in")));
  } },
/* 09 */ { t: "Zoom sul posto", lib: "medium-zoom 1", url: "https://medium-zoom.francoischalifour.com", d: "Per articoli e blog: la foto dentro il testo si solleva e si ingrandisce al centro dello schermo, poi torna esattamente dov'era.", hint: "Clicca una foto nel testo",
  init(s) {
    const [a, b, c] = pick(6, 3);
    s.innerHTML = `<div class="mz"><h3>Diario di un orizzonte</h3><p>Le immagini inserite in un testo non devono interrompere la lettura. Restano piccole finché servono da accompagnamento.</p>
      <img src="${a.th}" data-zoom-src="${a.src}" alt="${a.title}"><p>Con un clic la foto si stacca dalla pagina, cresce fino a riempire lo schermo e il resto si oscura. Un altro clic, o un tocco di scorrimento, e ritorna al suo posto.</p>
      <img src="${b.th}" data-zoom-src="${b.src}" alt="${b.title}"><p>È la soluzione più leggera per un blog WordPress: nessuna interfaccia, nessun pulsante, solo l'immagine.</p><img src="${c.th}" data-zoom-src="${c.src}" alt="${c.title}"><p>La versione ad alta risoluzione viene caricata soltanto quando serve.</p></div>`;
    mediumZoom($$(".mz img", s), { margin: 28, background: "rgba(13,12,17,.93)" });
  } },
/* 10 */ { t: "Visore con strumenti", lib: "Viewer.js 1", url: "https://fengyuanchen.github.io/viewerjs/", d: "Un visore completo incorporato nella pagina: zoom, rotazione, specchio, presentazione automatica e striscia di miniature.", hint: "Usa la barra degli strumenti · trascina la foto",
  init(s) {
    const set = pick(9, 9);
    s.innerHTML = `<div class="vw"><ul class="vw-src">${set.map(m => `<li><img src="${m.th}" data-original="${m.src}" alt="${m.title}"></li>`).join("")}</ul></div>`;
    new Viewer($(".vw-src", s), { inline: true, container: $(".vw", s), url: "data-original", zoomOnWheel: false, backdrop: false, button: false, fullscreen: false, transition: true, title: [1, img => img.alt],
      toolbar: { zoomIn: 1, zoomOut: 1, oneToOne: 1, reset: 1, prev: 1, play: 0, next: 1, rotateLeft: 1, rotateRight: 1, flipHorizontal: 1, flipVertical: 1 } });
  } },
/* 11 */ { t: "Lente per il prodotto", lib: "Drift 1", url: "https://github.com/strawdynamics/drift", d: "Pensata per le schede prodotto di un e-commerce: passando sulla foto, il dettaglio ingrandito compare nel riquadro a fianco.", hint: "Passa il mouse sulla foto (sul telefono: tocca e trascina)",
  init(s) {
    const set = pick(1, 4);
    s.innerHTML = `<div class="dz"><div class="dz-main"><img src="${set[0].src}" data-zoom="${set[0].src}" alt="${set[0].title}"></div>
      <div class="dz-side"><span class="tag">Stampa fine art · 70 × 50</span><h3>${set[0].title}</h3><p>Carta cotone 310 g, pigmenti minerali. Passa sulla foto per vedere la trama dell'immagine nel dettaglio, qui in questo riquadro.</p>
      <div class="dz-th">${set.map((m, i) => `<button class="${i ? "" : "on"}" aria-label="${m.title}"><img src="${m.th}" alt=""></button>`).join("")}</div></div></div>`;
    const img = $(".dz-main img", s);
    const dr = new Drift(img, { paneContainer: $(".dz-side", s), inlinePane: 700, inlineOffsetY: -90, zoomFactor: 2.6, hoverBoundingBox: true, containInline: true });
    $$(".dz-th button", s).forEach((b, i) => b.onclick = () => { $$(".dz-th button", s).forEach(x => x.classList.toggle("on", x === b)); img.src = set[i].src; img.alt = set[i].title; dr.setZoomImageURL(set[i].src); $(".dz-side h3", s).textContent = set[i].title; });
  } },
/* 12 */ { t: "Luce d'ambiente", lib: "Color Thief 3", url: "https://lokeshdhakar.com/projects/color-thief/", d: "La libreria legge i colori dominanti di ogni foto: lo sfondo, l'alone e le etichette si tingono di conseguenza a ogni cambio.", hint: "Clicca la foto per la successiva",
  async init(s) {
    const set = pick(0, 8);
    s.innerHTML = `<div class="ct"><div class="ct-f">${set.map((m, i) => `<img src="${m.src}" alt="${m.title}" class="${i ? "" : "on"}">`).join("")}<div class="cap" style="z-index:3"><b></b><span></span></div></div><div class="ct-b"></div></div>`;
    const ct = $(".ct", s), ims = $$(".ct-f img", s); let cur = 0; const cache = [];
    await Promise.all(ims.map(i => i.decode ? i.decode().catch(() => {}) : 0));
    const show = () => {
      ims.forEach((im, i) => im.classList.toggle("on", i === cur));
      const pal = cache[cur] || (cache[cur] = (ColorThief.getPaletteSync(ims[cur], { colorCount: 5 }) || []).map(c => c.hex()));
      pal.slice(0, 4).forEach((h, i) => ct.style.setProperty("--c" + (i + 1), h));
      $(".ct-b", s).innerHTML = pal.map(h => { const n = parseInt(h.slice(1), 16), lum = (n >> 16) * .299 + (n >> 8 & 255) * .587 + (n & 255) * .114; return `<i style="--k:${h};--t:${lum > 140 ? "#111" : "#fff"}">${h.toUpperCase()}</i>`; }).join("");
      $(".cap b", s).textContent = set[cur].title; $(".cap span", s).textContent = `${cur + 1} / ${set.length}`;
    };
    const next = () => { cur = (cur + 1) % set.length; show(); };
    $(".ct-f", s).onclick = next; show();
    let timer; return { play() { if (!RM) timer = setInterval(next, 3600); }, pause() { clearInterval(timer); } };
  } },
/* 13 */ { t: "Foto sospese", lib: "Parallax.js 3", url: "https://matthew.wagerfield.com/parallax/", d: "Sette foto galleggiano su piani diversi: seguono il mouse (o l'inclinazione del telefono) ognuna con la propria profondità.", hint: "Muovi il mouse sulla scena",
  init(s) {
    const P = [[4, 8, 26, .15], [62, 4, 30, .35], [34, 30, 34, .6], [6, 56, 24, .85], [70, 52, 26, .25], [44, 68, 22, 1], [24, 2, 16, .5]], set = pick(8, P.length);
    s.innerHTML = `<div class="pl">${P.map(([x, y, w, d], i) => `<div class="ly" data-depth="${d}"><div style="left:${x}%;top:${y}%;width:${w}%"><img src="${set[i].th}" alt="${set[i].title}"></div></div>`).join("")}<h3>in<br>sospeso</h3></div>`;
    const p = new Parallax($(".pl", s), { relativeInput: true, hoverOnly: false, scalarX: 14, scalarY: 14, frictionX: .07, frictionY: .07, selector: ".ly" });
    return { play() { p.enable(); }, pause() { p.disable(); } };
  } },
/* 14 */ { t: "Parete da esplorare", lib: "Panzoom 4", url: "https://github.com/timmywil/panzoom", d: "Una grande parete di trenta foto in cui muoversi liberamente: trascina per spostarti, pizzica o usa i pulsanti per avvicinarti.", hint: "Trascina · pizzica · Ctrl + rotella per lo zoom",
  init(s) {
    s.innerHTML = `<div class="pzw"><div class="pzb">${MIX.map(m => fig(m, 1)).join("")}</div><div class="pz-ctl"><button class="btn" data-z="in" aria-label="Avvicina">＋</button><button class="btn" data-z="out" aria-label="Allontana">−</button><button class="btn" data-z="reset">Centro</button></div></div>`;
    const w = $(".pzw", s), start = clamp(w.clientWidth / 1900, .28, .6);
    const pz = Panzoom($(".pzb", s), { maxScale: 2.4, minScale: .22, startScale: start, canvas: true, step: .35, animate: true, duration: 450, easing: "cubic-bezier(.2,.9,.3,1)" });
    w.addEventListener("wheel", e => { if (e.ctrlKey || e.metaKey) pz.zoomWithWheel(e); });
    $$("[data-z]", s).forEach(b => b.onclick = () => ({ in: () => pz.zoomIn(), out: () => pz.zoomOut(), reset: () => { pz.zoom(start, { animate: true }); pz.pan(0, 0, { animate: true }); } })[b.dataset.z]());
  } },
/* 15 */ { t: "Mi piace con scintille", lib: "mo.js 1", url: "https://mojs.github.io", d: "Ogni «mi piace» fa esplodere un piccolo fuoco d'artificio nel punto esatto del clic: perfetto per portfolio e vetrine social.", hint: "Clicca le foto che ti piacciono",
  init(s) {
    const set = pick(11, 8);
    s.innerHTML = `<div class="mj">${set.map(m => `<button aria-label="Mi piace: ${m.title}" aria-pressed="false"><img src="${m.th}" alt="${m.title}"><span class="hr">♥</span></button>`).join("")}</div><p class="mj-n"><b>0</b> foto preferite</p>`;
    const o = { left: 0, top: 0, parent: document.body };
    const burst = new mojs.Burst({ ...o, radius: { 20: 95 }, count: 14, children: { shape: "line", stroke: ["#ff4d6d", "#ff9259", "#ffd166", "#8fe3c8"], strokeWidth: 3, radius: { 12: 0 }, duration: 800, easing: "quad.out" } });
    const dots = new mojs.Burst({ ...o, radius: { 10: 60 }, count: 9, angle: 20, children: { shape: "circle", fill: ["#fff", "#ff4d6d"], radius: { 6: 0 }, duration: 900, delay: 60, easing: "cubic.out" } });
    const ring = new mojs.Shape({ ...o, shape: "circle", fill: "none", stroke: "#ff4d6d", strokeWidth: { 26: 0 }, radius: { 0: 70 }, opacity: { 1: 0 }, duration: 600, easing: "cubic.out" });
    $$(".mj button", s).forEach(b => b.onclick = e => {
      const on = b.classList.toggle("on"); b.setAttribute("aria-pressed", on); $(".mj-n b", s).textContent = $$(".mj .on", s).length;
      if (!on || RM) return; const x = e.pageX || b.getBoundingClientRect().left + scrollX + 60, y = e.pageY || b.getBoundingClientRect().top + scrollY + 60;
      [burst, dots, ring].forEach(m => m.tune({ x, y }).replay());
    });
  } },
/* 16 */ { t: "Scegli le tue preferite", lib: "SortableJS 1.15", url: "https://sortablejs.github.io/Sortable/", d: "Trascina le foto dall'archivio al vassoio della selezione, e riordinale: le altre si spostano per fare posto. Utile per moodboard e preventivi.", hint: "Trascina una foto nel riquadro arancione",
  init(s) {
    const set = pick(14, 10);
    s.innerHTML = `<div class="so"><h4>Archivio</h4><div class="so-l">${set.map(m => `<div><img src="${m.th}" alt="${m.title}"></div>`).join("")}</div><h4 style="margin-top:20px">La tua selezione · <span>0</span></h4><div class="so-l tray"></div></div>`;
    const [a, b] = $$(".so-l", s), opt = { group: "sel", animation: 280, easing: "cubic-bezier(.2,.9,.3,1)", ghostClass: "ghost", chosenClass: "chosen", forceFallback: true, fallbackTolerance: 4, onSort: () => $("h4 span", s).textContent = b.children.length };
    Sortable.create(a, opt); Sortable.create(b, opt);
  } },
/* 17 */ { t: "Racconto a scorrimento", lib: "Scrollama 3", url: "https://github.com/russellsamora/scrollama", d: "L'immagine resta ferma mentre il testo scorre: a ogni capitolo una nuova foto sale dal basso come un sipario.", hint: "Continua a scorrere la pagina",
  init(s) {
    s.classList.add("free");
    const set = pick(0, 4), tx = ["Tutto comincia con la luce giusta.", "Poi arriva la materia: superfici, venature, riflessi.", "Il colore decide l'umore di tutta la pagina.", "E alla fine resta solo l'orizzonte."];
    s.innerHTML = `<div class="sc"><div class="sc-fig">${set.map((m, i) => `<img src="${m.src}" alt="${m.title}" class="${i ? "" : "on"}">`).join("")}</div><div>${set.map((m, i) => `<div class="step${i ? "" : " on"}"><span class="tag">Capitolo ${i + 1}</span><h3>${m.title}</h3><p>${tx[i]}</p></div>`).join("")}</div></div>`;
    const ims = $$(".sc-fig img", s), steps = $$(".step", s); let cur = 0;
    const sc = scrollama(); sc.setup({ step: steps, offset: .6 }).onStepEnter(({ index }) => { if (index === cur) return; ims.forEach((im, i) => { im.classList.toggle("was", i === cur); im.classList.toggle("on", i === index); }); steps.forEach((st, i) => st.classList.toggle("on", i === index)); cur = index; });
    addEventListener("resize", sc.resize);
  } },
/* 18 */ { t: "Colonne in controtempo", lib: "lax.js 2", url: "https://github.com/alexfoxy/lax.js", d: "Tre colonne di foto legate allo scorrimento della pagina: quelle esterne salgono, quella centrale scende.", hint: "Scorri la pagina lentamente",
  init(s) {
    const set = pick(5, 12), col = (k) => set.slice(k * 4, k * 4 + 4).map(m => `<img src="${m.th}" alt="${m.title}">`).join("");
    s.innerHTML = `<div class="lx"><div class="lx-a">${col(0)}</div><div class="lx-b">${col(1)}</div><div class="lx-a">${col(2)}</div></div>`;
    if (!window.__lax) { lax.init(); lax.addDriver("scrollY", () => window.scrollY); window.__lax = 1; }
    const d = innerWidth < 700 ? 110 : 190;
    lax.addElements("#" + s.parentNode.id + " .lx-a", { scrollY: { translateY: [["elInY", "elOutY"], [d, -d]] } });
    lax.addElements("#" + s.parentNode.id + " .lx-b", { scrollY: { translateY: [["elInY", "elOutY"], [-d, d]] } });
  } },
/* 19 */ { t: "Giorno e notte", lib: "img-comparison-slider 8", url: "https://img-comparison-slider.sneas.io", d: "Due versioni della stessa scena divise da una maniglia. Ideale per prima/dopo di ristrutturazioni, ritocchi, restyling.", hint: "Trascina la maniglia",
  init(s) {
    s.innerHTML = `<div class="cmp">${[1, 2].map(k => `<img-comparison-slider value="100"><img slot="first" src="img/p${k}a.jpg" alt="Versione giorno"><img slot="second" src="img/p${k}b.jpg" alt="Versione notte"></img-comparison-slider>`).join("")}</div>`;
    const sl = $$("img-comparison-slider", s);
    if (RM) return void sl.forEach(x => x.value = 50);
    const t0 = performance.now(), run = (t) => { const k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 3); sl.forEach((x, i) => x.value = 100 - e * (i ? 62 : 45)); if (k < 1) requestAnimationFrame(run); }; requestAnimationFrame(run);
  } },
/* 20 */ { t: "Nastri senza fine", lib: "Embla Auto Scroll 8", url: "https://www.embla-carousel.com/plugins/auto-scroll/", d: "Tre nastri di foto scorrono all'infinito in direzioni opposte. Si fermano sotto il cursore e si possono trascinare.", hint: "Passa sopra per fermare · trascina",
  init(s) {
    s.style.paddingInline = 0;
    s.innerHTML = `<div class="mq">${[0, 1, 2].map(r => `<div class="embla"><div class="embla__c">${pick(r * 10, 10).map(m => `<div class="embla__s"><img src="${m.th}" alt="${m.title}" draggable="false"></div>`).join("")}</div></div>`).join("")}</div>`;
    const apis = $$(".embla", s).map((el, i) => EmblaCarousel(el, { loop: true, dragFree: true, container: el.firstElementChild }, [EmblaCarouselAutoScroll({ speed: [1.1, .8, 1.5][i], direction: i === 1 ? "backward" : "forward", stopOnInteraction: false, stopOnMouseEnter: true, startDelay: 0, playOnInit: false })]));
    return { play() { if (!RM) apis.forEach(a => a.plugins().autoScroll.play()); }, pause() { apis.forEach(a => a.plugins().autoScroll.stop()); } };
  } },
/* 21 */ { t: "Elica 3D", lib: "Three.js r187", url: "https://threejs.org", d: "Trenta foto disposte su una spirale che ruota nello spazio, con la nebbia che sfuma quelle lontane. Trascina per farla girare.", hint: "Trascina in orizzontale",
  init(s) { return import("./helix.js").then(m => m.default(s, MIX, RM)); } },
/* 22 */ { t: "Cubo", lib: "Solo CSS · trasformazioni 3D", url: "https://developer.mozilla.org/docs/Web/CSS/transform-style", d: "Sei foto sulle facce di un cubo che gira con un rimbalzo. Nessuna libreria: preserve-3d e una transizione.", hint: "Trascina il cubo o usa le frecce",
  init(s) {
    s.classList.add("s22");
    const set = pick(0, 6), T = ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"];
    s.innerHTML = `<div class="cubew"><div class="cube">${set.map(m => `<div>${fig(m)}</div>`).join("")}</div></div><div class="row" style="margin:0"><button class="btn" data-a="0,-90">←</button><button class="btn" data-a="-90,0">↑</button><button class="btn" data-a="90,0">↓</button><button class="btn" data-a="0,90">→</button></div>`;
    const w = $(".cubew", s), cube = $(".cube", s); let rx = -18, ry = 28, down = null, timer;
    const place = () => { const z = w.clientWidth / 2; $$(".cube>div", s).forEach((f, i) => f.style.transform = `${T[i]} translateZ(${z}px)`); draw(); };
    const draw = () => cube.style.transform = `translateZ(${-w.clientWidth / 2}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    new ResizeObserver(place).observe(w); place();
    $$("[data-a]", s).forEach(b => b.onclick = () => { const [x, y] = b.dataset.a.split(",").map(Number); rx += x; ry += y; draw(); clearInterval(timer); });
    w.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY, rx, ry }; cube.classList.add("drag"); w.setPointerCapture(e.pointerId); clearInterval(timer); });
    w.addEventListener("pointermove", e => { if (!down) return; ry = down.ry + (e.clientX - down.x) * .5; rx = clamp(down.rx - (e.clientY - down.y) * .5, -89, 89); draw(); });
    ["pointerup", "pointercancel"].forEach(ev => w.addEventListener(ev, () => { if (!down) return; down = null; cube.classList.remove("drag"); ry = Math.round(ry / 90) * 90 + 28; rx = Math.abs(rx) > 50 ? Math.sign(rx) * 90 : -18; draw(); }));
    return { play() { if (!RM) timer = setInterval(() => { ry += 90; draw(); }, 2600); }, pause() { clearInterval(timer); } };
  } },
/* 23 */ { t: "Scia di immagini", lib: "JavaScript nativo · Web Animations API", url: "https://developer.mozilla.org/docs/Web/API/Web_Animations_API", d: "Il cursore lascia dietro di sé una scia di foto che compaiono, ruotano e cadono. Effetto da studio creativo, in quaranta righe.", hint: "Muovi il cursore (o il dito) dentro il riquadro",
  init(s) {
    s.innerHTML = `<div class="tr"><h3>muovi<br>il cursore</h3></div>`;
    const box = $(".tr", s), set = pick(0, 14), pool = set.map(m => { const i = new Image(); i.src = m.th; i.alt = ""; box.append(i); return i; });
    let n = 0, lx = 0, ly = 0, z = 1, auto = true, idle;
    const spawn = (x, y) => { const im = pool[n++ % pool.length], r = (Math.random() - .5) * 26; im.style.zIndex = ++z;
      im.animate([{ opacity: 0, transform: `translate(${x}px,${y}px) scale(.4) rotate(${r * 2}deg)` }, { opacity: 1, transform: `translate(${x}px,${y}px) scale(1) rotate(${r}deg)`, offset: .18 }, { opacity: 1, transform: `translate(${x}px,${y}px) scale(1) rotate(${r}deg)`, offset: .6 }, { opacity: 0, transform: `translate(${x}px,${y + 90}px) scale(.7) rotate(${r * 1.6}deg)` }], { duration: 1300, easing: "cubic-bezier(.2,.8,.3,1)" }); };
    const at = (x, y) => { if (Math.hypot(x - lx, y - ly) > Math.max(60, box.clientWidth * .075)) { lx = x; ly = y; spawn(x, y); } };
    box.addEventListener("pointermove", e => { const r = box.getBoundingClientRect(); auto = false; clearTimeout(idle); idle = setTimeout(() => auto = true, 2500); at(e.clientX - r.left, e.clientY - r.top); });
    return loop((t) => { if (!auto || RM) return; const W = box.clientWidth, H = box.clientHeight, k = t / 1000; at(W * (.5 + .36 * Math.sin(k * 1.1)), H * (.5 + .3 * Math.sin(k * 1.7 + 1))); });
  } },
/* 24 */ { t: "Elenco con anteprima", lib: "JavaScript nativo", url: "https://developer.mozilla.org/docs/Web/API/Pointer_events", d: "Un indice tipografico: passando su un titolo la sua foto appare e insegue il cursore con un leggero ritardo.", hint: "Passa sui titoli (sul telefono: tocca)",
  init(s) {
    const set = pick(2, 7);
    s.innerHTML = `<div class="hl"><ul>${set.map((m, i) => `<li data-i="${i}"><small>0${i + 1}</small>${m.title}</li>`).join("")}</ul><div class="hl-f">${set.map(m => `<img src="${m.th}" alt="">`).join("")}</div></div>`;
    const box = $(".hl", s), f = $(".hl-f", s), ims = $$("img", f); let tx = 0, ty = 0, x = 0, y = 0, rot = 0;
    const act = (i) => { ims.forEach((im, k) => im.classList.toggle("on", k === i)); $$("li", s).forEach((li, k) => li.classList.toggle("on", k === i && matchMedia("(hover:none)").matches)); f.classList.add("on"); };
    box.addEventListener("pointermove", e => { const r = box.getBoundingClientRect(); tx = clamp(e.clientX - r.left, 0, r.width - f.offsetWidth - 30); ty = e.clientY - r.top; const li = e.target.closest("li"); if (li) act(+li.dataset.i); });
    box.addEventListener("pointerdown", e => { const li = e.target.closest("li"); if (li) { const r = box.getBoundingClientRect(); tx = clamp(e.clientX - r.left, 0, r.width - f.offsetWidth - 30); ty = e.clientY - r.top; act(+li.dataset.i); } });
    $("ul", s).addEventListener("pointerleave", e => { if (e.pointerType === "mouse") f.classList.remove("on"); });
    return loop(() => { const px = x; x += (tx - x) * .12; y += (ty - y) * .12; rot += ((x - px) * .6 - rot) * .15; f.style.transform = `translate(${x}px,${y}px) rotate(${clamp(rot, -12, 12)}deg)`; });
  } },
/* 25 */ { t: "Fusione liquida", lib: "SVG nativo · feTurbulence", url: "https://developer.mozilla.org/docs/Web/SVG/Element/feDisplacementMap", d: "Un filtro SVG scioglie la foto come inchiostro nell'acqua e la ricompone in un'altra. Niente WebGL, niente librerie.", hint: "Passa sopra una foto (sul telefono: tocca)",
  init(s) {
    const A = pick(0, 6), B = pick(13, 6);
    s.innerHTML = `<svg width="0" height="0" style="position:absolute">${A.map((_, i) => `<filter id="lq${i}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="${i * 7 + 3}"/><feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`).join("")}</svg>
      <div class="lq">${A.map((m, i) => `<button aria-label="${m.title}"><img src="${m.th}" alt="${m.title}"></button>`).join("")}</div>`;
    $$(".lq button", s).forEach((b, i) => {
      const img = $("img", b), disp = $(`#lq${i} feDisplacementMap`, s), turb = $(`#lq${i} feTurbulence`, s); let flip = false, raf, v = 0;
      const melt = () => { flip = !flip; const to = (flip ? B : A)[i], t0 = performance.now(); let swapped = false; cancelAnimationFrame(raf); img.style.filter = `url(#lq${i})`;
        const run = (t) => { const k = Math.min(1, (t - t0) / 900); v = Math.sin(k * Math.PI) * 130; disp.setAttribute("scale", v); turb.setAttribute("baseFrequency", `${.012 + k * .01} ${.03 - k * .012}`);
          if (k > .5 && !swapped) { swapped = true; img.src = to.th; img.alt = to.title; } if (k < 1) raf = requestAnimationFrame(run); else img.style.filter = ""; }; raf = requestAnimationFrame(run); };
      b.addEventListener("pointerenter", e => e.pointerType === "mouse" && melt()); b.addEventListener("click", e => { if (!matchMedia("(hover:hover)").matches || e.detail === 0) melt(); });
    });
    [...A, ...B].forEach(m => load(m.th).catch(() => {}));
  } },
];

/* costruzione pagina + avvio pigro di ogni galleria quando entra nello schermo */
const main = $("#main"), nav = $("#nav"), ctl = new Map();
G.forEach((g, i) => {
  const n = String(i + 1).padStart(2, "0");
  const sec = document.createElement("section"); sec.className = "g"; sec.id = "g" + n;
  sec.innerHTML = `<div class="g-head"><div class="g-num">${n}</div><h2>${g.t}</h2><div class="g-meta"><p>${g.d}</p><a class="chip" href="${g.url}" target="_blank" rel="noopener">${g.lib} ↗</a></div></div><div class="stage"></div><p class="hint">↳ ${g.hint}</p>`;
  main.append(sec);
  const b = document.createElement("button"); b.textContent = n; b.title = g.t; b.onclick = () => sec.scrollIntoView({ behavior: RM ? "auto" : "smooth" }); nav.append(b);
});
const LIC = { "Drift 1": "BSD-2", "D3 7": "ISC", "justified-layout 4 (Flickr)": "ISC", "OGL 1": "Unlicense" };
const libs = [...new Set(G.map(g => g.lib.split(" · ")[0]))].filter(l => !/nativ|CSS/.test(l));
$("#credits").innerHTML = libs.map(l => `<li class="chip">${l} · ${LIC[l] || "MIT"}</li>`).join("");

const io = new IntersectionObserver(es => es.forEach(async e => {
  const sec = e.target, i = +sec.id.slice(1) - 1, st = $(".stage", sec);
  sec.dataset.vis = e.isIntersecting ? 1 : "";
  if (e.isIntersecting && !ctl.has(i)) {
    ctl.set(i, null);
    try { ctl.set(i, await G[i].init(st) || null); } catch (err) { console.error("Galleria " + (i + 1), err); st.innerHTML = `<p class="err">Questa galleria non è riuscita a partire: ${err.message}</p>`; }
  }
  const c = ctl.get(i); if (c) sec.dataset.vis ? c.play() : c.pause();
}), { rootMargin: "120px 0px" });
$$(".g").forEach(s => io.observe(s));
const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const i = +e.target.id.slice(1) - 1; [...nav.children].forEach((b, k) => b.classList.toggle("on", k === i)); const b = nav.children[i]; nav.scrollTo({ left: b.offsetLeft - nav.clientWidth / 2, behavior: "smooth" }); } }), { rootMargin: "-45% 0px -50% 0px" });
$$(".g").forEach(s => spy.observe(s));
})();
