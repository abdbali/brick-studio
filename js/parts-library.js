/**
 * CyberBrick Eğitim ve Geliştirme Stüdyosu
 * Modül A: 3D Model & Parça Kütüphanesi (MakerWorld Entegrasyonu) & BOM Hesaplayıcı
 */

const CyberBrickPartsLibrary = {
  containerId: null,
  activeCategory: "all",

  init: function(containerId) {
    this.containerId = containerId;
    this.render();
  },

  setCategory: function(cat) {
    this.activeCategory = cat;
    this.render();
  },

  render: function() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const catalog = CyberBrickAPI.partsCatalog;
    const filtered = this.activeCategory === "all" 
      ? catalog 
      : catalog.filter(p => p.category === this.activeCategory);

    let html = `
      <div class="p-3">
        <!-- Kategori Filtre Butonları -->
        <div class="flex gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
          <button onclick="CyberBrickPartsLibrary.setCategory('all')" 
            class="px-2.5 py-1 rounded transition-colors ${this.activeCategory === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
            Tümü
          </button>
          <button onclick="CyberBrickPartsLibrary.setCategory('chassis')" 
            class="px-2.5 py-1 rounded transition-colors ${this.activeCategory === 'chassis' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
            Şasi & Gövde
          </button>
          <button onclick="CyberBrickPartsLibrary.setCategory('actuator')" 
            class="px-2.5 py-1 rounded transition-colors ${this.activeCategory === 'actuator' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
            Motor & Servo
          </button>
          <button onclick="CyberBrickPartsLibrary.setCategory('sensor')" 
            class="px-2.5 py-1 rounded transition-colors ${this.activeCategory === 'sensor' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
            Sensörler
          </button>
          <button onclick="CyberBrickPartsLibrary.setCategory('power')" 
            class="px-2.5 py-1 rounded transition-colors ${this.activeCategory === 'power' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">
            Güç & Batarya
          </button>
        </div>

        <!-- Parça Kartları Izgarası -->
        <div class="space-y-2.5">
    `;

    filtered.forEach(part => {
      const isMounted = part.mounted;
      html += `
        <div class="p-2.5 rounded-lg border transition-all ${isMounted ? 'bg-slate-900/90 border-cyan-500/30 shadow-sm shadow-cyan-500/10' : 'bg-slate-900/40 border-slate-800 opacity-75 hover:opacity-100'}">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 text-sm">
                <i class="fas ${part.icon}"></i>
              </div>
              <div>
                <h4 class="text-xs font-semibold text-slate-200">${part.name}</h4>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span><i class="fas fa-layer-group text-emerald-400 mr-1"></i>${part.filament}</span>
                  <span><i class="fas fa-clock text-amber-400 mr-1"></i>${part.printTime}</span>
                  <span><i class="fas fa-weight-hanging text-indigo-400 mr-1"></i>${part.weight}</span>
                </div>
              </div>
            </div>

            <span class="text-[9px] px-1.5 py-0.5 rounded font-mono ${isMounted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
              ${isMounted ? 'TAKILI' : 'DEPO'}
            </span>
          </div>

          <p class="text-[11px] text-slate-400 mt-2 leading-relaxed">
            ${part.description}
          </p>

          <!-- Alt Buton Çubuğu -->
          <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80 text-xs">
            <button onclick="CyberBrickPartsLibrary.toggleMount('${part.id}')" 
              class="px-2 py-1 rounded flex items-center gap-1 transition-all ${isMounted ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30' : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'}">
              <i class="fas ${isMounted ? 'fa-minus-circle' : 'fa-plus-circle'}"></i>
              <span>${isMounted ? 'Çıkar' : 'Sahneye Ekle'}</span>
            </button>

            <button onclick="CyberBrickPartsLibrary.showPrintDetails('${part.id}')"
              class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors">
              <i class="fas fa-cube text-amber-400"></i>
              <span>3D Baskı / STL</span>
            </button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  toggleMount: function(partId) {
    const part = CyberBrickAPI.partsCatalog.find(p => p.id === partId);
    if (!part) return;

    if (!part.removable && part.mounted) {
      alert(`${part.name} robotun ana taşıyıcı elemanıdır, çıkarılamaz!`);
      return;
    }

    part.mounted = !part.mounted;
    this.render();

    // 3D Sahnede İlgili Parçanın Görünürlüğünü Güncelle
    if (typeof CyberBrickSimulation !== "undefined") {
      if (partId === "cb-ultrasonic-mount" && CyberBrickSimulation.ultrasonicGroup) {
        CyberBrickSimulation.ultrasonicGroup.visible = part.mounted;
      } else if (partId === "cb-line-tracker") {
        if (CyberBrickSimulation.leftLineSensorDot) CyberBrickSimulation.leftLineSensorDot.visible = part.mounted;
        if (CyberBrickSimulation.rightLineSensorDot) CyberBrickSimulation.rightLineSensorDot.visible = part.mounted;
      }
    }
  },

  showPrintDetails: function(partId) {
    const part = CyberBrickAPI.partsCatalog.find(p => p.id === partId);
    if (!part) return;

    const modal = document.getElementById("modal-generic");
    const modalTitle = document.getElementById("modal-generic-title");
    const modalBody = document.getElementById("modal-generic-body");

    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<i class="fas fa-cube text-cyan-400 mr-2"></i>3D Baskı Detayları: ${part.name}`;
    modalBody.innerHTML = `
      <div class="space-y-4 text-sm text-slate-300">
        <div class="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div>
            <span class="text-xs text-slate-500 block">Önerilen Filament</span>
            <span class="font-medium text-emerald-400">${part.filament}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Tahmini Baskı Süresi</span>
            <span class="font-medium text-amber-400">${part.printTime}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Model Ağırlığı</span>
            <span class="font-medium text-indigo-400">${part.weight}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Dolgu (Infill) & Katman</span>
            <span class="font-medium text-cyan-400">${part.infill} / ${part.layerHeight}</span>
          </div>
        </div>

        <p class="text-xs text-slate-400 leading-relaxed">
          ${part.description} Bambu Lab X1/P1/A1 serisi ve standart FDM 3D yazıcılarla sıfır toleransla tam uyumlu olarak tasarlanmıştır. Destek (Support) gerektirmez.
        </p>

        <div class="flex gap-2 pt-2">
          <a href="${part.makerWorldUrl}" target="_blank" 
            class="flex-1 py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-center text-xs flex items-center justify-center gap-1.5 transition-colors">
            <i class="fas fa-external-link-alt"></i> MakerWorld Model Sayfası
          </a>
          <button onclick="CyberBrickPartsLibrary.downloadStlMock('${part.name}')" 
            class="flex-1 py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-center text-xs flex items-center justify-center gap-1.5 transition-colors">
            <i class="fas fa-download"></i> STL Dosyasını İndir
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  },

  downloadStlMock: function(partName) {
    const filename = `${partName.replace(/[^a-zA-Z0-9]/g, "_")}.stl`;
    const dummyStl = `solid ${partName}\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 10 0 0\nvertex 0 10 0\nendloop\nendfacet\nendsolid ${partName}`;
    const blob = new Blob([dummyStl], { type: "model/stl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Malzeme Listesi (BOM - Bill of Materials) Raporu
  openBomModal: function() {
    const catalog = CyberBrickAPI.partsCatalog.filter(p => p.mounted);
    const modal = document.getElementById("modal-generic");
    const modalTitle = document.getElementById("modal-generic-title");
    const modalBody = document.getElementById("modal-generic-body");

    if (!modal) return;

    let totalWeight = 0;
    catalog.forEach(p => {
      const g = parseInt(p.weight) || 0;
      totalWeight += g;
    });

    modalTitle.innerHTML = `<i class="fas fa-cube text-[#00ae42] mr-2"></i>MakerWorld 3D Baskı Malzeme Raporu (BOM)`;
    modalBody.innerHTML = `
      <div class="space-y-4 text-xs text-slate-700 dark:text-slate-300">
        <div class="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div class="font-bold text-sm text-emerald-800 dark:text-emerald-300">Mevcut 3D Model Konfigürasyonu</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Yazdırılacak 3D Parça Sayısı: ${catalog.length} adet</div>
          </div>
          <div class="text-right">
            <div class="text-[#00ae42] font-extrabold text-base">~${totalWeight} g Filament</div>
            <div class="text-[11px] text-slate-400">Tahmini Maliyet: ~$2.20</div>
          </div>
        </div>

        <div class="overflow-x-auto max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] font-bold">
                <th class="py-2.5 px-3">Bileşen Adı</th>
                <th class="py-2.5 px-3">Filament Türü</th>
                <th class="py-2.5 px-3">Ağırlık</th>
                <th class="py-2.5 px-3">Baskı Süresi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${catalog.map(c => `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">${c.name}</td>
                  <td class="py-2 px-3 text-slate-600 dark:text-slate-400">${c.filament}</td>
                  <td class="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-mono font-medium">${c.weight}</td>
                  <td class="py-2 px-3 text-amber-600 dark:text-amber-400 font-mono font-medium">${c.printTime}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center pt-2">
          <span class="text-[11px] text-slate-400">Bambu Lab PLA Basic / PETG-HF uyumludur.</span>
          <button onclick="CyberBrickPartsLibrary.exportBomMarkdown()" 
            class="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors">
            <i class="fas fa-file-download text-[#00ae42]"></i> Markdown Raporu İndir
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  },

  exportBomMarkdown: function() {
    const catalog = CyberBrickAPI.partsCatalog.filter(p => p.mounted);
    let md = `# CyberBrick Robot Malzeme Listesi (BOM) & 3D Baskı Kılavuzu\n\n`;
    md += `Tarih: ${new Date().toLocaleDateString('tr-TR')}\n`;
    md += `Standart: CyberBrick MicroPython V01.00.00.03 & MakerWorld 3D Ekosistemi\n\n`;
    md += `| Bileşen | Malzeme/Filament | Ağırlık | Baskı Süresi |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    catalog.forEach(c => {
      md += `| ${c.name} | ${c.filament} | ${c.weight} | ${c.printTime} |\n`;
    });
    md += `\n## Elektronik Donanım Parçaları\n`;
    md += `- 1x CyberBrick Multi-Function Core Board (XA003 / ESP32-C3)\n`;
    md += `- 2x N20 / TT DC Dişli Redüktörlü Motor\n`;
    md += `- 1x HC-SR04 Ultrasonik Mesafe Sensörü\n`;
    md += `- 1x Dual IR Çizgi İzleyen Sensör Modülü\n`;
    md += `- 2x 18650 3.7V Li-Ion Batarya (Seri bağlı 7.4V)\n`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CyberBrick_Robot_BOM.md";
    a.click();
    URL.revokeObjectURL(url);
  }
};

if (typeof window !== "undefined") {
  window.CyberBrickPartsLibrary = CyberBrickPartsLibrary;
}
