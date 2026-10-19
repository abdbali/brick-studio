/**
 * Brick Studio
 * K-12 Blok Editörü & 3D Simülasyon Yönetimi
 */

window.CyberBrickApp = {
  currentMainTab: "editor", // "editor", "circuit", "fullscreen_sim"
  isDarkMode: false,
  isSerialPaused: false,

  init: function() {
    console.log("[Brick Studio] K-12 Blok & 3D Simülasyon mimarisiyle başlatılıyor...");

    // 1. Three.js 3D Simülasyon Sahnesini Başlat
    CyberBrickSimulation.init("viewport-canvas-container");

    // 2. Google Blockly Blok Editörünü Başlat
    CyberBrickBlockly.init("blockly-div");

    // 3. Devre & Pin Yapılandırıcısını Başlat
    CyberBrickCircuitView.init("circuit-view-container");

    // 4. Parça Kütüphanesi & BOM Başlat
    CyberBrickPartsLibrary.init("parts-library-container");

    // 5. Sanal Çalışma Zamanı & Seri Port Dinleyicisi
    CyberBrickRuntime.init(
      (entry) => this.appendSerialLog(entry),
      (telemetry) => this.updateTelemetryUI(telemetry)
    );

    // 6. Klavye Kontrolleri (W, A, S, D, E, Q, Boşluk)
    this.setupKeyboardControls();
    this.setupUIEvents();

    // Pencere yeniden boyutlandığında Blockly ve Three.js boyutunu yenile
    window.addEventListener("resize", () => {
      if (typeof Blockly !== "undefined" && CyberBrickBlockly.workspace) {
        Blockly.svgResize(CyberBrickBlockly.workspace);
      }
    });

    // 7. Kaydedilmiş Dil Tercihini Yükle
    const savedLang = localStorage.getItem("brick_studio_lang") || "tr";
    this.setLanguage(savedLang, false);

    console.log("[Brick Studio] Hazır.");
  },

  // Ana Ekran ve Boyutlandırma
  isSimulationFullscreen: false,

  refreshLayoutSizes: function() {
    if (typeof CyberBrickSimulation !== "undefined" && CyberBrickSimulation.renderer && CyberBrickSimulation.camera) {
      const c = document.getElementById("viewport-canvas-container");
      if (c && c.clientWidth > 0 && c.clientHeight > 0) {
        CyberBrickSimulation.camera.aspect = c.clientWidth / c.clientHeight;
        CyberBrickSimulation.camera.updateProjectionMatrix();
        CyberBrickSimulation.renderer.setSize(c.clientWidth, c.clientHeight);
      }
    }
    if (typeof Blockly !== "undefined" && CyberBrickBlockly && CyberBrickBlockly.workspace) {
      Blockly.svgResize(CyberBrickBlockly.workspace);
    }
  },

  toggleSimulationFullscreen: function() {
    this.isSimulationFullscreen = !this.isSimulationFullscreen;
    const blocklyWrapper = document.getElementById("blockly-wrapper");
    const stageWrapper = document.getElementById("stage-wrapper");
    const ratioBtnIcon = document.getElementById("btn-toggle-ratio-icon");
    const ratioBtnText = document.getElementById("btn-toggle-ratio-text");
    const lang = this.currentLanguage || "tr";
    const t = this.i18n[lang] || this.i18n.tr;

    if (blocklyWrapper && stageWrapper) {
      if (this.isSimulationFullscreen) {
        blocklyWrapper.classList.add("hidden");
        stageWrapper.classList.remove("w-[62%]");
        stageWrapper.classList.add("w-full");
        if (ratioBtnIcon) ratioBtnIcon.className = "fas fa-compress-alt text-amber-500";
        if (ratioBtnText) ratioBtnText.innerText = t.exitFullscreen;
      } else {
        blocklyWrapper.classList.remove("hidden");
        stageWrapper.classList.remove("w-full");
        stageWrapper.classList.add("w-[62%]");
        if (ratioBtnIcon) ratioBtnIcon.className = "fas fa-expand-alt text-emerald-600";
        if (ratioBtnText) ratioBtnText.innerText = t.fullscreen;
      }
    }

    setTimeout(() => {
      this.refreshLayoutSizes();
    }, 60);
    setTimeout(() => {
      this.refreshLayoutSizes();
    }, 250);
  },

  // =========================================================================
  // ÇOKLU DİL DESTEĞİ (5 POPÜLER DİL: TR, EN, DE, ES, FR)
  // =========================================================================
  currentLanguage: "tr",

  i18n: {
    tr: {
      modelLabel: "Model:",
      run: "Çalıştır",
      stop: "Durdur",
      resetTooltip: "Robotu ve Sahneyi Başlangıç Noktasına Sıfırla",
      editorTitle: "Blok Kod Editörü",
      sampleCode: "Örnek Kod",
      clearCode: "Temizle",
      arenaWarehouse: "Depo",
      arenaTrack: "Çizgi Pisti",
      arenaSandbox: "Serbest Alan",
      loadStl: "STL Yükle",
      hudDist: "Mesafe",
      hudSpeed: "Hız",
      hudFork: "Çatal / Açı",
      hudBattery: "Pil",
      fullscreen: "Tam Ekran",
      exitFullscreen: "Küçült",
      langToast: "Dil Türkçe olarak seçildi.",
      models: {
        forklift: "BrickForklift (Forklift ve Flatbed)",
        truck: "BrickTruck (MakerWorld Kei-Kamyon)"
      }
    },
    en: {
      modelLabel: "Model:",
      run: "Run",
      stop: "Stop",
      resetTooltip: "Reset Robot and Arena to Start",
      editorTitle: "Block Code Editor",
      sampleCode: "Sample Code",
      clearCode: "Clear",
      arenaWarehouse: "Warehouse",
      arenaTrack: "Line Track",
      arenaSandbox: "Sandbox",
      loadStl: "Load STL",
      hudDist: "Distance",
      hudSpeed: "Speed",
      hudFork: "Fork/Angle",
      hudBattery: "Battery",
      fullscreen: "Fullscreen",
      exitFullscreen: "Minimize",
      langToast: "Language switched to English.",
      models: {
        forklift: "BrickForklift (Forklift & Flatbed)",
        truck: "BrickTruck (MakerWorld Kei-Truck)"
      }
    },
    de: {
      modelLabel: "Modell:",
      run: "Starten",
      stop: "Stoppen",
      resetTooltip: "Roboter und Arena zurücksetzen",
      editorTitle: "Block-Code-Editor",
      sampleCode: "Beispielcode",
      clearCode: "Löschen",
      arenaWarehouse: "Lagerhaus",
      arenaTrack: "Linienparcours",
      arenaSandbox: "Freies Areal",
      loadStl: "STL Laden",
      hudDist: "Abstand",
      hudSpeed: "Tempo",
      hudFork: "Gabel/Winkel",
      hudBattery: "Batterie",
      fullscreen: "Vollbild",
      exitFullscreen: "Verkleinern",
      langToast: "Sprache auf Deutsch eingestellt.",
      models: {
        forklift: "BrickForklift (Gabelstapler)",
        truck: "BrickTruck (MakerWorld Kei-LKW)"
      }
    },
    es: {
      modelLabel: "Modelo:",
      run: "Ejecutar",
      stop: "Detener",
      resetTooltip: "Restablecer robot y escenario",
      editorTitle: "Editor de Bloques",
      sampleCode: "Código de Ejemplo",
      clearCode: "Borrar",
      arenaWarehouse: "Almacén",
      arenaTrack: "Pista de Línea",
      arenaSandbox: "Modo Libre",
      loadStl: "Cargar STL",
      hudDist: "Distancia",
      hudSpeed: "Velocidad",
      hudFork: "Horquilla/Ángulo",
      hudBattery: "Batería",
      fullscreen: "Pantalla Completa",
      exitFullscreen: "Reducir",
      langToast: "Idioma cambiado a Español.",
      models: {
        forklift: "BrickForklift (Carretilla Elevadora)",
        truck: "BrickTruck (MakerWorld Camión Kei)"
      }
    },
    fr: {
      modelLabel: "Modèle :",
      run: "Exécuter",
      stop: "Arrêter",
      resetTooltip: "Réinitialiser le robot et l'arène",
      editorTitle: "Éditeur de Blocs",
      sampleCode: "Exemple de Code",
      clearCode: "Effacer",
      arenaWarehouse: "Entrepôt",
      arenaTrack: "Piste de Ligne",
      arenaSandbox: "Zone Libre",
      loadStl: "Charger STL",
      hudDist: "Distance",
      hudSpeed: "Vitesse",
      hudFork: "Fourche/Angle",
      hudBattery: "Batterie",
      fullscreen: "Plein Écran",
      exitFullscreen: "Réduire",
      langToast: "Langue définie sur Français.",
      models: {
        forklift: "BrickForklift (Chariot Élévateur)",
        truck: "BrickTruck (MakerWorld Camion Kei)"
      }
    }
  },

  setLanguage: function(lang, notify = true) {
    if (!this.i18n[lang]) lang = "tr";
    this.currentLanguage = lang;
    try { localStorage.setItem("brick_studio_lang", lang); } catch (e) {}

    const t = this.i18n[lang];

    // Dil seçici açılır menüsünü senkronize et
    const selectElem = document.getElementById("select-language");
    if (selectElem && selectElem.value !== lang) {
      selectElem.value = lang;
    }

    // Arayüz metinlerini güncelle
    const updateText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    updateText("label-model-select", t.modelLabel);
    updateText("btn-run-code-text", t.run);
    updateText("btn-stop-code-text", t.stop);
    updateText("label-arena-warehouse", t.arenaWarehouse);
    updateText("label-arena-track", t.arenaTrack);
    updateText("label-arena-sandbox", t.arenaSandbox);
    updateText("label-load-stl", t.loadStl);
    updateText("label-hud-dist", t.hudDist);
    updateText("label-hud-speed", t.hudSpeed);
    updateText("label-hud-fork", t.hudFork);
    updateText("label-hud-battery", t.hudBattery);

    updateText("label-editor-title", t.editorTitle);
    updateText("btn-sample-code-text", t.sampleCode);

    const btnClear = document.getElementById("btn-clear-code");
    if (btnClear) btnClear.title = t.clearCode;

    const btnReset = document.getElementById("btn-reset-robot");
    if (btnReset) btnReset.title = t.resetTooltip;

    const ratioBtnText = document.getElementById("btn-toggle-ratio-text");
    if (ratioBtnText) {
      ratioBtnText.innerText = this.isSimulationFullscreen ? t.exitFullscreen : t.fullscreen;
    }

    // Araç modeli seçeneklerini güncelle
    const modelSelect = document.getElementById("header-model-select");
    if (modelSelect && t.models) {
      for (const opt of modelSelect.options) {
        if (t.models[opt.value]) {
          opt.innerText = t.models[opt.value];
        }
      }
    }

    // Blockly toolbox kategorilerini güncelle
    if (typeof CyberBrickBlockly !== "undefined" && typeof CyberBrickBlockly.setLanguage === "function") {
      CyberBrickBlockly.setLanguage(lang);
    }

    if (notify && typeof showToast === "function") {
      showToast(t.langToast);
    }
  },

  switchMainTab: function(tabName) {
    this.currentMainTab = tabName || "editor";
    const paneEditor = document.getElementById("main-pane-editor");
    if (paneEditor) paneEditor.classList.remove("hidden");

    setTimeout(() => {
      this.refreshLayoutSizes();
    }, 80);
  },

  // Model Seçici (Forklift, Ekskavatör, Kamyon, Kart, Rover)
  onModelSelectChange: function(modelId) {
    CyberBrickSimulation.loadModel(modelId);
  },

  // Kodu Çalıştır / Durdur
  handleRunCode: function() {
    // Eğer kullanıcı başka bir sekmedeyse, robotun hareketini görmesi için editör sekmesine al
    if (this.currentMainTab !== "editor") {
      this.switchMainTab("editor");
    }

    CyberBrickRuntime.runBlocks();
    this.updateRunButtonState(true);
  },

  handleStopCode: function() {
    CyberBrickRuntime.stop();
    this.updateRunButtonState(false);
  },

  updateRunButtonState: function(isRunning) {
    const runBtn = document.getElementById("btn-run-code");
    const stopBtn = document.getElementById("btn-stop-code");
    if (runBtn && stopBtn) {
      runBtn.classList.toggle("hidden", isRunning);
      stopBtn.classList.toggle("hidden", !isRunning);
    }
  },

  // MicroPython Kodunu Göster / İndir Modalı
  showPythonCodeModal: function() {
    const pyCode = CyberBrickBlockly.generateMicroPython();
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal) return;

    title.innerHTML = `<i class="fab fa-python text-emerald-500 mr-2"></i>MicroPython V01.00.00.03 Kodu`;
    body.innerHTML = `
      <div class="space-y-3.5 text-xs">
        <p class="text-slate-500 dark:text-slate-400">
          Bloklarınız otomatik olarak CyberBrick Core Board (XA003 / ESP32-C3) standartlarında MicroPython koduna dönüştürülmüştür. Bu kodu kartınıza yükleyebilirsiniz.
        </p>

        <div class="relative bg-[#0d111a] rounded-2xl p-3 border border-slate-800 font-mono text-[11px] text-emerald-400 max-h-72 overflow-y-auto">
          <pre>${this.escapeHtml(pyCode)}</pre>
        </div>

        <div class="flex items-center justify-between pt-2">
          <button onclick="CyberBrickApp.copyPythonCode()" class="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors">
            <i class="fas fa-copy text-emerald-500"></i> Panoya Kopyala
          </button>
          <div class="flex gap-2">
            <button onclick="CyberBrickApp.downloadFile('boot.py', CyberBrickAPI.generateBootPy())" class="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors">
              boot.py İndir
            </button>
            <button onclick="CyberBrickApp.downloadFile('main.py', CyberBrickBlockly.generateMicroPython())" class="btn-bambu-primary text-xs">
              <i class="fas fa-download"></i> main.py İndir
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  },

  copyPythonCode: function() {
    const code = CyberBrickBlockly.generateMicroPython();
    navigator.clipboard.writeText(code).then(() => {
      showToast("MicroPython kodu panoya kopyalandı!");
    });
  },

  downloadFile: function(filename, content) {
    const blob = new Blob([content], { type: "text/x-python;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${filename} başarıyla indirildi!`);
  },

  // Tema Değiştirici (Açık / Koyu)
  toggleTheme: function() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle("dark", this.isDarkMode);

    const btn = document.getElementById("btn-theme-toggle");
    if (btn) {
      btn.innerHTML = this.isDarkMode 
        ? `<i class="fas fa-sun text-amber-400"></i>` 
        : `<i class="fas fa-moon text-slate-600"></i>`;
    }

    if (CyberBrickSimulation.scene) {
      CyberBrickSimulation.scene.background.setHex(this.isDarkMode ? 0x0c1017 : 0xf1f5f9);
      CyberBrickSimulation.scene.fog.color.setHex(this.isDarkMode ? 0x0c1017 : 0xf1f5f9);
    }
  },

  // Klavye Sürüş Kontrolleri
  setupKeyboardControls: function() {
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      const k = e.key.toLowerCase();
      let handled = false;

      if (k === "arrowup" || k === "w") {
        CyberBrickSimulation.setMotorsPwm(700, 700);
        handled = true;
      } else if (k === "arrowdown" || k === "s") {
        CyberBrickSimulation.setMotorsPwm(-700, -700);
        handled = true;
      } else if (k === "arrowleft" || k === "a") {
        CyberBrickSimulation.setMotorsPwm(-500, 500);
        handled = true;
      } else if (k === "arrowright" || k === "d") {
        CyberBrickSimulation.setMotorsPwm(500, -500);
        handled = true;
      } else if (k === "e") {
        const nextAng = Math.min(180, CyberBrickSimulation.robotState.servoAngle + 20);
        CyberBrickSimulation.setServoAngle(1, nextAng);
        handled = true;
      } else if (k === "q") {
        const nextAng = Math.max(0, CyberBrickSimulation.robotState.servoAngle - 20);
        CyberBrickSimulation.setServoAngle(1, nextAng);
        handled = true;
      } else if (k === " ") {
        CyberBrickRuntime.beep(120);
        handled = true;
      }

      if (handled) e.preventDefault();
    });

    window.addEventListener("keyup", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        if (!CyberBrickRuntime.isRunning) {
          CyberBrickSimulation.setMotorsPwm(0, 0);
        }
      }
    });
  },

  // Sanal Gamepad Butonları
  handleDpadPress: function(action) {
    if (action === "up") CyberBrickSimulation.setMotorsPwm(700, 700);
    else if (action === "down") CyberBrickSimulation.setMotorsPwm(-700, -700);
    else if (action === "left") CyberBrickSimulation.setMotorsPwm(-500, 500);
    else if (action === "right") CyberBrickSimulation.setMotorsPwm(500, -500);
    else if (action === "lift-up") {
      const ang = Math.min(180, CyberBrickSimulation.robotState.servoAngle + 20);
      CyberBrickSimulation.setServoAngle(1, ang);
    } else if (action === "lift-down") {
      const ang = Math.max(0, CyberBrickSimulation.robotState.servoAngle - 20);
      CyberBrickSimulation.setServoAngle(1, ang);
    } else if (action === "horn") {
      CyberBrickRuntime.beep(120);
    }
  },

  handleDpadRelease: function() {
    if (!CyberBrickRuntime.isRunning) {
      CyberBrickSimulation.setMotorsPwm(0, 0);
    }
  },

  // Seri Monitör Log Ekleme
  appendSerialLog: function(entry) {
    if (this.isSerialPaused) return;
    const logEl = document.getElementById("serial-monitor-logs");
    if (!logEl) return;

    const row = document.createElement("div");
    row.className = "flex items-start gap-1.5 py-0.5 leading-tight font-mono text-[11px]";

    let color = "text-slate-600 dark:text-slate-300";
    if (entry.type === "system") color = "text-emerald-600 dark:text-emerald-400 font-bold";
    else if (entry.type === "error") color = "text-rose-600 dark:text-rose-400 font-bold";
    else if (entry.type === "warning") color = "text-amber-600 dark:text-amber-400";
    else if (entry.type === "output") color = "text-indigo-600 dark:text-indigo-300";

    row.innerHTML = `<span class="text-slate-400 select-none">[${entry.timestamp}]</span><span class="${color}">${this.escapeHtml(entry.text)}</span>`;
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  },

  clearSerialLog: function() {
    const logEl = document.getElementById("serial-monitor-logs");
    if (logEl) logEl.innerHTML = "";
  },

  // Telemetri Güncelleme
  updateTelemetryUI: function(data) {
    const dEl = document.getElementById("hud-distance");
    const sEl = document.getElementById("hud-speed");
    const bEl = document.getElementById("hud-battery");
    const fEl = document.getElementById("hud-fork");

    if (dEl) dEl.innerText = `${data.distance} cm`;
    if (sEl) sEl.innerText = `${data.speedKmh} km/s`;
    if (bEl) bEl.innerText = `${data.batteryVoltage} V`;
    if (fEl) fEl.innerText = `${Math.round((data.servoAngle / 180) * 100)}%`;
  },

  setupUIEvents: function() {
    // Seri Port REPL giriş kutusu
    const input = document.getElementById("serial-input-field");
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim()) {
          const cmd = input.value.trim();
          this.appendSerialLog({ timestamp: new Date().toLocaleTimeString(), text: `>>> ${cmd}`, type: "system" });
          input.value = "";
        }
      });
    }

    // Modal Kapatma
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.getElementById("modal-generic").classList.add("hidden");
      });
    });
  },

  escapeHtml: function(str) {
    const div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
  }
};

function showToast(msg) {
  const toast = document.getElementById("toast-notification");
  const text = document.getElementById("toast-text");
  if (!toast || !text) return;

  text.innerText = msg;
  toast.classList.remove("translate-y-16", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-16", "opacity-0");
  }, 2800);
}

document.addEventListener("DOMContentLoaded", () => {
  CyberBrickApp.init();
});
