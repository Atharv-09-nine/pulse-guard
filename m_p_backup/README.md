# ⚡ PulseGuard — AC Grid & Optical Telemetry System

> **Real-Time Dual-Vector Power Telemetry, Fast-Tracking Optical Metering & Anti-Theft Protection powered by ESP32, React 19 & TypeScript.**

[![ESP32](https://img.shields.io/badge/Hardware-ESP32%20WROOM--32-E7352C?logo=espressif&logoColor=white)](#hardware-wiring--pin-configuration)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-61DAFB?logo=react&logoColor=black)](#frontend-architecture)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF?logo=vite&logoColor=white)](#getting-started)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20CSS%20v4-38BDF8?logo=tailwindcss&logoColor=white)](#frontend-architecture)
[![Deployment](https://img.shields.io/badge/Cloud-Render%20Web%20Service-46E3B7?logo=render&logoColor=black)](#cloud-deployment-rendercom)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

---

## 📌 Executive Summary

**PulseGuard** is an advanced smart-meter telemetry and tamper-detection ecosystem. It marries high-frequency synchronous AC grid instrumentation with calibrated optical pulse telemetry from utility meters.

By monitoring line voltage (**ZMPT101B**) and line current (**SCT-013**) while simultaneously intercepting optical LED energy pulses (**3200 imp/kWh**) on a utility meter, PulseGuard performs instant real-time vector cross-comparison. When current is consumed on the line but the utility meter's optical pulse output does not correspond (due to meter bypass, physical jamming, or optical shuttering), PulseGuard detects the anomaly immediately and issues an actionable **Theft & Tamper Alert**.

```
   ┌─────────────────────────────────────────────────────────┐
   │                      AC MAINS GRID                      │
   └─────────────┬─────────────────────────────┬─────────────┘
                 │                             │
        [ ZMPT101B Voltage ]          [ SCT-013 Current ]
                 │ (D2)                        │ (D15)
                 ▼                             ▼
   ┌─────────────────────────────────────────────────────────┐
   │               ESP32 DUAL-CORE ENGINE                    │
   │  • 800-Point True-RMS ADC Capture @ 100μs               │
   │  • 35ms Debounced Hardware Interrupt for Optical (D5)   │
   │  • Dynamic 25% Step-Change History Flush Engine         │
   │  • Discrepancy & Anti-Tamper State Machine              │
   └─────────────┬─────────────────────────────┬─────────────┘
                 │ (Web Serial API)            │ (USB Serial Bridge)
                 ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │   PulseGuard Web Client   │ │  Node.js SSE Cloud Server │
   │   (Chrome / Edge Local)   │ │  (Render.com / Remote)    │
   └───────────────────────────┘ └─────────────┬─────────────┘
                                               ▼
                                 ┌───────────────────────────┐
                                 │ Mobile & Remote Dashboard │
                                 └───────────────────────────┘
```

---

## 🚀 Key System Capabilities

### 1. Dual-Vector Synchronous Sampling
- **Synchronous ADC Capture**: Acquires 800 synchronous pairs of voltage and current per cycle at 100μs spacing with 4x hardware oversampling (`acc >> 2`).
- **Dynamic DC Midpoint Elimination**: Continuously filters out DC offsets dynamically ($V_{\text{mid}}$, $I_{\text{mid}}$).
- **True RMS Calculation**: Accurately computes $V_{\text{RMS}}$, $I_{\text{RMS}}$, Active Power ($P$), Apparent Power ($S$), and Power Factor ($\text{PF} = P / S$).

### 2. Optical Pulse Engine with Step-Tracking
- **Zero-Bounce Interrupt Routine**: Runs on ESP32 `IRAM_ATTR` using an active-LOW falling edge interrupt with a **35,000μs (35ms)** hardware lockout mask to reject spurious switch bounces.
- **Dynamic 25% Step-Change Recovery**: Conventional moving-average filters suffer from extreme lag when heavy loads suddenly turn ON or OFF. PulseGuard monitors the deviation between incoming pulses and the buffer average: if deviation exceeds **25%**, the entire 50-sample buffer is instantly flushed and re-seeded, delivering near-instant load response.
- **5-Second Idle Watchdog**: If load ceases and no pulse arrives within 5,000ms, the system automatically forces reported optical watts to $0.0\text{ W}$, avoiding stale readings.

### 3. Automated Electricity Theft & Tamper Detection
- Continuously calculates:
  $$\Delta\% = \frac{|P_{\text{grid}} - P_{\text{optical}}|}{P_{\text{grid}}} \times 100$$
- Triggers tiered alerts:
  - **Normal**: $\Delta\% < 25\%$ (Acceptable sensor tolerance).
  - **Notice / Warning**: Line load $> 200\text{ W}$ while optical power $< 10\text{ W}$ or $\Delta\% > 40\%$.
  - **Critical Breach**: $\Delta\% > 70\%$ indicating active meter bypass or total pulse blackout.

### 4. Tri-Mode Telemetry Transport
1. **Web Serial API (In-Browser)**: Direct zero-dependency plug-and-play connection from Google Chrome or Microsoft Edge directly to the ESP32 COM port at 115,200 baud.
2. **PC-to-Cloud Bridge (`bridge.ps1` / `bridge.bat`)**: Headless background PowerShell service that parses ESP32 UART output and pushes JSON payloads to any remote cloud endpoint.
3. **Real-Time SSE Server (`server.js`)**: Ultra-lightweight native Node.js HTTP server supporting Server-Sent Events (SSE) for zero-latency streaming to mobile smartphones and remote field inspectors.

---

## 🔌 Hardware Wiring & Pin Configuration

| Sensor / Module | ESP32 GPIO | ADC Channel | Configuration / Notes |
|---|---|---|---|
| **ZMPT101B** AC Voltage Module | **GPIO 2** | `ADC2_CH2` | Set to 11dB attenuation (`ADC_11db`), calibrated via `VOLTAGE_CAL = 781.33` |
| **SCT-013-000** Current Transformer | **GPIO 15** | `ADC2_CH3` | Set to 11dB attenuation (`ADC_11db`), calibrated via `CT_CAL = 133.33` |
| **Optical Pulse Photodiode** | **GPIO 5** | Digital (IRAM) | `INPUT_PULLUP`, Active-LOW falling edge interrupt |
| **GND** | **GND** | Common | Common ground across all sensor reference planes |
| **3.3V / 5V** | **3V3 / VIN** | Power Rail | 3.3V logic compliance on ADC inputs |

> [!WARNING]
> **High Voltage Safety Notice:** Working with AC mains (110V/230V) carries lethal shock hazards. Ensure the ZMPT101B and SCT-013 are wired inside a rated electrical enclosure and line isolation is preserved.

---

## 📁 Repository Structure

```text
m_p_backup/
├── README.md                      # Complete system documentation (this file)
├── run.bat                        # 1-Click root Windows launcher (Node + Vite 5174 + Browser)
├── start.ps1                      # PowerShell alternative launcher
│
├── mp_backup/                     # ESP32 Embedded Firmware
│   └── mp_backup.ino              # Arduino C++ firmware: ADC capture, ISR, step engine, UART output
│
└── Pulse-Guard-frontend/          # Web Client & Cloud Streaming Server
    ├── package.json               # Dependencies (React 19, Recharts, Leaflet, Tailwind v4, etc.)
    ├── vite.config.ts             # Vite build configuration
    ├── server.js                  # Zero-dependency Node.js HTTP & SSE Server for Render cloud
    ├── render.yaml                # Infrastructure-as-code for Render deployment
    ├── start.bat                  # Frontend-specific quick launcher
    ├── bridge.bat                 # 1-Click launcher for PC-to-Render cloud bridge
    ├── bridge.ps1                 # PowerShell COM port listener & REST pusher
    │
    └── src/
        ├── App.tsx                # Main router & telemetry provider wrapper
        ├── context/
        │   └── TelemetryContext.tsx # Central state machine (Web Serial API + SSE + data parser)
        ├── pages/
        │   ├── Landing.tsx        # High-tech ambient launch portal
        │   ├── Dashboard.tsx      # Central monitoring dashboard with real-time graphs
        │   ├── WaveformScope.tsx  # 800-point dual-trace oscilloscope visualizer
        │   ├── GISMap.tsx         # Leaflet GIS feeder map with live theft node alerts
        │   ├── Calibration.tsx    # Hardware calibration matrix & UART monitor
        │   └── Reports.tsx        # Energy audit event logger & CSV/JSON exporter
        ├── components/
        │   ├── Navbar.tsx         # Top bar with USB connect button & live badge
        │   └── StatCard.tsx       # Standardized telemetry metric card
        └── types/
            └── telemetry.ts       # TypeScript interface schemas
```

---

## 🧮 Mathematical Model & Calibration

### 1. True RMS Calculations
For $N = 800$ synchronous samples sampled at intervals of $100\mu\text{s}$:

$$V_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} \left( v_i - V_{\text{DC}} \right)^2} \times K_V$$

$$I_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} \left( i_i - I_{\text{DC}} \right)^2} \times K_I$$

