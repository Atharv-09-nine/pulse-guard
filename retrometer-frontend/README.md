# ⚡ PulseGuard — Web Client & Telemetry Cloud Bridge

> **High-Performance React 19 + TypeScript Dashboard and Zero-Dependency SSE Streaming Server for the PulseGuard System.**

For full system architecture, firmware formulas, hardware pinout, and wiring diagrams, see the primary [Root Documentation](../README.md).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
To start the local Vite development server on port `5174`:
```bash
npm run dev -- --port 5174
```
Or double-click `start.bat` in this directory (or `run.bat` at the root of the repository).

Visit `http://localhost:5174/dashboard`.

---

## 📡 Live Telemetry Connection Modes

### Option A: Web Serial API (Direct in Browser)
1. Open the dashboard in Google Chrome or Microsoft Edge.
2. Click **"Connect ESP32 USB"** in the top navigation bar.
3. Select your ESP32's COM port (baud rate: `115200`).
4. *Note:* Make sure the Serial Monitor in Arduino IDE is closed.

### Option B: PC-to-Cloud Bridge (`bridge.ps1` / `bridge.bat`)
Streams USB serial packets from your computer to your remote Render server so mobile devices can view live data over the internet:
```powershell
.\bridge.bat
```
Prompts for COM Port and Render URL (or `http://localhost:3000`).

### Option C: Production Node.js Server (`server.js`)
Build and run the production server:
```bash
npm run build
npm start
```
Starts native HTTP server on port 3000 (or `PORT` env) with Server-Sent Events (`/api/events`) and static asset hosting.

---

## 🛠️ Project Structure

```text
src/
├── App.tsx                  # Main router & layout coordinator
├── context/
│   └── TelemetryContext.tsx # Central state machine (Web Serial API + SSE + data parser)
├── pages/
│   ├── Landing.tsx          # High-tech ambient launch portal
│   ├── Dashboard.tsx        # Central monitoring dashboard with real-time graphs
│   ├── WaveformScope.tsx    # 800-point dual-trace oscilloscope visualizer
│   ├── GISMap.tsx           # Leaflet GIS feeder map with live theft node alerts
│   ├── Calibration.tsx      # Hardware calibration matrix & UART monitor
│   └── Reports.tsx          # Energy audit event logger & CSV/JSON exporter
├── components/
│   ├── Navbar.tsx           # Navigation with USB status and connect buttons
│   └── StatCard.tsx         # Standardized telemetry metric card
└── types/
    └── telemetry.ts         # TypeScript interfaces & types
```

---

## 📄 License
MIT License.
