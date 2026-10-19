# Brick Studio: Hardware Bill of Materials & 3D Print Guide
### Maker's Supply Specifications, Pinout Map, and Fabrication Parameters

---

## 1. Electronics Bill of Materials (Maker's Supply Standard)

All electronic hardware used in Brick Studio corresponds to standard, easily sourced components from the **Bambu Lab Maker's Supply** catalog or compatible electronics distributors.

| Component | Part Description / Model | Qty | Target Voltage / Interface | Function in Brick Studio | Maker's Supply Reference |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Core Microcontroller** | CyberBrick Core Board (XA003 / ESP32-C3) | 1 | 3.3V Logic / 5-9V Input | High-speed RISC-V MCU with Wi-Fi, BLE, and MicroPython firmware | Maker's Supply Core MCU |
| **Traction Motors** | N20 Micro Metal Gearmotor (6V, 200 RPM) | 2 | 3.0V - 7.4V DC PWM | Differential drive left and right wheels | N20 Gearmotor Kit |
| **Motor Driver** | Dual H-Bridge Driver (TC6612 / DRV8833 onboard) | 1 | Up to 1.2A per channel | Bi-directional PWM speed and braking control | Integrated on Core Board |
| **Elevator Servo** | SG90 / MG90S 9g Metal-Gear Micro Servo | 1 | 4.8V - 6.0V PWM | Forklift vertical mast / arm articulation | 9g Micro Servo |
| **Proximity Sensor** | Ultrasonic Sensor Module (HC-SR04 / RCWL-1601) | 1 | 5.0V Digital IO | Real-time distance measurement (2 cm to 300 cm) | Ultrasonic Sensor Pack |
| **Surface Sensor** | Dual-Channel TCRT5000 Optical IR Reflectance Module | 1 | 3.3V - 5.0V Digital IO | Ground line tracking (black tape detection) | Dual IR Line Tracker |
| **Status Beacon** | WS2812B NeoPixel RGB LED | 1 | 5.0V Single-Wire Data | Visual vehicle status, errors, and mode signals | Integrated on Core Board |
| **Acoustic Indicator** | Active Buzzer (5V) | 1 | 5.0V Digital IO | Horn, audio cues, obstacle warnings | Integrated on Core Board |
| **Power Source** | 2S 7.4V Li-ion Battery (2x 18650) with BMS | 1 | 7.4V Nominal (8.4V Peak) | High-discharge portable robot power | 2S Battery Pack |
| **Hardware Fasteners** | M2.5 & M3 Stainless Hex Socket Screws | 1 Set| Metric ISO Standard | Mechanical assembly of chassis and mast rails | Hardware Fastener Pack |

---

## 2. Pinout & Electrical Wiring Map

The physical wiring corresponds exactly to the software bindings in `js/circuit-view.js` and `js/cyberbrick-api.js`:

```text
ESP32-C3 Core Board (XA003)
├── GPIO 0  ────────► Ultrasonic Trig Pin (Output, 10us trigger pulse)
├── GPIO 1  ────────► Ultrasonic Echo Pin (Input, Pulse-width duration)
├── GPIO 2  ────────► Servo Channel 1 PWM (Forklift Mast Elevator, 50Hz)
├── GPIO 3  ────────► Servo Channel 2 PWM (Spare Auxiliary Articulation)
├── GPIO 4  ────────► Motor 1 PWM (Left Traction Motor, H-Bridge IN1/IN2)
├── GPIO 5  ────────► Motor 2 PWM (Right Traction Motor, H-Bridge IN3/IN4)
├── GPIO 6  ────────► Left Optical IR Line Sensor (Digital Read: 1=Black, 0=White)
├── GPIO 7  ────────► Right Optical IR Line Sensor (Digital Read: 1=Black, 0=White)
├── GPIO 8  ────────► WS2812B RGB Status Data Line
├── GPIO 9  ────────► Active Buzzer Digital Output
└── 5V / GND ───────► Regulated Common Bus
```

---

## 3. Bambu Lab 3D Printing & Slicing Specifications

All 3D models in the Brick Studio catalog (`BrickForklift`, `BrickTruck`) are engineered specifically for Bambu Lab 3D printers (**Bambu Lab X1-Carbon, P1S, P1P, A1, and A1 mini**) using **Bambu Studio**.

### Recommended Filament Choices
- **Chassis & Structural Rails:** Bambu PLA Tough or Bambu PETG-HF (high impact strength, rigid dimensional stability for bearing channels).
- **Cabin & Decorative Bodywork:** Bambu PLA Basic (vibrant colors, excellent layer adhesion).
- **Tires & Gripper Pads:** Bambu TPU 95A (flexible, high frictional grip on warehouse tiles and track surfaces).

### Slicing Profiles in Bambu Studio

| Component Group | Filament | Layer Height | Wall Loops | Infill % & Pattern | Supports Required? |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Main Chassis Platform** | Bambu PLA Tough | 0.20 mm Standard | 4 Walls | 25% Gyroid | None (Designed flat) |
| **Forklift Mast Rails** | Bambu PETG-HF | 0.16 mm Optimal | 5 Walls | 40% Gyroid | Minimal Tree Supports |
| **Carriage Forks** | Bambu PETG-HF | 0.16 mm Optimal | 6 Walls | 50% Grid | None (Print on back face) |
| **Traction Wheels (Rims)** | Bambu PLA Basic | 0.20 mm Standard | 3 Walls | 20% Gyroid | None |
| **Wheel Tires** | Bambu TPU 95A | 0.20 mm Standard | 3 Walls | 15% Concentric | None |
| **Cargo Pallets** | Bambu PLA Wood | 0.20 mm Standard | 3 Walls | 15% Grid | None |
| **Chemical Barrels** | Bambu PLA Basic | 0.20 mm Standard | 2 Walls | 10% Gyroid | None |

---

## 4. Mechanical Assembly Sequence (BrickForklift)

1. **Chassis Preparation:** Press-fit M3 brass heat-set inserts into the mounting bosses of the lower chassis.
2. **Motor Installation:** Slide the two N20 gearmotors into their left and right retaining brackets. Fasten with M2 screws. Press-fit the TPU-rimmed wheels onto the 3mm D-shafts.
3. **Mast Assembly:** Insert the carriage fork slider into the vertical mast guide channels. Lubricate guide channels with a drop of PTFE or silicone grease.
4. **Servo Linkage:** Mount the SG90 micro servo into the central mast bracket. Connect the servo horn to the carriage lift arm using an M2 linkage screw. Calibrate zero position to horizontal floor contact.
5. **Electronics Integration:** Snap the CyberBrick ESP32-C3 Core Board into the upper chassis tray. Connect motor leads to the screw terminals. Plug the servo into Channel 1.
6. **Sensor Mounting:** Click the ultrasonic sensor into the front grille bracket and the dual IR line sensor under the front bumper facing down (3mm clearance to the floor).
7. **Final Check:** Power on the 2S battery pack, ensure the RGB beacon lights green, and open Brick Studio in your browser to begin testing.
