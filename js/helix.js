// Galleria 21 — elica 3D di fotografie (Three.js)
import * as THREE from "../lib/three.module.js";

export default async function (stage, set, reduce) {
  stage.innerHTML = `<div class="cv"></div>`;
  const box = stage.querySelector(".cv");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  box.append(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x110f16, 9.5, 17.5);
  const cam = new THREE.PerspectiveCamera(38, 1, .1, 50); cam.position.set(0, 0, 13);
  const group = new THREE.Group(); group.rotation.z = -.1; scene.add(group);
  const loader = new THREE.TextureLoader(), geo = new THREE.PlaneGeometry(1.95, 1.34), N = set.length, R = 3.5, STEP = .52, RISE = .21;
  set.forEach((m, i) => {
    const tex = loader.load(m.th); tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    const a = i * STEP;
    mesh.position.set(Math.sin(a) * R, (i - (N - 1) / 2) * RISE, Math.cos(a) * R);
    mesh.rotation.y = a;
    group.add(mesh);
  });
  const size = () => { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w < 600 ? 19 : 13; scene.fog.near = cam.position.z - 3.5; scene.fog.far = cam.position.z + 4.5; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(box); size();
  let target = 0, cur = 0, down = null, on = false, raf = 0;
  box.addEventListener("pointerdown", e => { down = { x: e.clientX, t: target }; box.setPointerCapture(e.pointerId); });
  box.addEventListener("pointermove", e => { if (down) target = down.t + (e.clientX - down.x) * .008; });
  ["pointerup", "pointercancel"].forEach(ev => box.addEventListener(ev, () => down = null));
  const tick = (t) => {
    if (!down && !reduce) target += .0035;
    cur += (target - cur) * .06;
    group.rotation.y = cur;
    group.position.y = Math.sin(t / 2400) * .25;
    renderer.render(scene, cam);
    if (on) raf = requestAnimationFrame(tick);
  };
  return { play() { if (!on) { on = true; raf = requestAnimationFrame(tick); } }, pause() { on = false; cancelAnimationFrame(raf); } };
}
