# Component Wiring Reference

Wiring tables for the MAX30100/MAX30102 pulse oximeter and GPS ATGM336H modules connected to the XIAO ESP32-S3.

---

## MAX30100 / MAX30102 → XIAO ESP32-S3

**Protocol:** I²C

| MAX30100 / MAX30102 | Direction | XIAO ESP32-S3 | Notes |
|---------------------|-----------|---------------|-------|
| `GND` | → | `GND` | Common ground |
| `VCC` | → | `3.3V` | Power supply (3.3V only) |
| `SCL` | → | `D4` | I²C clock |
| `SDA` | ↔ | `D5` | I²C data (bidirectional) |
| `INT` | → | *(optional GPIO)* | Interrupt-driven readings |

> **Note:** Add 4.7kΩ pull-up resistors on SDA and SCL to 3.3V if your module board does not already include them.

---

## GPS ATGM336H → ESP32-S3

**Protocol:** UART

| GPS ATGM336H | Direction | ESP32-S3 | Notes |
|--------------|-----------|----------|-------|
| `GND` | → | `GND` | Common ground |
| `VCC` | → | `3.3V` | Power supply (3.3V only) |
| `TX` | → | `RX` | UART data: GPS → ESP32 |
| `RX` | ← | `TX` | UART data: ESP32 → GPS |
| `PPS` | → | `D0` | Pulse-per-second timing signal |

> **Note:** Configure `D0` as a digital input on the ESP32-S3 for the PPS signal. The PPS pin provides a precise 1 Hz pulse useful for GPS time synchronization.

---

## General Reminders

- Both modules run on **3.3V** — do not connect to 5V.
- Ensure a **common GND** between all components.
- The MAX30100/MAX30102 I²C address is `0x57` (MAX30102) or `0x57`/`0x70` (MAX30100).
- Use a GPS library such as [TinyGPS++](https://github.com/mikalhart/TinyGPSPlus) for parsing NMEA sentences on the ESP32-S3.
