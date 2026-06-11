#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// MAX30100 I2C
#define I2C_SDA         6     // D5 = GPIO6
#define I2C_SCL         5     // D4 = GPIO5
#define REPORTING_MS    1000

// GPS UART
#define RXD1            44    // D7 = GPIO44 -> GPS TX
#define TXD1            43    // D6 = GPIO43 -> GPS RX
#define PPS_PIN         1     // D0 = GPIO1  -> GPS PPS
#define GPS_BAUDRATE    9600

// ── MAX30100 ──────────────────────────────────────────
PulseOximeter pox;
uint32_t lastReport = 0;
uint8_t noReadingCount = 0;

// ── GPS ───────────────────────────────────────────────
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);

volatile bool ppsTriggered = false;
volatile unsigned long ppsMicros = 0;

// ── ISR ───────────────────────────────────────────────
void IRAM_ATTR onPPS() {
  ppsMicros = micros();
  ppsTriggered = true;
}

// ── MAX30100 beat callback ────────────────────────────
void onBeatDetected() {
  Serial.println("Beat detected!");
}

// ── MAX30100 init ─────────────────────────────────────
void initSensor() {
  Serial.println("Initialising MAX30100...");
  if (!pox.begin()) {
    Serial.println("MAX30100 FAILED. Check wiring!");
    while (1);
  }
  Serial.println("MAX30100 ready! Place finger on sensor.");
  pox.setIRLedCurrent(MAX30100_LED_CURR_11MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);
}

// ── SETUP ─────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(3000);

  Serial.println("=== XIAO ESP32-S3 | GPS + MAX30100 ===");

  // MAX30100
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(100000);
  initSensor();

  // GPS
  gpsSerial.begin(GPS_BAUDRATE, SERIAL_8N1, RXD1, TXD1);
  pinMode(PPS_PIN, INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(PPS_PIN), onPPS, RISING);
  Serial.println("GPS started. Waiting for fix...");
}

// ── LOOP ──────────────────────────────────────────────
void loop() {

  // ── MAX30100 update ──────────────────────────────
  pox.update();

  if (millis() - lastReport > REPORTING_MS) {
    lastReport = millis();

    float bpm  = pox.getHeartRate();
    int   spo2 = pox.getSpO2();

    if (bpm == 0 && spo2 == 0) {
      Serial.println("[OXY] No finger detected");
      noReadingCount++;
      if (noReadingCount > 60) {  // 60 seconds before restart
        noReadingCount = 0;
        Serial.println("[OXY] Restarting sensor...");
        initSensor();
      }
    } else if (spo2 > 100) {
      Serial.println("[OXY] Stabilising...");
      noReadingCount = 0;
    } else {
      Serial.print("[OXY] BPM: ");       Serial.print(bpm);
      Serial.print("  |  SpO2: ");       Serial.print(spo2);
      Serial.println("%");
      noReadingCount = 0;
    }
  }

  // ── GPS feed ─────────────────────────────────────
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // GPS debug every 2 seconds forever
  {
    static unsigned long lastDebug = 0;
    if (millis() - lastDebug > 2000) {
      lastDebug = millis();
      if (gps.charsProcessed() == 0) {
        Serial.println("[GPS] No data — check RX/TX wiring or baud rate");
      } else {
        Serial.printf("[GPS] Chars: %lu | Fix: %lu | BadCRC: %lu\n",
          gps.charsProcessed(),
          gps.sentencesWithFix(),
          gps.failedChecksum());
      }
    }
  }

  // ── PPS triggered ────────────────────────────────
  noInterrupts();
  bool pps = ppsTriggered;
  unsigned long ppsMicrosLocal = ppsMicros;
  if (pps) ppsTriggered = false;
  interrupts();

  if (pps) {
    Serial.print("[PPS] micros: ");
    Serial.println(ppsMicrosLocal);

    if (gps.time.isValid()) {
      Serial.printf("[GPS] UTC : %02d:%02d:%02d\n",
        gps.time.hour(), gps.time.minute(), gps.time.second());
    }

    if (gps.location.isValid()) {
      Serial.printf("[GPS] Lat : %.6f\n", gps.location.lat());
      Serial.printf("[GPS] Lng : %.6f\n", gps.location.lng());
      Serial.printf("[GPS] Alt : %.2f m\n", gps.altitude.meters());
      Serial.printf("[GPS] Sat : %d | HDOP: %.2f\n",
        gps.satellites.value(), gps.hdop.hdop());
    } else {
      Serial.println("[GPS] No fix yet...");
    }

    Serial.println("----------------------------");
  }
}