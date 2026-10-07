#include <Arduino.h>

// ====================================================================
// PIN CONFIGURATION
// ====================================================================
const int VOLT_PIN     = 2;  // D2  (GPIO 2  / ADC2_CH2) - ZMPT101B Voltage Sensor
const int CT_PIN       = 15; // D15 (GPIO 15 / ADC2_CH3) - SCT-013 Current Sensor
const int PULSE_IN_PIN = 5;  // D5  (GPIO 5)             - Optical Pulse (Active-LOW)

// ====================================================================
// CALIBRATION PARAMETERS
// ====================================================================
float VOLTAGE_CAL = 781.33;
float CT_CAL      = 133.33;

const float SUPPLY_VOLTAGE = 3.3;
const float ADC_RESOLUTION = 4095.0;
const double METER_CONSTANT = 3200.0; // imp/kWh[cite: 1, 5]

const float NOISE_GATE_VOLTAGE = 15.0;
const float NOISE_GATE_CURRENT = 0.05;

const int SAMPLES = 800;
int rawVBuffer[SAMPLES];
int rawIBuffer[SAMPLES];

double energyTotal_kWh = 0.0;
unsigned long lastComputeTime = 0;

// ====================================================================
// OPTICAL BUFFER WITH STEP-CHANGE & TIMEOUT ENGINE
// ====================================================================
const int AVG_WINDOW_SIZE = 50;
double intervalBuffer[AVG_WINDOW_SIZE];
int bufferIndex = 0;
int bufferCount = 0;
double bufferRunningSumSec = 0.0;

double stableReportedWatts = 0.0;
unsigned long lastPulseArrivedMs = 0;

// ISR state
volatile unsigned long isrLastEdgeUs = 0;
volatile unsigned long isrIntervalUs = 0;
volatile unsigned long isrPulseCount = 0;
volatile bool newValidPulse          = false;

void IRAM_ATTR onPulseFall() {
  if (digitalRead(PULSE_IN_PIN) == LOW) {
    unsigned long nowUs = micros();

    // Lockout mask rejects re-trigger bounce[cite: 1]
    if (nowUs - isrLastEdgeUs > 35000) { 
      if (isrLastEdgeUs > 0) {
        isrIntervalUs = nowUs - isrLastEdgeUs;
        isrPulseCount++;
        newValidPulse = true;
      }
      isrLastEdgeUs = nowUs;
    }
  }
}

void flushBufferWith(double seedIntervalSec) {
  for (int i = 0; i < AVG_WINDOW_SIZE; i++) {
    intervalBuffer[i] = seedIntervalSec;
  }
  bufferIndex = 0;
  bufferCount = AVG_WINDOW_SIZE;
  bufferRunningSumSec = seedIntervalSec * AVG_WINDOW_SIZE;
}

void resetOpticalState() {
  noInterrupts();
  isrLastEdgeUs = 0;
  isrIntervalUs = 0;
  isrPulseCount = 0;
  newValidPulse = false;
  interrupts();

  for (int i = 0; i < AVG_WINDOW_SIZE; i++) intervalBuffer[i] = 0.0;
  bufferIndex = 0;
  bufferCount = 0;
  bufferRunningSumSec = 0.0;
  stableReportedWatts = 0.0;
  lastPulseArrivedMs = 0;
}

void setup() {
  Serial.begin(115200);
  delay(1500);

  analogReadResolution(12);
  analogSetPinAttenuation(VOLT_PIN, ADC_11db);
  analogSetPinAttenuation(CT_PIN, ADC_11db);

  pinMode(PULSE_IN_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PULSE_IN_PIN), onPulseFall, FALLING); //[cite: 1]
  resetOpticalState();

  Serial.println("\n=================================================================");
  Serial.println("  AC Monitor + Fast Step-Tracking Optical Pulse Reader          ");
  Serial.println("=================================================================\n");
  lastComputeTime = millis();
}

