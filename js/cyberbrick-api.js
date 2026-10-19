/**
 * CyberBrick Eğitim ve Geliştirme Stüdyosu
 * CyberBrick Donanım, Pinout & MicroPython V01.00.00.03 API Standartları
 */

const CyberBrickAPI = {
  version: "V01.00.00.03",
  mcu: "ESP32-C3 RISC-V (160MHz)",
  board: "CyberBrick Multi-Function Core Board (XA003)",
  serialBaudRate: 115200,

  // Resmi Pin Eşleşme Veritabanı
  pinout: {
    motors: {
      ch1: { label: "Motor 1 (Sol)", pinA: "GPIO4", pinB: "GPIO5", type: "PWM", range: [-1024, 1024] },
      ch2: { label: "Motor 2 (Sağ)", pinA: "GPIO6", pinB: "GPIO7", type: "PWM", range: [-1024, 1024] }
    },
    servos: {
      ch1: { label: "Servo 1 (Pan)", pin: "GPIO0", type: "PWM (50Hz)", range: [0, 180] },
      ch2: { label: "Servo 2 (Tilt)", pin: "GPIO1", type: "PWM (50Hz)", range: [0, 180] },
      ch3: { label: "Servo 3 (Ek)", pin: "GPIO2", type: "PWM (50Hz)", range: [0, 180] },
      ch4: { label: "Servo 4 (Ek)", pin: "GPIO3", type: "PWM (50Hz)", range: [0, 180] }
    },
    sensors: {
      ultrasonic: { label: "HC-SR04 Mesafe", trig: "GPIO10", echo: "GPIO8", unit: "cm", min: 2, max: 400 },
      lineTracker: { label: "Çizgi Sensörü (IR)", left: "GPIO9", right: "GPIO7", type: "Digital / Analog" },
      oledDisplay: { label: "SSD1306 OLED (0.96\")", sda: "GPIO20", scl: "GPIO21", i2cAddress: "0x3C" }
    },
    peripherals: {
      rgbLed: { label: "Onboard WS2812 RGB", pin: "GPIO8", type: "NeoPixel Addressable" },
      buzzer: { label: "Aktif/Pasif Buzzer", pin: "GPIO3", type: "PWM Frequency" },
      userButton: { label: "BOOT/User Butonu", pin: "GPIO9", active: "LOW" },
      batteryAdc: { label: "Akü Gerilim Ölçümü", pin: "GPIO0", dividerRatio: 3.2 }
    }
  },

  // MakerWorld MicroPython V01.00.00.03 İçin Standart boot.py Şablonu
  generateBootPy: function() {
    return `# ==========================================================
# CyberBrick Multi-Function Core (XA003) - boot.py
# Standart: MicroPython for CyberBrick V01.00.00.03
# MakerWorld Uyumlu Sistem Başlangıç Betiği
# ==========================================================
import machine
import gc
import esp

# Hata ayıklama mesajlarını seri portta etkinleştir
esp.osdebug(None)

# Çöp toplayıcı optimizasyonu
gc.collect()

print("[CyberBrick Core] Sistem başlatıldı. MicroPython V01.00.00.03 hazır.")
print("[CyberBrick Core] main.py çalıştırılıyor...")
`;
  },

  // Standart main.py Şablonu
  generateMainPy: function(customCode = "") {
    if (customCode && customCode.trim().length > 0) {
      return customCode;
    }
    return `# ==========================================================
# CyberBrick Robotik Kontrol Betiği - main.py
# Donanım: CyberBrick XA003 Core (ESP32-C3)
# Standart: MicroPython for CyberBrick V01.00.00.03
# ==========================================================
import time
from bbl.motors import MotorsController
from bbl.servos import ServosController
from bbl.leds import LEDController
from bbl.buzzer import BuzzerController

# Sürücü denetleyicilerini başlat
motors = MotorsController()
servos = ServosController()
leds = LEDController()
buzzer = BuzzerController()

# Başlangıç bildirimi: RGB Yeşil + Bip
leds.set_color(0, 255, 0)
buzzer.beep(100)
time.sleep_ms(300)

print("[CyberBrick] Robot goreve hazir!")

# Temel Döngü
try:
    while True:
        # İleri hareket (Yüzde 50 güç = 512)
        motors.set_speed(1, 512)
        motors.set_speed(2, 512)
        time.sleep_ms(1000)
        
        # Dur ve bekle
        motors.set_speed(1, 0)
        motors.set_speed(2, 0)
        time.sleep_ms(500)
        
except KeyboardInterrupt:
    # Güvenli durdurma
    motors.set_speed(1, 0)
    motors.set_speed(2, 0)
    leds.set_color(255, 0, 0)
    print("[CyberBrick] Program durduruldu.")
`;
  },

  // 3D Baskı için parça listesi ve MakerWorld parametreleri
  partsCatalog: [
    {
      id: "cb-core-xa003",
      name: "CyberBrick Multi-Function Core (XA003)",
      category: "brain",
      icon: "fa-microchip",
      makerWorldUrl: "https://makerworld.com/en/cyberbrick",
      filament: "Bambu PLA Basic / Siyah",
      printTime: "25 dk",
      weight: "14g",
      infill: "25% Gyroid",
      layerHeight: "0.20mm Standard",
      description: "ESP32-C3 işlemcili, USB-C REPL, WS2812 durum LED'li ana robotik beyin kartı gövdesi.",
      mounted: true,
      removable: false
    },
    {
      id: "cb-chassis-2wd",
      name: "CyberBrick 2WD Modüler Şasi V2",
      category: "chassis",
      icon: "fa-cube",
      makerWorldUrl: "https://makerworld.com/en/models/cb-chassis",
      filament: "Bambu PETG-HF / Koyu Gri",
      printTime: "1 sa 45 dk",
      weight: "68g",
      infill: "30% Grid",
      layerHeight: "0.20mm Strength",
      description: "Lego Technic pin yuvaları ve modüler klips kanalları olan ana gövde taşıyıcı şasisi.",
      mounted: true,
      removable: false
    },
    {
      id: "cb-motors-wheels",
      name: "N20 DC Dişli Motorlar & Kauçuk Lastikler",
      category: "actuator",
      icon: "fa-cog",
      makerWorldUrl: "https://makerworld.com/en/models/cb-wheel-traction",
      filament: "Bambu PLA + TPU 95A (Lastik)",
      printTime: "1 sa 10 dk",
      weight: "44g",
      infill: "100% (TPU) / 35% (Jant)",
      layerHeight: "0.16mm High Quality",
      description: "Yüksek torklu N20 motor yuvası ve yüksek tutuşlu 60mm esnek TPU desenli tekerlekler.",
      mounted: true,
      removable: true
    },
    {
      id: "cb-ultrasonic-mount",
      name: "HC-SR04 Ultrasonik Sensör Yuvası",
      category: "sensor",
      icon: "fa-wifi",
      makerWorldUrl: "https://makerworld.com/en/models/cb-hcsr04-bracket",
      filament: "Bambu PLA Matte / Bambu Turuncu",
      printTime: "22 dk",
      weight: "12g",
      infill: "20% Gyroid",
      layerHeight: "0.20mm Standard",
      description: "2cm-400cm engel algılama için ön tampona geçmeli titreşimsiz sensör tutucu.",
      mounted: true,
      removable: true
    },
    {
      id: "cb-line-tracker",
      name: "Dual IR Çizgi İzleyen Sensör Kızağı",
      category: "sensor",
      icon: "fa-road",
      makerWorldUrl: "https://makerworld.com/en/models/cb-ir-line-mount",
      filament: "Bambu PLA Basic / Siyah",
      printTime: "18 dk",
      weight: "9g",
      infill: "25% Grid",
      layerHeight: "0.20mm Standard",
      description: "Yerden 8mm optimum mesafe ayarlı, sol ve sağ siyah çizgi algılama aparatı.",
      mounted: true,
      removable: true
    },
    {
      id: "cb-servo-pantilt",
      name: "9g Mikro Servo Radar Başlığı",
      category: "actuator",
      icon: "fa-compass",
      makerWorldUrl: "https://makerworld.com/en/models/cb-servo-mount",
      filament: "Bambu PLA Basic / Mavi",
      printTime: "35 dk",
      weight: "16g",
      infill: "30% Gyroid",
      layerHeight: "0.16mm Optimal",
      description: "Ultrasonik sensörü 180 derece sağa-sola döndürerek radar haritalaması yaptıran servo dişlisi.",
      mounted: false,
      removable: true
    },
    {
      id: "cb-battery-2s",
      name: "18650 2S Li-Ion Batarya Kutusu",
      category: "power",
      icon: "fa-battery-full",
      makerWorldUrl: "https://makerworld.com/en/models/cb-battery-pack",
      filament: "Bambu PETG-HF / Kırmızı",
      printTime: "55 dk",
      weight: "36g",
      infill: "40% Grid",
      layerHeight: "0.20mm Strength",
      description: "7.4V çift 18650 pil yuvası, güvenlik sigortası ve kilitlenebilir kapak.",
      mounted: true,
      removable: true
    },
    {
      id: "cb-front-bumper",
      name: "TPU Darbe Emici Tampon",
      category: "chassis",
      icon: "fa-shield-alt",
      makerWorldUrl: "https://makerworld.com/en/models/cb-tpu-bumper",
      filament: "Bambu TPU 95A / Neon Mavi",
      printTime: "40 dk",
      weight: "22g",
      infill: "15% Gyroid (Esnek)",
      layerHeight: "0.20mm Standard",
      description: "Çarpışmalarda robot gövdesini ve sensörleri koruyan esnek petek yapılı ön bar.",
      mounted: false,
      removable: true
    }
  ]
};

// Global dışa aktarım
if (typeof window !== "undefined") {
  window.CyberBrickAPI = CyberBrickAPI;
}
