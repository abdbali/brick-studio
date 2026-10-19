# Contributing to Brick Studio

Thank you for your interest in contributing to **Brick Studio**! We welcome contributions from educators, makers, software engineers, and 3D printing enthusiasts worldwide.

---

## 1. Core Engineering & Architecture Standards

All contributions to Brick Studio must adhere to strict production standards:

1. **Clean Technical Typography & Iconography:**
   - Maintain professional, distraction-free technical documentation and user interfaces. Use structured markdown tables, high-contrast monospace code blocks, and FontAwesome vector icons. Avoid colloquial symbols, decorative emoticons, or non-technical ornaments.

2. **Precision User Interface & Visual Design:**
   - UI components must maintain an industrial workstation aesthetic: high contrast, neutral slate foundations, tactile state transitions, and distinct functional color-coding (`#00ae42`, `#ff6a00`, `#cbf026`).

3. **Client-Side, Zero-Install Web Architecture:**
   - The application is an instant Single Page Application (SPA). Do not introduce mandatory backend servers, heavy bundlers, or telemetry trackers. All simulation, physics solving, AST compilation, and firmware generation must execute 100% client-side in the browser.

4. **Multi-Dialect Code Generation:**
   - Whenever introducing a new custom block, you must provide:
     - Block definition in `js/blockly-cyberbrick.js` (with multi-language strings).
     - Asynchronous browser simulation handler in `js/virtual-runtime.js`.
     - Standard hardware MicroPython generator in `js/blockly-cyberbrick.js` targeting the `bbl` firmware architecture.

5. **Internationalization (i18n):**
   - New user-facing strings must be defined across all five supported language dictionaries in `js/app.js` and `js/blockly-cyberbrick.js`:
     - Turkish (`tr`)
     - English (`en`)
     - German (`de`)
     - Spanish (`es`)
     - French (`fr`)

---

## 2. Development Workflow

1. **Fork the Repository:**
   ```bash
   git clone https://github.com/your-username/brick-studio.git
   cd brick-studio
   ```

2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Test Locally:**
   Open `index.html` directly in your browser or run a lightweight local server:
   ```bash
   python -m http.server 8080
   # Open http://localhost:8080 in Chrome or Edge
   ```

4. **Verify Functionality:**
   - Verify that all blocks drag, drop, and snap cleanly.
   - Verify that the 3D simulation renders at a smooth 60 FPS.
   - Verify that all five languages switch seamlessly without clearing the workspace.
   - Verify syntax validation and test for any unescaped markup.

5. **Submit a Pull Request:**
   Push your feature branch to your fork and submit a Pull Request with a clear description of the mechanical, educational, or computational enhancement.

---

## 3. Adding New MakerWorld Robot Models

If you have designed a 3D-printable robot compatible with Bambu Lab Maker's Supply:
1. Add the parametric record to the catalog in [`js/cyberbrick-models.js`](js/cyberbrick-models.js).
2. Construct the procedural 3D mesh representation or STL loader hook in [`js/simulation-3d.js`](js/simulation-3d.js).
3. Provide the MakerWorld model URL and bill of materials in [`docs/HARDWARE_BOM.md`](docs/HARDWARE_BOM.md).
4. Update model selection dropdowns in `index.html` and language dictionaries in `js/app.js`.

---

## 4. Community & Support

For questions, discussions, or educational pilot proposals, please open an Issue in this repository or contact the project maintainers.
