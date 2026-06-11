#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

#define I2C_SDA       6
#define I2C_SCL       5
#define REPORTING_MS  1000

PulseOximeter pox;
uint32_t lastReport = 0;
uint8_t noReadingCount = 0;

void onBeatDetected() {
  Serial.println("Beat detected!");
}

void initSensor() {
  Serial.println("Initialising MAX30100...");
  if (!pox.begin()) {
    Serial.println("FAILED. Check wiring!");
    while (1);
  }
  Serial.println("Ready! Place finger on sensor.");
  pox.setIRLedCurrent(MAX30100_LED_CURR_11MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);
}

void setup() {
  Serial.begin(115200);
  delay(3000);

  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(100000);

  initSensor();
}

void loop() {
  pox.update();

  if (millis() - lastReport > REPORTING_MS) {
    lastReport = millis();

    float bpm  = pox.getHeartRate();
    int   spo2 = pox.getSpO2();

    if (bpm == 0 && spo2 == 0) {
      Serial.println("No finger detected");
      noReadingCount++;
      if (noReadingCount > 10) {
        noReadingCount = 0;
        Serial.println("Restarting sensor...");
        initSensor();
      }
    } else if (spo2 > 100) {
      Serial.println("Stabilising...");
      noReadingCount = 0;
    } else {
      Serial.print("BPM: ");       Serial.print(bpm);
      Serial.print("  |  SpO2: "); Serial.print(spo2);
      Serial.println("%");
      noReadingCount = 0;
    }
  }
}