import type { HardwarePinMap, HardwareSpecs } from '../types/telemetry'

export const HARDWARE_SPECS: HardwareSpecs = {
  meterConstant: 3200, // imp/kWh from mp_backup.ino line 164
  ctRatio: 2000.0, // 2000:1 current transformer
  burdenOhms: 3.3, // 3.3 ohm precision burden resistor
  pgaGain: 22.0, // ADE7953 PGA IA Gain
  voltageDividerRatio: (660330.0 + 330.0) / 330.0, // ~2002.0:1 divider
  calCurrentGain: 0.979,
  calVoltageGain: 0.974,
  debounceMicros: 5000, // 5ms debounce (200 flashes/sec max)
  goertzelWindowN: 699, // 100ms exact window
  sampleRateHz: 6990, // ADE7953 waveform register 0x0216 rate
}

export const ESP32_PIN_MAP: HardwarePinMap[] = [
  {
    pin: 7,
    name: 'PIN_OPTICAL',
    function: 'Optical Meter Pulse Interrupt',
    protocol: 'Hardware Ext Interrupt (IRAM)',
    chip: 'BPW34 PIN Diode + LM393 Dual Comparator',
    description: 'Intercepts utility meter calibration LED flashes (3200 imp/kWh) with 5ms noise blanking',
    status: 'INTERRUPT',
  },
  {
    pin: 3,
    name: 'PIN_IRQ',
    function: 'ADE7953 Hardware Sync IRQ',
    protocol: 'Digital Interrupt (Active LOW)',
    chip: 'ADE7953 Energy Metering IC',
    description: 'Synchronous zero-crossing and energy register ready notification pin',
    status: 'INTERRUPT',
  },
  {
    pin: 10,
    name: 'PIN_CS',
    function: 'ADE7953 SPI Chip Select',
    protocol: 'SPI (Mode 3, 1MHz MSB)',
    chip: 'ADE7953 Energy Metering IC',
    description: 'Active-low bus slave select for high-speed energy register reading',
    status: 'ACTIVE',
  },
  {
    pin: 11,
    name: 'PIN_MOSI',
    function: 'ADE7953 SPI Master Out Slave In',
    protocol: 'SPI',
    chip: 'ADE7953 Energy Metering IC',
    description: 'Transmits register address and calibration commands to ADE7953',
    status: 'ACTIVE',
  },
  {
    pin: 12,
    name: 'PIN_SCLK',
    function: 'ADE7953 SPI Serial Clock',
    protocol: 'SPI',
    chip: 'ADE7953 Energy Metering IC',
    description: '1.0 MHz synchronous SPI clock bus',
    status: 'ACTIVE',
  },
  {
    pin: 13,
    name: 'PIN_MISO',
    function: 'ADE7953 SPI Master In Slave Out',
    protocol: 'SPI',
    chip: 'ADE7953 Energy Metering IC',
    description: 'Reads 24-bit VRMS (0x021C), IRMSA (0x021A), AWATT (0x0212), and PFA (0x010A)',
    status: 'ACTIVE',
  },
  {
    pin: 5,
    name: 'PIN_EEPROM_SDA',
    function: 'AT24C32 I2C Data',
    protocol: 'I2C (Address 0x50)',
    chip: 'AT24C32 32K EEPROM',
    description: 'Stores non-volatile cumulative energy, calibration gain, and tamper event logs',
    status: 'OK',
  },
  {
    pin: 6,
    name: 'PIN_EEPROM_SCL',
    function: 'AT24C32 I2C Clock',
    protocol: 'I2C (Address 0x50)',
    chip: 'AT24C32 32K EEPROM',
    description: 'Synchronous 400kHz I2C clock line for memory persistence',
    status: 'OK',
  },
  {
    pin: 4,
    name: 'PIN_DS1302_RST',
    function: 'DS1302 Chip Enable / RST',
    protocol: '3-Wire Serial Bus',
    chip: 'DS1302 Trickle-Charge RTC',
    description: 'Active-high chip enable for real-time timestamping of telemetry packets',
    status: 'OK',
  },
  {
    pin: 8,
    name: 'PIN_DS1302_DAT',
    function: 'DS1302 Bidirectional I/O',
    protocol: '3-Wire Serial Bus',
    chip: 'DS1302 Trickle-Charge RTC',
    description: 'LSB-first bidirectional time & date transfer register (BCD format)',
    status: 'OK',
  },
  {
    pin: 9,
    name: 'PIN_DS1302_CLK',
    function: 'DS1302 Serial Clock',
    protocol: '3-Wire Serial Bus',
    chip: 'DS1302 Trickle-Charge RTC',
    description: 'Bit-banged shift clock for real-time clock communications',
    status: 'OK',
  },
]

