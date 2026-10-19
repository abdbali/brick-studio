/**
 * CyberBrick Eğitim ve Geliştirme Stüdyosu
 * Gerçek Zamanlı Robotik Eylem Motoru (CyberBrick Actions)
 * 
 * Blokların 3D robotu doğrudan ve kusursuz hareket ettirmesini sağlar.
 */

const CyberBrickActions = {
  // 1. Süreli Yön Hareketi (İleri, Geri, Sola, Sağa)
  moveTimed: async function(dir, speedPct, seconds) {
    if (!CyberBrickRuntime.isRunning) return;

    speedPct = Math.max(0, Math.min(100, Number(speedPct) || 50));
    const pwm = Math.round(speedPct * 10.24);

    let l = pwm, r = pwm;
    if (dir === 'BACKWARD') { l = -pwm; r = -pwm; }
    else if (dir === 'LEFT') { l = -pwm; r = pwm; }
    else if (dir === 'RIGHT') { l = pwm; r = -pwm; }

    CyberBrickSimulation.setMotorsPwm(l, r);
    CyberBrickRuntime.log(`[Sürüş] ${dir} - Hız: %${speedPct} (${seconds} sn)`, "info");

    const durationMs = Math.round((Number(seconds) || 1) * 1000);
    const step = 25;
    let elapsed = 0;

    while (elapsed < durationMs && CyberBrickRuntime.isRunning) {
      await CyberBrickRuntime.sleep(step);
      elapsed += step;
    }

    CyberBrickSimulation.setMotorsPwm(0, 0);
  },

  // 1b. Belirli Mesafe Sürüşü (cm cinsinden mesafe)
  moveDistance: async function(dir, distCm, speedPct) {
    if (!CyberBrickRuntime.isRunning) return;
    speedPct = Math.max(10, Math.min(100, Number(speedPct) || 50));
    distCm = Math.max(0, Number(distCm) || 50);
    // 3.0 m/s max linear hız, speedPct=50 iken v = 1.5 m/s = 150 cm/s
    const speedCmPerSec = (speedPct / 100) * 300;
    const durationSec = speedCmPerSec > 0 ? (distCm / speedCmPerSec) : 1;
    await this.moveTimed(dir, speedPct, Number(durationSec.toFixed(2)));
  },

  // 1c. Belirli Açı Dönüşü (Derece cinsinden dönüş)
  turnAngle: async function(dir, angleDeg, speedPct) {
    if (!CyberBrickRuntime.isRunning) return;
    speedPct = Math.max(15, Math.min(100, Number(speedPct) || 55));
    angleDeg = Math.max(0, Number(angleDeg) || 90);
    // Dönüş açısal hızı: omega = 2 * (speedPct/100 * 3.0) / 1.1 rad/s (wheelBase: 1.1m)
    const omega = (2 * (speedPct / 100) * 3.0) / 1.1;
    const targetRad = (angleDeg * Math.PI) / 180;
    const durationSec = omega > 0 ? (targetRad / omega) : 0.52;
    const turnDir = (dir === 'LEFT' || dir === 'SOL') ? 'LEFT' : 'RIGHT';
    await this.moveTimed(turnDir, speedPct, Number(durationSec.toFixed(2)));
  },

  // 2. Sürekli Yön Hareketi
  moveDirection: function(dir, speedPct) {
    if (!CyberBrickRuntime.isRunning) return;

    speedPct = Math.max(0, Math.min(100, Number(speedPct) || 50));
    const pwm = Math.round(speedPct * 10.24);

    let l = pwm, r = pwm;
    if (dir === 'BACKWARD') { l = -pwm; r = -pwm; }
    else if (dir === 'LEFT') { l = -pwm; r = pwm; }
    else if (dir === 'RIGHT') { l = pwm; r = -pwm; }

    CyberBrickSimulation.setMotorsPwm(l, r);
  },

  // 3. Tank Sürüşü (Bağımsız Sol/Sağ Motor)
  moveTank: function(leftPct, rightPct) {
    if (!CyberBrickRuntime.isRunning) return;
    const lPwm = Math.round((Number(leftPct) || 0) * 10.24);
    const rPwm = Math.round((Number(rightPct) || 0) * 10.24);
    CyberBrickSimulation.setMotorsPwm(lPwm, rPwm);
  },

  // 4. Motorları Frenle / Durdur
  stopMotors: function() {
    CyberBrickSimulation.setMotorsPwm(0, 0);
    CyberBrickRuntime.log("[Motorlar] Durduruldu.", "system");
  },

  // 5. Forklift Çatalını veya Ekskavatör Kepçesini Kaldır (0 - 100%)
  setForkliftHeight: async function(heightPct) {
    if (!CyberBrickRuntime.isRunning) return;

    heightPct = Math.max(0, Math.min(100, Number(heightPct) || 0));
    const targetAngle = Math.round(heightPct * 1.8); // 0-100% -> 0-180 derece

    CyberBrickSimulation.setServoAngle(1, targetAngle);
    CyberBrickRuntime.log(`[Mekanizma] Çatal Yüksekliği: %${heightPct} (Servo: ${targetAngle}°)`, "output");

    // Mekanizmanın yükselmesini 400ms simüle et
    await CyberBrickRuntime.sleep(400);
  },

  // 6. Servo Açısını Doğrudan Ayarla (0-180°)
  setServoAngle: async function(channel, angle) {
    if (!CyberBrickRuntime.isRunning) return;
    angle = Math.max(0, Math.min(180, Number(angle) || 90));
    CyberBrickSimulation.setServoAngle(channel || 1, angle);
    await CyberBrickRuntime.sleep(100);
  },

  // 7. Ultrasonik Sensörden Mesafe Oku (cm)
  getDistance: function() {
    return CyberBrickSimulation.robotState.ultrasonicDistance;
  },

  // 8. Engel Belirtilen Mesafeden Yakın mı?
  isObstacleNear: function(distCm) {
    const d = CyberBrickSimulation.robotState.ultrasonicDistance;
    return d < (Number(distCm) || 25);
  },

  // 9. Çizgi Sensörü Durumu (LEFT veya RIGHT)
  isLineDetected: function(sensor) {
    if (sensor === 'LEFT') {
      return CyberBrickSimulation.robotState.leftLineDetected;
    }
    return CyberBrickSimulation.robotState.rightLineDetected;
  },

  // 10. RGB Durum LED'ini Yak
  setRgbColor: function(r, g, b) {
    CyberBrickSimulation.setRgbColor(Number(r) || 0, Number(g) || 0, Number(b) || 0);
  },

  // 11. Korna / Bip Sesi Çal
  beep: function(durationMs) {
    CyberBrickRuntime.beep(Number(durationMs) || 120);
  },

  // 12. Bekle (ms)
  wait: async function(ms) {
    const target = Math.max(0, Number(ms) || 500);
    const step = 25;
    let elapsed = 0;
    while (elapsed < target && CyberBrickRuntime.isRunning) {
      await CyberBrickRuntime.sleep(step);
      elapsed += step;
    }
  },

  // 13. Konsola Yaz
  print: function(msg) {
    CyberBrickRuntime.log(String(msg), "output");
  }
};

if (typeof window !== "undefined") {
  window.CyberBrickActions = CyberBrickActions;
}
