/*
 * Particle text effect adapted from Sanprieto demo.
 * Shows interactive particle text "BODRUM ART PROJECT".
 */

const preload = () => {

  const manager = new THREE.LoadingManager();
  manager.onLoad = () => {
    // Instantiate the scene once font & texture are ready
    new Environment(font, particleTexture);
  };

  let font = null;
  const loader = new THREE.FontLoader(manager);
  loader.load(
    'https://res.cloudinary.com/dydre7amr/raw/upload/v1612950355/font_zsd4dr.json',
    loadedFont => {
      font = loadedFont;
    }
  );

  const particleTexture = new THREE.TextureLoader(manager).load(
    'https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png'
  );
};

if (
  document.readyState === 'complete' ||
  (document.readyState !== 'loading' && !document.documentElement.doScroll)
) {
  preload();
} else {
  document.addEventListener('DOMContentLoaded', preload);
}

/*--------------------------------------------------
  Environment wrapper
--------------------------------------------------*/
class Environment {
  constructor(font, particle) {
    this.font = font;
    this.particle = particle;

    this.container = document.querySelector('#magic');
    this.scene = new THREE.Scene();

    this.createCamera();
    this.createRenderer();
    this.setup();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setup() {
    this.createParticles = new CreateParticles(
      this.scene,
      this.font,
      this.particle,
      this.camera,
      this.renderer
    );
  }

  render() {
    this.createParticles.render();
    this.renderer.render(this.scene, this.camera);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      65,
      this.container.clientWidth / this.container.clientHeight,
      1,
      10000
    );
    this.camera.position.set(0, 0, 100);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);
    this.renderer.setAnimationLoop(() => this.render());
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}

/*--------------------------------------------------
  Particle text generator
--------------------------------------------------*/
class CreateParticles {
  constructor(scene, font, particleImg, camera, renderer) {
    this.scene = scene;
    this.font = font;
    this.particleImg = particleImg;
    this.camera = camera;
    this.renderer = renderer;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-200, 200);

    this.colorChange = new THREE.Color();
    this.buttom = false; // Spelling kept from original demo

    this.data = {
      text: 'BODRUM ART PROJECT',
      amount: 1500,
      particleSize: 1,
      particleColor: 0xffffff,
      textSize: 16,
      area: 250,
      ease: 0.05,
    };

