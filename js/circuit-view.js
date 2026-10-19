/**
 * CyberBrick Eğitim ve Geliştirme Stüdyosu
 * Modül: Görsel Devre ve Pin Bağlantı Yöneticisi (CyberBrick App İlhamlı)
 * 
 * Referans: CyberBrick Controller Core XA003 Pin Yapılandırması (Görsel 2, 4, 5)
 */

const CyberBrickCircuitView = {
  containerId: null,
  activePinCard: null,

  pins: [
    {
      id: "pin-m1",
      name: "Motor 1 (Sol Çekiş / Palet)",
      channel: "PWM CH1",
      pinsText: "GPIO4 & GPIO5",
      type: "motor",
      side: "left",
      yOffset: 90,
      icon: "fa-cog",
      color: "#00ae42",
      description: "Sol tekerlek veya sol palet N20 DC dişli motor sürücüsü (-1024..+1024 PWM)."
    },
    {
      id: "pin-m2",
      name: "Motor 2 (Sağ Çekiş / Palet)",
      channel: "PWM CH2",
      pinsText: "GPIO6 & GPIO7",
      type: "motor",
      side: "left",
      yOffset: 190,
      icon: "fa-cog",
      color: "#00ae42",
      description: "Sağ tekerlek veya sağ palet N20 DC motor sürücüsü (-1024..+1024 PWM)."
    },
    {
      id: "pin-s1",
      name: "Servo 1 (Çatal / Kepçe Kaldırma)",
      channel: "Servo CH1",
      pinsText: "GPIO0 (50Hz)",
      type: "servo",
      side: "left",
      yOffset: 290,
      icon: "fa-arrows-alt-v",
      color: "#ff6a00",
      description: "Forklift çatalını yukarı-aşağı veya ekskavatör kepçesini hareket ettiren 9g servo."
    },
    {
      id: "pin-s2",
      name: "Servo 2 (Radar / Pan Taraması)",
      channel: "Servo CH2",
      pinsText: "GPIO1 (50Hz)",
      type: "servo",
      side: "right",
      yOffset: 90,
      icon: "fa-compass",
      color: "#ff6a00",
      description: "Ultrasonik sensörü sağa-sola 180 derece döndüren radar tarama servosu."
    },
    {
      id: "pin-us",
      name: "HC-SR04 Ultrasonik Sensör",
      channel: "Sonar CH",
      pinsText: "Trig: GPIO10 / Echo: GPIO8",
      type: "sensor",
      side: "right",
      yOffset: 190,
      icon: "fa-wifi",
      color: "#00b4d8",
      description: "Öndeki engellerin mesafesini ses dalgalarıyla 2cm-400cm aralığında ölçen sensör."
    },
    {
      id: "pin-ir",
      name: "Dual IR Çizgi Sensörü",
      channel: "IR Track",
      pinsText: "Sol: GPIO9 / Sağ: GPIO7",
      type: "sensor",
      side: "right",
      yOffset: 290,
      icon: "fa-road",
      color: "#10b981",
      description: "Zemindeki siyah yarış çizgisini optik olarak algılayan sol ve sağ kızılötesi sensörler."
    },
    {
      id: "pin-rgb",
      name: "Onboard WS2812 RGB & Buzzer",
      channel: "System IO",
      pinsText: "LED: GPIO8 / Buzzer: GPIO3",
      type: "output",
      side: "bottom",
      yOffset: 400,
      icon: "fa-lightbulb",
      color: "#ec4899",
      description: "Dahili adreslenebilir durum LED'i ve sesli geri vites/uyarı hoparlörü."
    }
  ],

  init: function(containerId) {
    this.containerId = containerId;
    this.render();
  },

  render: function() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    let html = `
      <div class="h-full flex flex-col bg-[#f8fafc] dark:bg-[#0b0f19] overflow-hidden select-none">
        
        <!-- Üst Kontrol Barı (CyberBrick App Stili) -->
        <div class="h-12 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="apple-segmented-control">
              <button class="apple-segmented-btn active">
                <i class="fas fa-sliders-h"></i> Pin Konfigürasyonu
              </button>
              <button onclick="CyberBrickCircuitView.showDeviceModal()" class="apple-segmented-btn">
                <i class="fas fa-microchip"></i> Cihaz Yönetimi (Receiver1)
              </button>
            </div>
            <span class="text-xs text-slate-500 font-mono hidden sm:inline">
              Donanım: CyberBrick XA003 (ESP32-C3)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="badge-live-pulse text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              AutoSync: ON
            </span>
            <button onclick="CyberBrickCircuitView.resetPins()" class="px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <i class="fas fa-redo-alt mr-1"></i> Sıfırla
            </button>
          </div>
        </div>

        <!-- İnteraktif Devre Şeması Kanvası -->
        <div class="flex-1 relative overflow-auto p-4 flex items-center justify-center min-h-[500px]">
          
          <div class="relative w-[860px] h-[480px] shrink-0">
            
            <!-- SVG Bağlantı Kabloları (Bezier Curves) -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" id="circuit-svg-canvas">
              <!-- Sol Üst: Motor 1 -->
              <path d="M 235 90 C 330 90, 360 185, 395 185" fill="none" stroke="#00ae42" stroke-width="2.5" class="circuit-wire" />
              <!-- Sol Orta: Motor 2 -->
              <path d="M 235 190 C 330 190, 360 215, 395 215" fill="none" stroke="#00ae42" stroke-width="2.5" class="circuit-wire" />
              <!-- Sol Alt: Servo 1 -->
              <path d="M 235 290 C 330 290, 360 245, 395 245" fill="none" stroke="#ff6a00" stroke-width="2.5" class="circuit-wire" />

              <!-- Sağ Üst: Servo 2 -->
              <path d="M 625 90 C 530 90, 500 185, 465 185" fill="none" stroke="#ff6a00" stroke-width="2.5" class="circuit-wire" />
              <!-- Sağ Orta: HC-SR04 -->
              <path d="M 625 190 C 530 190, 500 215, 465 215" fill="none" stroke="#00b4d8" stroke-width="2.5" class="circuit-wire" />
              <!-- Sağ Alt: IR Line Tracker -->
              <path d="M 625 290 C 530 290, 500 245, 465 245" fill="none" stroke="#10b981" stroke-width="2.5" class="circuit-wire" />

              <!-- Alt: WS2812 RGB & Buzzer -->
              <path d="M 430 380 C 430 330, 430 310, 430 285" fill="none" stroke="#ec4899" stroke-width="2.5" class="circuit-wire" />
            </svg>

            <!-- SOL BAĞLANTI KARTLARI (Motorlar ve Servo 1) -->
            <div class="absolute left-0 top-0 w-56 space-y-3 z-20">
              ${this.renderCard(this.pins[0])}
              ${this.renderCard(this.pins[1])}
              ${this.renderCard(this.pins[2])}
            </div>

            <!-- MERKEZİ CYBERBRICK KART GÖRSELİ (XA003 Core Board) -->
            <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-[#090d16] border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col items-center justify-between p-3 z-20">
              
              <!-- 4 Altın/Sarı Köşe Montaj Halkası -->
              <div class="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-[#f59e0b] bg-[#f59e0b]/20 flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
              </div>
              <div class="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-[#f59e0b] bg-[#f59e0b]/20 flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
              </div>
              <div class="absolute bottom-2 left-2 w-5 h-5 rounded-full border-2 border-[#f59e0b] bg-[#f59e0b]/20 flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
              </div>
              <div class="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-[#f59e0b] bg-[#f59e0b]/20 flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
              </div>

              <!-- Üst Bağlantı Pin Padleri -->
              <div class="flex gap-1.5 pt-0.5">
                <span class="w-2 h-1.5 rounded-sm bg-yellow-500"></span>
                <span class="w-2 h-1.5 rounded-sm bg-yellow-500"></span>
                <span class="w-2 h-1.5 rounded-sm bg-yellow-500"></span>
              </div>

              <!-- Ortada ESP32-C3 RISC-V Metal Çip -->
              <div class="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 rounded-xl shadow-inner flex flex-col items-center justify-center p-1 text-center">
                <div class="text-[9px] font-bold tracking-wider text-slate-300 font-mono">ESP32-C3</div>
                <div class="text-[7px] text-slate-400 font-mono">RISC-V 160M</div>
                <div class="w-2 h-2 rounded-full bg-emerald-400 mt-1 shadow-sm shadow-emerald-400" id="board-live-led"></div>
              </div>

              <!-- Alt USB-C Arayüzü -->
              <div class="w-9 h-3 rounded bg-slate-400 border border-slate-300 shadow-sm flex items-center justify-center">
                <div class="w-5 h-1 rounded-full bg-slate-800"></div>
              </div>
            </div>

            <!-- SAĞ BAĞLANTI KARTLARI (Servo 2, Mesafe ve Çizgi) -->
            <div class="absolute right-0 top-0 w-56 space-y-3 z-20">
              ${this.renderCard(this.pins[3])}
              ${this.renderCard(this.pins[4])}
              ${this.renderCard(this.pins[5])}
            </div>

            <!-- ALT BAĞLANTI KARTI (RGB ve Buzzer) -->
            <div class="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-72 z-20">
              ${this.renderCard(this.pins[6])}
            </div>

          </div>

        </div>

      </div>
    `;

    container.innerHTML = html;
  },

  renderCard: function(pin) {
    return `
      <div id="${pin.id}" onclick="CyberBrickCircuitView.selectPin('${pin.id}')"
        class="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-[${pin.color}]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs" style="background-color: ${pin.color}20; color: ${pin.color}">
              <i class="fas ${pin.icon}"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">${pin.name}</div>
              <div class="text-[10px] text-slate-500 font-mono">${pin.pinsText}</div>
            </div>
          </div>
          <span class="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            ${pin.channel}
          </span>
        </div>
        <p class="text-[10px] text-slate-400 mt-1.5 leading-snug">
          ${pin.description}
        </p>
      </div>
    `;
  },

  selectPin: function(pinId) {
    this.activePinCard = pinId;
    const pin = this.pins.find(p => p.id === pinId);
    if (!pin) return;

    if (typeof showToast === "function") {
      showToast(`${pin.name} seçildi. (${pin.pinsText})`);
    }
  },

  resetPins: function() {
    if (typeof showToast === "function") {
      showToast("Tüm pin konfigürasyonu varsayılana getirildi.");
    }
  },

  showDeviceModal: function() {
    const modal = document.getElementById("modal-generic");
    const title = document.getElementById("modal-generic-title");
    const body = document.getElementById("modal-generic-body");
    if (!modal) return;

    title.innerHTML = `<i class="fas fa-microchip text-emerald-500 mr-2"></i>Cihaz Yönetimi (CyberBrick Core)`;
    body.innerHTML = `
      <div class="space-y-4 text-xs text-slate-700 dark:text-slate-300">
        <div class="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">Cihaz Adı</span>
            <span class="font-bold text-sm text-slate-900 dark:text-slate-100">Receiver1</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">Seri Numarası</span>
            <span class="font-mono text-slate-600 dark:text-slate-300">3U0000000000</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">Firmware Versiyonu</span>
            <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">V01.00.00.03</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">Bağlantı Türü</span>
            <span class="text-slate-600 dark:text-slate-300">USB-C CDC / Wi-Fi REPL</span>
          </div>
        </div>

        <div class="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300">
          <strong>K12 Öğretmen Notu:</strong>
          Öğrenciler pin yapılandırma kartlarına tıklayarak motor ve sensörlerin ESP32-C3 üzerindeki donanımsal karşılıklarını doğrudan kavrar.
        </div>
      </div>
    `;
    modal.classList.remove("hidden");
  }
};

if (typeof window !== "undefined") {
  window.CyberBrickCircuitView = CyberBrickCircuitView;
}