- $K_V = \text{VOLTAGE\_CAL} = 781.33$
- $K_I = \text{CT\_CAL} = 133.33$

### 2. Active Real Power & Energy
$$P_{\text{real}} = \frac{1}{N} \sum_{i=1}^{N} \left( v_i(t) \cdot i_i(t) \right)$$

$$E_{\text{total}} = \sum \left( P_{\text{real}} \times \frac{\Delta t}{3600 \times 1000} \right) \quad [\text{kWh}]$$

### 3. Optical Pulse Conversion
For an energy meter with constant $M = 3200\text{ imp/kWh}$ and consecutive pulse duration $\Delta t$ in seconds:

$$P_{\text{opt}} = \frac{3600 \times 1000}{M \times \Delta t} \quad [\text{Watts}]$$

$$E_{\text{certified}} = \frac{\text{Pulse Count}}{M} \quad [\text{kWh}]$$

---

## 🏁 Quick Start Guide

### Step 1: Flash the ESP32 Firmware
1. Open the [mp_backup.ino](file:///c:/Users/Atharv/OneDrive/Documents/m_p_backup/mp_backup/mp_backup.ino) sketch in the **Arduino IDE**.
2. Select your board: `Tools -> Board -> ESP32 Arduino -> ESP32 Dev Module`.
3. Set upload speed to `115200` or `921600`.
4. Click **Upload**.
5. Once uploaded, test the serial output at **115200 baud**.
6. **IMPORTANT:** Close the Arduino IDE Serial Monitor before launching the web app (Windows restricts a COM port to one application at a time).

---

### Step 2: Run the Web Dashboard
You can start the system instantly using the provided batch launcher:

#### Method A: 1-Click Launch (Recommended)
Double-click `run.bat` in the root directory, or run in PowerShell:
```powershell
.\start.ps1
```
This script will:
1. Verify your Node.js installation.
2. Start the Vite server on port `5174`.
3. Automatically open `http://localhost:5174/dashboard` in your browser.

#### Method B: Manual CLI Launch
```bash
cd Pulse-Guard-frontend
npm install
npm run dev -- --port 5174
```
Navigate to `http://localhost:5174/dashboard`.

---

### Step 3: Connect Hardware to the Browser
1. Open the dashboard in **Google Chrome** or **Microsoft Edge**.
2. Click the green **"Connect ESP32 USB"** button in the top navigation bar.
3. Select your ESP32's COM port in the browser prompt and click **Connect**.
4. The status indicator will transition to:
   $$\text{🟢 LIVE ESP32 HARDWARE STREAM}$$
5. Live telemetry, waveform graphs, and tamper indicators will immediately update in real time.

---

## 🌐 Cloud Remote Access (Phone & Off-Site Monitoring)

PulseGuard supports full off-site monitoring without port forwarding:

```
[ ESP32 ] ---> (USB) ---> [ PC Bridge (bridge.ps1) ] ---> (HTTPS POST) ---> [ Render Cloud Server ] ---> (SSE) ---> [ Smartphone Browser ]
```

### 1. Deploying to Render.com
1. Connect your repository to **Render.com**.
2. Create a new **Web Service**.
3. Render automatically picks up `Pulse-Guard-frontend/render.yaml`:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (runs lightweight `server.js`)
4. Your application is live at `https://<your-subdomain>.onrender.com`.

### 2. Forwarding Telemetry from PC to Cloud
Run the bridge script on your local PC:
```powershell
cd Pulse-Guard-frontend
.\bridge.bat
```
1. Select your ESP32 COM port from the prompt.
2. Enter your Render URL (e.g. `https://pulse-guard.onrender.com`).
3. The bridge continuously reads serial packets and syncs them to your cloud endpoint via HTTP POST.
4. Anyone opening your Render URL on mobile will receive live SSE streaming without any USB cables attached to the phone!

---

## 🖥️ Screen Guide & Diagnostics

### 1. Dashboard (`/dashboard`)
- **Key Metric Cards**: Voltage ($V_{\text{RMS}}$), Current ($I_{\text{RMS}}$), Line Power, Optical Meter Power, Power Factor, Certified Energy, and Tamper Status.
- **Power Tracking Chart**: Dynamic Recharts curve showing real-time comparison between CT line power and optical meter response.
- **Console Terminal**: Live scrolling log displaying raw UART lines from the ESP32.

### 2. 800-Point Oscilloscope (`/dashboard/waveform`)
- Full synchronous dual-trace AC oscilloscope.
- View $v(t)$, $i(t)$, or instantaneous active power $p(t) = v(t) \cdot i(t)$.
- Interactive peak-to-peak and phase displacement calculations.

### 3. GIS Feeder Map (`/dashboard/map`)
- Leaflet-powered GIS grid map visualizing distribution feeder nodes.
- Color-coded status pins:
  - 🟢 **Online / Nominal**
  - 🟡 **Load Step Spike**
  - 🔴 **Theft / Bypass Alert**

### 4. Calibration Matrix (`/dashboard/calibration`)
- Interactive interface to adjust `VOLTAGE_CAL`, `CT_CAL`, `METER_CONSTANT`, noise gating voltages, and step thresholds.
- **Buffer Reset Button**: Dispatches the `'R'` serial command to the ESP32 to clear circular averaging buffers without having to power cycle the microcontroller.

### 5. Audit Reports (`/dashboard/reports`)
- Comprehensive chronological event log tracking normal cycles, step flushes, and theft incidents.
- Filter by severity and export audit logs directly to **CSV** or **JSON** for utility verification.

---

## 🔧 Troubleshooting & FAQs

### Q: Browser shows "COM Port is Busy or Locked"?
**Fix:** On Windows, only one application can communicate with a serial port at any given time.
1. Close the **Serial Monitor** or **Serial Plotter** in Arduino IDE.
2. Ensure no third-party serial terminals (PuTTY, Tera Term, VS Code Serial Monitor) are open.
3. Click **Connect ESP32 USB** in the dashboard again.

### Q: Why does the optical reading take a moment to update?
**Fix:** The optical reading depends on physical meter pulses ($3200\text{ imp/kWh}$). At very low loads (e.g. $10\text{ W}$), pulses occur several seconds apart. PulseGuard's **25% Step Recovery Engine** instantly flushes the buffer as soon as a significant load change is detected.

### Q: Can I reset the optical buffer manually?
**Fix:** Yes! You can:
1. Click **Reset Optical Buffer** on the **Calibration** page in the dashboard, or
2. Send the character `'R'` or `'r'` directly over Serial (115200 baud).

---

## 📜 Technology Stack

- **Firmware**: C++ / Arduino ESP32 Core
- **Client Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Animation**: Framer Motion
- **Data Visualization**: Recharts, Leaflet, React-Leaflet
- **Server**: Node.js (Zero-dependency HTTP + Server-Sent Events)
- **Tooling**: Vite 8, ESLint, TypeScript 6

---

## 📄 License
This project is licensed under the **MIT License** — feel free to use, modify, and distribute for educational, research, or commercial purposes.
