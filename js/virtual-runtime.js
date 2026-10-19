/**
 * CyberBrick Egitim ve Gelistirme Studyosu
 * Sanal Calisma Zamani Motoru, Dogrudan Blok Yurutecleri ve Web Audio Ses Sentezleyicisi
 * 
 * Blok kodlarini dogrudan asenkron yurultur ve 3D robotu canlandirir.
 */

const CyberBrickRuntime = {
  isRunning: false,
  audioCtx: null,
  baudRate: 115200,

  onLogCallback: null,
  onTelemetryCallback: null,

  init: function(logCallback, telemetryCallback) {
    this.onLogCallback = logCallback;
    this.onTelemetryCallback = telemetryCallback;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioCtx = new AudioContext();
    }

    // Telemetri Yayin Dongusu (20Hz)
    setInterval(() => {
      this.emitTelemetry();
    }, 50);
  },

  // Web Audio ile Gercek CyberBrick Hoparlor & Korna Sesi
  playTone: function(frequency, durationMs) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency || 1200, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (durationMs || 100) / 1000);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs || 100) / 1000);
    } catch (e) {
      console.warn("AudioContext calma hatasi:", e);
    }
  },

  beep: function(durationMs = 120) {
    this.playTone(1800, durationMs);
  },

  log: function(message, type = "info") {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
    
    if (typeof this.onLogCallback === "function") {
      this.onLogCallback({
        timestamp: timeStr,
        text: String(message),
        type: type
      });
    }
  },

  emitTelemetry: function() {
    if (typeof this.onTelemetryCallback !== "function") return;
    if (typeof CyberBrickSimulation === "undefined") return;

    const state = CyberBrickSimulation.robotState;
    this.onTelemetryCallback({
      distance: state.ultrasonicDistance,
      leftLine: state.leftLineDetected,
      rightLine: state.rightLineDetected,
      leftPwm: state.leftPwm,
      rightPwm: state.rightPwm,
      servoAngle: state.servoAngle,
      speedKmh: state.speedKmh.toFixed(1),
      headingDeg: Math.round(((state.heading * 180) / Math.PI + 360) % 360),
      batteryVoltage: (7.4 - (Math.abs(state.leftPwm) + Math.abs(state.rightPwm)) * 0.00015).toFixed(2),
      rgb: state.rgbColor
    });
  },

  // BLOKLARI DOGRUDAN VE KESINTISIZ YURUTEN ASENKRON MOTOR
  runBlocks: async function() {
    if (this.isRunning) {
      this.stop();
      await this.sleep(100);
    }

    this.isRunning = true;
    if (typeof CyberBrickApp !== "undefined") {
      CyberBrickApp.updateRunButtonState(true);
    }

    this.log(`--- [ESP32-C3] Brick Core Bağlandı (${this.baudRate} baud) ---`, "system");
    this.log("[Brick Studio] Blok programı başlatılıyor...", "system");

    try {
      await this.executeWorkspaceDirectly();
      if (this.isRunning) {
        this.log("[Brick Studio] Program başarıyla tamamlandı.", "system");
        if (typeof showToast === "function") {
          showToast("Program başarıyla tamamlandı.");
        }
      }
    } catch (err) {
      this.log("Çalışma Hatası: " + err.message, "error");
      console.error(err);
    } finally {
      this.stop();
    }
  },

  // Çalışma alanındaki blok ağacını doğrudan yorumlama
  executeWorkspaceDirectly: async function() {
    if (!CyberBrickBlockly.workspace) return;

    const topBlocks = CyberBrickBlockly.workspace.getTopBlocks(true);
    if (!topBlocks || topBlocks.length === 0) {
      this.log("Çalıştırılacak blok bulunamadı.", "warning");
      return;
    }

    for (const topBlock of topBlocks) {
      if (!this.isRunning) break;
      await this.executeBlockChain(topBlock);
    }
  },

  executeBlockChain: async function(startBlock) {
    let curr = startBlock;
    while (curr && this.isRunning) {
      if (CyberBrickBlockly.workspace && typeof CyberBrickBlockly.workspace.highlightBlock === "function") {
        CyberBrickBlockly.workspace.highlightBlock(curr.id);
      }

      await this.executeSingleBlock(curr);

      if (!this.isRunning) break;
      curr = curr.getNextBlock();
    }

    if (CyberBrickBlockly.workspace && typeof CyberBrickBlockly.workspace.highlightBlock === "function") {
      CyberBrickBlockly.workspace.highlightBlock(null);
    }
  },

  executeSingleBlock: async function(block) {
    if (!block || !this.isRunning) return;

    const type = block.type;

    if (type === "cb_move_timed") {
      const dir = block.getFieldValue("DIR") || "FORWARD";
      const speed = this.evalNumInput(block, "SPEED", 60);
      const secs = this.evalNumInput(block, "SECS", 1.5);
      await CyberBrickActions.moveTimed(dir, speed, secs);
    }
    else if (type === "cb_move_distance") {
      const dir = block.getFieldValue("DIR") || "FORWARD";
      const dist = this.evalNumInput(block, "DIST", 50);
      const speed = this.evalNumInput(block, "SPEED", 50);
      await CyberBrickActions.moveDistance(dir, dist, speed);
    }
    else if (type === "cb_turn_angle") {
      const dir = block.getFieldValue("DIR") || "RIGHT";
      const angle = this.evalNumInput(block, "ANGLE", 90);
      const speed = this.evalNumInput(block, "SPEED", 55);
      await CyberBrickActions.turnAngle(dir, angle, speed);
    }
    else if (type === "cb_move_direction") {
      const dir = block.getFieldValue("DIR") || "FORWARD";
      const speed = this.evalNumInput(block, "SPEED", 50);
      CyberBrickActions.moveDirection(dir, speed);
    }
    else if (type === "cb_move_tank") {
      const l = this.evalNumInput(block, "L_SPEED", 50);
      const r = this.evalNumInput(block, "R_SPEED", 50);
      CyberBrickActions.moveTank(l, r);
    }
    else if (type === "cb_stop_motors") {
      CyberBrickActions.stopMotors();
    }
    else if (type === "cb_forklift_lift") {
      const h = this.evalNumInput(block, "HEIGHT", 80);
      await CyberBrickActions.setForkliftHeight(h);
    }
    else if (type === "cb_forklift_preset") {
      const preset = Number(block.getFieldValue("PRESET")) || 0;
      await CyberBrickActions.setForkliftHeight(preset);
    }
    else if (type === "cb_servo_angle") {
      const ang = this.evalNumInput(block, "ANGLE", 90);
      await CyberBrickActions.setServoAngle(1, ang);
    }
    else if (type === "cb_set_rgb") {
      const col = block.getFieldValue("COLOR") || "0, 174, 66";
      const parts = col.split(",").map(s => Number(s.trim()));
      CyberBrickActions.setRgbColor(parts[0] || 0, parts[1] || 174, parts[2] || 66);
    }
    else if (type === "cb_horn_beep") {
      const ms = this.evalNumInput(block, "MS", 120);
      CyberBrickActions.beep(ms);
      await this.sleep(ms + 40);
    }
    else if (type === "cb_wait_ms") {
      const ms = this.evalNumInput(block, "MS", 500);
      await CyberBrickActions.wait(ms);
    }
    else if (type === "cb_print_log") {
      const txt = this.evalTextInput(block, "TEXT", "Brick Görev");
      CyberBrickActions.print(txt);
    }
    else if (type === "cb_loop_forever") {
      const branch = block.getInputTargetBlock("DO");
      while (this.isRunning) {
        if (branch) await this.executeBlockChain(branch);
        await this.sleep(25);
      }
    }
    else if (type === "controls_repeat_ext" || type === "controls_repeat") {
      const times = Math.max(1, Math.min(100, Math.round(
        block.type === "controls_repeat"
          ? (Number(block.getFieldValue("TIMES")) || 3)
          : this.evalNumInput(block, "TIMES", 3)
      )));
      const branch = block.getInputTargetBlock("DO");
      for (let i = 0; i < times && this.isRunning; i++) {
        if (branch) await this.executeBlockChain(branch);
        await this.sleep(10);
      }
    }
    else if (type === "controls_whileUntil") {
      const mode = block.getFieldValue("MODE") || "WHILE";
      const branch = block.getInputTargetBlock("DO");
      while (this.isRunning) {
        const cond = this.evalBoolInput(block, "BOOL");
        const shouldRun = (mode === "WHILE") ? cond : !cond;
        if (!shouldRun) break;
        if (branch) await this.executeBlockChain(branch);
        await this.sleep(20);
      }
    }
    else if (type === "controls_if") {
      let handled = false;
      let i = 0;
      while (block.getInput("IF" + i)) {
        const cond = this.evalBoolInput(block, "IF" + i);
        if (cond) {
          const doBranch = block.getInputTargetBlock("DO" + i) || (i === 0 ? block.getInputTargetBlock("DO") : null);
          if (doBranch) await this.executeBlockChain(doBranch);
          handled = true;
          break;
        }
        i++;
      }
      if (!handled) {
        const elseBranch = block.getInputTargetBlock("ELSE");
        if (elseBranch) await this.executeBlockChain(elseBranch);
      }
    }
  },

  evalNumInput: function(block, inputName, defaultVal) {
    if (!block) return defaultVal;
    const target = block.getInputTargetBlock(inputName);
    if (!target) {
      const fv = block.getFieldValue(inputName);
      if (fv !== null && fv !== undefined && fv !== "") {
        const num = Number(fv);
        return isNaN(num) ? defaultVal : num;
      }
      return defaultVal;
    }

    if (target.type === "math_number") {
      const v = Number(target.getFieldValue("NUM"));
      return isNaN(v) ? defaultVal : v;
    }
    if (target.type === "cb_get_distance") {
      return CyberBrickActions.getDistance();
    }
    if (target.type === "math_arithmetic") {
      const op = target.getFieldValue("OP") || "ADD";
      const a = this.evalNumInput(target, "A", 0);
      const b = this.evalNumInput(target, "B", 0);
      if (op === "ADD") return a + b;
      if (op === "MINUS") return a - b;
      if (op === "MULTIPLY") return a * b;
      if (op === "DIVIDE") return b !== 0 ? a / b : 0;
      if (op === "POWER") return Math.pow(a, b);
    }
    return defaultVal;
  },

  evalTextInput: function(block, inputName, defaultVal) {
    if (!block) return defaultVal;
    const target = block.getInputTargetBlock(inputName);
    if (!target) {
      const fv = block.getFieldValue(inputName);
      return (fv !== null && fv !== undefined) ? fv : defaultVal;
    }
    if (target.type === "text") {
      return target.getFieldValue("TEXT") || defaultVal;
    }
    return defaultVal;
  },

  evalBoolInput: function(block, inputName) {
    if (!block) return false;
    const target = block.getInputTargetBlock(inputName);
    if (!target) {
      const fv = block.getFieldValue(inputName);
      if (fv === "TRUE") return true;
      if (fv === "FALSE") return false;
      return false;
    }

    if (target.type === "cb_is_obstacle") {
      const dist = this.evalNumInput(target, "DIST", 25);
      return CyberBrickActions.isObstacleNear(dist);
    }
    if (target.type === "cb_get_line") {
      const s = target.getFieldValue("SENSOR") || "LEFT";
      return CyberBrickActions.isLineDetected(s);
    }
    if (target.type === "logic_boolean") {
      return target.getFieldValue("BOOL") === "TRUE";
    }
    if (target.type === "logic_operation") {
      const op = target.getFieldValue("OP") || "AND";
      const a = this.evalBoolInput(target, "A");
      const b = this.evalBoolInput(target, "B");
      return op === "AND" ? (a && b) : (a || b);
    }
    if (target.type === "logic_negate") {
      return !this.evalBoolInput(target, "BOOL");
    }
    if (target.type === "logic_compare") {
      const op = target.getFieldValue("OP") || "EQ";
      const a = this.evalNumInput(target, "A", 0);
      const b = this.evalNumInput(target, "B", 0);
      if (op === "EQ") return a === b;
      if (op === "NEQ") return a !== b;
      if (op === "LT") return a < b;
      if (op === "LTE") return a <= b;
      if (op === "GT") return a > b;
      if (op === "GTE") return a >= b;
    }
    return false;
  },

  stop: function() {
    this.isRunning = false;
    if (typeof CyberBrickSimulation !== "undefined") {
      CyberBrickSimulation.setMotorsPwm(0, 0);
    }
    this.log("[Brick Core] Robot durduruldu (STOP).", "warning");

    if (typeof CyberBrickApp !== "undefined") {
      CyberBrickApp.updateRunButtonState(false);
    }

    if (CyberBrickBlockly.workspace && typeof CyberBrickBlockly.workspace.highlightBlock === "function") {
      CyberBrickBlockly.workspace.highlightBlock(null);
    }
  },

  sleep: function(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
  }
};

if (typeof window !== "undefined") {
  window.CyberBrickRuntime = CyberBrickRuntime;
}
