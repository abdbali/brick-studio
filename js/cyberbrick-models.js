/**
 * CyberBrick EÄŸitim ve GeliÅŸtirme StÃ¼dyosu
 * MakerWorld Koleksiyonu Resmi 3D Model KÃ¼tÃ¼phanesi & Geometri Ãœreticisi
 * 
 * Referans: MakerWorld CyberBrick Compatible Models & Accessories
 * Modeller: Forklift, EkskavatÃ¶r, Kamyon, Go-Kart, Otonom Rover
 */

const CyberBrickModels = {
  currentModelId: "forklift", // "forklift", "excavator", "truck", "kart", "rover"

  // MakerWorld Koleksiyonundaki Resmi Modellerin VeritabanÄ±
  catalog: [
    {
      id: "forklift",
      name: "BrickForklift (Forklift & Flatbed)",
      subtitle: "Bambu Lab & MakerWorld Amiral Gemisi",
      creator: "MakerWorld Official",
      category: "Lojistik & Depo",
      icon: "fa-dolly",
      color: "#f59e0b", // SarÄ±
      badge: "Ã–NERÄ°LEN",
      description: "Ã‡atallarÄ± yukarÄ±-aÅŸaÄŸÄ± hareket edebilen, palet ve boru taÅŸÄ±yabilen profesyonel depo forklifti.",
      specs: {
        filament: "Bambu PLA Basic / SarÄ± & Siyah",
        weight: "115g",
        printTime: "2 sa 40 dk",
        servos: "1x 9g Servo (Ã‡atal KaldÄ±rma)",
        motors: "2x N20 DC DiÅŸli Motor (Ã‡ekiÅŸ)"
      },
      mechanisms: ["Dikey Ã‡atal KaldÄ±rma", "Palet TaÅŸÄ±ma", "Diferansiyel DÃ¶nÃ¼ÅŸ"]
    },
    {
      id: "soccerbot",
      name: "SoccerBot (Robotik Futbolcu)",
      subtitle: "Bambu Lab & MakerWorld Kicking Bot",
      creator: "MakerWorld Official",
      category: "Spor & Robotik",
      icon: "fa-futbol",
      color: "#f497a7", // Sakura Pembe
      badge: "TEKME & SUT",
      description: "Sakura pembe ve beyaz govdeli, 4 tirnakli tekerlekli, hareketli tekme ve top surme koluna sahip robotik futbolcu.",
      specs: {
        filament: "Bambu PLA Matte / Sakura Pembe, Beyaz & Karbon Siyah",
        weight: "108g",
        printTime: "2 sa 20 dk",
        servos: "1x 9g Metal Disli Servo (Tekme & Sut Kolu)",
        motors: "2x N20 DC Disli Motor (Cift Ceker Surus)"
      },
      mechanisms: ["Artikule Tekme Kolu", "C-Tipi Top Tutucu & Surme", "Yuksek Torklu 4 Tekerlek"]
    },
    {
      id: "truck",
      name: "BrickTruck (MakerWorld Kei-Kamyon)",
      subtitle: "Kompakt Nakliye & Santiye Kamyoneti",
      creator: "MakerWorld Community",
      category: "Kargo & Nakliye",
      icon: "fa-truck",
      color: "#f6c445", // Bambu PLA Matte Sicak Sari
      badge: "KASALI & BORULU",
      description: "Sari kabinli, siyah alt govdeli, 4 tekerlekli ve kasasinda 3 adet sanayi borusu tasiyan 3D baski Kei-Truck kamyonet.",
      specs: {
        filament: "Bambu PLA Matte / Sari, Siyah & Gri",
        weight: "112g",
        printTime: "2 sa 15 dk",
        servos: "1x 9g Servo (On Direksiyon)",
        motors: "1x N20 DC Arka Cekis Motoru"
      },
      mechanisms: ["Kargo Kasasi & 3 Boru Yuku", "On Direksiyon Acisi"]
    }
  ],

  // 3D Model Insa Fonksiyonlari (Three.js Nesneleri)
  buildModel: function(modelId, parentGroup) {
    // Eski alt nesneleri temizle
    while (parentGroup.children.length > 0) {
      parentGroup.remove(parentGroup.children[0]);
    }

    const dynamicParts = {
      leftWheel: null,
      rightWheel: null,
      extraWheels: [],
      servoPart: null, // Forklift catallari, tekme kolu veya on direksiyon
      forkCarriage: null,
      statusLed: null,
      cargoObject: null
    };

    if (modelId === "forklift") {
      this.buildForkliftGeometry(parentGroup, dynamicParts);
    } else if (modelId === "soccerbot" || modelId === "excavator") {
      this.buildSoccerBotGeometry(parentGroup, dynamicParts);
    } else if (modelId === "truck") {
      this.buildTruckGeometry(parentGroup, dynamicParts);
    } else {
      this.buildForkliftGeometry(parentGroup, dynamicParts);
    }

    return dynamicParts;
  },

  // 1. FORKLIFT (FOTOÄžRAFTAKÄ° BÄ°REBÄ°R MAKERWORLD MODELÄ°: TANK PALETLÄ°, Ã‡Ä°FT DÄ°ÅžLÄ° MAKARALI, BAMBU SARISI)
  buildForkliftGeometry: function(group, parts) {
    // FotoÄŸraftaki gerÃ§ek Bambu Lab PLA & PBR standartlarÄ±nda materyaller
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Bambu SarÄ±sÄ± GÃ¶vde
      roughness: 0.30,
      metalness: 0.06
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Mat Karbon SiyahÄ±
      roughness: 0.65,
      metalness: 0.15
    });
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // Derin Siyah TÄ±rtÄ±l Palet KauÃ§uÄŸu
      roughness: 0.90,
      metalness: 0.05
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x27272a, // Koyu Gri Jant ve DiÅŸli
      roughness: 0.45,
      metalness: 0.35
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Ä°ÅŸlenmiÅŸ Ã‡elik (Ã‡atal & AsansÃ¶r RaylarÄ±)
      metalness: 0.85,
      roughness: 0.25
    });
    const boltSilverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Parlak Paslanmaz M2.5 Vida BaÅŸlarÄ±
      metalness: 0.95,
      roughness: 0.15
    });
    const headlightLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xe2e8f0,
      emissiveIntensity: 0.4
    });
    const wireOrange = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const wireRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const wireBrown = new THREE.MeshBasicMaterial({ color: 0x78350f });

    // A. ALT Ã‡ELÄ°K ÅžASÄ°
    const baseChassis = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 1.25), darkMat);
    baseChassis.position.set(0, 0.26, -0.05);
    baseChassis.castShadow = true;
    group.add(baseChassis);

    // B. SOL VE SAÄž TIRTIL PALET SÄ°STEMÄ° (FotoÄŸraftaki Tank Tipi Paletler)
    const createTrackSide = (sideX) => {
      const trackGroup = new THREE.Group();
      trackGroup.position.set(sideX, 0, 0);

      // Palet Yan Sac KorumasÄ±
      const sidePlate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.40, 1.05), darkMat);
      sidePlate.position.set(0, 0.28, 0);
      sidePlate.castShadow = true;
      trackGroup.add(sidePlate);

      // 1. Ã–n DiÅŸli Ã‡ark (BÃ¼yÃ¼k Ã–n Tekerlek)
      const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 24);
      wheelGeo.rotateZ(Math.PI / 2);
      const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
      frontWheel.position.set(0, 0.26, 0.36);
      frontWheel.castShadow = true;
      trackGroup.add(frontWheel);

      // Ã–n Jant GÃ¶beÄŸi & Vida
      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.20, 16);
      hubGeo.rotateZ(Math.PI / 2);
      const frontHub = new THREE.Mesh(hubGeo, darkMat);
      frontHub.position.set(0, 0.26, 0.36);
      trackGroup.add(frontHub);

      const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.21, 6);
      boltGeo.rotateZ(Math.PI / 2);
      const frontBolt = new THREE.Mesh(boltGeo, boltSilverMat);
      frontBolt.position.set(0, 0.26, 0.36);
      trackGroup.add(frontBolt);

      // 2. Arka DiÅŸli Ã‡ark (BÃ¼yÃ¼k Arka Tekerlek)
      const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
      rearWheel.position.set(0, 0.26, -0.36);
      rearWheel.castShadow = true;
      trackGroup.add(rearWheel);

      const rearHub = new THREE.Mesh(hubGeo, darkMat);
      rearHub.position.set(0, 0.26, -0.36);
      trackGroup.add(rearHub);

      const rearBolt = new THREE.Mesh(boltGeo, boltSilverMat);
      rearBolt.position.set(0, 0.26, -0.36);
      trackGroup.add(rearBolt);

      // 3. Orta KÄ±lavuz MakaralarÄ±
      const rollerGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.18, 16);
      rollerGeo.rotateZ(Math.PI / 2);
      const roller1 = new THREE.Mesh(rollerGeo, darkMat);
      roller1.position.set(0, 0.14, -0.11);
      trackGroup.add(roller1);
      const roller2 = new THREE.Mesh(rollerGeo, darkMat);
      roller2.position.set(0, 0.14, 0.11);
      trackGroup.add(roller2);

      // 4. KauÃ§uk TÄ±rtÄ±l Palet BandÄ±
      const topBelt = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.76), trackMat);
      topBelt.position.set(0, 0.50, 0);
      topBelt.castShadow = true;
      trackGroup.add(topBelt);

      const bottomBelt = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.04, 0.76), trackMat);
      bottomBelt.position.set(0, 0.02, 0);
      bottomBelt.castShadow = true;
      trackGroup.add(bottomBelt);

      const noseGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.20, 16, 1, false, 0, Math.PI);
      noseGeo.rotateZ(Math.PI / 2);
      const frontNose = new THREE.Mesh(noseGeo, trackMat);
      frontNose.position.set(0, 0.26, 0.36);
      frontNose.rotation.x = -Math.PI / 2;
      trackGroup.add(frontNose);

      const rearNose = new THREE.Mesh(noseGeo, trackMat);
      rearNose.position.set(0, 0.26, -0.36);
      rearNose.rotation.x = Math.PI / 2;
      trackGroup.add(rearNose);

      // 5. Palet Ãœzerindeki 3D DiÅŸler / TÄ±rnaklar
      const lugGeo = new THREE.BoxGeometry(0.21, 0.03, 0.04);
      for (let z = -0.36; z <= 0.36; z += 0.08) {
        const topLug = new THREE.Mesh(lugGeo, trackMat);
        topLug.position.set(0, 0.52, z);
        trackGroup.add(topLug);

        const btmLug = new THREE.Mesh(lugGeo, trackMat);
        btmLug.position.set(0, 0.005, z);
        trackGroup.add(btmLug);
      }

      group.add(trackGroup);
      return frontWheel;
    };

    parts.leftWheel = createTrackSide(-0.62);
    parts.rightWheel = createTrackSide(0.62);

    // C. ARKA BAMBU SARISI MOTOR KAPUTU & KARÅžI AÄžIRLIK (FotoÄŸraftaki kavisli gÃ¶vde)
    const hoodGroup = new THREE.Group();
    hoodGroup.position.set(0, 0.36, -0.32);

    // Ana SarÄ± Kaput
    const hoodBody = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.48, 0.74), yellowMat);
    hoodBody.position.set(0, 0.24, 0);
    hoodBody.castShadow = true;
    hoodGroup.add(hoodBody);

    // Arka Kavisli KarÅŸÄ± AÄŸÄ±rlÄ±k YÃ¼zeyi
    const counterweightGeo = new THREE.CylinderGeometry(0.50, 0.50, 0.48, 20, 1, false, 0, Math.PI);
    counterweightGeo.rotateY(Math.PI / 2);
    const counterweight = new THREE.Mesh(counterweightGeo, yellowMat);
    counterweight.position.set(0, 0.24, -0.37);
    counterweight.scale.set(1.02, 1, 0.65);
    counterweight.castShadow = true;
    hoodGroup.add(counterweight);

    // Alt Siyah Tampon / AÄŸÄ±rlÄ±k DÃ¶kÃ¼mÃ¼
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.18, 0.32), darkMat);
    rearBumper.position.set(0, 0.06, -0.42);
    rearBumper.castShadow = true;
    hoodGroup.add(rearBumper);

    // Ãœst HavalandÄ±rma Ã‡izgileri
    const ventGeo = new THREE.BoxGeometry(0.55, 0.02, 0.04);
    for (let vz = -0.15; vz <= 0.15; vz += 0.08) {
      const vent = new THREE.Mesh(ventGeo, darkMat);
      vent.position.set(0, 0.485, vz);
      hoodGroup.add(vent);
    }
    group.add(hoodGroup);

    // D. SÄ°YAH OPERATÃ–R KABÄ°NÄ° & ROLL-CAGE (FotoÄŸraftaki Koruma Kafesi)
    const cageGroup = new THREE.Group();
    const cageBarMat = darkMat;

    const createPillar = (x1, y1, z1, x2, y2, z2, radius = 0.038) => {
      const p1 = new THREE.Vector3(x1, y1, z1);
      const p2 = new THREE.Vector3(x2, y2, z2);
      const dist = p1.distanceTo(p2);
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dist, 12), cageBarMat);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      cyl.position.copy(mid);
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
      cyl.castShadow = true;
      cageGroup.add(cyl);
    };

    // Sol & SaÄŸ AÃ§Ä±lÄ± Ã–n SÃ¼tunlar
    createPillar(-0.48, 0.48, 0.22, -0.44, 1.28, 0.12);
    createPillar(0.48, 0.48, 0.22, 0.44, 1.28, 0.12);

    // Sol & SaÄŸ Arka SÃ¼tunlar
    createPillar(-0.44, 1.28, -0.40, -0.46, 0.60, -0.42);
    createPillar(0.44, 1.28, -0.40, 0.46, 0.60, -0.42);

    // Tavan Yan BoylamalarÄ±
    createPillar(-0.44, 1.28, 0.12, -0.44, 1.28, -0.40);
    createPillar(0.44, 1.28, 0.12, 0.44, 1.28, -0.40);

    // Tavan Enlemesine KiriÅŸler
    createPillar(-0.44, 1.28, 0.12, 0.44, 1.28, 0.12);
    createPillar(-0.44, 1.28, -0.40, 0.44, 1.28, -0.40);

    // Tavan Koruma IzgarasÄ± (Slatted Roof)
    for (let rz = -0.28; rz <= -0.02; rz += 0.12) {
      createPillar(-0.44, 1.28, rz, 0.44, 1.28, rz, 0.025);
    }

    // FOTOÄžRAFTAKÄ° YUVARLAK Ã–N FARLAR (Headlights)
    const createHeadlight = (x) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0.72, 0.24);

      const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), darkMat);
      housing.rotateX(Math.PI / 2);
      housing.castShadow = true;
      lamp.add(housing);

      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.072, 16), headlightLensMat);
      lens.position.set(0, 0, 0.032);
      lamp.add(lens);

      cageGroup.add(lamp);
    };
    createHeadlight(-0.52);
    createHeadlight(0.52);

    // OperatÃ¶r KoltuÄŸu
    const seatGroup = new THREE.Group();
    seatGroup.position.set(0, 0.60, -0.16);
    const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.42), darkMat);
    seatBase.castShadow = true;
    seatGroup.add(seatBase);
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.10), darkMat);
    seatBack.position.set(0, 0.24, -0.16);
    seatBack.rotation.x = -0.15;
    seatBack.castShadow = true;
    seatGroup.add(seatBack);
    cageGroup.add(seatGroup);

    // Ã–n GÃ¶sterge Konsolu
    const dashboard = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.22, 0.14), darkMat);
    dashboard.position.set(0, 0.68, 0.18);
    dashboard.rotation.x = -0.3;
    cageGroup.add(dashboard);

    group.add(cageGroup);

    // E. DÄ°KEY ASANSÃ–R KULESÄ° (MAST - FotoÄŸraftaki Ã§ift diÅŸli makaralÄ± sistem)
    const mastGroup = new THREE.Group();
    mastGroup.position.set(0, 0, 0.52);

    const mastHeight = 1.62;
    const mastLeft = new THREE.Mesh(new THREE.BoxGeometry(0.09, mastHeight, 0.10), darkMat);
    mastLeft.position.set(-0.31, mastHeight / 2 + 0.05, 0);
    mastLeft.castShadow = true;
    mastGroup.add(mastLeft);

    const mastRight = new THREE.Mesh(new THREE.BoxGeometry(0.09, mastHeight, 0.10), darkMat);
    mastRight.position.set(0.31, mastHeight / 2 + 0.05, 0);
    mastRight.castShadow = true;
    mastGroup.add(mastRight);

    // Ä°Ã§ Metalik Ray KanallarÄ±
    const innerRailL = new THREE.Mesh(new THREE.BoxGeometry(0.02, mastHeight - 0.1, 0.06), steelMat);
    innerRailL.position.set(-0.27, mastHeight / 2 + 0.05, 0);
    mastGroup.add(innerRailL);
    const innerRailR = new THREE.Mesh(new THREE.BoxGeometry(0.02, mastHeight - 0.1, 0.06), steelMat);
    innerRailR.position.set(0.27, mastHeight / 2 + 0.05, 0);
    mastGroup.add(innerRailR);

    // Ãœst Yatay KiriÅŸ
    const topCross = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.12, 0.11), darkMat);
    topCross.position.set(0, mastHeight + 0.02, 0);
    topCross.castShadow = true;
    mastGroup.add(topCross);

    // FOTOÄžRAFTAKÄ° Ä°KÄ° ADET DÄ°ÅžLÄ° MAKARA (Top Interlocking Spur Gears)
    const createSpurGear = (gx, gy, gz) => {
      const gear = new THREE.Group();
      gear.position.set(gx, gy, gz);

      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.045, 20), darkMat);
      core.rotateX(Math.PI / 2);
      core.castShadow = true;
      gear.add(core);

      const toothGeo = new THREE.BoxGeometry(0.025, 0.035, 0.045);
      for (let t = 0; t < 14; t++) {
        const ang = (t / 14) * Math.PI * 2;
        const tooth = new THREE.Mesh(toothGeo, darkMat);
        tooth.position.set(Math.cos(ang) * 0.095, Math.sin(ang) * 0.095, 0);
        tooth.rotation.z = ang;
        gear.add(tooth);
      }

      // Merkezde GÃ¶rÃ¼nen Parlak M2.5 Paslanmaz Vida BaÅŸlÄ±ÄŸÄ± (Hex Bolt)
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.052, 6), boltSilverMat);
      bolt.rotateX(Math.PI / 2);
      gear.add(bolt);

      mastGroup.add(gear);
    };

    createSpurGear(-0.085, mastHeight - 0.08, 0.06);
    createSpurGear(0.085, mastHeight - 0.08, 0.06);

    // Kule Boyunca Ä°nen Servo Ribbon Kablosu (Turuncu - KÄ±rmÄ±zÄ± - Kahverengi)
    const wireGeo = new THREE.CylinderGeometry(0.007, 0.007, 1.25, 6);
    const w1 = new THREE.Mesh(wireGeo, wireOrange); w1.position.set(-0.24, 0.95, 0.035); mastGroup.add(w1);
    const w2 = new THREE.Mesh(wireGeo, wireRed);    w2.position.set(-0.255, 0.95, 0.035); mastGroup.add(w2);
    const w3 = new THREE.Mesh(wireGeo, wireBrown);  w3.position.set(-0.27, 0.95, 0.035); mastGroup.add(w3);

    // Ã‡elik KaldÄ±rma Teli
    const cableGeo = new THREE.CylinderGeometry(0.006, 0.006, 1.35, 6);
    const liftCable = new THREE.Mesh(cableGeo, steelMat);
    liftCable.position.set(0, 0.92, 0.075);
    mastGroup.add(liftCable);

    group.add(mastGroup);

    // F. HAREKETLÄ° Ã‡ATAL TAÅžIYICI & Ã‡ATALLAR (Servo 1 ile yukarÄ± aÅŸaÄŸÄ± kalkan grup)
    const forkCarriage = new THREE.Group();
    forkCarriage.position.set(0, 0.06, 0.58); // BaÅŸlangÄ±Ã§ta tam zemin seviyesinde

    // Dikey TaÅŸÄ±yÄ±cÄ± Plaka
    const carriageBack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.04), darkMat);
    carriageBack.position.set(0, 0.22, 0);
    carriageBack.castShadow = true;
    forkCarriage.add(carriageBack);

    // Orta GÃ¶rÃ¼ÅŸ BoÅŸluklarÄ±
    const windowBorderL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.30, 0.045), steelMat);
    windowBorderL.position.set(-0.11, 0.22, 0);
    forkCarriage.add(windowBorderL);
    const windowBorderR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.30, 0.045), steelMat);
    windowBorderR.position.set(0.11, 0.22, 0);
    forkCarriage.add(windowBorderR);

    // L-BÄ°Ã‡Ä°MLÄ° SAÄž VE SOL Ã‡ATALLAR (FotoÄŸraftaki sivriltilmiÅŸ kalÄ±n Ã§atallar!)
    const createForkBlade = (fx) => {
      const fork = new THREE.Group();
      fork.position.set(fx, 0, 0);

      // Dikey GÃ¶vde
      const shank = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.44, 0.035), darkMat);
      shank.position.set(0, 0.22, 0.035);
      shank.castShadow = true;
      fork.add(shank);

      // Yatay Ä°leri Uzanan Ã‡atal BÄ±Ã§aÄŸÄ±
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.032, 0.85), darkMat);
      blade.position.set(0, 0.016, 0.45);
      blade.castShadow = true;
      fork.add(blade);

      // Ã–n SivriltilmiÅŸ PabuÃ§ Ucu (Palet altÄ±na rahatÃ§a giren kavisli uÃ§)
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.018, 0.15), darkMat);
      tip.position.set(0, 0.010, 0.92);
      tip.rotation.x = -0.15;
      tip.castShadow = true;
      fork.add(tip);

      return fork;
    };

    forkCarriage.add(createForkBlade(-0.21));
    forkCarriage.add(createForkBlade(0.21));

    group.add(forkCarriage);
    parts.servoPart = forkCarriage; // Servo ile dikey hareket eden nesne

    // G. CYBERBRICK CORE BOARD & DURUM RGB LED'Ä° (Kabinin arkasÄ±nda)
    this.addCoreBoardToModel(group, 0, 0.72, -0.62, parts);
  },

  // 2. SOCCERBOT MODELÄ° (FOTOÄžRAFTAKÄ° BÄ°REBÄ°R KOLLU FUTBOL ROBOTU: SAKURA PEMBE, BEYAZ VE SÄ°YAH)
  buildSoccerBotGeometry: function(group, parts) {
    // A. GERÃ‡EKÃ‡Ä° BAMBU LAB MATTE PLA VE PBR MATERYALLERÄ°
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xf497a7, // Bambu PLA Matte Sakura Pembe
      roughness: 0.36,
      metalness: 0.04
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Bambu PLA Matte Saf Beyaz
      roughness: 0.35,
      metalness: 0.02
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Bambu PLA Matte Karbon SiyahÄ±
      roughness: 0.65,
      metalness: 0.10
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x121214, // Derin Siyah TÄ±rtÄ±klÄ± KauÃ§uk Lastik
      roughness: 0.88,
      metalness: 0.05
    });
    const screwMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Paslanmaz Ã‡elik M3 Hex Civatalar
      metalness: 0.95,
      roughness: 0.15
    });

    // B. ALT ÅžASÄ° KATMANLARI (3 KATMAN: SÄ°YAH ALT ÅžASÄ°, BEYAZ ARA GÃ–VDE, SÄ°YAH ARKA KULE)
    const chassisGroup = new THREE.Group();

    // 1. Siyah Alt Åžasi (Black Lower Chassis)
    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.22, 0.76), blackMat);
    lowerChassis.position.set(0, 0.20, -0.02);
    lowerChassis.castShadow = true;
    chassisGroup.add(lowerChassis);

    // Ã–n EÄŸimli Burun PlakasÄ±
    const nosePlate = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.14, 0.12), blackMat);
    nosePlate.position.set(0, 0.18, 0.38);
    chassisGroup.add(nosePlate);

    // 2. Beyaz Ara GÃ¶vde BloÄŸu (White Bevelled Collar / Spacer Block)
    const whiteCollar = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.16, 0.78), whiteMat);
    whiteCollar.position.set(0, 0.37, -0.02);
    whiteCollar.castShadow = true;
    chassisGroup.add(whiteCollar);

    // Beyaz gÃ¶vdenin Ã¶n sol ve saÄŸ 45 derece pahlÄ± kÃ¶ÅŸeleri (FotoÄŸraftaki detay)
    [-0.38, 0.38].forEach(cx => {
      const chamfer = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), whiteMat);
      chamfer.position.set(cx, 0.37, 0.37);
      chamfer.rotation.y = Math.PI / 4;
      chassisGroup.add(chamfer);
    });

    // 3. Arka Siyah Dikey Kule / SÄ±rtlÄ±k (Black Electronics & Battery Tower)
    const rearTower = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.62, 0.20), blackMat);
    rearTower.position.set(0, 0.58, -0.34);
    rearTower.castShadow = true;
    chassisGroup.add(rearTower);

    // SÄ±rtlÄ±k Ã¼st kÃ¶ÅŸe pahlarÄ±
    [-0.34, 0.34].forEach(tx => {
      const topChamfer = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.20), blackMat);
      topChamfer.position.set(tx, 0.86, -0.34);
      topChamfer.rotation.z = Math.PI / 4;
      chassisGroup.add(topChamfer);
    });

    group.add(chassisGroup);

    // C. PEMBE MEKANÄ°ZMA KULESÄ° VE ÃœST H-KÃ–PRÃœSÃœ (PINK TOWERS & H-PLATE)
    const towerGroup = new THREE.Group();

    // Sol ve SaÄŸ Pembe Yan Kule Direkleri
    [-0.24, 0.24].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.46, 0.54), pinkMat);
      pillar.position.set(px, 0.66, 0.04);
      pillar.castShadow = true;
      towerGroup.add(pillar);

      // Kule YanÄ±ndaki Dairesel Rulman / Mafsal YuvasÄ± (FotoÄŸraftaki yuvarlak detay)
      const bearingHole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16), blackMat);
      bearingHole.rotateZ(Math.PI / 2);
      bearingHole.position.set(px > 0 ? 0.335 : -0.335, 0.72, 0.06);
      towerGroup.add(bearingHole);
    });

    // Ãœst Pembe H-KÃ¶prÃ¼sÃ¼ (Top Pink H-Plate)
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.05, 0.48), pinkMat);
    topPlate.position.set(0, 0.89, 0.04);
    topPlate.castShadow = true;
    towerGroup.add(topPlate);

    // Ãœst Plaka KÃ¶ÅŸe Paslanmaz Ã‡elik M3 Civata BaÅŸlarÄ± (FotoÄŸrafta gÃ¶rÃ¼len 4 vida)
    [-0.26, 0.26].forEach(sx => {
      [-0.14, 0.14].forEach(sz => {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 12), screwMat);
        screw.position.set(sx, 0.92, 0.04 + sz);
        towerGroup.add(screw);
      });
    });

    group.add(towerGroup);

    // D. 4 ADET PEMBE JANTLI VE DERÄ°N DÄ°ÅžLÄ° KAUÃ‡UK LASTÄ°KLÄ° TEKERLEK (PINK-RIM WHEELS)
    const createSoccerWheel = () => {
      const wheel = new THREE.Group();

      // KalÄ±n TÄ±rtÄ±klÄ± Siyah Lastik
      const tireGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.11, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheel.add(tire);

      // 10 Adet Belirgin DÄ±ÅŸ DiÅŸ BloklarÄ± (Lug Cleats)
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI * 2) / 10;
        const cleat = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.11), tireMat);
        cleat.position.set(0, Math.sin(angle) * 0.175, Math.cos(angle) * 0.175);
        cleat.rotation.x = angle;
        wheel.add(cleat);
      }

      // Pembe Jant GÃ¶beÄŸi (Sakura Pink Rim)
      const rimGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.116, 20);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, pinkMat);
      wheel.add(rim);

      // Ã‡Ä±kÄ±ntÄ±lÄ± Pembe Orta GÃ¶bek KapaÄŸÄ±
      const hubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.126, 16);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, pinkMat);
      wheel.add(hub);

      // DÄ±ÅŸ YÃ¼zey SoÄŸutma / TasarÄ±m KanallarÄ± (FotoÄŸraftaki delikler)
      for (let s = 0; s < 6; s++) {
        const sAngle = (s * Math.PI * 2) / 6;
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.035), blackMat);
        slot.position.set(0.059, Math.sin(sAngle) * 0.09, Math.cos(sAngle) * 0.09);
        wheel.add(slot);

        const slotL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.035), blackMat);
        slotL.position.set(-0.059, Math.sin(sAngle) * 0.09, Math.cos(sAngle) * 0.09);
        wheel.add(slotL);
      }

      return wheel;
    };

    // 4 TekerleÄŸin KonumlandÄ±rÄ±lmasÄ±
    const fLWheel = createSoccerWheel(); fLWheel.position.set(-0.43, 0.17, 0.26); group.add(fLWheel);
    const fRWheel = createSoccerWheel(); fRWheel.position.set(0.43, 0.17, 0.26); group.add(fRWheel);
    const rLWheel = createSoccerWheel(); rLWheel.position.set(-0.43, 0.17, -0.26); group.add(rLWheel);
    const rRWheel = createSoccerWheel(); rRWheel.position.set(0.43, 0.17, -0.26); group.add(rRWheel);

    parts.leftWheel = fLWheel;
    parts.rightWheel = fRWheel;
    parts.extraWheels = [
      { mesh: rLWheel, isLeft: true },
      { mesh: rRWheel, isLeft: false }
    ];

    // E. HAREKETLÄ° PEMBE VURUÅž VE TOP YAKALAMA KOLU (ARTICULATED KICKER & BALL GRIPPER)
    // Mafsal dÃ¶nÃ¼ÅŸ noktasÄ±: (0, 0.72, 0.06)
    const armGroup = new THREE.Group();
    armGroup.position.set(0, 0.72, 0.06);

    // 1. Merkez Servo Makara / Silindir GÃ¶beÄŸi (Pink Winch/Actuator Drum)
    const drumGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.22, 24);
    drumGeo.rotateZ(Math.PI / 2);
    const drum = new THREE.Mesh(drumGeo, pinkMat);
    drum.castShadow = true;
    armGroup.add(drum);

    // 2. Ana Ä°leri ve AÅŸaÄŸÄ± Ä°nen TaÅŸÄ±yÄ±cÄ± Kol KiriÅŸi (Main Angled Forward Arm)
    const armBeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.72), pinkMat);
    armBeam.position.set(0, -0.24, 0.32);
    armBeam.rotation.x = -0.58; // AÅŸaÄŸÄ± ve ileri doÄŸru eÄŸimli
    armBeam.castShadow = true;
    armGroup.add(armBeam);

    // 3. Bilek MafsalÄ± ve Paslanmaz Ã‡elik Civata BaÄŸlantÄ±sÄ± (FotoÄŸraftaki vida)
    const wristScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.05, 12), screwMat);
    wristScrew.position.set(0, -0.46, 0.58);
    armGroup.add(wristScrew);

    // 4. C-ÅžEKÄ°LLÄ° TOP YAKALAMA VE VURUÅž KISKACI (C-SHAPED BALL SCOOP & KICKING FORK)
    const forkGroup = new THREE.Group();
    forkGroup.position.set(0, -0.50, 0.60);

    // Arka Enlemesine KiriÅŸ
    const forkCross = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.06), pinkMat);
    forkCross.position.set(0, 0, 0.03);
    forkCross.castShadow = true;
    forkGroup.add(forkCross);

    // Sol ve SaÄŸ Ä°leri Uzanan DiÅŸler (Tines)
    [-0.19, 0.19].forEach(tx => {
      const tine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.28), pinkMat);
      tine.position.set(tx, 0, 0.17);
      tine.castShadow = true;
      forkGroup.add(tine);

      // UÃ§ KÄ±sÄ±mlardaki EÄŸimli Top GiriÅŸ PahlarÄ± / RampalarÄ± (FotoÄŸraftaki kulaklar)
      const tipRamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.07), pinkMat);
      tipRamp.position.set(tx > 0 ? 0.175 : -0.175, 0.01, 0.31);
      tipRamp.rotation.y = tx > 0 ? -0.25 : 0.25;
      tipRamp.castShadow = true;
      forkGroup.add(tipRamp);
    });

    armGroup.add(forkGroup);
    group.add(armGroup);

    // Dinamik ParÃ§a ReferanslarÄ±
    parts.servoPart = armGroup;       // Servo ile kalkan ve vuran kol
    parts.forkCarriage = forkGroup;   // Top/yÃ¼k temas noktasÄ±

    // F. CYBERBRICK XA003 CORE BOARD VE DURUM RGB LED'Ä° (Arka Siyah SÄ±rtlÄ±k Ä°Ã§inde)
    this.addCoreBoardToModel(group, 0, 0.62, -0.22, parts);
  },

  // 3. LOJÄ°STÄ°K MÄ°NÄ° KAMYON MODELÄ° (MAKERWORLD KEI-TRUCK: SARI KABÄ°N, SÄ°YAH ALT GÃ–VDE, 4 TEKERLEK, 3 GRÄ° BORU YÃœKÃœ)
  buildTruckGeometry: function(group, parts) {
    // A. FOTOÄžRAFTAKÄ° BÄ°REBÄ°R BAMBU LAB MATTE PLA VE PBR MATERYALLERÄ°
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xf6c445, // Bambu PLA Matte SÄ±cak SarÄ±
      roughness: 0.38,
      metalness: 0.04
    });
    const chassisDarkMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Mat Karbon SiyahÄ± (Åžasi, Tamponlar ve Ã‡amurluklar)
      roughness: 0.70,
      metalness: 0.10
    });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // 3D BaskÄ± Mat Koyu Cam YÃ¼zeyleri
      roughness: 0.40,
      metalness: 0.15
    });
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Sanayi Tipi Beton / PVC Gri Borular
      roughness: 0.48,
      metalness: 0.18
    });
    const pipeBoreMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a // Boru Ä°Ã§ BoÅŸluk GÃ¶lgesi
    });
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Buzlu SÃ¼t Beyaz Yuvarlak Far Lensi
      roughness: 0.15,
      metalness: 0.10,
      emissive: 0xffffff,
      emissiveIntensity: 0.4
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // KalÄ±n TÄ±rtÄ±klÄ± KauÃ§uk Lastik
      roughness: 0.88,
      metalness: 0.05
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db, // Ã‡ukur Pres Ã‡elik Jant (Metallic Silver)
      metalness: 0.82,
      roughness: 0.25
    });
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xd90429, // KÄ±rmÄ±zÄ± Arka Stoplar
      emissive: 0xd90429,
      emissiveIntensity: 0.5,
      roughness: 0.2
    });

    // B. SÄ°YAH ALT ÅžASÄ°, TAMPONLAR VE Ã‡AMURLUKLAR (LOWER BLACK BODY & FENDERS)
    const lowerBodyGroup = new THREE.Group();

    // Ana siyah alt gÃ¶vde taÅŸÄ±yÄ±cÄ± bloÄŸu
    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.18, 1.94), chassisDarkMat);
    lowerChassis.position.set(0, 0.22, 0);
    lowerChassis.castShadow = true;
    lowerBodyGroup.add(lowerChassis);

    // Ã–n Siyah Tampon (FotoÄŸraftaki dÃ¼z kesimli siyah tampon)
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.18, 0.14), chassisDarkMat);
    frontBumper.position.set(0, 0.22, 0.94);
    frontBumper.castShadow = true;
    lowerBodyGroup.add(frontBumper);

    // Ã–n alt koruma dudaÄŸÄ± (Front chin spoiler)
    const frontLip = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.10), chassisDarkMat);
    frontLip.position.set(0, 0.13, 0.93);
    lowerBodyGroup.add(frontLip);

    // Ã–n plakalÄ±k detayÄ±
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.02), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    plate.position.set(0, 0.22, 1.015);
    lowerBodyGroup.add(plate);

    // Arka Siyah Tampon
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.14, 0.12), chassisDarkMat);
    rearBumper.position.set(0, 0.24, -0.96);
    rearBumper.castShadow = true;
    lowerBodyGroup.add(rearBumper);

    [-0.36, 0.36].forEach(tx => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.02), tailMat);
      tail.position.set(tx, 0.24, -1.025);
      lowerBodyGroup.add(tail);
    });

    // Arka GeniÅŸletilmiÅŸ Siyah Ã‡amurluklar (FotoÄŸraftaki arka teker Ã¼stÃ¼ Ã§Ä±kÄ±ntÄ±lÄ± siyah davlumbaz)
    [-0.49, 0.49].forEach(fx => {
      const fender = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 0.52), chassisDarkMat);
      fender.position.set(fx, 0.27, -0.56);
      fender.castShadow = true;
      lowerBodyGroup.add(fender);
    });

    group.add(lowerBodyGroup);

    // C. 4 ADET Ã‡UKUR PRES Ã‡ELÄ°K JANTLI TEKERLEK (4 STAMPED STEEL WHEELS)
    const createKeiWheel = () => {
      const wheel = new THREE.Group();

      // KauÃ§uk Lastik
      const tireGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.12, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheel.add(tire);

      // Ã‡ukur Pres Ã‡elik Jant (Derin Ã§anak jant)
      const rimGeo = new THREE.CylinderGeometry(0.125, 0.11, 0.125, 20);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheel.add(rim);

      // Jant GÃ¶beÄŸi ve 4 Bijon YuvasÄ± Delikleri
      const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.13, 16);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, chassisDarkMat);
      wheel.add(hub);

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        const lugHole = new THREE.Mesh(new THREE.CircleGeometry(0.014, 8), chassisDarkMat);
        lugHole.rotateY(Math.PI / 2);
        lugHole.position.set(0.063, Math.sin(a) * 0.08, Math.cos(a) * 0.08);
        wheel.add(lugHole);

        const lugHoleL = new THREE.Mesh(new THREE.CircleGeometry(0.014, 8), chassisDarkMat);
        lugHoleL.rotateY(-Math.PI / 2);
        lugHoleL.position.set(-0.063, Math.sin(a) * 0.08, Math.cos(a) * 0.08);
        wheel.add(lugHoleL);
      }

      return wheel;
    };

    // 1. Ã–n Aks & Direksiyon Grubu (Servo ile saÄŸa/sola yÃ¶nlenen 2 tekerlek)
    const frontSteerGroup = new THREE.Group();
    frontSteerGroup.position.set(0, 0.19, 0.58);

    const fTieRod = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.03, 0.03), chassisDarkMat);
    frontSteerGroup.add(fTieRod);

    const fLWheel = createKeiWheel();
    fLWheel.position.set(-0.48, 0, 0);
    frontSteerGroup.add(fLWheel);

    const fRWheel = createKeiWheel();
    fRWheel.position.set(0.48, 0, 0);
    frontSteerGroup.add(fRWheel);

    group.add(frontSteerGroup);
    parts.servoPart = frontSteerGroup; // Kamyon Ã¶n direksiyonu

    // 2. Arka Ã‡ekiÅŸ AksÄ± (2 Tekerlek)
    const rLWheel = createKeiWheel();
    rLWheel.position.set(-0.48, 0.19, -0.56);
    group.add(rLWheel);

    const rRWheel = createKeiWheel();
    rRWheel.position.set(0.48, 0.19, -0.56);
    group.add(rRWheel);

    parts.leftWheel = rLWheel;
    parts.rightWheel = rRWheel;

    // D. SARI ÅžOFÃ–R KABÄ°NÄ° (FOTOÄžRAFTAKÄ° KEI-TRUCK KABÄ°N MÄ°MARÄ°SÄ°)
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, 0, 0);

    // Kabin Alt GÃ¶vdesi (SarÄ±)
    const cabLower = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.28, 0.82), yellowMat);
    cabLower.position.set(0, 0.44, 0.47);
    cabLower.castShadow = true;
    cabGroup.add(cabLower);

    // EÄŸimli Ã–n Burun (Slanted Nose Panel)
    const frontNose = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.18, 0.12), yellowMat);
    frontNose.position.set(0, 0.44, 0.86);
    frontNose.castShadow = true;
    cabGroup.add(frontNose);

    // Ä°ki Yuvarlak Ã–n Far (FotoÄŸraftaki burun kÃ¶ÅŸelerindeki yuvarlak farlar)
    [-0.33, 0.33].forEach(hx => {
      const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20), chassisDarkMat);
      bezel.rotateX(Math.PI / 2);
      bezel.position.set(hx, 0.42, 0.925);
      cabGroup.add(bezel);

      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.025, 20), headlightMat);
      lamp.rotateX(Math.PI / 2);
      lamp.position.set(hx, 0.42, 0.93);
      cabGroup.add(lamp);
    });

    // Ã–n EÄŸimli Ã–n Cam (FotoÄŸraftaki geniÅŸ siyah Ã¶n cam)
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.46, 0.03), windowMat);
    windshield.position.set(0, 0.77, 0.65);
    windshield.rotation.x = -0.58; // AÃ§Ä±lÄ± Ã¶n cam
    windshield.castShadow = true;
    cabGroup.add(windshield);

    // SarÄ± A-SÃ¼tunlarÄ± ve Cam Ã‡erÃ§evesi
    [-0.43, 0.43].forEach(ax => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.46, 0.05), yellowMat);
      pillar.position.set(ax, 0.77, 0.65);
      pillar.rotation.x = -0.58;
      cabGroup.add(pillar);
    });

    // DÃ¼z SarÄ± Tavan (Flat Yellow Roof)
    const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.07, 0.46), yellowMat);
    cabRoof.position.set(0, 0.98, 0.30);
    cabRoof.castShadow = true;
    cabGroup.add(cabRoof);

    // Kabin Arka DuvarÄ±
    const cabBack = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.54, 0.04), yellowMat);
    cabBack.position.set(0, 0.70, 0.08);
    cabBack.castShadow = true;
    cabGroup.add(cabBack);

    // Yan KapÄ± CamlarÄ± (FotoÄŸraftaki karakteristik aÃ§Ä±lÄ± basamaklÄ± yan camlar)
    [-0.472, 0.472].forEach(sx => {
      const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.34, 0.38), windowMat);
      sideWin.position.set(sx, 0.76, 0.35);
      cabGroup.add(sideWin);

      // KapÄ± Alt Ã‡izgisi ve KapÄ± Kolu
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.07, 0.025), chassisDarkMat);
      handle.position.set(sx * 1.01, 0.52, 0.20);
      cabGroup.add(handle);

      // Siyah Yan Ayna (FotoÄŸraftaki A sÃ¼tunu kÃ¶kÃ¼ndeki kÃ¶ÅŸeli siyah dikiz aynasÄ±)
      const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.03), chassisDarkMat);
      mirrorArm.position.set(sx > 0 ? 0.49 : -0.49, 0.62, 0.66);
      cabGroup.add(mirrorArm);

      const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.06), chassisDarkMat);
      mirrorHead.position.set(sx > 0 ? 0.54 : -0.54, 0.63, 0.66);
      mirrorHead.castShadow = true;
      cabGroup.add(mirrorHead);
    });

    group.add(cabGroup);

    // E. AÃ‡IK SARI KARGO KASASI (OPEN YELLOW PICKUP BED)
    const bedGroup = new THREE.Group();
    bedGroup.position.set(0, 0, 0);

    // Kasa TabanÄ± (SarÄ±)
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.05, 0.98), yellowMat);
    bedFloor.position.set(0, 0.34, -0.46);
    bedFloor.castShadow = true;
    bedGroup.add(bedFloor);

    // Kasa Ã–n Koruma DuvarÄ± (Kabin arkasÄ± sarÄ± panel)
    const bedFrontWall = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.28, 0.04), yellowMat);
    bedFrontWall.position.set(0, 0.48, 0.04);
    bedFrontWall.castShadow = true;
    bedGroup.add(bedFrontWall);

    // Kasa Sol ve SaÄŸ SarÄ± Yan KapaklarÄ± (Yellow Bed Dropsides)
    [-0.46, 0.46].forEach(wx => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.98), yellowMat);
      wall.position.set(wx, 0.48, -0.46);
      wall.castShadow = true;
      bedGroup.add(wall);
    });

    // Kasa Arka KapaÄŸÄ± (Yellow Tailgate)
    const bedTailgate = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.26, 0.04), yellowMat);
    bedTailgate.position.set(0, 0.48, -0.96);
    bedTailgate.castShadow = true;
    bedGroup.add(bedTailgate);

    // F. KASADAKÄ° YÃœK: 3 ADET GRÄ° SANAYÄ° BORUSU (3 GREY INDUSTRIAL PIPES - FOTOÄžRAFTAKÄ° GÄ°BÄ° Ä°STÄ°FLÄ°)
    const pipesGroup = new THREE.Group();

    const createIndustrialPipe = (px, py, pz) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, py, pz);

      // Ana Boru GÃ¶vdesi
      const bodyGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.84, 24);
      bodyGeo.rotateX(Math.PI / 2);
      const pBody = new THREE.Mesh(bodyGeo, pipeMat);
      pBody.castShadow = true;
      pGroup.add(pBody);

      // Arka ManÅŸon / Soket BileziÄŸi (Thick Socket Collar)
      const collarGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.10, 24);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, pipeMat);
      collar.position.set(0, 0, -0.37);
      collar.castShadow = true;
      pGroup.add(collar);

      // Boru Ä°Ã§ BoÅŸluÄŸu (Hollow Bore)
      const bore = new THREE.Mesh(new THREE.CircleGeometry(0.088, 16), pipeBoreMat);
      bore.position.set(0, 0, -0.422);
      pGroup.add(bore);

      const boreFront = new THREE.Mesh(new THREE.CircleGeometry(0.088, 16), pipeBoreMat);
      boreFront.rotateY(Math.PI);
      boreFront.position.set(0, 0, 0.422);
      pGroup.add(boreFront);

      return pGroup;
    };

    // Piramit Dizilimi: 2 Alt Boru + 1 Ãœst Orta Boru
    pipesGroup.add(createIndustrialPipe(-0.15, 0.46, -0.46));
    pipesGroup.add(createIndustrialPipe(0.15, 0.46, -0.46));
    pipesGroup.add(createIndustrialPipe(0.00, 0.67, -0.46));

    bedGroup.add(pipesGroup);
    group.add(bedGroup);

    // G. CYBERBRICK XA003 KONTROL KARTI VE RGB BÄ°LDÄ°RÄ°M LED'Ä° (Kabin ile Kasa ArasÄ±nda)
    this.addCoreBoardToModel(group, 0, 0.52, 0.05, parts);
  },

  // 4. GO-KART YARIÅž MODELÄ° (CYBERKART - FORMULA PÄ°ST ÅžASÄ°SÄ°, SPOR SLICK LASTÄ°KLER)
  buildKartGeometry: function(group, parts) {
    // A. GERÃ‡EKÃ‡Ä° YARIÅž PBR MATERYALLERÄ°
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Corsa Rosso KÄ±rmÄ±zÄ±
      metalness: 0.15,
      roughness: 0.22
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Karbon Fiber Kompozit
      roughness: 0.38,
      metalness: 0.25
    });
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Ã‡elik Boru Åžasi
      metalness: 0.65,
      roughness: 0.35
    });
    const slickTireMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // YarÄ±ÅŸ Slick KauÃ§uÄŸu
      roughness: 0.88
    });
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // BBS Anodize AltÄ±n Jant
      metalness: 0.88,
      roughness: 0.20
    });
    const brakeMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Delikli Ã‡elik Fren Diski
      metalness: 0.95,
      roughness: 0.15
    });
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Brembo Fren Kaliperi
      roughness: 0.3
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Krom ve AlÃ¼minyum Pedallar
      metalness: 0.95,
      roughness: 0.1
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Beyaz YarÄ±ÅŸ NumaralÄ±ÄŸÄ±
      roughness: 0.35
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Koyu Metalik Motor GÃ¶vdesi
      roughness: 0.65
    });

    // B. KAYNAKLI BORU UZAY ÅžASÄ° (TUBULAR SPACEFRAME CHASSIS)
    const chassisGroup = new THREE.Group();

    // Ana Taban BorularÄ±
    [-0.38, 0.38].forEach(bx => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 2.1, 12), tubeMat);
      rail.rotateX(Math.PI / 2);
      rail.position.set(bx, 0.15, 0);
      chassisGroup.add(rail);
    });

    // Yan Koruma BarlarÄ± (Side Nerf Bars - Karting GÃ¼venlik Ã‡erÃ§evesi)
    const createNerfBar = (isLeft) => {
      const sign = isLeft ? -1 : 1;
      const nerf = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32), tubeMat);
      p1.position.set(sign * 0.54, 0.16, 0.35); p1.rotation.z = sign * 0.4; nerf.add(p1);
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32), tubeMat);
      p2.position.set(sign * 0.54, 0.16, -0.35); p2.rotation.z = sign * 0.4; nerf.add(p2);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85), tubeMat);
      bar.rotateX(Math.PI / 2);
      bar.position.set(sign * 0.62, 0.18, 0);
      nerf.add(bar);
      return nerf;
    };
    chassisGroup.add(createNerfBar(true));
    chassisGroup.add(createNerfBar(false));

    // Ã–n Tampon Kavisli Ã‡arpÄ±ÅŸma BarÄ±
    const fHoop = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.022, 8, 24, Math.PI), tubeMat);
    fHoop.rotation.x = Math.PI / 2;
    fHoop.position.set(0, 0.14, 0.85);
    chassisGroup.add(fHoop);

    // Arka Motor ve Aks Koruma BarÄ±
    const rHoop = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.04), tubeMat);
    rHoop.position.set(0, 0.16, -0.92);
    chassisGroup.add(rHoop);

    // AlÃ¼minyum Taban SacÄ± (Floor Pan)
    const floorPan = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.015, 1.45), carbonMat);
    floorPan.position.set(0, 0.14, 0.12);
    chassisGroup.add(floorPan);

    group.add(chassisGroup);

    // C. AERODÄ°NAMÄ°K GÃ–VDE: Ã–N BURUN, YAN PANELLER VE ARKA KANAT
    const aeroGroup = new THREE.Group();

    // Ã–n Kama Burun Konisi (Front Wedge Nosecone / Splitter)
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.14, 0.85), redMat);
    nose.position.set(0, 0.20, 0.80);
    nose.castShadow = true;
    aeroGroup.add(nose);

    // Ã–n Aerodinamik Splitter DudaÄŸÄ±
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.025, 0.28), carbonMat);
    splitter.position.set(0, 0.12, 1.05);
    splitter.castShadow = true;
    aeroGroup.add(splitter);

    // Ã–n YarÄ±ÅŸ NumaralÄ±k PlakasÄ± (#01)
    const numPlate = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.02), whiteMat);
    numPlate.position.set(0, 0.32, 0.65);
    numPlate.rotation.x = -0.45;
    aeroGroup.add(numPlate);

    const numStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.01), redMat);
    numStripe.position.set(0, 0.32, 0.665);
    numStripe.rotation.x = -0.45;
    aeroGroup.add(numStripe);

    // Sol & SaÄŸ Yan Podlar (Aerodynamic Side Pods with NACA Ducts)
    [-0.60, 0.60].forEach(sx => {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 1.05), redMat);
      pod.position.set(sx, 0.24, -0.05);
      pod.castShadow = true;
      aeroGroup.add(pod);

      const carbonTop = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 1.06), carbonMat);
      carbonTop.position.set(sx, 0.355, -0.05);
      aeroGroup.add(carbonTop);

      // NACA Hava GiriÅŸi ve RadyatÃ¶r PeteÄŸi
      const duct = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.24), carbonMat);
      duct.position.set(sx + (sx > 0 ? -0.11 : 0.11), 0.24, 0.25);
      aeroGroup.add(duct);

      const radCore = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.10, 0.20), steelMat);
      radCore.position.set(sx + (sx > 0 ? -0.10 : 0.10), 0.24, 0.25);
      aeroGroup.add(radCore);
    });

    // Ã‡ift ElemanlÄ± Karbon Arka YarÄ±ÅŸ KanadÄ± (Dual-Element Rear Wing)
    const wingStanchionL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.12), carbonMat);
    wingStanchionL.position.set(-0.28, 0.50, -0.80);
    wingStanchionL.rotation.x = -0.25;
    aeroGroup.add(wingStanchionL);

    const wingStanchionR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.12), carbonMat);
    wingStanchionR.position.set(0.28, 0.50, -0.80);
    wingStanchionR.rotation.x = -0.25;
    aeroGroup.add(wingStanchionR);

    // Ãœst Ana Kanat Profili
    const mainWing = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.035, 0.26), redMat);
    mainWing.position.set(0, 0.68, -0.88);
    mainWing.rotation.x = 0.10;
    mainWing.castShadow = true;
    aeroGroup.add(mainWing);

    // Ä°kincil Flap
    const flapWing = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.025, 0.14), carbonMat);
    flapWing.position.set(0, 0.74, -0.96);
    flapWing.rotation.x = 0.20;
    aeroGroup.add(flapWing);

    // Kanat Yan PlakalarÄ± (Endplates)
    [-0.69, 0.69].forEach(ex => {
      const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.38), carbonMat);
      endplate.position.set(ex, 0.68, -0.92);
      aeroGroup.add(endplate);
    });

    // Arka Alt Hava DifÃ¼zÃ¶rÃ¼ (Rear Underbody Diffuser)
    [-0.24, -0.08, 0.08, 0.24].forEach(dx => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.32), carbonMat);
      fin.position.set(dx, 0.14, -0.82);
      aeroGroup.add(fin);
    });

    group.add(aeroGroup);

    // D. KOKPÄ°T, YARIÅž KOLTUÄžU VE DÄ°REKSÄ°YON MEKANÄ°ZMASI (SERVO 1 Ä°LE DÃ–NER)
    const cockpitGroup = new THREE.Group();

    // Derin YarÄ±ÅŸ Ã‡anak KoltuÄŸu (Deep Molded Bucket Seat)
    const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.16, 0.42), carbonMat);
    seatBase.position.set(0, 0.24, -0.18);
    cockpitGroup.add(seatBase);

    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.52, 0.10), carbonMat);
    seatBack.position.set(0, 0.50, -0.34);
    seatBack.rotation.x = -0.35;
    seatBack.castShadow = true;
    cockpitGroup.add(seatBack);

    // 4 NoktalÄ± KÄ±rmÄ±zÄ± Emniyet Kemeri (4-Point Racing Harness)
    [-0.14, 0.14].forEach(hx => {
      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.46, 0.02), redMat);
      belt.position.set(hx, 0.48, -0.28);
      belt.rotation.x = -0.35;
      cockpitGroup.add(belt);
    });

    const buckle = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), steelMat);
    buckle.position.set(0, 0.36, -0.22);
    cockpitGroup.add(buckle);

    // AlÃ¼minyum Gaz ve Fren PedallarÄ±
    [-0.12, 0.12].forEach(px => {
      const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.02), steelMat);
      pedal.position.set(px, 0.22, 0.58);
      pedal.rotation.x = -0.5;
      cockpitGroup.add(pedal);
    });

    group.add(cockpitGroup);

    // DÄ°REKSÄ°YON VE Ã–N TEKERLEK BAÄžLANTISI (SERVO 1 Ä°LE AÃ‡ILANIR)
    const steerSystem = new THREE.Group();
    steerSystem.position.set(0, 0.22, 0.62);

    // Direksiyon Mili ve F1 Tipi DÃ¼z Taban Direksiyon
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.42), steelMat);
    col.position.set(0, 0.22, -0.24);
    col.rotation.x = 0.65;
    steerSystem.add(col);

    const f1Wheel = new THREE.Group();
    f1Wheel.position.set(0, 0.36, -0.35);
    f1Wheel.rotation.x = 0.65;

    // Kelebek YarÄ±ÅŸ Direksiyonu
    const rimShape = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.02), carbonMat);
    f1Wheel.add(rimShape);
    const centerDisplay = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.025), redMat);
    f1Wheel.add(centerDisplay);
    [-0.12, 0.12].forEach(gx => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12), slickTireMat);
      grip.position.set(gx, 0, 0);
      f1Wheel.add(grip);
    });
    steerSystem.add(f1Wheel);

    // Ã–n Tekerlek TaÅŸÄ±yÄ±cÄ± Milleri
    const tieRod = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.03, 0.03), steelMat);
    steerSystem.add(tieRod);

    // Ã–n Tekerlekler (Slick Tires on Gold Rims + Big Brakes)
    const createKartWheel = (isRear) => {
      const wGroup = new THREE.Group();
      const radius = isRear ? 0.26 : 0.23;
      const width = isRear ? 0.28 : 0.20;

      // KauÃ§uk Slick Lastik
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 24), slickTireMat);
      tire.rotateZ(Math.PI / 2);
      tire.castShadow = true;
      wGroup.add(tire);

      // BBS AltÄ±n Rengi Ã‡ok Kollu Jant
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.68, radius * 0.68, width + 0.01, 16), goldRimMat);
      rim.rotateZ(Math.PI / 2);
      wGroup.add(rim);

      // KÄ±rmÄ±zÄ± Merkez Kilit Somunu (Center-lock Nut)
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, width + 0.03, 10), redMat);
      nut.rotateZ(Math.PI / 2);
      wGroup.add(nut);

      // HavalandÄ±rmalÄ± Delikli Disk Fren RotÃ¶rÃ¼
      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.60, radius * 0.60, 0.02, 20), brakeMat);
      rotor.rotateZ(Math.PI / 2);
      rotor.position.set(0, 0, 0);
      wGroup.add(rotor);

      // Brembo KÄ±rmÄ±zÄ± Fren Kaliperi
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.06), caliperMat);
      caliper.position.set(0, radius * 0.42, 0);
      wGroup.add(caliper);

      return wGroup;
    };

    const fLWheel = createKartWheel(false); fLWheel.position.set(-0.66, 0, 0); steerSystem.add(fLWheel);
    const fRWheel = createKartWheel(false); fRWheel.position.set(0.66, 0, 0); steerSystem.add(fRWheel);

    group.add(steerSystem);
    parts.servoPart = steerSystem; // Servo kartÄ±n direksiyonunu Ã§evirir!

    // E. ARKA YARIÅž AKSI, MOTOR VE GENÄ°Åž SLICK TEKERLEKLER
    const rLWheel = createKartWheel(true); rLWheel.position.set(-0.72, 0.26, -0.52); group.add(rLWheel);
    const rRWheel = createKartWheel(true); rRWheel.position.set(0.72, 0.26, -0.52); group.add(rRWheel);

    parts.leftWheel = rLWheel;
    parts.rightWheel = rRWheel;

    // Arka Tahrik AksÄ± ve AltÄ±n Zincir DiÅŸlisi
    const rearAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.45, 14), steelMat);
    rearAxle.rotateZ(Math.PI / 2);
    rearAxle.position.set(0, 0.26, -0.52);
    group.add(rearAxle);

    const sprocket = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 20), goldRimMat);
    sprocket.rotateZ(Math.PI / 2);
    sprocket.position.set(0.24, 0.26, -0.52);
    group.add(sprocket);

    // FÄ±rÃ§asÄ±z Elektrik YarÄ±ÅŸ Motoru
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.22, 16), darkMat);
    motor.rotateZ(Math.PI / 2);
    motor.position.set(0.38, 0.28, -0.38);
    motor.castShadow = true;
    group.add(motor);

    // F. CYBERBRICK XA003 CORE BOARD (Ã–n burun telemetri yuvasÄ±nda)
    this.addCoreBoardToModel(group, 0, 0.32, 0.30, parts);
  },

  // 5. OTONOM KEÅžÄ°F ARACI (CYBERROVER - STEM & K12 ROVER, 180Â° HC-SR04 SONAR RADAR)
  buildRoverGeometry: function(group, parts) {
    // A. GERÃ‡EKÃ‡Ä° PBR MATERYALLERÄ°
    const greenMat = new THREE.MeshStandardMaterial({
      color: 0x00ae42, // Resmi Bambu YeÅŸili
      roughness: 0.35,
      metalness: 0.05
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Ay BeyazÄ± GÃ¶vde Panelleri
      roughness: 0.30
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // YÃ¼ksek DayanÄ±mlÄ± CNC Åžasi
      roughness: 0.65
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // PirinÃ§ / AltÄ±n Rulman ve Aks BurÃ§larÄ±
      metalness: 0.90,
      roughness: 0.22
    });
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Polikristal GÃ¼neÅŸ Paneli Silikonu
      metalness: 0.65,
      roughness: 0.15
    });
    const pcbBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Klasik Mavi FR-4 Devre KartÄ±
      roughness: 0.35
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Ultrasonik DÃ¶nÃ¼ÅŸtÃ¼rÃ¼cÃ¼ AlÃ¼minyum & Tel Ã–rgÃ¼
      metalness: 0.92,
      roughness: 0.15
    });
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe, // Åžeffaf Polikarbon Koruma Kubbesi
      transparent: true,
      opacity: 0.38,
      roughness: 0.10
    });

    // B. Ã‡Ä°FT KATMANLI CNC KOMPOZÄ°T ÅžASÄ° (DUAL-DECK ROVER CHASSIS)
    const chassisGroup = new THREE.Group();

    // Alt Åžasi KÃ¼veti (Batarya ve Tahrik YuvasÄ±)
    const lowerTub = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.22, 1.85), darkMat);
    lowerTub.position.set(0, 0.30, 0);
    lowerTub.castShadow = true;
    chassisGroup.add(lowerTub);

    // Ãœst Ekipman GÃ¼vertesi (Bambu YeÅŸili Ãœst Panel)
    const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.08, 1.90), greenMat);
    upperDeck.position.set(0, 0.44, 0);
    upperDeck.castShadow = true;
    chassisGroup.add(upperDeck);

    // Ã–n AÄŸÄ±r Hizmet Ã‡arpÄ±ÅŸma BarÄ± ve AltÄ±n Ã‡eki MapalarÄ± (D-Rings)
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.10, 0.12), darkMat);
    frontBumper.position.set(0, 0.34, 1.00);
    frontBumper.castShadow = true;
    chassisGroup.add(frontBumper);

    [-0.42, 0.42].forEach(dx => {
      const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 16), brassMat);
      shackle.position.set(dx, 0.34, 1.08);
      chassisGroup.add(shackle);
    });

    // ÅžASÄ° ALTI Ã‡Ä°FT KIZILÃ–TESÄ° Ã‡Ä°ZGÄ° Ä°ZLEME SENSÃ–R DÄ°ZÄ°SÄ° (UNDERBODY LINE-TRACKING ARRAY)
    const lineArrayGroup = new THREE.Group();
    lineArrayGroup.position.set(0, 0.14, 0.72);

    [-0.14, 0.14].forEach(lx => {
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.18), pcbBlueMat);
      pcb.position.set(lx, 0, 0);
      lineArrayGroup.add(pcb);

      // IR Verici Diyot (Koyu)
      const emitter = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), darkMat);
      emitter.position.set(lx - 0.03, -0.02, 0.04);
      lineArrayGroup.add(emitter);

      // IR AlÄ±cÄ± FototransistÃ¶r (Åžeffaf/KÄ±rmÄ±zÄ±)
      const receiver = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      receiver.position.set(lx + 0.03, -0.02, 0.04);
      lineArrayGroup.add(receiver);
    });
    chassisGroup.add(lineArrayGroup);

    group.add(chassisGroup);

    // C. 4x4 TÃœM ARAZÄ° PLANETARY HUB TEKERLEKLERÄ° (ALL-TERRAIN ROVER WHEELS)
    const createRoverWheel = () => {
      const wGroup = new THREE.Group();

      // Derin TÄ±rnaklÄ± Arazi LastiÄŸi
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24), darkMat);
      tire.rotateZ(Math.PI / 2);
      tire.castShadow = true;
      wGroup.add(tire);

      // TÄ±rnak BloklarÄ± (Deep Chevron Rover Lugs)
      const lugGeo = new THREE.BoxGeometry(0.23, 0.04, 0.06);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const lug = new THREE.Mesh(lugGeo, darkMat);
        lug.position.set(0, Math.sin(a) * 0.32, Math.cos(a) * 0.32);
        lug.rotation.x = a;
        wGroup.add(lug);
      }

      // Gezegen DiÅŸli Merkez GÃ¶beÄŸi (Planetary Hub Center)
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.23, 16), greenMat);
      hub.rotateZ(Math.PI / 2);
      wGroup.add(hub);

      // PirinÃ§ Aks Burcu ve 6 Civata
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 12), brassMat);
      bushing.rotateZ(Math.PI / 2);
      wGroup.add(bushing);

      for (let ba = 0; ba < Math.PI * 2; ba += Math.PI / 3) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.015), silverMat);
        b.position.set(0, Math.sin(ba) * 0.12, Math.cos(ba) * 0.12);
        wGroup.add(b);
      }

      return wGroup;
    };

    // 4 BaÄŸÄ±msÄ±z Tekerlek (Ã–n Sol/SaÄŸ, Arka Sol/SaÄŸ)
    const rFL = createRoverWheel(); rFL.position.set(-0.74, 0.32, 0.60); group.add(rFL);
    const rFR = createRoverWheel(); rFR.position.set(0.74, 0.32, 0.60); group.add(rFR);
    const rRL = createRoverWheel(); rRL.position.set(-0.74, 0.32, -0.60); group.add(rRL);
    const rRR = createRoverWheel(); rRR.position.set(0.74, 0.32, -0.60); group.add(rRR);

    parts.leftWheel = rFL;
    parts.rightWheel = rFR;
    parts.extraWheels = [
      { mesh: rRL, isLeft: true },
      { mesh: rRR, isLeft: false }
    ];

    // D. 180Â° DÃ–NEN HAREKETLÄ° HC-SR04 ULTRASONÄ°K RADAR DÄ°REÄžÄ° (SERVO 1 Ä°LE PAN YAPAR)
    const radarMast = new THREE.Group();
    radarMast.position.set(0, 0.48, 0.72); // Ã–n gÃ¼verte montaj noktasÄ±

    // Servo TabanÄ± ve Karbon Direk
    const servoBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.18), darkMat);
    servoBase.position.set(0, 0.07, 0);
    radarMast.add(servoBase);

    const mastCol = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.32, 12), darkMat);
    mastCol.position.set(0, 0.28, 0);
    radarMast.add(mastCol);

    // HC-SR04 SENSÃ–R MODÃœLÃœ (TAM BÄ°REBÄ°R ELEKTRONÄ°K DETAYI)
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0, 0.44, 0);

    // Klasik Mavi FR-4 BaskÄ± Devre KartÄ± (PCB)
    const pcbBoard = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.26, 0.04), pcbBlueMat);
    sensorGroup.add(pcbBoard);

    // Metalik Kristal OsilatÃ¶r (16.000 MHz Crystal)
    const crystal = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08), silverMat);
    crystal.rotateZ(Math.PI / 2);
    crystal.position.set(0, -0.04, 0.03);
    sensorGroup.add(crystal);

    // Ä°KÄ°Z ULTRASONÄ°K DÃ–NÃœÅžTÃœRÃœCÃœLER (TRANSMITTER 'T' & RECEIVER 'R')
    const createTransducer = (tx) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(tx, 0, 0.08);

      // AlÃ¼minyum DÄ±ÅŸ Silindir
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 20), silverMat);
      can.rotateX(Math.PI / 2);
      can.castShadow = true;
      tGroup.add(can);

      // Ã–n Koruyucu Paslanmaz Ã‡elik Izgara (Mesh Screen)
      const meshScreen = new THREE.Mesh(new THREE.CircleGeometry(0.082, 16), darkMat);
      meshScreen.position.set(0, 0, 0.072);
      tGroup.add(meshScreen);

      // Ã–n Parlak Halka KenarlÄ±k
      const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.01, 8, 20), silverMat);
      bezel.position.set(0, 0, 0.072);
      tGroup.add(bezel);

      return tGroup;
    };

    sensorGroup.add(createTransducer(-0.17)); // Sol Verici Transducer
    sensorGroup.add(createTransducer(0.17));  // SaÄŸ AlÄ±cÄ± Transducer

    // 4-Pinli Erkek KonnektÃ¶r ve Renkli Jumper KablolarÄ± (VCC, TRIG, ECHO, GND)
    const header = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.03), darkMat);
    header.position.set(0, -0.14, 0.02);
    sensorGroup.add(header);

    const cableColors = [0xef4444, 0xf59e0b, 0x00ae42, 0x18181b];
    [-0.06, -0.02, 0.02, 0.06].forEach((cx, idx) => {
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.22),
        new THREE.MeshStandardMaterial({ color: cableColors[idx] })
      );
      wire.position.set(cx, -0.24, -0.02);
      sensorGroup.add(wire);
    });

    radarMast.add(sensorGroup);
    group.add(radarMast);
    parts.servoPart = radarMast; // Rover radarÄ± 180 derece saÄŸa-sola pan yapar

    // E. ARKA GÃœNEÅž PANELÄ° VE UYDU HABERLEÅžME ANTENÄ° (SCIENCE & PAYLOAD)
    const payloadGroup = new THREE.Group();
    payloadGroup.position.set(0, 0.48, -0.45);

    // AÃ§Ä±lÄ± Fotovoltaik GÃ¼neÅŸ Paneli Dizisi
    const solarFrame = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.04, 0.72), whiteMat);
    solarFrame.position.set(0, 0.12, 0);
    solarFrame.rotation.x = -0.22;
    solarFrame.castShadow = true;
    payloadGroup.add(solarFrame);

    // 8 Adet Polikristal Mavi GÃ¼neÅŸ HÃ¼cresi
    for (let row = -1; row <= 1; row += 2) {
      for (let col = -3; col <= 3; col += 2) {
        const cell = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.01, 0.30), solarMat);
        cell.position.set(col * 0.125, 0.145 - row * 0.03, row * 0.16);
        cell.rotation.x = -0.22;
        payloadGroup.add(cell);
      }
    }

    // YÃ¼ksek KazanÃ§lÄ± Sarmal Ä°letiÅŸim Anteni (High-Gain Helical Antenna)
    const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.08, 12), brassMat);
    antBase.position.set(0.42, 0.12, -0.15);
    payloadGroup.add(antBase);

    const antMast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45), silverMat);
    antMast.position.set(0.42, 0.36, -0.15);
    payloadGroup.add(antMast);

    const antCoil = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16), silverMat);
    antCoil.position.set(0.42, 0.58, -0.15);
    antCoil.rotation.x = Math.PI / 2;
    payloadGroup.add(antCoil);

    // Ã‡evre SensÃ¶r IzgarasÄ± ve Arka USB-C Portu
    const sensorVent = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.03), darkMat);
    sensorVent.position.set(-0.40, 0.06, -0.42);
    payloadGroup.add(sensorVent);

    group.add(payloadGroup);

    // F. CYBERBRICK XA003 CORE BOARD & ÅžEFFAF KORUMA KUBBESÄ° (MERKEZÄ° YUVA)
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.22, 20, 1, false, 0, Math.PI), domeMat);
    dome.rotateZ(Math.PI / 2);
    dome.position.set(0, 0.60, 0.12);
    dome.scale.set(0.7, 1, 1.1);
    group.add(dome);

    this.addCoreBoardToModel(group, 0, 0.52, 0.12, parts);
  },

  // Ortak CyberBrick Core Board Ekleme
  addCoreBoardToModel: function(group, x, y, z, parts) {
    const boardGroup = new THREE.Group();
    boardGroup.position.set(x, y, z);

    // Siyah PCB
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.08, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.6 })
    );
    boardGroup.add(pcb);

    // ESP32-C3 Metal Kalkan
    const mcu = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.05, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    mcu.position.y = 0.06;
    boardGroup.add(mcu);

    // 4 SarÄ±/AltÄ±n KÃ¶ÅŸe Montaj HalkalarÄ± (Resmi CyberBrick DonanÄ±m Ã–zelliÄŸi)
    const ringGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.09, 12);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
    const corners = [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]];
    corners.forEach(([cx, cz]) => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(cx, 0.02, cz);
      boardGroup.add(ring);
    });

    // Durum WS2812 RGB LED'i
    const ledMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x00ae42 })
    );
    ledMesh.position.set(0.2, 0.07, 0.2);
    boardGroup.add(ledMesh);
    parts.statusLed = ledMesh;

    group.add(boardGroup);
  }
};

if (typeof window !== "undefined") {
  window.CyberBrickModels = CyberBrickModels;
}
