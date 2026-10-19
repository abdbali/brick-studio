/**
 * CyberBrick Eğitim ve Geliştirme Stüdyosu
 * Google Blockly K-12 Blok Editörü & Eylem Motoru Köprüsü
 * 
 * Kod editörü tamamen görsel blok odaklıdır ve blokları doğrudan 3D robot eylemlerine dönüştürür.
 */

const CyberBrickBlockly = {
  workspace: null,

  currentLanguage: "tr",

  categoriesI18n: {
    tr: {
      drive: "Sürüş & Hareket",
      mechanism: "Çatal & Kol (Servo)",
      sensors: "Sensörler & Radar",
      lights: "Işık & Korna",
      timing: "Zaman & Döngüler",
      logic: "Mantık & Karar",
      serial: "Seri Port (Log)",
      logDefault: "Brick Studio Başlatıldı!"
    },
    en: {
      drive: "Drive & Motion",
      mechanism: "Fork & Arm (Servo)",
      sensors: "Sensors & Radar",
      lights: "Lights & Horn",
      timing: "Timing & Loops",
      logic: "Logic & Decisions",
      serial: "Serial Port (Log)",
      logDefault: "Brick Studio Initialized!"
    },
    de: {
      drive: "Fahren & Bewegung",
      mechanism: "Gabel & Arm (Servo)",
      sensors: "Sensoren & Radar",
      lights: "Licht & Hupe",
      timing: "Zeit & Schleifen",
      logic: "Logik & Entscheidungen",
      serial: "Serieller Port (Log)",
      logDefault: "Brick Studio Gestartet!"
    },
    es: {
      drive: "Conducción y Movimiento",
      mechanism: "Horquilla y Brazo (Servo)",
      sensors: "Sensores y Radar",
      lights: "Luces y Bocina",
      timing: "Tiempo y Bucles",
      logic: "Lógica y Decisiones",
      serial: "Puerto Serie (Log)",
      logDefault: "¡Brick Studio Iniciado!"
    },
    fr: {
      drive: "Conduite & Mouvement",
      mechanism: "Fourche & Bras (Servo)",
      sensors: "Capteurs & Radar",
      lights: "Lumières & Klaxon",
      timing: "Temps & Boucles",
      logic: "Logique & Décisions",
      serial: "Port Série (Log)",
      logDefault: "Brick Studio Démarré !"
    }
  },

  escapeXml: function(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  },

  getToolboxXml: function(lang) {
    const c = this.categoriesI18n[lang] || this.categoriesI18n.tr;
    const esc = this.escapeXml;
    return `
    <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
      
      <!-- 1. SURUS VE HAREKET -->
      <category name="${esc(c.drive)}" colour="#cbf026">
        <block type="cb_move_timed">
          <value name="SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
          <value name="SECS"><shadow type="math_number"><field name="NUM">1.5</field></shadow></value>
        </block>
        <block type="cb_turn_angle">
          <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
          <value name="SPEED"><shadow type="math_number"><field name="NUM">55</field></shadow></value>
        </block>
        <block type="cb_move_distance">
          <value name="DIST"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
          <value name="SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
        </block>
        <block type="cb_move_direction">
          <value name="SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
        </block>
        <block type="cb_move_tank">
          <value name="L_SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
          <value name="R_SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
        </block>
        <block type="cb_stop_motors"></block>
      </category>

      <!-- 2. FORKLIFT VE KOL MEKANIZMASI -->
      <category name="${esc(c.mechanism)}" colour="#ff6a00">
        <block type="cb_forklift_lift">
          <value name="HEIGHT"><shadow type="math_number"><field name="NUM">75</field></shadow></value>
        </block>
        <block type="cb_forklift_preset"></block>
        <block type="cb_servo_angle">
          <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
        </block>
      </category>

      <!-- 3. SENSORLER -->
      <category name="${esc(c.sensors)}" colour="#00b4d8">
        <block type="cb_get_distance"></block>
        <block type="cb_is_obstacle">
          <value name="DIST"><shadow type="math_number"><field name="NUM">25</field></shadow></value>
        </block>
        <block type="cb_get_line"></block>
      </category>

      <!-- 4. ISIK VE KORNA -->
      <category name="${esc(c.lights)}" colour="#ec4899">
        <block type="cb_set_rgb"></block>
        <block type="cb_horn_beep">
          <value name="MS"><shadow type="math_number"><field name="NUM">120</field></shadow></value>
        </block>
      </category>

      <!-- 5. ZAMAN VE DONGULER -->
      <category name="${esc(c.timing)}" colour="#6366f1">
        <block type="cb_wait_ms">
          <value name="MS"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
        </block>
        <block type="cb_loop_forever"></block>
        <block type="controls_if"></block>
        <block type="controls_repeat_ext">
          <value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
        </block>
        <block type="controls_whileUntil"></block>
      </category>

      <!-- 6. MANTIK VE SAYILAR -->
      <category name="${esc(c.logic)}" colour="#10b981">
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
        <block type="math_number"></block>
      </category>

      <!-- 7. KONSOL -->
      <category name="${esc(c.serial)}" colour="#8b5cf6">
        <block type="cb_print_log">
          <value name="TEXT"><shadow type="text"><field name="TEXT">${esc(c.logDefault)}</field></shadow></value>
        </block>
      </category>

    </xml>
    `;
  },

  getToolboxDom: function(lang) {
    const xmlText = this.getToolboxXml(lang);
    try {
      if (typeof Blockly !== "undefined" && Blockly.utils && Blockly.utils.xml && typeof Blockly.utils.xml.textToDom === "function") {
        return Blockly.utils.xml.textToDom(xmlText);
      }
      if (typeof Blockly !== "undefined" && Blockly.Xml && typeof Blockly.Xml.textToDom === "function") {
        return Blockly.Xml.textToDom(xmlText);
      }
    } catch (e) {
      console.warn("Toolbox XML parse hatası:", e);
    }
    return xmlText;
  },

  blockMessages: {
    tr: {
      dir_forward: "İleri",
      dir_backward: "Geri",
      dir_left: "Sola Dön",
      dir_right: "Sağa Dön",
      dir_drive_forward: "İleri Sür",
      dir_drive_backward: "Geri Sür",
      dir_turn_left: "Sola Döndür",
      dir_turn_right: "Sağa Döndür",

      move_timed_robot: "Robotu",
      move_timed_speed: "Hız (%):",
      move_timed_secs: "Süre (sn):",
      move_timed_tooltip: "Robotu belirlenen süre boyunca belirtilen yönde hareket ettirir ve ardından durdurur.",

      move_dist_robot: "Robotu",
      move_dist_cm: "Mesafe (cm):",
      move_dist_speed: "Hız (%):",
      move_dist_tooltip: "Robotu santimetre cinsinden belirlenen mesafe kadar sürer.",

      turn_angle_robot: "Robotu",
      turn_angle_deg: "Açı (°):",
      turn_angle_speed: "Hız (%):",
      turn_angle_tooltip: "Robotu belirlenen derece açısıyla kendi ekseninde döndürür.",

      move_dir_robot: "Robotu",
      move_dir_speed: "Hız (%):",

      tank_left: "Sol Motor (%):",
      tank_right: "Sağ Motor (%):",

      stop_motors: "Motorları Frenle / Durdur",

      forklift_lift: "Çatal / Kol Seviyesi (%):",
      forklift_lift_tooltip: "0% (en alt) ile 100% (en üst) arasında dikey çatal veya kol yüksekliğini ayarlar.",

      forklift_preset_prefix: "Çatal / Kolu",
      forklift_preset_0: "Zemine İndir (0%)",
      forklift_preset_25: "Taşıma Seviyesi (25%)",
      forklift_preset_75: "Kaldırma / Vuruş (75%)",
      forklift_preset_100: "Maksimum Seviye (100%)",
      forklift_preset_suffix: "Ayarla",
      forklift_preset_tooltip: "Çatal veya tekme kolunu hazır operasyonel seviyelere ayarlar.",

      servo_angle: "Servo Kanal 1 Açısı (°):",

      sensor_distance: "Ultrasonik Mesafe (cm)",

      sensor_obstacle: "Engel Mesafesi < (cm):",

      line_prefix: "Çizgi Sensörü",
      line_left: "Sol Sensör",
      line_right: "Sağ Sensör",
      line_suffix: "Siyah Çizgide mi?",

      rgb_label: "RGB Durum Işığı:",
      rgb_green: "Yeşil (Hazır)",
      rgb_red: "Kırmızı (Engel/Fren)",
      rgb_yellow: "Sarı (Dikkat)",
      rgb_blue: "Mavi (Radar)",

      horn_beep: "Korna Çal / Bip (ms):",

      wait_ms: "Bekle (ms):",

      loop_forever: "Sürekli Tekrarla (Sonsuz Döngü)",

      print_log: "Konsola Yaz:",

      repeat_title: "%1 kez tekrarla",
      repeat_do: "yap",
      logic_if: "eğer",
      logic_then: "yap",
      logic_else: "değilse",
      logic_elseif: "değilse eğer",
      logic_true: "doğru",
      logic_false: "yanlış",
      logic_not: "%1 değil",
      logic_and: "ve",
      logic_or: "veya"
    },
    en: {
      dir_forward: "Forward",
      dir_backward: "Backward",
      dir_left: "Turn Left",
      dir_right: "Turn Right",
      dir_drive_forward: "Drive Forward",
      dir_drive_backward: "Drive Backward",
      dir_turn_left: "Turn Left",
      dir_turn_right: "Turn Right",

      move_timed_robot: "Drive Robot",
      move_timed_speed: "Speed (%):",
      move_timed_secs: "Duration (s):",
      move_timed_tooltip: "Drives the robot in the specified direction for the set duration and then stops.",

      move_dist_robot: "Drive Robot",
      move_dist_cm: "Distance (cm):",
      move_dist_speed: "Speed (%):",
      move_dist_tooltip: "Drives the robot for the specified distance in centimeters.",

      turn_angle_robot: "Turn Robot",
      turn_angle_deg: "Angle (°):",
      turn_angle_speed: "Speed (%):",
      turn_angle_tooltip: "Rotates the robot by the specified angle in degrees.",

      move_dir_robot: "Drive Robot",
      move_dir_speed: "Speed (%):",

      tank_left: "Left Motor (%):",
      tank_right: "Right Motor (%):",

      stop_motors: "Stop / Brake Motors",

      forklift_lift: "Set Fork / Arm Level (%):",
      forklift_lift_tooltip: "Adjusts vertical fork or arm height between 0% (lowest) and 100% (highest).",

      forklift_preset_prefix: "Set Fork / Arm to",
      forklift_preset_0: "Lower to Ground (0%)",
      forklift_preset_25: "Transport Level (25%)",
      forklift_preset_75: "Lift / Kick Level (75%)",
      forklift_preset_100: "Max Level (100%)",
      forklift_preset_suffix: "",
      forklift_preset_tooltip: "Sets fork or arm to standard operational height presets.",

      servo_angle: "Servo Channel 1 Angle (°):",

      sensor_distance: "Ultrasonic Distance (cm)",

      sensor_obstacle: "Obstacle Distance < (cm):",

      line_prefix: "Line Sensor",
      line_left: "Left Sensor",
      line_right: "Right Sensor",
      line_suffix: "on Black Line?",

      rgb_label: "RGB Status Light:",
      rgb_green: "Green (Ready)",
      rgb_red: "Red (Obstacle/Brake)",
      rgb_yellow: "Yellow (Caution)",
      rgb_blue: "Blue (Radar)",

      horn_beep: "Play Horn / Beep (ms):",

      wait_ms: "Wait (ms):",

      loop_forever: "Repeat Forever (Infinite Loop)",

      print_log: "Log to Console:",

      repeat_title: "repeat %1 times",
      repeat_do: "do",
      logic_if: "if",
      logic_then: "do",
      logic_else: "else",
      logic_elseif: "else if",
      logic_true: "true",
      logic_false: "false",
      logic_not: "not %1",
      logic_and: "and",
      logic_or: "or"
    },
    de: {
      dir_forward: "Vorwärts",
      dir_backward: "Rückwärts",
      dir_left: "Links drehen",
      dir_right: "Rechts drehen",
      dir_drive_forward: "Vorwärts fahren",
      dir_drive_backward: "Rückwärts fahren",
      dir_turn_left: "Links drehen",
      dir_turn_right: "Rechts drehen",

      move_timed_robot: "Roboter",
      move_timed_speed: "Tempo (%):",
      move_timed_secs: "Dauer (s):",
      move_timed_tooltip: "Fährt den Roboter für die festgelegte Dauer in die angegebene Richtung und stoppt dann.",

      move_dist_robot: "Roboter",
      move_dist_cm: "Distanz (cm):",
      move_dist_speed: "Tempo (%):",
      move_dist_tooltip: "Fährt den Roboter um die angegebene Strecke in Zentimetern.",

      turn_angle_robot: "Roboter drehen",
      turn_angle_deg: "Winkel (°):",
      turn_angle_speed: "Tempo (%):",
      turn_angle_tooltip: "Dreht den Roboter um den festgelegten Winkel in Grad.",

      move_dir_robot: "Roboter steuern",
      move_dir_speed: "Tempo (%):",

      tank_left: "Linker Motor (%):",
      tank_right: "Rechter Motor (%):",

      stop_motors: "Motoren stoppen / bremsen",

      forklift_lift: "Gabel- / Armstufe (%):",
      forklift_lift_tooltip: "Stellt die vertikale Gabel- oder Armhöhe zwischen 0% (unten) und 100% (oben) ein.",

      forklift_preset_prefix: "Gabel / Arm einstellen auf",
      forklift_preset_0: "Auf Boden absenken (0%)",
      forklift_preset_25: "Transportposition (25%)",
      forklift_preset_75: "Heben / Kick (75%)",
      forklift_preset_100: "Max. Höhe (100%)",
      forklift_preset_suffix: "",
      forklift_preset_tooltip: "Stellt die Gabel oder den Kickarm auf vorgefertigte Betriebshöhen ein.",

      servo_angle: "Servo Kanal 1 Winkel (°):",

      sensor_distance: "Ultraschall-Abstand (cm)",

      sensor_obstacle: "Hindernis-Distanz < (cm):",

      line_prefix: "Liniensensor",
      line_left: "Linker Sensor",
      line_right: "Rechter Sensor",
      line_suffix: "auf schwarzer Linie?",

      rgb_label: "RGB Status-LED:",
      rgb_green: "Grün (Bereit)",
      rgb_red: "Rot (Hindernis/Bremse)",
      rgb_yellow: "Gelb (Achtung)",
      rgb_blue: "Blau (Radar)",

      horn_beep: "Hupe / Piepston (ms):",

      wait_ms: "Warten (ms):",

      loop_forever: "Dauerhaft wiederholen (Endlosschleife)",

      print_log: "Im Terminal ausgeben:",

      repeat_title: "wiederhole %1 mal",
      repeat_do: "mache",
      logic_if: "wenn",
      logic_then: "dann",
      logic_else: "sonst",
      logic_elseif: "sonst wenn",
      logic_true: "wahr",
      logic_false: "falsch",
      logic_not: "nicht %1",
      logic_and: "und",
      logic_or: "oder"
    },
    es: {
      dir_forward: "Adelante",
      dir_backward: "Atrás",
      dir_left: "Girar Izquierda",
      dir_right: "Girar Derecha",
      dir_drive_forward: "Conducir Adelante",
      dir_drive_backward: "Conducir Atrás",
      dir_turn_left: "Girar a la Izquierda",
      dir_turn_right: "Girar a la Derecha",

      move_timed_robot: "Mover Robot",
      move_timed_speed: "Velocidad (%):",
      move_timed_secs: "Tiempo (s):",
      move_timed_tooltip: "Mueve el robot en la dirección establecida durante el tiempo fijado y luego se detiene.",

      move_dist_robot: "Mover Robot",
      move_dist_cm: "Distancia (cm):",
      move_dist_speed: "Velocidad (%):",
      move_dist_tooltip: "Conduce el robot la distancia especificada en centímetros.",

      turn_angle_robot: "Girar Robot",
      turn_angle_deg: "Ángulo (°):",
      turn_angle_speed: "Velocidad (%):",
      turn_angle_tooltip: "Gira el robot en su propio eje según el ángulo en grados.",

      move_dir_robot: "Mover Robot",
      move_dir_speed: "Velocidad (%):",

      tank_left: "Motor Izquierdo (%):",
      tank_right: "Motor Derecho (%):",

      stop_motors: "Frenar / Detener Motores",

      forklift_lift: "Nivel de Horquilla / Brazo (%):",
      forklift_lift_tooltip: "Ajusta la altura vertical de la horquilla o brazo entre 0% (abajo) y 100% (arriba).",

      forklift_preset_prefix: "Ajustar Horquilla / Brazo a",
      forklift_preset_0: "Bajar al Suelo (0%)",
      forklift_preset_25: "Nivel de Transporte (25%)",
      forklift_preset_75: "Nivel de Carga / Tiro (75%)",
      forklift_preset_100: "Nivel Máximo (100%)",
      forklift_preset_suffix: "",
      forklift_preset_tooltip: "Ajusta la horquilla o brazo a alturas preconfiguradas.",

      servo_angle: "Ángulo Servo Canal 1 (°):",

      sensor_distance: "Distancia Ultrasónica (cm)",

      sensor_obstacle: "Distancia Obstáculo < (cm):",

      line_prefix: "Sensor de Línea",
      line_left: "Sensor Izquierdo",
      line_right: "Sensor Derecho",
      line_suffix: "¿en Línea Negra?",

      rgb_label: "Luz de Estado RGB:",
      rgb_green: "Verde (Listo)",
      rgb_red: "Rojo (Obstáculo/Freno)",
      rgb_yellow: "Amarillo (Atención)",
      rgb_blue: "Azul (Radar)",

      horn_beep: "Tocar Bocina / Pitido (ms):",

      wait_ms: "Esperar (ms):",

      loop_forever: "Repetir Continuamente (Bucle Infinito)",

      print_log: "Imprimir en Consola:",

      repeat_title: "repetir %1 veces",
      repeat_do: "hacer",
      logic_if: "si",
      logic_then: "hacer",
      logic_else: "sino",
      logic_elseif: "sino si",
      logic_true: "verdadero",
      logic_false: "falso",
      logic_not: "no %1",
      logic_and: "y",
      logic_or: "o"
    },
    fr: {
      dir_forward: "Avant",
      dir_backward: "Arrière",
      dir_left: "Tourner à Gauche",
      dir_right: "Tourner à Droite",
      dir_drive_forward: "Avancer",
      dir_drive_backward: "Reculer",
      dir_turn_left: "Tourner à Gauche",
      dir_turn_right: "Tourner à Droite",

      move_timed_robot: "Conduire Robot",
      move_timed_speed: "Vitesse (%):",
      move_timed_secs: "Durée (s):",
      move_timed_tooltip: "Déplace le robot dans la direction définie pendant la durée spécifiée puis s'arrête.",

      move_dist_robot: "Conduire Robot",
      move_dist_cm: "Distance (cm):",
      move_dist_speed: "Vitesse (%):",
      move_dist_tooltip: "Fait avancer le robot sur la distance spécifiée en centimètres.",

      turn_angle_robot: "Tourner Robot",
      turn_angle_deg: "Angle (°):",
      turn_angle_speed: "Vitesse (%):",
      turn_angle_tooltip: "Fait tourner le robot sur son axe selon l'angle en degrés.",

      move_dir_robot: "Conduire Robot",
      move_dir_speed: "Vitesse (%):",

      tank_left: "Moteur Gauche (%):",
      tank_right: "Moteur Droit (%):",

      stop_motors: "Freiner / Arrêter les Moteurs",

      forklift_lift: "Niveau Fourche / Bras (%):",
      forklift_lift_tooltip: "Ajuste la hauteur de fourche ou du bras entre 0% (en bas) et 100% (en haut).",

      forklift_preset_prefix: "Régler Fourche / Bras sur",
      forklift_preset_0: "Abaisser au Sol (0%)",
      forklift_preset_25: "Niveau de Transport (25%)",
      forklift_preset_75: "Niveau Levage / Tir (75%)",
      forklift_preset_100: "Hauteur Max (100%)",
      forklift_preset_suffix: "",
      forklift_preset_tooltip: "Règle la fourche ou le bras sur des hauteurs de travail prédéfinies.",

      servo_angle: "Angle Servo Canal 1 (°):",

      sensor_distance: "Distance Ultrasonique (cm)",

      sensor_obstacle: "Distance Obstacle < (cm):",

      line_prefix: "Capteur de Ligne",
      line_left: "Capteur Gauche",
      line_right: "Capteur Droit",
      line_suffix: "sur Ligne Noire ?",

      rgb_label: "Voyant d'État RGB :",
      rgb_green: "Vert (Prêt)",
      rgb_red: "Rouge (Obstacle/Frein)",
      rgb_yellow: "Jaune (Attention)",
      rgb_blue: "Bleu (Radar)",

      horn_beep: "Klaxonner / Bip (ms):",

      wait_ms: "Attendre (ms):",

      loop_forever: "Répéter en Boucle (Boucle Infinie)",

      print_log: "Écrire dans la Console :",

      repeat_title: "répéter %1 fois",
      repeat_do: "faire",
      logic_if: "si",
      logic_then: "faire",
      logic_else: "sinon",
      logic_elseif: "sinon si",
      logic_true: "vrai",
      logic_false: "faux",
      logic_not: "non %1",
      logic_and: "et",
      logic_or: "ou"
    }
  },

  getMessages: function(lang) {
    const l = lang || this.currentLanguage || "tr";
    return this.blockMessages[l] || this.blockMessages.tr;
  },

  applyBlocklyStandardMessages: function(lang) {
    if (typeof Blockly === "undefined" || !Blockly.Msg) return;
    const m = this.getMessages(lang);
    Blockly.Msg['CONTROLS_REPEAT_TITLE'] = m.repeat_title;
    Blockly.Msg['CONTROLS_REPEAT_INPUT_DO'] = m.repeat_do;
    Blockly.Msg['CONTROLS_IF_MSG_IF'] = m.logic_if;
    Blockly.Msg['CONTROLS_IF_MSG_THEN'] = m.logic_then;
    Blockly.Msg['CONTROLS_IF_MSG_ELSE'] = m.logic_else;
    Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'] = m.logic_elseif;
    Blockly.Msg['LOGIC_BOOLEAN_TRUE'] = m.logic_true;
    Blockly.Msg['LOGIC_BOOLEAN_FALSE'] = m.logic_false;
    Blockly.Msg['LOGIC_NEGATE_TITLE'] = m.logic_not;
    Blockly.Msg['LOGIC_OPERATION_AND'] = m.logic_and;
    Blockly.Msg['LOGIC_OPERATION_OR'] = m.logic_or;
  },

  setLanguage: function(lang) {
    this.currentLanguage = lang || "tr";
    this.applyBlocklyStandardMessages(this.currentLanguage);
    this.defineCustomBlocks();

    // Dinamik resmi Blockly yerelleştirme betiği yükle (varsa)
    if (typeof document !== "undefined" && lang !== "tr") {
      const scriptId = "blockly-msg-script-" + lang;
      if (!document.getElementById(scriptId)) {
        const s = document.createElement("script");
        s.id = scriptId;
        s.src = `https://unpkg.com/blockly/msg/${lang}.js`;
        s.onload = () => {
          this.applyBlocklyStandardMessages(lang);
          this.defineCustomBlocks();
          if (this.workspace) {
            this.refreshWorkspaceLanguage();
          }
        };
        document.head.appendChild(s);
      }
    }

    if (this.workspace) {
      this.refreshWorkspaceLanguage();
    }
  },

  refreshWorkspaceLanguage: function() {
    if (!this.workspace) return;
    const toolboxDom = this.getToolboxDom(this.currentLanguage);
    this.workspace.updateToolbox(toolboxDom);

    // Eğer çalışma alanında hiç blok kalmamışsa varsayılan başlangıç kodunu yükle
    if (this.workspace.getAllBlocks(false).length === 0) {
      this.loadDefaultBlocks();
    }

    this.workspace.render();
    Blockly.svgResize(this.workspace);
  },

  init: function(containerId) {
    this.containerId = containerId || "blockly-div";
    if (typeof Blockly === "undefined") {
      console.warn("Blockly yükleniyor, bekleniyor...");
      setTimeout(() => this.init(containerId), 120);
      return;
    }

    const savedLang = (typeof localStorage !== "undefined" && localStorage.getItem("brick_studio_lang")) || this.currentLanguage || "tr";
    this.currentLanguage = savedLang;
    this.applyBlocklyStandardMessages(this.currentLanguage);
    this.defineCustomBlocks();
    this.setupJavaScriptGenerators();
    this.setupPythonGenerators();

    const container = document.getElementById(this.containerId);
    if (!container) return;

    const baseTheme = (Blockly.Themes && Blockly.Themes.Zelos) ? Blockly.Themes.Zelos : (Blockly.Themes && Blockly.Themes.Classic ? Blockly.Themes.Classic : undefined);

    const theme = Blockly.Theme.defineTheme("bambuLight", {
      base: baseTheme,
      fontStyle: {
        family: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
        weight: '600',
        size: 12
      },
      componentStyles: {
        workspaceBackgroundColour: "#ffffff",
        toolboxBackgroundColour: "#f8fafc",
        toolboxForegroundColour: "#334155",
        flyoutBackgroundColour: "#ffffff",
        flyoutForegroundColour: "#0f172a",
        flyoutOpacity: 0.98,
        scrollbarColour: "#cbd5e1",
        scrollbarOpacity: 0.65,
        insertionMarkerColour: "#cbf026",
        insertionMarkerOpacity: 0.7
      }
    });

    const injectOptions = {
      toolbox: this.getToolboxDom(this.currentLanguage),
      theme: theme,
      renderer: "zelos",
      grid: { spacing: 24, length: 2, colour: "#cbd5e1", snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.88, maxScale: 1.6, minScale: 0.4 },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true }
    };

    try {
      this.workspace = Blockly.inject(container, injectOptions);
    } catch (e) {
      console.warn("Zelos renderer not supported, falling back to default renderer:", e);
      delete injectOptions.renderer;
      injectOptions.toolbox = this.getToolboxDom(this.currentLanguage);
      this.workspace = Blockly.inject(container, injectOptions);
    }

    // Varsayilan baslangic bloklarini calisma alanina yukle
    this.loadDefaultBlocks();

    setTimeout(() => {
      if (this.workspace) {
        Blockly.svgResize(this.workspace);
      }
    }, 80);
    setTimeout(() => {
      if (this.workspace) {
        Blockly.svgResize(this.workspace);
      }
    }, 250);
  },

  defineCustomBlocks: function() {
    const m = this.getMessages();

    // 1. Süreli Yön Hareketi
    Blockly.Blocks['cb_move_timed'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField(msg.move_timed_robot)
            .appendField(new Blockly.FieldDropdown([
              [msg.dir_forward, "FORWARD"],
              [msg.dir_backward, "BACKWARD"],
              [msg.dir_left, "LEFT"],
              [msg.dir_right, "RIGHT"]
            ]), "DIR")
            .appendField(msg.move_timed_speed);
        this.appendValueInput("SECS")
            .setCheck("Number")
            .appendField(msg.move_timed_secs);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#cbf026");
        this.setTooltip(msg.move_timed_tooltip);
      }
    };

    // 1b. Belirli Mesafe Sürüşü (cm)
    Blockly.Blocks['cb_move_distance'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("DIST")
            .setCheck("Number")
            .appendField(msg.move_dist_robot)
            .appendField(new Blockly.FieldDropdown([
              [msg.dir_forward, "FORWARD"],
              [msg.dir_backward, "BACKWARD"]
            ]), "DIR")
            .appendField(msg.move_dist_cm);
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField(msg.move_dist_speed);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#cbf026");
        this.setTooltip(msg.move_dist_tooltip);
      }
    };

    // 1c. Belirli Açı ile Dönüş (Derece)
    Blockly.Blocks['cb_turn_angle'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField(msg.turn_angle_robot)
            .appendField(new Blockly.FieldDropdown([
              [msg.dir_turn_right, "RIGHT"],
              [msg.dir_turn_left, "LEFT"]
            ]), "DIR")
            .appendField(msg.turn_angle_deg);
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField(msg.turn_angle_speed);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#cbf026");
        this.setTooltip(msg.turn_angle_tooltip);
      }
    };

    // 2. Sürekli Yön Hareketi
    Blockly.Blocks['cb_move_direction'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("SPEED")
            .setCheck("Number")
            .appendField(msg.move_dir_robot)
            .appendField(new Blockly.FieldDropdown([
              [msg.dir_drive_forward, "FORWARD"],
              [msg.dir_drive_backward, "BACKWARD"],
              [msg.dir_left, "LEFT"],
              [msg.dir_right, "RIGHT"]
            ]), "DIR")
            .appendField(msg.move_dir_speed);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#cbf026");
      }
    };

    // 3. Tank Sürüşü
    Blockly.Blocks['cb_move_tank'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("L_SPEED").setCheck("Number").appendField(msg.tank_left);
        this.appendValueInput("R_SPEED").setCheck("Number").appendField(msg.tank_right);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#cbf026");
      }
    };

    // 4. Durdur
    Blockly.Blocks['cb_stop_motors'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendDummyInput().appendField(msg.stop_motors);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#e11d48");
      }
    };

    // 5. Çatal / Kol Seviyesini Ayarla
    Blockly.Blocks['cb_forklift_lift'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("HEIGHT")
            .setCheck("Number")
            .appendField(msg.forklift_lift);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff6a00");
        this.setTooltip(msg.forklift_lift_tooltip);
      }
    };

    // 5b. Çatal / Kol Hazır Seviye Ayarla
    Blockly.Blocks['cb_forklift_preset'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        const input = this.appendDummyInput()
            .appendField(msg.forklift_preset_prefix)
            .appendField(new Blockly.FieldDropdown([
              [msg.forklift_preset_0, "0"],
              [msg.forklift_preset_25, "25"],
              [msg.forklift_preset_75, "75"],
              [msg.forklift_preset_100, "100"]
            ]), "PRESET");
        if (msg.forklift_preset_suffix) {
          input.appendField(msg.forklift_preset_suffix);
        }
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff6a00");
        this.setTooltip(msg.forklift_preset_tooltip);
      }
    };

    // 6. Servo Açısı
    Blockly.Blocks['cb_servo_angle'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField(msg.servo_angle);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ff6a00");
      }
    };

    // 7. Ultrasonik Mesafe Oku (cm)
    Blockly.Blocks['cb_get_distance'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendDummyInput().appendField(msg.sensor_distance);
        this.setOutput(true, "Number");
        this.setColour("#00b4d8");
      }
    };

    // 8. Engel Belirtilen Mesafeden Yakın mı?
    Blockly.Blocks['cb_is_obstacle'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("DIST")
            .setCheck("Number")
            .appendField(msg.sensor_obstacle);
        this.setOutput(true, "Boolean");
        this.setColour("#00b4d8");
      }
    };

    // 9. Çizgi Sensörü Oku
    Blockly.Blocks['cb_get_line'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendDummyInput()
            .appendField(msg.line_prefix)
            .appendField(new Blockly.FieldDropdown([
              [msg.line_left, "LEFT"],
              [msg.line_right, "RIGHT"]
            ]), "SENSOR")
            .appendField(msg.line_suffix);
        this.setOutput(true, "Boolean");
        this.setColour("#00b4d8");
      }
    };

    // 10. RGB Durum Işığı
    Blockly.Blocks['cb_set_rgb'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendDummyInput()
            .appendField(msg.rgb_label)
            .appendField(new Blockly.FieldDropdown([
              [msg.rgb_green, "0, 174, 66"],
              [msg.rgb_red, "255, 0, 0"],
              [msg.rgb_yellow, "245, 158, 11"],
              [msg.rgb_blue, "0, 180, 216"]
            ]), "COLOR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ec4899");
      }
    };

    // 11. Korna / Bip
    Blockly.Blocks['cb_horn_beep'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("MS")
            .setCheck("Number")
            .appendField(msg.horn_beep);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ec4899");
      }
    };

    // 12. Bekle (ms)
    Blockly.Blocks['cb_wait_ms'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("MS").setCheck("Number").appendField(msg.wait_ms);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#6366f1");
      }
    };

    // 13. Sonsuz Döngü
    Blockly.Blocks['cb_loop_forever'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendDummyInput().appendField(msg.loop_forever);
        this.appendStatementInput("DO");
        this.setPreviousStatement(true, null);
        this.setColour("#6366f1");
      }
    };

    // 14. Log Yazdır
    Blockly.Blocks['cb_print_log'] = {
      init: function() {
        const msg = CyberBrickBlockly.getMessages();
        this.appendValueInput("TEXT").appendField(msg.print_log);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8b5cf6");
      }
    };
  },

  // DOĞRUDAN VE KUSURSUZ ÇALIŞTIRILABİLİR JAVASCRIPT ÜRETECİ
  setupJavaScriptGenerators: function() {
    const js = (typeof Blockly !== "undefined" && Blockly.JavaScript)
            || (typeof javascript !== "undefined" && javascript.javascriptGenerator)
            || (typeof window !== "undefined" && window.javascriptGenerator);

    if (!js) return;
    if (typeof Blockly !== "undefined" && !Blockly.JavaScript) {
      Blockly.JavaScript = js;
    }

    js['cb_move_timed'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const speed = js.valueToCode(block, 'SPEED', js.ORDER_ATOMIC) || '50';
      const secs = js.valueToCode(block, 'SECS', js.ORDER_ATOMIC) || '1';
      return `await CyberBrickActions.moveTimed('${dir}', ${speed}, ${secs});\nif (!CyberBrickRuntime.isRunning) return;\n`;
    };

    js['cb_move_distance'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const dist = js.valueToCode(block, 'DIST', js.ORDER_ATOMIC) || '50';
      const speed = js.valueToCode(block, 'SPEED', js.ORDER_ATOMIC) || '50';
      return `await CyberBrickActions.moveDistance('${dir}', ${dist}, ${speed});\nif (!CyberBrickRuntime.isRunning) return;\n`;
    };

    js['cb_turn_angle'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const ang = js.valueToCode(block, 'ANGLE', js.ORDER_ATOMIC) || '90';
      const speed = js.valueToCode(block, 'SPEED', js.ORDER_ATOMIC) || '55';
      return `await CyberBrickActions.turnAngle('${dir}', ${ang}, ${speed});\nif (!CyberBrickRuntime.isRunning) return;\n`;
    };

    js['cb_move_direction'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const speed = js.valueToCode(block, 'SPEED', js.ORDER_ATOMIC) || '50';
      return `CyberBrickActions.moveDirection('${dir}', ${speed});\n`;
    };

    js['cb_move_tank'] = function(block) {
      const l = js.valueToCode(block, 'L_SPEED', js.ORDER_ATOMIC) || '0';
      const r = js.valueToCode(block, 'R_SPEED', js.ORDER_ATOMIC) || '0';
      return `CyberBrickActions.moveTank(${l}, ${r});\n`;
    };

    js['cb_stop_motors'] = function() {
      return `CyberBrickActions.stopMotors();\n`;
    };

    js['cb_forklift_lift'] = function(block) {
      const h = js.valueToCode(block, 'HEIGHT', js.ORDER_ATOMIC) || '50';
      return `await CyberBrickActions.setForkliftHeight(${h});\nif (!CyberBrickRuntime.isRunning) return;\n`;
    };

    js['cb_forklift_preset'] = function(block) {
      const preset = block.getFieldValue('PRESET') || '0';
      return `await CyberBrickActions.setForkliftHeight(${preset});\nif (!CyberBrickRuntime.isRunning) return;\n`;
    };

    js['cb_servo_angle'] = function(block) {
      const ang = js.valueToCode(block, 'ANGLE', js.ORDER_ATOMIC) || '90';
      return `await CyberBrickActions.setServoAngle(1, ${ang});\nif (!CyberBrickRuntime.isRunning) return;\n`;
    };

    js['cb_get_distance'] = function() {
      return ['CyberBrickActions.getDistance()', js.ORDER_ATOMIC];
    };

    js['cb_is_obstacle'] = function(block) {
      const dist = js.valueToCode(block, 'DIST', js.ORDER_ATOMIC) || '25';
      return [`CyberBrickActions.isObstacleNear(${dist})`, js.ORDER_ATOMIC];
    };

    js['cb_get_line'] = function(block) {
      const s = block.getFieldValue('SENSOR');
      return [`CyberBrickActions.isLineDetected('${s}')`, js.ORDER_ATOMIC];
    };

    js['cb_set_rgb'] = function(block) {
      const col = block.getFieldValue('COLOR');
      return `CyberBrickActions.setRgbColor(${col});\n`;
    };

    js['cb_horn_beep'] = function(block) {
      const ms = js.valueToCode(block, 'MS', js.ORDER_ATOMIC) || '120';
      return `CyberBrickActions.beep(${ms});\n`;
    };

    js['cb_wait_ms'] = function(block) {
      const ms = js.valueToCode(block, 'MS', js.ORDER_ATOMIC) || '500';
      return `await CyberBrickActions.wait(${ms});\nif (!CyberBrickRuntime.isRunning) return;\n`;
    };

    js['cb_loop_forever'] = function(block) {
      const branch = js.statementToCode(block, 'DO') || '';
      return `while (CyberBrickRuntime.isRunning) {\n${branch}  await CyberBrickRuntime.sleep(25);\n}\n`;
    };

    js['cb_print_log'] = function(block) {
      const text = js.valueToCode(block, 'TEXT', js.ORDER_ATOMIC) || "''";
      return `CyberBrickActions.print(${text});\n`;
    };
  },

  // RESMİ MICROPYTHON V01.00.00.03 KOD ÜRETECİ
  setupPythonGenerators: function() {
    const py = (typeof Blockly !== "undefined" && Blockly.Python)
            || (typeof python !== "undefined" && python.pythonGenerator)
            || (typeof window !== "undefined" && window.pythonGenerator);

    if (!py) return;
    if (typeof Blockly !== "undefined" && !Blockly.Python) {
      Blockly.Python = py;
    }

    py['cb_move_timed'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const speed = py.valueToCode(block, 'SPEED', py.ORDER_ATOMIC) || '50';
      const secs = py.valueToCode(block, 'SECS', py.ORDER_ATOMIC) || '1';
      let l = '1', r = '1';
      if (dir === 'BACKWARD') { l = '-1'; r = '-1'; }
      else if (dir === 'LEFT') { l = '-1'; r = '1'; }
      else if (dir === 'RIGHT') { l = '1'; r = '-1'; }

      return `pwm = int((${speed}) * 10.24)\n` +
             `motors.set_speed(1, ${l} * pwm)\n` +
             `motors.set_speed(2, ${r} * pwm)\n` +
             `time.sleep_ms(int((${secs}) * 1000))\n` +
             `motors.set_speed(1, 0)\n` +
             `motors.set_speed(2, 0)\n`;
    };

    py['cb_move_distance'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const dist = py.valueToCode(block, 'DIST', py.ORDER_ATOMIC) || '50';
      const speed = py.valueToCode(block, 'SPEED', py.ORDER_ATOMIC) || '50';
      const sign = (dir === 'BACKWARD') ? -1 : 1;
      return `# Mesafe bazli surus: ${dist} cm, hiz: %${speed}\n` +
             `pwm = int((${speed}) * 10.24)\n` +
             `duration = int((${dist}) / ((${speed}) * 3.0) * 1000)\n` +
             `motors.set_speed(1, ${sign} * pwm)\n` +
             `motors.set_speed(2, ${sign} * pwm)\n` +
             `time.sleep_ms(max(100, duration))\n` +
             `motors.set_speed(1, 0)\n` +
             `motors.set_speed(2, 0)\n`;
    };

    py['cb_turn_angle'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const ang = py.valueToCode(block, 'ANGLE', py.ORDER_ATOMIC) || '90';
      const speed = py.valueToCode(block, 'SPEED', py.ORDER_ATOMIC) || '55';
      const isRight = (dir === 'RIGHT');
      const l = isRight ? 1 : -1;
      const r = isRight ? -1 : 1;
      return `# Hassas aci donusu: ${ang} derece\n` +
             `pwm = int((${speed}) * 10.24)\n` +
             `duration = int(((${ang}) * 3.14159 / 180) / ((2 * (${speed}/100) * 3.0) / 1.1) * 1000)\n` +
             `motors.set_speed(1, ${l} * pwm)\n` +
             `motors.set_speed(2, ${r} * pwm)\n` +
             `time.sleep_ms(max(80, duration))\n` +
             `motors.set_speed(1, 0)\n` +
             `motors.set_speed(2, 0)\n`;
    };

    py['cb_move_direction'] = function(block) {
      const dir = block.getFieldValue('DIR');
      const speed = py.valueToCode(block, 'SPEED', py.ORDER_ATOMIC) || '50';
      let l = '1', r = '1';
      if (dir === 'BACKWARD') { l = '-1'; r = '-1'; }
      else if (dir === 'LEFT') { l = '-1'; r = '1'; }
      else if (dir === 'RIGHT') { l = '1'; r = '-1'; }

      return `pwm = int((${speed}) * 10.24)\n` +
             `motors.set_speed(1, ${l} * pwm)\n` +
             `motors.set_speed(2, ${r} * pwm)\n`;
    };

    py['cb_move_tank'] = function(block) {
      const l = py.valueToCode(block, 'L_SPEED', py.ORDER_ATOMIC) || '0';
      const r = py.valueToCode(block, 'R_SPEED', py.ORDER_ATOMIC) || '0';
      return `motors.set_speed(1, int((${l}) * 10.24))\n` +
             `motors.set_speed(2, int((${r}) * 10.24))\n`;
    };

    py['cb_stop_motors'] = function() {
      return `motors.set_speed(1, 0)\nmotors.set_speed(2, 0)\n`;
    };

    py['cb_forklift_lift'] = function(block) {
      const h = py.valueToCode(block, 'HEIGHT', py.ORDER_ATOMIC) || '50';
      return `angle = int((${h}) * 1.8)\nservos.set_angle(1, angle)\n`;
    };

    py['cb_forklift_preset'] = function(block) {
      const preset = block.getFieldValue('PRESET') || '0';
      return `angle = int((${preset}) * 1.8)\nservos.set_angle(1, angle)\n`;
    };

    py['cb_servo_angle'] = function(block) {
      const ang = py.valueToCode(block, 'ANGLE', py.ORDER_ATOMIC) || '90';
      return `servos.set_angle(1, int(${ang}))\n`;
    };

    py['cb_get_distance'] = function() {
      return ['ultrasonic.read_distance()', py.ORDER_ATOMIC];
    };

    py['cb_is_obstacle'] = function(block) {
      const d = py.valueToCode(block, 'DIST', py.ORDER_ATOMIC) || '25';
      return [`(ultrasonic.read_distance() < ${d})`, py.ORDER_ATOMIC];
    };

    py['cb_get_line'] = function(block) {
      const s = block.getFieldValue('SENSOR');
      const method = s === 'LEFT' ? 'read_left()' : 'read_right()';
      return [`(line_sensor.${method} == 1)`, py.ORDER_ATOMIC];
    };

    py['cb_set_rgb'] = function(block) {
      const col = block.getFieldValue('COLOR');
      return `leds.set_color(${col})\n`;
    };

    py['cb_horn_beep'] = function(block) {
      const ms = py.valueToCode(block, 'MS', py.ORDER_ATOMIC) || '120';
      return `buzzer.beep(int(${ms}))\n`;
    };

    py['cb_wait_ms'] = function(block) {
      const ms = py.valueToCode(block, 'MS', py.ORDER_ATOMIC) || '1000';
      return `time.sleep_ms(int(${ms}))\n`;
    };

    py['cb_loop_forever'] = function(block) {
      const branch = py.statementToCode(block, 'DO') || '    pass\n';
      return `while True:\n${branch}`;
    };

    py['cb_print_log'] = function(block) {
      const text = py.valueToCode(block, 'TEXT', py.ORDER_ATOMIC) || "''";
      return `print(${text})\n`;
    };
  },

  // Doğrudan Çalıştırılacak Asenkron Kod Üretimi
  generateExecutableCode: function() {
    if (!this.workspace || typeof Blockly.JavaScript === "undefined") {
      return "console.log('Blockly çalıştırılamadı');";
    }
    return Blockly.JavaScript.workspaceToCode(this.workspace);
  },

  // Karta Yüklenecek MicroPython Kodunu Üret
  generateMicroPython: function() {
    if (!this.workspace || typeof Blockly.Python === "undefined") {
      return CyberBrickAPI.generateMainPy();
    }
    const body = Blockly.Python.workspaceToCode(this.workspace);

    return `# ==========================================================
# Brick Studio MicroPython
# Donanım: CyberBrick Multi-Function Core Board (XA003 / ESP32-C3)
# ==========================================================
import time
from bbl.motors import MotorsController
from bbl.servos import ServosController
from bbl.leds import LEDController
from bbl.buzzer import BuzzerController

motors = MotorsController()
servos = ServosController()
leds = LEDController()
buzzer = BuzzerController()

class UltrasonicSensor:
    def read_distance(self): return 45.0

class LineSensor:
    def read_left(self): return 0
    def read_right(self): return 0

ultrasonic = UltrasonicSensor()
line_sensor = LineSensor()

leds.set_color(0, 174, 66)
buzzer.beep(100)
print("[Brick Studio] Program başlatıldı.")

# --- Blok Kodları ---
${body || "print('Blok ekleyiniz.')"}
`;
  },

  loadDefaultBlocks: function(force = false) {
    if (!this.workspace) return;
    if (!force && this.workspace.getAllBlocks(false).length > 0) {
      return;
    }
    this.workspace.clear();
    // Forklift ile palet ve varil taşıma başlangıç programı
    const xml = `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="cb_set_rgb" x="25" y="25">
          <field name="COLOR">0, 174, 66</field>
          <next>
            <block type="cb_horn_beep">
              <value name="MS"><shadow type="math_number"><field name="NUM">120</field></shadow></value>
              <next>
                <block type="cb_forklift_lift">
                  <value name="HEIGHT"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                  <next>
                    <block type="cb_move_timed">
                      <field name="DIR">FORWARD</field>
                      <value name="SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
                      <value name="SECS"><shadow type="math_number"><field name="NUM">1.5</field></shadow></value>
                      <next>
                        <block type="cb_stop_motors">
                          <next>
                            <block type="cb_forklift_lift">
                              <value name="HEIGHT"><shadow type="math_number"><field name="NUM">75</field></shadow></value>
                              <next>
                                <block type="cb_wait_ms">
                                  <value name="MS"><shadow type="math_number"><field name="NUM">400</field></shadow></value>
                                  <next>
                                    <block type="cb_move_timed">
                                      <field name="DIR">BACKWARD</field>
                                      <value name="SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
                                      <value name="SECS"><shadow type="math_number"><field name="NUM">1.2</field></shadow></value>
                                      <next>
                                        <block type="cb_turn_angle">
                                          <field name="DIR">RIGHT</field>
                                          <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
                                          <value name="SPEED"><shadow type="math_number"><field name="NUM">55</field></shadow></value>
                                          <next>
                                            <block type="cb_move_timed">
                                              <field name="DIR">FORWARD</field>
                                              <value name="SPEED"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
                                              <value name="SECS"><shadow type="math_number"><field name="NUM">1.4</field></shadow></value>
                                              <next>
                                                <block type="cb_stop_motors">
                                                  <next>
                                                    <block type="cb_forklift_lift">
                                                      <value name="HEIGHT"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                                                      <next>
                                                        <block type="cb_wait_ms">
                                                          <value name="MS"><shadow type="math_number"><field name="NUM">400</field></shadow></value>
                                                          <next>
                                                            <block type="cb_move_timed">
                                                              <field name="DIR">BACKWARD</field>
                                                              <value name="SPEED"><shadow type="math_number"><field name="NUM">45</field></shadow></value>
                                                              <value name="SECS"><shadow type="math_number"><field name="NUM">0.9</field></shadow></value>
                                                              <next>
                                                                <block type="cb_forklift_lift">
                                                                  <value name="HEIGHT"><shadow type="math_number"><field name="NUM">20</field></shadow></value>
                                                                  <next>
                                                                    <block type="cb_horn_beep">
                                                                      <value name="MS"><shadow type="math_number"><field name="NUM">250</field></shadow></value>
                                                                    </block>
                                                                  </next>
                                                                </block>
                                                              </next>
                                                            </block>
                                                          </next>
                                                        </block>
                                                      </next>
                                                    </block>
                                                  </next>
                                                </block>
                                              </next>
                                            </block>
                                          </next>
                                        </block>
                                      </next>
                                    </block>
                                  </next>
                                </block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>
      </xml>
    `;

    try {
      const dom = (Blockly.utils && Blockly.utils.xml && typeof Blockly.utils.xml.textToDom === "function")
        ? Blockly.utils.xml.textToDom(xml)
        : Blockly.Xml.textToDom(xml);
      Blockly.Xml.domToWorkspace(dom, this.workspace);
      const topBlocks = this.workspace.getTopBlocks(false);
      if (topBlocks.length > 0) {
        topBlocks[0].moveTo(new Blockly.utils.Coordinate(32, 32));
      }
      this.workspace.render();
      Blockly.svgResize(this.workspace);
    } catch (e) {
      console.warn("Blok yükleme uyarısı:", e);
    }
  },

  loadXml: function(xmlStr) {
    if (!this.workspace) return;
    try {
      this.workspace.clear();
      const dom = (Blockly.utils && Blockly.utils.xml && typeof Blockly.utils.xml.textToDom === "function")
        ? Blockly.utils.xml.textToDom(xmlStr)
        : Blockly.Xml.textToDom(xmlStr);
      Blockly.Xml.domToWorkspace(dom, this.workspace);

      const topBlocks = this.workspace.getTopBlocks(false);
      if (topBlocks.length > 0) {
        topBlocks[0].moveTo(new Blockly.utils.Coordinate(36, 36));
      }

      if (typeof this.workspace.scrollCenter === "function") {
        this.workspace.scrollCenter();
      }

      this.workspace.render();
      Blockly.svgResize(this.workspace);
    } catch (e) {
      console.warn("loadXml hatasi:", e);
    }
  },

  getXml: function() {
    if (!this.workspace) return "";
    const dom = Blockly.Xml.workspaceToDom(this.workspace);
    return Blockly.Xml.domToText(dom);
  }
};

if (typeof window !== "undefined") {
  window.CyberBrickBlockly = CyberBrickBlockly;
}