    this.setup();
    this.bindEvents();
  }

  /* ------------- initial setup ------------- */
  setup() {
    // Invisible plane to project mouse coords
    const geometry = new THREE.PlaneGeometry(
      this.visibleWidthAtZDepth(100, this.camera),
      this.visibleHeightAtZDepth(100, this.camera)
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
    });
    this.planeArea = new THREE.Mesh(geometry, material);
    this.planeArea.visible = false;
    this.scene.add(this.planeArea);

    this.createText();
  }

  bindEvents() {
    // Sadece click olayları iptal edildi, mousemove korundu
    // document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    // document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  /* ------------- Mouse handlers ------------- */
  onMouseDown(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
    vector.unproject(this.camera);
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    this.currenPosition = this.camera.position.clone().add(dir.multiplyScalar(distance));

    this.buttom = true;
    this.data.ease = 0.01;
  }

  onMouseUp() {
    this.buttom = false;
    this.data.ease = 0.05;
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  /* ------------- Render loop ------------- */
  render() {
    const time = ((0.001 * performance.now()) % 12) / 12;
    const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

    // Raycaster geri getirildi - mouse takibi aktif
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.planeArea);

    if (intersects.length === 0) return;

    const posAttr = this.particles.geometry.attributes.position;
    const copyAttr = this.geometryCopy.attributes.position;
    const colorAttr = this.particles.geometry.attributes.customColor;
    const sizeAttr = this.particles.geometry.attributes.size;

    // Mouse koordinatları geri getirildi
    const { x: mx, y: my, z: mz } = intersects[0].point;

    for (let i = 0, l = posAttr.count; i < l; i++) {
      const initX = copyAttr.getX(i);
      const initY = copyAttr.getY(i);
      const initZ = copyAttr.getZ(i);

      let px = posAttr.getX(i);
      let py = posAttr.getY(i);
      let pz = posAttr.getZ(i);

      // default color (was white)
      this.colorChange.setHSL(0, 0, 0); // black
      colorAttr.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);

      sizeAttr.array[i] = this.data.particleSize;

      const dx = mx - px;
      const dy = my - py;
      const d = dx * dx + dy * dy;
      const f = -this.data.area / d;

      // Sadece click (buttom) kontrolü iptal edildi
      if (false) { // this.buttom yerine false
        const t = Math.atan2(dy, dx);
        px -= f * Math.cos(t);
        py -= f * Math.sin(t);

        this.colorChange.setHSL(0, 0, 0.3); // dark grey highlight
        colorAttr.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);

        if (
          px > initX + 70 ||
          px < initX - 70 ||
          py > initY + 70 ||
          py < initY - 70
        ) {
          this.colorChange.setHSL(0, 0, 0.6); // medium grey
          colorAttr.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
        }
      } else {
        // Mouse hover etkisi korundu (click olmadan)
        const mouseDistance = this.distance(mx, my, px, py);
        if (mouseDistance < this.data.area) {
          if (i % 5 === 0) {
            const t = Math.atan2(dy, dx);
            px -= 0.03 * Math.cos(t);
            py -= 0.03 * Math.sin(t);

            this.colorChange.setHSL(0, 0, 0.6);
            colorAttr.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);

            sizeAttr.array[i] = this.data.particleSize / 1.2;
          } else {
            const t = Math.atan2(dy, dx);
            px += f * Math.cos(t);
            py += f * Math.sin(t);

            sizeAttr.array[i] = this.data.particleSize * 1.3;
          }

          if (
            px > initX + 10 ||
            px < initX - 10 ||
            py > initY + 10 ||
            py < initY - 10
          ) {
            this.colorChange.setHSL(0, 0, 0.6);
            colorAttr.setXYZ(i, this.colorChange.r, this.colorChange.g, this.colorChange.b);
            sizeAttr.array[i] = this.data.particleSize / 1.8;
          }
        }
      }

      // Orijinal pozisyona dönüş (ease) korundu
      px += (initX - px) * this.data.ease;
      py += (initY - py) * this.data.ease;
      pz += (initZ - pz) * this.data.ease;

      posAttr.setXYZ(i, px, py, pz);
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  }

  /* ------------- Text geometry ------------- */
  createText() {
    const shapes = this.font.generateShapes(this.data.text, this.data.textSize);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    // Center geometry
    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    const yMid = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;
    geometry.center();

    // Handle holes in shapes
    const holeShapes = [];
    shapes.forEach(s => {
      if (s.holes && s.holes.length > 0) {
        s.holes.forEach(h => holeShapes.push(h));
      }
    });
    shapes.push(...holeShapes);

    const thePoints = [];
    const colors = [];
    const sizes = [];

    shapes.forEach(shape => {
      const amountPoints = shape.type === 'Path' ? this.data.amount / 2 : this.data.amount;
      const points = shape.getSpacedPoints(amountPoints);
      points.forEach(() => {
        colors.push(this.colorChange.r, this.colorChange.g, this.colorChange.b);
        sizes.push(1);
      });
      thePoints.push(...points.map(p => new THREE.Vector3(p.x, p.y, 0)));
    });

    const geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);
    geoParticles.translate(xMid, yMid, 0);
    geoParticles.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
    geoParticles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x000000) },
        pointTexture: { value: this.particleImg },
      },
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    this.particles = new THREE.Points(geoParticles, material);
    this.scene.add(this.particles);

    // Keep a copy for reference positions
    this.geometryCopy = geoParticles.clone();
  }

  /* ------------- Utility helpers ------------- */
  visibleHeightAtZDepth(depth, camera) {
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    const vFOV = (camera.fov * Math.PI) / 180;
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  }

  visibleWidthAtZDepth(depth, camera) {
    return this.visibleHeightAtZDepth(depth, camera) * camera.aspect;
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }
} 