void loop() {
  // -------------------------------------------------------------
  // 1. SERIAL COMMAND RESET
  // -------------------------------------------------------------
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == 'R' || cmd == 'r') {
      while (Serial.available() > 0) Serial.read();
      resetOpticalState();
      Serial.println("\n[RESET] Buffer cleared.\n");
    }
  }

  // -------------------------------------------------------------
  // 2. SYNCHRONOUS WAVEFORM CAPTURE (ADC)
  // -------------------------------------------------------------
  long sumVRaw = 0, sumIRaw = 0;
  for (int i = 0; i < SAMPLES; i++) {
    int accV = 0, accI = 0;
    for (int k = 0; k < 4; k++) {
      accV += analogRead(VOLT_PIN);
      accI += analogRead(CT_PIN);
    }
    rawVBuffer[i] = accV >> 2;
    rawIBuffer[i] = accI >> 2;
    sumVRaw += rawVBuffer[i];
    sumIRaw += rawIBuffer[i];
    delayMicroseconds(100);
  }

  float midVoltageDC = ((float)sumVRaw / SAMPLES / ADC_RESOLUTION) * SUPPLY_VOLTAGE;
  float midCurrentDC = ((float)sumIRaw / SAMPLES / ADC_RESOLUTION) * SUPPLY_VOLTAGE;

  double sumSquaredV = 0.0, sumSquaredI = 0.0, sumInstPower = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float vInst = ((rawVBuffer[i] / ADC_RESOLUTION) * SUPPLY_VOLTAGE - midVoltageDC) * VOLTAGE_CAL;
    float iInst = ((rawIBuffer[i] / ADC_RESOLUTION) * SUPPLY_VOLTAGE - midCurrentDC) * CT_CAL;
    sumSquaredV  += (vInst * vInst);
    sumSquaredI  += (iInst * iInst);
    sumInstPower += (vInst * iInst);
  }

  float vRMS = sqrt(sumSquaredV / SAMPLES);
  float iRMS = sqrt(sumSquaredI / SAMPLES);
  float realPower = sumInstPower / SAMPLES;

  if (vRMS < NOISE_GATE_VOLTAGE) vRMS = 0.0;
  if (iRMS < NOISE_GATE_CURRENT) { iRMS = 0.0; realPower = 0.0; }

  unsigned long now = millis();
  double dt_hours = (now - lastComputeTime) / 3600000.0;
  lastComputeTime = now;
  energyTotal_kWh += (realPower * dt_hours) / 1000.0;

  // -------------------------------------------------------------
  // 3. OPTICAL PROCESSING WITH INSTANT STEP RECOVERY
  // -------------------------------------------------------------
  bool pulseProcessed = false;
  unsigned long currentPulseCount = 0;
  double rawInstantWatts = 0.0;
  double smoothedWatts = 0.0;
  double certifiedEnergyKWh = 0.0;

  if (newValidPulse) {
    noInterrupts();
    newValidPulse = false;
    unsigned long intervalUs = isrIntervalUs;
    currentPulseCount = isrPulseCount;
    interrupts();

    lastPulseArrivedMs = millis();
    double instantSec = (double)intervalUs / 1000000.0;

    if (instantSec > 0.0) {
      rawInstantWatts = (3600.0 * 1000.0) / (METER_CONSTANT * instantSec); //[cite: 5]
      certifiedEnergyKWh = (double)currentPulseCount / METER_CONSTANT; //[cite: 5]

      // STEP CHANGE DETECTION:
      // If the incoming raw reading deviates from the current buffer average by > 25%,
      // a deliberate load change occurred: flush the old history immediately[cite: 1, 2]
      if (bufferCount > 0) {
        double currentAvgWatts = (3600.0 * 1000.0) / (METER_CONSTANT * (bufferRunningSumSec / bufferCount));
        if (fabs(rawInstantWatts - currentAvgWatts) / currentAvgWatts > 0.25) {
          flushBufferWith(instantSec);
        }
      }

      // Standard circular buffer update
      if (bufferCount == AVG_WINDOW_SIZE) {
        bufferRunningSumSec -= intervalBuffer[bufferIndex];
      } else {
        bufferCount++;
      }

      intervalBuffer[bufferIndex] = instantSec;
      bufferRunningSumSec += instantSec;
      bufferIndex = (bufferIndex + 1) % AVG_WINDOW_SIZE;

      smoothedWatts = (3600.0 * 1000.0) / (METER_CONSTANT * (bufferRunningSumSec / bufferCount));
      stableReportedWatts = smoothedWatts;
      pulseProcessed = true;
    }
  }

  // -------------------------------------------------------------
  // 4. IDLE TIMEOUT WATCHDOG
  // -------------------------------------------------------------
  // If no pulse arrives for > 5 seconds (or twice the expected period), load has dropped
  if (lastPulseArrivedMs > 0 && (millis() - lastPulseArrivedMs > 5000)) {
    stableReportedWatts = 0.0;
    bufferCount = 0;
    bufferRunningSumSec = 0.0;
  }

  // -------------------------------------------------------------
  // 5. TELEMETRY OUTPUT
  // -------------------------------------------------------------
  Serial.printf("GRID: %5.1fV | CT(D15): %5.3fA, %6.1fW\n", vRMS, iRMS, realPower);

  if (pulseProcessed) {
    Serial.printf("  --> [OPTICAL D5 #%lu] Raw: %6.1fW | Fast-Tracking Load: %6.1fW | Meter E: %.5fkWh\n",
                  currentPulseCount, rawInstantWatts, stableReportedWatts, certifiedEnergyKWh);
  } else if (stableReportedWatts == 0.0 && lastPulseArrivedMs > 0) {
    Serial.println("  --> [OPTICAL D5] Idle (0.0 W)");
  }

  delay(1000);
}