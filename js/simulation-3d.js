/**
 * CyberBrick Eğitim ve Geliştirme Stüdyosu
 * Three.js 3D Sahne, Çoklu MakerWorld Modelleri, Dinamik Mekanizmalar ve Fizik Motoru
 */

const CyberBrickSimulation = {
  container: null,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  clock: null,

  // Robot Kök Grubu ve Dinamik Parçaları
  robotGroup: null,
  activeModelParts: {},
  currentModelId: "forklift", // "forklift", "excavator", "truck", "kart", "rover"

  // Sahne ve Parkur
  arenaGroup: null,
  obstacles: [],
  groundMesh: null,
  lineCanvas: null,
  lineContext: null,
  lineTexture: null,
  currentArena: "warehouse", // "warehouse", "line_track", "sandbox"
  loadedPallet: null,
  loadedCargo: null,

  // Kinematik & Fizik Durumu
  robotState: {
    x: 0,
    z: 0,
    heading: 0,
    radius: 0.52,
    wheelRadius: 0.35,
    wheelBase: 1.1,
    leftPwm: 0,
    rightPwm: 0,
    servoAngle: 90, // 0-180 derece (Forklift için yükseklik, radar için pan, kepçe için açı)
    rgbColor: { r: 0, g: 174, b: 66 }, // Bambu Yeşili
    ultrasonicDistance: 400.0,
    leftLineDetected: false,
    rightLineDetected: false,
    speedKmh: 0,
    batteryVoltage: 7.4,
    cameraMode: "orbit" // "orbit", "chase", "topdown"
  },

  // Etkileşimli Işınlama (Raycasting)
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  draggedObstacle: null,
  dragPlane: null,

  init: function(containerId) {
    if (typeof THREE === "undefined") {
      console.warn("Three.js yükleniyor, bekleniyor...");
      setTimeout(() => this.init(containerId), 100);
      return;
    }

    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Sahne & Sis (Bambu Lab Temiz Studio Grisi)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f5f9);
    this.scene.fog = new THREE.FogExp2(0xf1f5f9, 0.02);
    this.clock = new THREE.Clock();

    // 2. Kamera (Derinlik tamponu hassasiyeti için optimize edilmiş near/far)
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.25, 75);
    this.camera.position.set(0, 5.5, 7.5);

    // 3. Renderer (Yüksek Kaliteli PBR & Titreşimsiz Logaritmik Derinlik Tamponu)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      logarithmicDepthBuffer: true,
      powerPreference: "high-performance",
      precision: "highp"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.container.appendChild(this.renderer.domElement);

    setTimeout(() => {
      if (this.container && this.renderer && this.camera) {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w > 0 && h > 0) {
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        }
      }
    }, 120);

    // 4. Orbit Kontrolleri
    if (typeof THREE.OrbitControls !== "undefined") {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.07;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
      this.controls.minDistance = 2.0;
      this.controls.maxDistance = 22.0;
      this.controls.target.set(0, 0.6, 0);
    }

    // 5. Işıklandırma
    this.setupLighting();

    // 6. Zemin ve Parkur
    this.setupGround();
    this.loadArena("warehouse");

    // 7. Modeli İnşa Et (Varsayılan: Forklift)
    this.loadModel("forklift");

    // 8. Olay Dinleyicileri
    this.setupEventListeners();

    // 9. Render Döngüsü
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  },

  setupLighting: function() {
    // Yumuşak Gökyüzü Işığı
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.7);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Ana Güneş Işığı (Gölge Oluşturan Key Light - Titreşimsiz ve Gölge Acne Önleyici)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(7, 14, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1.0;
    dirLight.shadow.camera.far = 32;
    const d = 11;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.00008;
    dirLight.shadow.normalBias = 0.015; // Açılardaki gölge titremesini ve köşe yırtılmalarını önler
    dirLight.shadow.radius = 1.5;
    this.scene.add(dirLight);

    // Yumuşak Bambu Yeşili Dolgu Işığı
    const fillLight = new THREE.PointLight(0x00ae42, 0.35, 15);
    fillLight.position.set(-6, 3, -6);
    this.scene.add(fillLight);
  },

  setupGround: function() {
    this.lineCanvas = document.createElement("canvas");
    this.lineCanvas.width = 1024;
    this.lineCanvas.height = 1024;
    this.lineContext = this.lineCanvas.getContext("2d");

    this.lineTexture = new THREE.CanvasTexture(this.lineCanvas);
    const maxAniso = (this.renderer && this.renderer.capabilities) ? this.renderer.capabilities.getMaxAnisotropy() : 16;
    this.lineTexture.anisotropy = maxAniso;
    this.lineTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.lineTexture.magFilter = THREE.LinearFilter;
    this.lineTexture.generateMipmaps = true;

    const groundGeo = new THREE.PlaneGeometry(22, 22);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.lineTexture,
      roughness: 0.85,
      metalness: 0.05
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Sürükleme düzlemi
    const dragPlaneGeo = new THREE.PlaneGeometry(100, 100);
    const dragPlaneMat = new THREE.MeshBasicMaterial({ visible: false });
    this.dragPlane = new THREE.Mesh(dragPlaneGeo, dragPlaneMat);
    this.dragPlane.rotation.x = -Math.PI / 2;
    this.scene.add(this.dragPlane);

    // İnce stüdyo ızgarası
    const grid = new THREE.GridHelper(22, 22, 0x00ae42, 0xd0d8e2);
    grid.position.y = 0.005;
    this.scene.add(grid);
  },

  // MakerWorld Modelini Değiştirme
  loadModel: function(modelId) {
    this.currentModelId = modelId;

    if (!this.robotGroup) {
      this.robotGroup = new THREE.Group();
      this.scene.add(this.robotGroup);
    }

    if (typeof CyberBrickModels !== "undefined") {
      this.activeModelParts = CyberBrickModels.buildModel(modelId, this.robotGroup);
    }

    this.resetRobot();

    const modelSelect = document.getElementById("header-model-select");
    if (modelSelect && modelSelect.value !== modelId) {
      modelSelect.value = modelId;
    }

    if (typeof showToast === "function") {
      const info = CyberBrickModels.catalog.find(m => m.id === modelId);
      if (info) showToast(`${info.name} sahneye yüklendi!`);
    }
  },

  // Parkur Yükleme (Lojistik Deposu, Çizgi Pisti, Engel Kaçış, Sandbox)
  loadArena: function(arenaType) {
    this.currentArena = arenaType;

    if (this.arenaGroup) {
      this.scene.remove(this.arenaGroup);
    }
    this.arenaGroup = new THREE.Group();
    this.obstacles = [];
    this.loadedPallet = null;
    this.loadedCargo = null;

    const ctx = this.lineContext;
    const w = this.lineCanvas.width;
    const h = this.lineCanvas.height;

    // Temiz Apple/Bambu Stüdyo Zemin Rengi
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Açık gri kılavuz çizgileri
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= w; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    this.buildBoundaryWalls();

    if (arenaType === "line_track") {
      // Cizgi Izleme Pisti (Kalin siyah hat)
      this.buildLineTrackArena(ctx, w, h);
    } else if (arenaType === "sandbox") {
      // Serbest Acik Alan
      this.buildSandboxArena();
    } else {
      // Varsayilan: Lojistik Deposu (warehouse)
      this.buildWarehouseArena(ctx, w, h);
    }

    this.lineTexture.needsUpdate = true;
    this.scene.add(this.arenaGroup);
    this.resetRobot();
  },

  buildBoundaryWalls: function() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
    const greenStripeMat = new THREE.MeshBasicMaterial({ color: 0x00ae42 });

    const wallThickness = 0.35;
    const wallHeight = 0.7;
    const size = 20;

    const createWall = (x, z, w, d) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, d), wallMat);
      mesh.position.set(x, wallHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.arenaGroup.add(mesh);
      this.obstacles.push(mesh);

      // Üst yeşil Bambu çizgisi
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(w > d ? w : 0.08, 0.04, d > w ? d : 0.08), greenStripeMat);
      stripe.position.set(x, wallHeight + 0.02, z);
      this.arenaGroup.add(stripe);
    };

    createWall(0, -size / 2, size, wallThickness);
    createWall(0, size / 2, size, wallThickness);
    createWall(-size / 2, 0, wallThickness, size);
    createWall(size / 2, 0, wallThickness, size);
  },

  // 1. ENDÜSTRİYEL METAL VARİL (INDUSTRIAL 200L METAL OIL DRUM)
  createIndustrialBarrel: function(x, z, colorHex = 0xff6a00, isStackable = true) {
    const barrel = new THREE.Group();
    barrel.position.set(x, 0.58, z);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.70,
      roughness: 0.32
    });
    const chimeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Galvaniz çelik halka ve kenarlar
      metalness: 0.88,
      roughness: 0.25
    });

    // Ana Gövde Silindiri
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.15, 24), bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    barrel.add(body);

    // Üç Haddeleme Halkası (3 Rolling Hoops / Ribs)
    [-0.28, 0, 0.28].forEach(ry => {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.02, 10, 24), bodyMat);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = ry;
      barrel.add(rib);
    });

    // Üst ve Alt Kıvrımlı Çelik Kenarlık (Top & Bottom Crimped Chimes)
    [0.575, -0.575].forEach(cy => {
      const chime = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.022, 10, 24), chimeMat);
      chime.rotation.x = Math.PI / 2;
      chime.position.y = cy;
      barrel.add(chime);
    });

    // İç Kavisli Üst Kapak
    const lid = new THREE.Mesh(new THREE.CircleGeometry(0.375, 24), bodyMat);
    lid.rotation.x = -Math.PI / 2;
    lid.position.y = 0.565;
    barrel.add(lid);

    // 2-İnç Büyük Doldurma Tapası (Large 2" Bung Plug)
    const bung1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), chimeMat);
    bung1.position.set(0.18, 0.58, 0);
    barrel.add(bung1);

    // 3/4-İnç Küçük Havalandırma Tapası (Small 3/4" Vent Bung)
    const bung2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 14), chimeMat);
    bung2.position.set(-0.18, 0.58, 0);
    barrel.add(bung2);

    // Yanıcı Madde İkaz Baklavası (Hazmat Diamond Placard - polygonOffset ile sıfır Z-fighting)
    const hazardDiamond = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.015), new THREE.MeshStandardMaterial({
      color: 0xef4444, // Kırmızı yanıcı sıvı eşkenar dörtgeni
      roughness: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    }));
    hazardDiamond.position.set(0, 0.12, 0.388);
    hazardDiamond.rotation.z = Math.PI / 4;
    barrel.add(hazardDiamond);

    barrel.userData = {
      isDraggable: true,
      isCargo: true,
      type: "barrel",
      title: "Metal Varil",
      groundY: 0.58,
      forkOffsetY: 0.54
    };

    this.arenaGroup.add(barrel);
    this.obstacles.push(barrel);
    return barrel;
  },

  // 2. RESMİ EPAL AHŞAP EURO-PALET (EPAL EURO-PALLET)
  createEuroPallet: function(x, z, rotationY = 0) {
    const pallet = new THREE.Group();
    pallet.position.set(x, 0.07, z);
    pallet.rotation.y = rotationY;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.82 });
    const blockMat = new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.88 });
    const nailMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.7,
      roughness: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    // Üst 5 Ahşap Tahta (Top Deckboards)
    const slatWidths = [0.18, 0.14, 0.18, 0.14, 0.18];
    const slatPositions = [-0.54, -0.27, 0, 0.27, 0.54];
    for (let i = 0; i < 5; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.026, slatWidths[i]), woodMat);
      slat.position.set(0, 0.088, slatPositions[i]);
      slat.castShadow = true;
      slat.receiveShadow = true;
      pallet.add(slat);

      // Çivi Başları Detayı
      [-0.58, 0, 0.58].forEach(nx => {
        const nail = new THREE.Mesh(new THREE.CircleGeometry(0.008, 8), nailMat);
        nail.rotation.x = -Math.PI / 2;
        nail.position.set(nx, 0.102, slatPositions[i]);
        pallet.add(nail);
      });
    }

    // 3 Enlemesine Taşıyıcı Kiriş (Stringer Boards)
    [-0.54, 0, 0.54].forEach(px => {
      const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.026, 1.20), woodMat);
      stringer.position.set(px, 0.062, 0);
      pallet.add(stringer);
    });

    // 9 Katı Ahşap Takoz Bloğu (Solid Spacer Blocks)
    [-0.54, 0, 0.54].forEach(bx => {
      [-0.48, 0, 0.48].forEach(bz => {
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.078, 0.14), blockMat);
        block.position.set(bx, 0.01, bz);
        block.castShadow = true;
        pallet.add(block);
      });
    });

    // 3 Alt Destek Tahtası (Bottom Baseboards)
    [-0.54, 0, 0.54].forEach(bx => {
      const btmSlat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.022, 1.20), woodMat);
      btmSlat.position.set(bx, -0.04, 0);
      btmSlat.castShadow = true;
      pallet.add(btmSlat);
    });

    pallet.userData = {
      isDraggable: true,
      isCargo: true,
      type: "pallet",
      title: "EPAL Ahşap Palet",
      groundY: 0.07,
      forkOffsetY: 0.02
    };

    this.arenaGroup.add(pallet);
    this.obstacles.push(pallet);
    return pallet;
  },

  // Palet Üzerine Eşya İstifleme ve Mekanik Kenetleme
  stackCargoOnPallet: function(cargo, pallet) {
    if (!cargo || !pallet || cargo === pallet) return;
    if (cargo.userData && cargo.userData.parentPallet && cargo.userData.parentPallet !== pallet) {
      this.unstackCargoFromPallet(cargo);
    }
    if (pallet.userData && pallet.userData.stackedCargo && pallet.userData.stackedCargo !== cargo) {
      this.unstackCargoFromPallet(pallet.userData.stackedCargo);
    }

    pallet.userData.stackedCargo = cargo;
    cargo.userData.parentPallet = pallet;

    const groundY = (cargo.userData && cargo.userData.groundY !== undefined) ? cargo.userData.groundY : 0.5;
    const stackOffsetY = 0.101 + groundY;
    cargo.userData.stackOffsetY = stackOffsetY;

    cargo.position.set(pallet.position.x, pallet.position.y + stackOffsetY, pallet.position.z);
    cargo.rotation.y = pallet.rotation.y;
  },

  // Paletten Eşyayı Ayırma
  unstackCargoFromPallet: function(cargo) {
    if (!cargo || !cargo.userData) return;
    const pallet = cargo.userData.parentPallet;
    if (pallet && pallet.userData && pallet.userData.stackedCargo === cargo) {
      pallet.userData.stackedCargo = null;
    }
    cargo.userData.parentPallet = null;
    if (cargo.userData.groundY !== undefined) {
      cargo.position.y = cargo.userData.groundY;
    }
    delete cargo.userData.stackOffsetY;
  },

  // 3. ÇELİK KÖŞE TAKVİYELİ AHŞAP KARGO SANDIĞI (WOODEN LOGISTICS CRATE)
  createCargoCrate: function(x, z, sx = 0.95, sy = 0.85, sz = 0.95, labelText = "FRAGILE") {
    const crate = new THREE.Group();
    crate.position.set(x, sy / 2 + 0.02, z);

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xcd9b6d,
      roughness: 0.82,
      metalness: 0.05
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.65,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const rivetMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85
    });
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const braceMat = new THREE.MeshStandardMaterial({
      color: 0xb9804e,
      roughness: 0.88,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    // 1. Ana Sandık Ahşap Gövdesi
    const body = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), woodMat);
    body.castShadow = true;
    body.receiveShadow = true;
    crate.add(body);

    // 2. Çelik Dış Köşe Destekleri (L-Profiller ve 3 Yönlü Köşe Başlıkları)
    // Gövde ile düzlemsel çakışma (Z-fighting) ve gölge acne tamamen önlenmiştir.
    const t = 0.007; // 7 mm çelik et kalınlığı
    const w = 0.052; // 52 mm kanat genişliği
    const gap = 0.0015; // 1.5 mm fiziksel mesafe payı (yüzey çakışmasını sıfırlar)

    [-sx / 2, sx / 2].forEach(cx => {
      [-sz / 2, sz / 2].forEach(cz => {
        const dirX = Math.sign(cx);
        const dirZ = Math.sign(cz);

        // Z-Yüzeyi Üzerindeki Çelik Kanat (Ön ve Arka Yüz)
        const flangeZ = new THREE.Mesh(
          new THREE.BoxGeometry(w, sy + 0.004, t),
          darkSteelMat
        );
        flangeZ.position.set(
          cx - dirX * (w / 2),
          0,
          cz + dirZ * (gap + t / 2)
        );
        flangeZ.castShadow = true;
        flangeZ.receiveShadow = true;
        crate.add(flangeZ);

        // X-Yüzeyi Üzerindeki Çelik Kanat (Sağ ve Sol Yan Yüz)
        const flangeX = new THREE.Mesh(
          new THREE.BoxGeometry(t, sy + 0.004, w),
          darkSteelMat
        );
        flangeX.position.set(
          cx + dirX * (gap + t / 2),
          0,
          cz - dirZ * (w / 2)
        );
        flangeX.castShadow = true;
        flangeX.receiveShadow = true;
        crate.add(flangeX);

        // Dış Köşe Birleşim Omurgası (Outer Corner Spine)
        const cornerSpine = new THREE.Mesh(
          new THREE.BoxGeometry(t, sy + 0.004, t),
          darkSteelMat
        );
        cornerSpine.position.set(
          cx + dirX * (gap + t / 2),
          0,
          cz + dirZ * (gap + t / 2)
        );
        cornerSpine.castShadow = true;
        cornerSpine.receiveShadow = true;
        crate.add(cornerSpine);

        // Üst ve Alt 3 Yönlü Çelik Köşe Başlıkları (Corner Caps)
        [1, -1].forEach(capY => {
          const capTop = new THREE.Mesh(
            new THREE.BoxGeometry(w + t, t, w + t),
            darkSteelMat
          );
          capTop.position.set(
            cx - dirX * (w / 2 - t / 2),
            capY * (sy / 2 + gap + t / 2),
            cz - dirZ * (w / 2 - t / 2)
          );
          capTop.castShadow = true;
          capTop.receiveShadow = true;
          crate.add(capTop);

          // Köşe Perçini (Rivet)
          const rivet = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 0.004, 10),
            rivetMat
          );
          rivet.rotation.x = Math.PI / 2;
          rivet.position.set(
            cx - dirX * (w * 0.55),
            capY * (sy * 0.40),
            cz + dirZ * (gap + t + 0.002)
          );
          crate.add(rivet);
        });
      });
    });

    // 3. Sandık Çapraz Takviye Kirişleri (X-Bracing)
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(sx * 1.10, 0.055, 0.016), braceMat);
    b1.position.set(0, 0, sz / 2 + gap + t + 0.006);
    b1.rotation.z = Math.atan2(sy, sx);
    b1.castShadow = true;
    b1.receiveShadow = true;
    crate.add(b1);

    // 4. Kırmızı "FRAGILE" / Kırılabilir İkaz Plakası
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.01), redMat);
    label.position.set(0, sy * 0.15, sz / 2 + gap + t + 0.014);
    label.castShadow = false;
    label.receiveShadow = true;
    crate.add(label);

    crate.userData = {
      isDraggable: true,
      isCargo: true,
      type: "crate",
      title: "Lojistik Sandığı",
      groundY: sy / 2 + 0.02,
      forkOffsetY: sy / 2
    };

    this.arenaGroup.add(crate);
    this.obstacles.push(crate);
    return crate;
  },

  // 4. ÇELİK ENDÜSTRİYEL BORU PAKETİ (INDUSTRIAL PIPE BUNDLE)
  createPipeBundle: function(x, z, rotationY = 0) {
    const bundle = new THREE.Group();
    bundle.position.set(x, 0.28, z);
    bundle.rotation.y = rotationY;

    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Parlak Çelik Borular
      metalness: 0.92,
      roughness: 0.20
    });
    const strapMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Yüksek Dayanımlı Sarı Gergi Şeridi
      roughness: 0.45
    });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.85 });

    // Ahşap Taşıma Yatağı (Cradle Base)
    [-0.45, 0.45].forEach(cz => {
      const cradle = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.12), woodMat);
      cradle.position.set(0, -0.22, cz);
      cradle.castShadow = true;
      bundle.add(cradle);
    });

    // 6 Adet Endüstriyel Çelik Boru (Piramit Dizilimi: 3 Alt, 2 Orta, 1 Üst)
    const pipeCoords = [
      [-0.24, -0.10], [0, -0.10], [0.24, -0.10],
      [-0.12, 0.10], [0.12, 0.10],
      [0, 0.30]
    ];

    pipeCoords.forEach(([px, py]) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.85, 20), pipeMat);
      pipe.rotateX(Math.PI / 2);
      pipe.position.set(px, py, 0);
      pipe.castShadow = true;
      bundle.add(pipe);

      // İç Boşluk / Boru Ağzı
      const bore = new THREE.Mesh(new THREE.CircleGeometry(0.095, 16), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      bore.position.set(px, py, 0.93);
      bundle.add(bore);
      const bore2 = new THREE.Mesh(new THREE.CircleGeometry(0.095, 16), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      bore2.rotation.y = Math.PI;
      bore2.position.set(px, py, -0.93);
      bundle.add(bore2);
    });

    // 2 Adet Sarı Çelik Bağlama Çemberi / Spanzet
    [-0.55, 0.55].forEach(sz => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.56, 0.04), strapMat);
      strap.position.set(0, 0.08, sz);
      bundle.add(strap);
    });

    bundle.userData = {
      isDraggable: true,
      isCargo: true,
      type: "pipe_bundle",
      title: "Boru Paketi",
      groundY: 0.28,
      forkOffsetY: 0.25
    };

    this.arenaGroup.add(bundle);
    this.obstacles.push(bundle);
    return bundle;
  },

  // 5. ISO DENİZ TAŞIMA KONTEYNERİ (INTERMODAL SHIPPING CONTAINER)
  createShippingContainer: function(x, z, colHex, rotationY = 0) {
    const cGroup = new THREE.Group();
    cGroup.position.set(x, 1.30, z);
    cGroup.rotation.y = rotationY;

    const cMat = new THREE.MeshStandardMaterial({
      color: colHex,
      roughness: 0.42,
      metalness: 0.30
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.5
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.1
    });

    // Ana Konteyner Sandığı (2.4m genişlik, 2.5m yükseklik, 5.6m uzunluk)
    const cBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 5.6), cMat);
    cBody.castShadow = true;
    cBody.receiveShadow = true;
    cGroup.add(cBody);

    // Derin Oluklu Dalgalı Çelik Yan Paneller (Corrugated Ribs)
    const ribGeo = new THREE.BoxGeometry(2.46, 2.40, 0.10);
    for (let rz = -2.55; rz <= 2.55; rz += 0.36) {
      const rib = new THREE.Mesh(ribGeo, cMat);
      rib.position.set(0, 0, rz);
      cGroup.add(rib);
    }

    // 8 Köşe Kilit Döküm Bloğu (Corner Castings - Dışarıyı saracak şekilde boyutlandırılmış, sıfır Z-fighting)
    const cornerGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    [-1.2, 1.2].forEach(cx => {
      [-1.25, 1.25].forEach(cy => {
        [-2.8, 2.8].forEach(cz => {
          const corner = new THREE.Mesh(cornerGeo, darkSteelMat);
          corner.position.set(cx - Math.sign(cx) * 0.118, cy - Math.sign(cy) * 0.118, cz - Math.sign(cz) * 0.118);
          cGroup.add(corner);
        });
      });
    });

    // Alt Forklift Taşıma Cepleri (Fork Pockets)
    [-0.85, 0.85].forEach(fz => {
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.16, 0.38), darkSteelMat);
      pocket.position.set(0, -1.18, fz);
      cGroup.add(pocket);
    });

    // Arka Çift Kapı ve Kilit Barları (Rear Cargo Doors & Lock Rods)
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.28, 2.38, 0.04), darkSteelMat);
    doorFrame.position.set(0, 0, 2.81);
    cGroup.add(doorFrame);

    [-0.45, -0.15, 0.15, 0.45].forEach(rx => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.30), chromeMat);
      rod.position.set(rx, 0, 2.84);
      cGroup.add(rod);

      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.06), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      handle.position.set(rx, -0.3, 2.87);
      cGroup.add(handle);
    });

    // ISO CSC Güvenlik Onay ve Tanıtım Plakası
    const cscPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.02), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 }));
    cscPlate.position.set(-0.65, 0.45, 2.84);
    cGroup.add(cscPlate);

    cGroup.userData = {
      isDraggable: true,
      type: "container",
      title: "ISO Deniz Konteyneri",
      groundY: 1.30
    };

    this.arenaGroup.add(cGroup);
    this.obstacles.push(cGroup);
    return cGroup;
  },

  // 6. YÜKLEME RAMPASI VE DOCK İSKELESİ (GRİ YÜKSELTİ ALANI - TÜM HARİTALARDAN KALDIRILDI)
  createLoadingDockWithRamp: function(x, z) {
    return null;
  },

  // 7. GERÇEKÇİ REFLEKTÖRLÜ TRAFİK KONİSİ (TRAFFIC SAFETY CONE)
  createTrafficCone: function(x, z) {
    const cone = new THREE.Group();
    cone.position.set(x, 0, z);

    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff6a00, roughness: 0.4 });
    const whiteReflectMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, emissive: 0xf8fafc, emissiveIntensity: 0.2 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75 });

    // Taban Ağırlık Plakası
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), baseMat);
    base.position.y = 0.025;
    base.castShadow = true;
    cone.add(base);

    // Ana Turuncu Koni
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.72, 18), orangeMat);
    body.position.y = 0.39;
    body.castShadow = true;
    cone.add(body);

    // Çift Beyaz Reflektif Bant
    const band1 = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.12, 18), whiteReflectMat);
    band1.position.y = 0.38;
    cone.add(band1);

    const band2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 0.09, 18), whiteReflectMat);
    band2.position.y = 0.54;
    cone.add(band2);

    cone.userData = {
      isDraggable: true,
      isCargo: true,
      type: "traffic_cone",
      title: "Trafik Konisi",
      groundY: 0,
      forkOffsetY: 0.05
    };

    this.arenaGroup.add(cone);
    this.obstacles.push(cone);
    return cone;
  },

  // 8. BEYAZ - TURUNCU YOL EMNİYET BARİYERİ (JERSEY SAFETY BARRIER)
  createJerseyBarrier: function(x, z, colorHex = 0xf8fafc, rotationY = 0) {
    const barrier = new THREE.Group();
    barrier.position.set(x, 0.36, z);
    barrier.rotation.y = rotationY;

    const bMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.72, 1.65), bMat);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    barrier.add(mainBody);

    const baseFlange = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.20, 1.65), bMat);
    baseFlange.position.y = -0.26;
    barrier.add(baseFlange);

    barrier.userData = {
      isDraggable: true,
      type: "barrier",
      title: "Emniyet Bariyeri",
      groundY: 0.36
    };

    this.arenaGroup.add(barrier);
    this.obstacles.push(barrier);
    return barrier;
  },

  // 9. START/BİTİŞ KAFES TAKI (OVERHEAD START/FINISH TRUSS GANTRY)
  createOverheadGantry: function(x, z) {
    const gantry = new THREE.Group();
    gantry.position.set(x, 0, z);

    const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.88, roughness: 0.25 });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 });
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x00ae42 });
    const redLedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Sol ve Sağ Alüminyum Kafes Direkleri
    [-2.2, 2.2].forEach(tx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 0.18), trussMat);
      leg.position.set(tx, 1.4, 0);
      leg.castShadow = true;
      gantry.add(leg);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.52), trussMat);
      base.position.set(tx, 0.04, 0);
      gantry.add(base);
    });

    // Üst Yatay Kafes Kirişi (Overhead Crossbeam)
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.26, 0.26), trussMat);
    beam.position.set(0, 2.7, 0);
    beam.castShadow = true;
    gantry.add(beam);

    // Dijital Zaman & Bilgi Panosu (Digital Timing Board)
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.08), boardMat);
    board.position.set(0, 2.35, 0);
    gantry.add(board);

    // 5 Sıralı Formula Başlangıç Işıkları (Start Light Gantry)
    [-0.8, -0.4, 0, 0.4, 0.8].forEach(lx => {
      const lampHousing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.06), boardMat);
      lampHousing.position.set(lx, 1.88, 0.05);
      gantry.add(lampHousing);

      const rLight = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), redLedMat);
      rLight.position.set(lx, 1.94, 0.085);
      gantry.add(rLight);

      const gLight = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), greenLedMat);
      gLight.position.set(lx, 1.82, 0.085);
      gantry.add(gLight);
    });

    this.arenaGroup.add(gantry);
    return gantry;
  },

  // 10. METALLİK İÇECEK KUTUSU (RED SODA CAN)
  createSodaCan: function(x, z) {
    const canGroup = new THREE.Group();
    canGroup.position.set(x, 0.48, z);

    const canBodyMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      metalness: 0.75,
      roughness: 0.18
    });
    const canSilverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15
    });

    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.92, 28), canBodyMat);
    canBody.castShadow = true;
    canGroup.add(canBody);

    const canTopRim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.015, 12, 28), canSilverMat);
    canTopRim.rotation.x = Math.PI / 2;
    canTopRim.position.y = 0.46;
    canGroup.add(canTopRim);

    const canLid = new THREE.Mesh(new THREE.CircleGeometry(0.22, 28), canSilverMat);
    canLid.rotation.x = -Math.PI / 2;
    canLid.position.y = 0.455;
    canGroup.add(canLid);

    const pullTab = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.12), canSilverMat);
    pullTab.position.set(0, 0.462, 0.05);
    canGroup.add(pullTab);

    canGroup.userData = {
      isDraggable: true,
      isCargo: true,
      type: "soda_can",
      title: "Teneke İçecek Kutusu",
      groundY: 0.48,
      forkOffsetY: 0.44
    };

    this.arenaGroup.add(canGroup);
    this.obstacles.push(canGroup);
    return canGroup;
  },

  // A. PROFESYONEL LOJİSTİK DEPOSU ARENASI (WAREHOUSE ARENA)
  buildWarehouseArena: function(ctx, w, h) {
    // Zemin İşaretleri: Modern gri-mavi lojistik sınır çizgisi
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 4;
    ctx.strokeRect(140, 140, w - 280, h - 280);

    // A, B, C Palet Park ve İstif Alanları (Staging Bays A, B, C)
    const bays = [
      { id: "A", label: "ALAN A", x: 220, y: 680, w: 144, h: 144, color: "#00ae42", bg: "#00ae420f" },
      { id: "B", label: "ALAN B", x: 440, y: 680, w: 144, h: 144, color: "#0284c7", bg: "#0284c70f" },
      { id: "C", label: "ALAN C", x: 660, y: 680, w: 144, h: 144, color: "#f59e0b", bg: "#f59e0b0f" }
    ];

    bays.forEach(bay => {
      ctx.save();

      // Zemin hafif renk dolgusu
      ctx.fillStyle = bay.bg;
      ctx.fillRect(bay.x, bay.y, bay.w, bay.h);

      // Emniyet Çizgisi (Kesikli modern lojistik sınırı)
      ctx.strokeStyle = bay.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(bay.x, bay.y, bay.w, bay.h);
      ctx.setLineDash([]);

      // 4 Köşe L-Parantez Kılavuzları
      const cl = 16;
      ctx.strokeStyle = bay.color;
      ctx.lineWidth = 3.5;
      // Sol-Üst
      ctx.beginPath(); ctx.moveTo(bay.x - 2, bay.y + cl); ctx.lineTo(bay.x - 2, bay.y - 2); ctx.lineTo(bay.x + cl, bay.y - 2); ctx.stroke();
      // Sağ-Üst
      ctx.beginPath(); ctx.moveTo(bay.x + bay.w + 2 - cl, bay.y - 2); ctx.lineTo(bay.x + bay.w + 2, bay.y - 2); ctx.lineTo(bay.x + bay.w + 2, bay.y + cl); ctx.stroke();
      // Sol-Alt
      ctx.beginPath(); ctx.moveTo(bay.x - 2, bay.y + bay.h + 2 - cl); ctx.lineTo(bay.x - 2, bay.y + bay.h + 2); ctx.lineTo(bay.x + cl, bay.y + bay.h + 2); ctx.stroke();
      // Sağ-Alt
      ctx.beginPath(); ctx.moveTo(bay.x + bay.w + 2 - cl, bay.y + bay.h + 2); ctx.lineTo(bay.x + bay.w + 2, bay.y + bay.h + 2); ctx.lineTo(bay.x + bay.w + 2, bay.y + bay.h + 2 - cl); ctx.stroke();

      const cx = bay.x + bay.w / 2;
      const cy = bay.y + bay.h / 2;

      // Büyük Harf (A, B, C)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "800 48px 'Plus Jakarta Sans', -apple-system, sans-serif";
      ctx.fillStyle = bay.color;
      ctx.fillText(bay.id, cx, cy - 8);

      // Alan Etiket Başlığı (ALAN A, ALAN B, ALAN C)
      ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#334155";
      ctx.fillText(bay.label, cx, cy + 28);

      ctx.restore();
    });

    // Açık Yeşil Yaya Yolu (Pedestrian Walkway)
    ctx.fillStyle = "#00ae4214";
    ctx.fillRect(160, 480, w - 320, 60);

    // HEDEF İŞARETLİ ALAN (Forklift Görev Teslim Noktası)
    // 3D Dünya Koordinatı: (x = 2.55, z = 0.45) -> Canvas: (631, 533)
    const targetCx = 631, targetCy = 533;
    const bayW = 86, bayH = 86;
    const bx = targetCx - bayW / 2;
    const by = targetCy - bayH / 2;

    ctx.save();
    // Hedef alan açık yeşil zemin dolgusu
    ctx.fillStyle = "#00ae4218";
    ctx.fillRect(bx, by, bayW, bayH);

    // Dışarıdan kesikli turuncu/yeşil emniyet sınırı
    ctx.strokeStyle = "#ff6a00";
    ctx.lineWidth = 3.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(bx, by, bayW, bayH);
    ctx.setLineDash([]);

    // 4 Köşe Hizalama L-Parantez Kılavuzları (Corner Brackets)
    ctx.strokeStyle = "#00ae42";
    ctx.lineWidth = 3;
    const cl = 14;
    ctx.beginPath(); ctx.moveTo(bx - 2, by + cl); ctx.lineTo(bx - 2, by - 2); ctx.lineTo(bx + cl, by - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bayW + 2 - cl, by - 2); ctx.lineTo(bx + bayW + 2, by - 2); ctx.lineTo(bx + bayW + 2, by + cl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 2, by + bayH + 2 - cl); ctx.lineTo(bx - 2, by + bayH + 2); ctx.lineTo(bx + cl, by + bayH + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + bayW + 2 - cl, by + bayH + 2); ctx.lineTo(bx + bayW + 2, by + bayH + 2); ctx.lineTo(bx + bayW + 2, by + bayH + 2 - cl); ctx.stroke();

    // Merkez Hedef Nişangahı ve Metin
    ctx.fillStyle = "#00993a";
    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText("HEDEF ALAN", targetCx, targetCy - 8);
    ctx.font = "bold 8px Plus Jakarta Sans, sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("DEPO TESLIM", targetCx, targetCy + 6);
    ctx.fillText("PALET ISTIFI", targetCx, targetCy + 18);
    ctx.restore();

    // 2. EPAL AHŞAP EURO-PALETLER VE ÜZERİNDEKİ KENETLİ YÜKLER
    // Palet 1 (GÖREV PALETİ): Doğrudan forkliftin önünde (z = 2.25m), üzerinde mavi endüstriyel varil kenetli palet
    const palletFront = this.createEuroPallet(0, 2.25);
    const barrelBlue = this.createIndustrialBarrel(0, 2.25, 0x1d4ed8);
    this.stackCargoOnPallet(barrelBlue, palletFront);

    // Palet 2: Sol bölgede, üzerinde turuncu varil kenetli palet
    const palletLeft = this.createEuroPallet(-2.8, 1.8);
    const barrelOrange = this.createIndustrialBarrel(-2.8, 1.8, 0xff6a00);
    this.stackCargoOnPallet(barrelOrange, palletLeft);

    // Palet 3: Sağ bölgede, üzerinde ahşap kargo sandığı kenetli palet
    const palletRight = this.createEuroPallet(2.8, -2.2);
    const cargoCrate = this.createCargoCrate(2.8, -2.2, 0.95, 0.85, 0.95, "FRAGILE");
    this.stackCargoOnPallet(cargoCrate, palletRight);

    // 4. BAĞIMSIZ ENDÜSTRİYEL METAL VARİL (SARI)
    this.createIndustrialBarrel(-2.2, -2.2, 0xf59e0b);

    // 5. PARLAK KIRMIZI İÇECEK KUTUSU (Merkezden uzakta, güvenli yan sahada)
    this.createSodaCan(1.8, -1.0);
  },

  // B. GERÇEKÇİ ÇOK ETAPLI ROBOTİK YARIŞMA ÇİZGİ PİSTİ (LINE TRACK ARENA)
  buildLineTrackArena: function(ctx, w, h) {
    // 1. Zemin: Gri Yarış Matı Kaplaması ve 64px Koordinat Izgarası
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    // Koyu yarış pist alanı
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.roundRect(80, 80, w - 160, h - 160, 60);
    ctx.fill();

    // 64px Açık Kılavuz Çizgileri
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    for (let x = 80; x <= w - 80; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, h - 80); ctx.stroke();
    }
    for (let y = 80; y <= h - 80; y += 64) {
      ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(w - 80, y); ctx.stroke();
    }

    // 2. Viraj İç/Dış Apex Bordürleri (Red & White Kerbs / Rumble Strips)
    const drawKerbArc = (cx, cy, r, startA, endA) => {
      ctx.save();
      const step = 0.08;
      let flip = false;
      for (let a = startA; a < endA; a += step) {
        ctx.strokeStyle = flip ? "#ef4444" : "#ffffff";
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.arc(cx, cy, r, a, Math.min(endA, a + step));
        ctx.stroke();
        flip = !flip;
      }
      ctx.restore();
    };

    // Güvenlik Bordürleri
    drawKerbArc(760, 630, 160, -Math.PI / 4, Math.PI / 2);
    drawKerbArc(760, 360, 160, Math.PI, Math.PI * 1.5);
    drawKerbArc(220, 220, 130, Math.PI * 0.8, Math.PI * 1.6);
    drawKerbArc(260, 480, 125, 0, Math.PI * 2);

    // 3. ANA SİYAH YARIŞ ÇİZGİSİ (36px kalınlık, kesintisiz yarışma parkuru)
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 36;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    // Start Düzlüğü: px=260, py=754 noktasından başlar, sağa doğru uzanır
    ctx.moveTo(260, 754);
    ctx.lineTo(740, 754);

    // Viraj 1: Doğu Hızlı Süpürme Yayı (Sweeping East Turn)
    ctx.arcTo(880, 754, 880, 614, 140);
    ctx.lineTo(880, 480);

    // Viraj 2: Kuzeydoğu 90 Derece Dönüş
    ctx.arcTo(880, 340, 740, 340, 140);
    ctx.lineTo(580, 340);

    // Dörtyol Ağzı / Kesişim Noktası (Crossroads Intersection at x=512, y=340)
    ctx.lineTo(440, 340);

    // S-Virajları / Chicane (S-Curves)
    ctx.bezierCurveTo(360, 340, 340, 240, 260, 240);
    ctx.bezierCurveTo(180, 240, 160, 180, 240, 180);

    // 90 Derece Keskin Köşe (Northwest Turn)
    ctx.lineTo(400, 180);
    ctx.arcTo(480, 180, 480, 260, 80);
    ctx.lineTo(480, 300);

    // Dörtyol Kesişiminin Dikey Geçişi
    ctx.lineTo(480, 420);
    ctx.arcTo(480, 480, 380, 480, 80);

    // Dönel Ada / Roundabout Çemberi
    ctx.arc(280, 480, 100, 0, Math.PI * 2);

    // Çember Çıkışı ve Güney Dönüşü
    ctx.moveTo(280, 580);
    ctx.lineTo(180, 580);
    ctx.arcTo(140, 580, 140, 660, 60);

    // Son Bağlantı Kavisli Başlangıç Girişi
    ctx.arcTo(140, 754, 260, 754, 94);
    ctx.lineTo(260, 754);
    ctx.stroke();

    // 4. Dörtyol Ağzı Tam Kesişim Çizgisi (Perpendicular Cross Connector)
    ctx.beginPath();
    ctx.moveTo(512, 280);
    ctx.lineTo(512, 400);
    ctx.stroke();

    // 5. Kesik Çizgi Etabı / Dotted Line Challenge (Bypass alternatif hat)
    ctx.save();
    ctx.setLineDash([24, 18]);
    ctx.lineWidth = 32;
    ctx.beginPath();
    ctx.moveTo(740, 754);
    ctx.lineTo(740, 580);
    ctx.arcTo(740, 480, 640, 480, 100);
    ctx.lineTo(512, 480);
    ctx.stroke();
    ctx.restore();

    // 6. Başlangıç & Bitiş Damalı Çizgisi (Start/Finish Grid & Paddock)
    // Yeşil Başlangıç Alanı
    ctx.fillStyle = "#00ae42";
    ctx.fillRect(470, 730, 84, 48);

    // İki Sıralı Damalı Bayrak Deseni
    const boxSize = 12;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? "#ffffff" : "#0f172a";
        ctx.fillRect(490 + c * boxSize, 730 + r * boxSize, boxSize, boxSize);
      }
    }

    // Pist Metinleri ve Koordinat Etiketleri
    ctx.fillStyle = "#475569";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillText("START / FINISH", 475, 804);
    ctx.fillText("APEX - 1", 860, 780);
    ctx.fillText("CHICANE", 270, 215);
    ctx.fillText("ROUNDABOUT", 220, 485);
    ctx.fillText("CROSSROADS", 460, 320);

    // 3D START / BİTİŞ ALÜMİNYUM KAFES TAKI (OVERHEAD GANTRY)
    this.createOverheadGantry(0, 5.15);

    // Pist Kenarı Güvenlik Konileri
    this.createTrafficCone(1.8, 4.4);
    this.createTrafficCone(-1.8, 4.4);
    this.createTrafficCone(4.8, 1.2);
    this.createTrafficCone(-3.8, -1.2);
  },

  // C. SERBEST DENEY ALANI (SANDBOX ARENA)
  buildSandboxArena: function() {
    // Serbest yükleme ve taşıma için paletler, sandıklar ve variller
    this.createEuroPallet(1.8, 1.8);
    this.createCargoCrate(1.8, 1.8, 0.90, 0.80, 0.90, "HANDLE WITH CARE");
    this.createEuroPallet(-2.4, 1.8);
    this.createIndustrialBarrel(-2.4, 1.8, 0xff6a00);
    this.createIndustrialBarrel(0, 2.8, 0x1d4ed8);
    this.createPipeBundle(-1.8, -2.2, Math.PI / 2);
    this.createTrafficCone(0, -1.5);
  },

  resetRobot: function(resetArena = false) {
    if (resetArena) {
      this.loadArena(this.currentArena || "warehouse");
      return;
    }
    if (this.currentArena === "line_track") {
      this.robotState.x = 0;
      this.robotState.z = 5.15;
      this.robotState.heading = Math.PI / 2; // piste paralel (doğu yönü)
    } else {
      this.robotState.x = 0;
      this.robotState.z = 0;
      this.robotState.heading = 0;
    }
    this.robotState.leftPwm = 0;
    this.robotState.rightPwm = 0;
    this.robotState.servoAngle = 90;
    this.robotState.speedKmh = 0;
    this.loadedPallet = null;
    this.loadedCargo = null;

    if (this.robotGroup) {
      this.robotGroup.position.set(this.robotState.x, 0, this.robotState.z);
      this.robotGroup.rotation.set(0, this.robotState.heading, 0);
    }
    this.updateUltrasonicSensor();
    this.updateLineSensors();
  },

  setCameraMode: function(mode) {
    this.robotState.cameraMode = mode;
    if (mode === "topdown") {
      this.camera.position.set(0, 15, 0.01);
      this.camera.lookAt(0, 0, 0);
      if (this.controls) this.controls.target.set(0, 0, 0);
    } else if (mode === "chase") {
      // Chase camera
    } else {
      this.camera.position.set(0, 5.5, 7.5);
      if (this.controls) this.controls.target.set(0, 0.6, 0);
    }
  },

  // Donanım Komutları (MicroPython API'si tarafından çağrılır)
  setMotorsPwm: function(l, r) {
    this.robotState.leftPwm = Math.max(-1024, Math.min(1024, l));
    this.robotState.rightPwm = Math.max(-1024, Math.min(1024, r));
  },

  setServoAngle: function(ch, angle) {
    if (ch === 1) {
      this.robotState.servoAngle = Math.max(0, Math.min(180, angle));
    }
  },

  setRgbColor: function(r, g, b) {
    this.robotState.rgbColor = { r, g, b };
    if (this.activeModelParts.statusLed) {
      this.activeModelParts.statusLed.material.color.setRGB(r / 255, g / 255, b / 255);
    }
  },

  // Fizik ve Mekanizma Animasyon Döngüsü
  updatePhysics: function(dt) {
    const maxLinear = 3.0; // m/s
    const maxAngular = 3.8; // rad/s

    const vL = (this.robotState.leftPwm / 1024) * maxLinear;
    const vR = (this.robotState.rightPwm / 1024) * maxLinear;

    const v = (vL + vR) / 2;
    const omega = (vR - vL) / this.robotState.wheelBase;

    this.robotState.speedKmh = Math.abs(v * 3.6);

    if (Math.abs(v) > 0.001 || Math.abs(omega) > 0.001) {
      this.robotState.heading += omega * dt;
      while (this.robotState.heading > Math.PI) this.robotState.heading -= Math.PI * 2;
      while (this.robotState.heading < -Math.PI) this.robotState.heading += Math.PI * 2;

      const targetX = this.robotState.x + Math.sin(this.robotState.heading) * v * dt;
      const targetZ = this.robotState.z + Math.cos(this.robotState.heading) * v * dt;

      if (!this.checkCollision(targetX, targetZ)) {
        this.robotState.x = targetX;
        this.robotState.z = targetZ;
      }

      // Tekerleklerin dönme animasyonu
      if (this.activeModelParts.leftWheel && this.activeModelParts.rightWheel) {
        this.activeModelParts.leftWheel.rotation.x += (vL / this.robotState.wheelRadius) * dt;
        this.activeModelParts.rightWheel.rotation.x += (vR / this.robotState.wheelRadius) * dt;
      }
      if (this.activeModelParts.extraWheels && Array.isArray(this.activeModelParts.extraWheels)) {
        for (const ew of this.activeModelParts.extraWheels) {
          const spd = ew.isLeft ? vL : vR;
          ew.mesh.rotation.x += (spd / this.robotState.wheelRadius) * dt;
        }
      }
    }

    if (this.robotGroup) {
      this.robotGroup.position.set(this.robotState.x, 0, this.robotState.z);
      this.robotGroup.rotation.y = this.robotState.heading;
    }

    // MODELE ÖZEL DİNAMİK MEKANİZMA ANİMASYONU
    if (this.activeModelParts.servoPart) {
      const part = this.activeModelParts.servoPart;
      if (this.currentModelId === "forklift") {
        // Forklift Çatalları: Servo açısına göre dikey yukarı kalkar (0° = zemin 0.06m, 180° = 1.25m üst seviye)
        const targetY = 0.06 + (this.robotState.servoAngle / 180) * 1.19;
        part.position.y = THREE.MathUtils.lerp(part.position.y, targetY, 0.15);

        if (this.robotGroup) {
          this.robotGroup.updateMatrixWorld(true);
        }

        const forkPos = new THREE.Vector3();
        const forkQuat = new THREE.Quaternion();
        part.localToWorld(forkPos.set(0, 0.02, 0.45));
        part.getWorldQuaternion(forkQuat);

        const forkHeight = part.position.y;
        if (!this.loadedCargo) {
          // Çatallar yükselirken (ör. > 0.12m) çatal hizasındaki eşyayı kilitle
          if (forkHeight > 0.12) {
            for (const obs of this.obstacles) {
              if (obs && obs.userData && (obs.userData.isCargo || obs.userData.type === "pallet")) {
                // Eğer nesne palet üzerindeyse, çatallar doğrudan palete kenetlenmeli
                if (obs.userData.parentPallet) continue;

                const d = Math.hypot(obs.position.x - forkPos.x, obs.position.z - forkPos.z);
                const dy = Math.abs(obs.position.y - forkPos.y);
                if (d < 1.10 && dy < 0.90) {
                  this.loadedCargo = obs;
                  this.loadedPallet = obs;
                  if (typeof showToast === "function") {
                    showToast(`${obs.userData.title || "Yük"} çatallara yüklendi.`);
                  }
                  break;
                }
              }
            }
          }
        } else {
          // Eşya taşınıyor:
          if (forkHeight <= 0.085) {
            // Çatallar zemine indiğinde eşyayı yere bırak!
            const groundY = this.loadedCargo.userData.groundY !== undefined ? this.loadedCargo.userData.groundY : 0.06;
            this.loadedCargo.position.y = groundY;
            this.loadedCargo.rotation.set(0, this.robotState.heading, 0);
            if (this.loadedCargo.userData.stackedCargo) {
              const sc = this.loadedCargo.userData.stackedCargo;
              const offY = sc.userData.stackOffsetY || (0.101 + (sc.userData.groundY || 0.5));
              sc.position.set(this.loadedCargo.position.x, groundY + offY, this.loadedCargo.position.z);
              sc.rotation.set(0, this.robotState.heading, 0);
            }
            const droppedX = this.loadedCargo.position.x;
            const droppedZ = this.loadedCargo.position.z;
            const isTargetBay = Math.hypot(droppedX - 2.55, droppedZ - 0.45) < 1.35;
            const isAreaA = Math.hypot(droppedX - (-4.73), droppedZ - 5.16) < 1.65;
            const isAreaB = Math.hypot(droppedX - 0.0, droppedZ - 5.16) < 1.65;
            const isAreaC = Math.hypot(droppedX - 4.73, droppedZ - 5.16) < 1.65;

            if (this.currentArena === "warehouse" && (isTargetBay || isAreaA || isAreaB || isAreaC)) {
              let targetName = "hedef alana";
              if (isAreaA) targetName = "Alan A'ya";
              else if (isAreaB) targetName = "Alan B'ye";
              else if (isAreaC) targetName = "Alan C'ye";

              if (typeof confetti === "function") {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              }
              if (typeof showToast === "function") {
                showToast(`Tebrikler! ${this.loadedCargo.userData.title || "Yük"} ${targetName} başarıyla yerleştirildi.`);
              }
            } else if (typeof showToast === "function") {
              showToast(`${this.loadedCargo.userData.title || "Yük"} zemine bırakıldı.`);
            }
            this.loadedCargo = null;
            this.loadedPallet = null;
          } else {
            // Çatallarla birlikte yükselir ve doğrudan çatalın üstüne oturur
            const liftOffset = (this.loadedCargo.userData.type === "pallet") 
              ? 0.04 
              : (this.loadedCargo.userData.forkOffsetY !== undefined ? this.loadedCargo.userData.forkOffsetY : 0.02);

            const targetPos = new THREE.Vector3();
            part.localToWorld(targetPos.set(0, liftOffset, 0.45));
            this.loadedCargo.position.copy(targetPos);
            this.loadedCargo.quaternion.copy(forkQuat);

            // Palet üzerinde bir eşya varsa onunla birleşik hareket etsin!
            if (this.loadedCargo.userData.stackedCargo) {
              const sc = this.loadedCargo.userData.stackedCargo;
              const offY = sc.userData.stackOffsetY || (0.101 + (sc.userData.groundY || 0.5));
              const stackedOffset = new THREE.Vector3(0, offY, 0).applyQuaternion(forkQuat);
              sc.position.copy(targetPos).add(stackedOffset);
              sc.quaternion.copy(forkQuat);
            }
          }
        }
      } else if (this.currentModelId === "soccerbot" || this.currentModelId === "excavator") {
        // SoccerBot Artiküle Tekme Kolu ve Top / Nesne Sürme Mekanizması
        const normAngle = this.robotState.servoAngle / 180; // 0..1
        const targetArmRad = -normAngle * 1.35; // 0 (yerde top sürme) .. -1.35 rad (havada tekme-şut)
        part.rotation.x = THREE.MathUtils.lerp(part.rotation.x, targetArmRad, 0.2);

        if (this.robotGroup) {
          this.robotGroup.updateMatrixWorld(true);
        }

        const forkCarriage = this.activeModelParts.forkCarriage;
        const forkPos = new THREE.Vector3();
        const forkQuat = new THREE.Quaternion();
        if (forkCarriage) {
          forkCarriage.localToWorld(forkPos.set(0, 0, 0.2));
          forkCarriage.getWorldQuaternion(forkQuat);
        }

        // Dinamik Nesne / Top / Kutu Etkileşimi
        if (!this.loadedCargo) {
          // Kol aşağıdayken veya orta yükseklikteyken ön kıskaca giren nesneyi kontrol altına al
          if (forkCarriage) {
            for (const obs of this.obstacles) {
              if (obs && obs.userData && (obs.userData.isCargo || obs.userData.type === "pallet" || obs.userData.type === "cylinder" || obs.userData.type === "ball")) {
                if (obs.userData.parentPallet) continue;

                const d = Math.hypot(obs.position.x - forkPos.x, obs.position.z - forkPos.z);
                const dy = Math.abs(obs.position.y - forkPos.y);
                if (d < 0.95 && dy < 0.85) {
                  this.loadedCargo = obs;
                  this.loadedPallet = obs;
                  if (typeof showToast === "function") {
                    showToast(`${obs.userData.title || "Nesne"} SoccerBot kıskacına alındı.`);
                  }
                  break;
                }
              }
            }
          }
        } else {
          // Nesne kontrol altında:
          // Kol aniden yukarı kalkarsa (normAngle > 0.75), şut çek / fırlat!
          if (normAngle > 0.75) {
            const kickDirX = Math.sin(this.robotState.heading);
            const kickDirZ = Math.cos(this.robotState.heading);
            this.loadedCargo.position.x += kickDirX * 1.8;
            this.loadedCargo.position.z += kickDirZ * 1.8;
            this.loadedCargo.position.y = this.loadedCargo.userData.groundY !== undefined ? this.loadedCargo.userData.groundY : 0.06;
            if (typeof showToast === "function") {
              showToast("Goooool! SoccerBot topu fırlattı.");
            }
            if (typeof confetti === "function") {
              confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
            }
            this.loadedCargo = null;
            this.loadedPallet = null;
          } else if (normAngle <= 0.05) {
            // Kol yere oturduğunda nesneyi zemine serbest bırak
            const groundY = this.loadedCargo.userData.groundY !== undefined ? this.loadedCargo.userData.groundY : 0.06;
            this.loadedCargo.position.y = groundY;
            this.loadedCargo.rotation.set(0, this.robotState.heading, 0);
            if (typeof showToast === "function") {
              showToast(`${this.loadedCargo.userData.title || "Nesne"} zemine bırakıldı.`);
            }
            this.loadedCargo = null;
            this.loadedPallet = null;
          } else if (forkCarriage) {
            // Kolla birlikte tasima / surme
            const targetPos = new THREE.Vector3();
            forkCarriage.localToWorld(targetPos.set(0, 0.05, 0.22));
            this.loadedCargo.position.copy(targetPos);
            this.loadedCargo.quaternion.copy(forkQuat);
          }
        }
      } else if (this.currentModelId === "rover") {
        // Rover Sonar Başlığı: Sağa sola pan yapar!
        const rad = -((this.robotState.servoAngle - 90) * Math.PI) / 180;
        part.rotation.y = THREE.MathUtils.lerp(part.rotation.y, rad, 0.2);
      } else if (this.currentModelId === "truck") {
        // Kamyon Ön Direksiyonu: Servo açısına göre yönlenir!
        const rad = -((this.robotState.servoAngle - 90) * Math.PI) / 180 * 0.45;
        part.rotation.y = THREE.MathUtils.lerp(part.rotation.y, rad, 0.2);
      } else if (this.currentModelId === "kart") {
        // Go-Kart Direksiyonu ve Ön Milleri: Servo açısına göre yönlenir!
        const rad = -((this.robotState.servoAngle - 90) * Math.PI) / 180 * 0.55;
        part.rotation.y = THREE.MathUtils.lerp(part.rotation.y, rad, 0.25);
      }
    }

    // Ultrasonik Mesafe Raycast'i
    this.updateUltrasonicSensor();

    // Çizgi İzleyen Sensörleri Güncelle
    this.updateLineSensors();

    // Takip Kamerası
    if (this.robotState.cameraMode === "chase") {
      const d = 3.6, h = 2.4;
      const camX = this.robotState.x - Math.sin(this.robotState.heading) * d;
      const camZ = this.robotState.z - Math.cos(this.robotState.heading) * d;
      this.camera.position.lerp(new THREE.Vector3(camX, h, camZ), 0.1);
      this.camera.lookAt(this.robotState.x, 0.7, this.robotState.z);
      if (this.controls) this.controls.target.set(this.robotState.x, 0.7, this.robotState.z);
    }
  },

  checkCollision: function(x, z) {
    const r = this.robotState.radius || 0.52;
    // Sınır duvarları
    if (x < -9.5 + r || x > 9.5 - r || z < -9.5 + r || z > 9.5 - r) return true;

    for (const obs of this.obstacles) {
      if (!obs || !obs.position) continue;
      // Taşınmakta olan yükü veya paleti çarpışma kontrolünden hariç tut
      if (obs === this.loadedCargo || obs === this.loadedPallet) continue;
      // Taşınan paletin üzerindeki yükü de hariç tut
      if (this.loadedCargo && this.loadedCargo.userData && this.loadedCargo.userData.stackedCargo === obs) continue;
      if (this.loadedPallet && this.loadedPallet.userData && this.loadedPallet.userData.stackedCargo === obs) continue;

      // Zemin seviyesindeki paletler: Çatalların palete girebilmesi için araç şasisini engellemez
      if (obs.userData && obs.userData.type === "pallet") {
        continue;
      }

      // Uzun sınır duvarlarını bu daire kontrolünden muaf tut
      if (obs.geometry && obs.geometry.parameters && (obs.geometry.parameters.width >= 15 || obs.geometry.parameters.depth >= 15)) {
        continue;
      }
      // Robotun başlangıç noktasındaki nesneleri (varsa) yoksay
      if (Math.abs(obs.position.x) < 0.2 && Math.abs(obs.position.z) < 0.2) continue;

      // Nesne tipine göre gerçekçi çarpışma sınırları
      let obsRadius = 0.45;
      if (obs.userData) {
        if (obs.userData.type === "soda_can") obsRadius = 0.16;
        else if (obs.userData.type === "barrel") obsRadius = 0.38;
        else if (obs.userData.type === "crate") obsRadius = 0.50;
        else if (obs.userData.type === "traffic_cone") obsRadius = 0.22;
        else if (obs.userData.type === "container") {
          // Konteyner kutu çarpışması (Box collision: L=5.6, W=2.4)
          const dx = Math.abs(x - obs.position.x);
          const dz = Math.abs(z - obs.position.z);
          if (dx < 1.30 + r && dz < 2.90 + r) return true;
          continue;
        } else if (obs.userData.type === "dock_ramp") {
          // Rampa ve iskele kutu çarpışması
          const dx = Math.abs(x - obs.position.x);
          const dz = Math.abs(z - obs.position.z);
          if (dx < 1.30 + r && dz < 2.80 + r) return true;
          continue;
        }
      }

      const dist = Math.hypot(x - obs.position.x, z - obs.position.z);
      if (dist < r + obsRadius) return true;
    }
    return false;
  },

  updateUltrasonicSensor: function() {
    // 1. Taşınmakta olan yükleri ve paletleri sensör hedefinden hariç tut
    const targetObstacles = [];
    for (const obs of this.obstacles) {
      if (!obs || !obs.position) continue;
      if (obs === this.loadedCargo || obs === this.loadedPallet) continue;
      if (this.loadedCargo && this.loadedCargo.userData && this.loadedCargo.userData.stackedCargo === obs) continue;
      if (this.loadedPallet && this.loadedPallet.userData && this.loadedPallet.userData.stackedCargo === obs) continue;
      targetObstacles.push(obs);
    }

    if (targetObstacles.length === 0) {
      this.robotState.ultrasonicDistance = 400;
      return;
    }

    // 2. Sensörün robot şasisindeki montaj noktası (Ön tampon hizası)
    const frontOffset = 0.46;
    const heading = this.robotState.heading;

    // Yalnızca Rover modelinde servo 1 radar başlığını sağa/sola pan yapar
    let panAngle = 0;
    if (this.currentModelId === "rover") {
      panAngle = -((this.robotState.servoAngle - 90) * Math.PI) / 180;
    }
    const netAngle = heading + panAngle;

    const sensorBaseX = this.robotState.x + Math.sin(heading) * frontOffset;
    const sensorBaseZ = this.robotState.z + Math.cos(heading) * frontOffset;

    // 3. Gerçekçi ultrasonik ses konisi (Alçak paletler, zemin kutuları, variller ve duvarlar için çoklu ışın)
    const rayConfigs = [
      // Merkez yatay ışın
      { y: 0.28, yawOffset: 0, pitch: 0 },
      // Alçak zemin ışını (0.14m yükseklikteki paletleri ve zemin kutularını yakalar)
      { y: 0.16, yawOffset: 0, pitch: -0.04 },
      // Üst seviye ışın (variller, konteynerler ve kargo sandıkları için)
      { y: 0.45, yawOffset: 0, pitch: 0.03 },
      // Sol koni açısı (-9 derece)
      { y: 0.28, yawOffset: -0.16, pitch: 0 },
      // Sağ koni açısı (+9 derece)
      { y: 0.28, yawOffset: 0.16, pitch: 0 }
    ];

    let minDistanceMeters = 4.0; // Maksimum 400 cm

    for (const cfg of rayConfigs) {
      const origin = new THREE.Vector3(sensorBaseX, cfg.y, sensorBaseZ);
      const angle = netAngle + cfg.yawOffset;
      const cosPitch = Math.cos(cfg.pitch);
      const dir = new THREE.Vector3(
        Math.sin(angle) * cosPitch,
        Math.sin(cfg.pitch),
        Math.cos(angle) * cosPitch
      ).normalize();

      this.raycaster.set(origin, dir);
      this.raycaster.far = 4.0;

      const hits = this.raycaster.intersectObjects(targetObstacles, true);
      if (hits.length > 0) {
        if (hits[0].distance < minDistanceMeters) {
          minDistanceMeters = hits[0].distance;
        }
      }
    }

    this.robotState.ultrasonicDistance = Math.min(400, Math.max(2, Math.round(minDistanceMeters * 100)));
  },

  updateLineSensors: function() {
    if (this.currentArena !== "line_track" || !this.lineContext) {
      this.robotState.leftLineDetected = false;
      this.robotState.rightLineDetected = false;
      return;
    }

    const heading = this.robotState.heading;
    const frontOffset = 0.7;
    const sideOffset = 0.28;

    const lx = this.robotState.x + Math.sin(heading) * frontOffset - Math.cos(heading) * sideOffset;
    const lz = this.robotState.z + Math.cos(heading) * frontOffset + Math.sin(heading) * sideOffset;

    const rx = this.robotState.x + Math.sin(heading) * frontOffset + Math.cos(heading) * sideOffset;
    const rz = this.robotState.z + Math.cos(heading) * frontOffset - Math.sin(heading) * sideOffset;

    const toCanvas = (x, z) => {
      const u = (x + 11) / 22;
      const v = (z + 11) / 22;
      return [Math.floor(u * 1024), Math.floor(v * 1024)];
    };

    const isBlack = (px, py) => {
      if (px < 0 || px >= 1024 || py < 0 || py >= 1024) return false;
      try {
        const p = this.lineContext.getImageData(px, py, 1, 1).data;
        return (p[0] + p[1] + p[2]) / 3 < 80;
      } catch (e) {
        return false;
      }
    };

    const [lpx, lpz] = toCanvas(lx, lz);
    const [rpx, rpz] = toCanvas(rx, rz);

    this.robotState.leftLineDetected = isBlack(lpx, lpz);
    this.robotState.rightLineDetected = isBlack(rpx, rpz);
  },

  setupEventListeners: function() {
    window.addEventListener("resize", () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    const dom = this.renderer.domElement;

    // Nesneler fare ile kontrol edilmez; fare yalnızca sahne kamerası (OrbitControls) için kullanılır.
    // STL Sürükle - Bırak (Drag & Drop) Dinleyicisi
    dom.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    dom.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.name.toLowerCase().endsWith(".stl")) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              this.loadStlMeshFromBuffer(ev.target.result, file.name);
            };
            reader.readAsArrayBuffer(file);
          }
        }
      }
    });
  },

  // STL DOSYASI YÜKLEME VE İŞLEME (MakerWorld & K-12 Model Entegrasyonu)
  loadStlMeshFromBuffer: function(buffer, filename) {
    if (typeof THREE.STLLoader === "undefined") {
      console.warn("STLLoader kütüphanesi yüklenemedi.");
      return;
    }
    try {
      const loader = new THREE.STLLoader();
      const geometry = loader.parse(buffer);
      geometry.computeVertexNormals();
      geometry.center();

      // Boyut analizi (mm -> metre ölçekleme)
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox;
      const sizeX = bbox.max.x - bbox.min.x;
      const sizeY = bbox.max.y - bbox.min.y;
      const sizeZ = bbox.max.z - bbox.min.z;
      const maxDim = Math.max(sizeX, sizeY, sizeZ);

      // Standart simülasyon boyutuna normalize et (1.2m max)
      let scaleFactor = 1.0;
      if (maxDim > 10) {
        scaleFactor = 1.2 / maxDim;
      }

      // Bambu Lab PLA Kalitesinde PBR Materyal
      const filamentColors = [0xf59e0b, 0x00ae42, 0xef4444, 0x3b82f6, 0x64748b, 0x1e293b];
      const color = filamentColors[Math.floor(Math.random() * filamentColors.length)];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.35,
        metalness: 0.15
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Nesneyi robotun hemen önüne veya sahne merkezine yerleştir
      mesh.position.set(this.robotState.x, (sizeY * scaleFactor) / 2 + 0.05, this.robotState.z + 2.2);
      mesh.userData = { isDraggable: true, filename: filename, type: "stl_model" };

      this.scene.add(mesh);
      this.obstacles.push(mesh);

      if (typeof showToast === "function") {
        showToast(`STL Yüklendi: ${filename}`);
      }
      return mesh;
    } catch (e) {
      console.error("STL parse hatası:", e);
    }
  },

  handleStlFileUpload: function(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith(".stl")) continue;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.loadStlMeshFromBuffer(e.target.result, file.name);
      };
      reader.readAsArrayBuffer(file);
    }
    event.target.value = "";
  },

  animate: function() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.updatePhysics(dt);
    if (this.controls && this.robotState.cameraMode === "orbit") {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  }
};

if (typeof window !== "undefined") {
  window.CyberBrickSimulation = CyberBrickSimulation;
}
