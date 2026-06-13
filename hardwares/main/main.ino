#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ── CONFIGURATION ─────────────────────────────────────
const char* WIFI_SSID     = "SunwayForAI";
const char* WIFI_PASSWORD = "Sunway@123";
const char* API_URL       = "https://skkcg1pw-3000.inc1.devtunnels.ms/pet/update-attributes";

// MAX30100 I2C (XIAO ESP32-S3)
#define I2C_SDA         6     // D5 = GPIO6
#define I2C_SCL         5     // D4 = GPIO5
#define REPORTING_MS    1000

// GPS UART (XIAO ESP32-S3)
#define RXD1            44    // D7 = GPIO44 -> GPS TX
#define TXD1            43    // D6 = GPIO43 -> GPS RX
#define PPS_PIN         1     // D0 = GPIO1  -> GPS PPS
#define GPS_BAUDRATE    9600

// ── BPM AVERAGING ─────────────────────────────────────
// Collects this many valid BPM samples before accepting a reading.
// Higher = smoother but slower to react. 5 is a good balance.
#define BPM_SAMPLE_COUNT  5

// How many seconds to wait after sensor init before trusting any reading.
// The MAX30100 needs time to lock onto a waveform.
#define STABILIZE_MS      8000

// ── MAX30100 ──────────────────────────────────────────
PulseOximeter pox;
uint32_t lastReport    = 0;
uint8_t  noReadingCount = 0;

// Rolling average buffer for BPM
float    bpmSamples[BPM_SAMPLE_COUNT] = {0};
uint8_t  bpmSampleIndex = 0;
uint8_t  bpmSamplesFilled = 0;   // How many slots have real data
uint32_t sensorInitTime = 0;     // Timestamp of last sensor init, for stabilization

// ── GPS ───────────────────────────────────────────────
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);

volatile bool          ppsTriggered = false;
volatile unsigned long ppsMicros    = 0;

// ── SHARED DATA ───────────────────────────────────────
// Protected by a mutex — written by Core 1 (sensor loop),
// read by Core 0 (network task). Never access without taking the mutex.
SemaphoreHandle_t dataMutex;

float shared_bpm = 0.0;
float shared_lat = 0.0;
float shared_lng = 0.0;

// FreeRTOS Task Handle
TaskHandle_t NetworkTask;

// ── ISR ───────────────────────────────────────────────
void IRAM_ATTR onPPS() {
  ppsMicros    = micros();
  ppsTriggered = true;
}

// ── Beat callback ─────────────────────────────────────
void onBeatDetected() {
  // Intentionally empty — heartbeat is polled via getHeartRate()
}

// ── Add a BPM sample and return the rolling average ───
// Returns 0.0 if the buffer isn't filled yet.
float addBpmSample(float newBpm) {
  bpmSamples[bpmSampleIndex] = newBpm;
  bpmSampleIndex = (bpmSampleIndex + 1) % BPM_SAMPLE_COUNT;
  if (bpmSamplesFilled < BPM_SAMPLE_COUNT) bpmSamplesFilled++;

  if (bpmSamplesFilled < BPM_SAMPLE_COUNT) return 0.0; // Not enough data yet

  float sum = 0.0;
  for (uint8_t i = 0; i < BPM_SAMPLE_COUNT; i++) sum += bpmSamples[i];
  return sum / BPM_SAMPLE_COUNT;
}

// ── Reset the BPM rolling buffer ──────────────────────
void resetBpmBuffer() {
  bpmSampleIndex  = 0;
  bpmSamplesFilled = 0;
  memset(bpmSamples, 0, sizeof(bpmSamples));
}

// ── MAX30100 init ─────────────────────────────────────
void initSensor() {
  Serial.println("[OXY] Initialising MAX30100...");
  if (!pox.begin()) {
    Serial.println("[OXY] MAX30100 FAILED. Check wiring!");
    while (1);
  }

  // FIX 1: Increase LED current from 11 mA to 27.1 mA for a stronger,
  // more reliable signal — especially important for animals with fur/thick skin.
  pox.setIRLedCurrent(MAX30100_LED_CURR_27_1MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);

  // Record the time so we can ignore readings during the warm-up window
  sensorInitTime = millis();

  // Clear stale rolling average data after a reinit
  resetBpmBuffer();

  Serial.println("[OXY] MAX30100 ready. Stabilising...");
}

// ── NETWORK TASK (Core 0) ─────────────────────────────
void networkTaskCode(void* pvParameters) {
  Serial.print("[NET] Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    vTaskDelay(500 / portTICK_PERIOD_MS);
    Serial.print(".");
  }
  Serial.println("\n[NET] Wi-Fi Connected!");

  WiFiClientSecure client;
  client.setInsecure(); // Skips SSL cert validation (required for DevTunnels proxy)

  for (;;) {
    vTaskDelay(10000 / portTICK_PERIOD_MS);

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[NET] Wi-Fi disconnected. Reconnecting...");
      WiFi.reconnect();
      continue;
    }

    // FIX 3: Take the mutex before reading shared sensor data.
    // This prevents reading a half-written float from Core 1.
    float postBpm, postLat, postLng;
    if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(200)) == pdTRUE) {
      postBpm = shared_bpm;
      postLat = shared_lat;
      postLng = shared_lng;
      xSemaphoreGive(dataMutex);
    } else {
      Serial.println("[NET] Could not acquire mutex. Skipping cycle.");
      continue;
    }

    if (postBpm <= 0.0) {
      Serial.println("[NET] Skipped POST: No valid heart rate reading.");
      continue;
    }

    HTTPClient http;
    http.begin(client, API_URL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<512> doc;
    doc["collarModelNo"] = "K9-COL-2024-001";
    doc["petId"]         = "6a2b9a3bc4130973233b5cb0";

    JsonObject attributes  = doc.createNestedObject("attributes");
    JsonObject coordinates = attributes.createNestedObject("coordinates");
    coordinates["latitude"]     = postLat;
    coordinates["longitude"]    = postLng;
    attributes["heartRate"]     = (int)postBpm;
    attributes["temperature"]   = 38.5; // Static placeholder
    attributes["batteryLevel"]  = 100;  // Static placeholder
    attributes["status"]        = "active";

    String payload;
    serializeJson(doc, payload);

    int httpResponseCode = http.POST(payload);
    Serial.printf("[NET] POST sent (BPM: %.1f). Response: %d\n", postBpm, httpResponseCode);

    if (httpResponseCode <= 0) {
      Serial.printf("[NET] POST failed: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  }
}

// ── SETUP (Core 1) ────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(3000);
  Serial.println("=== XIAO ESP32-S3 | GPS + MAX30100 + Wi-Fi ===");

  // FIX 3: Create the mutex before starting the network task
  dataMutex = xSemaphoreCreateMutex();
  if (dataMutex == NULL) {
    Serial.println("FATAL: Could not create mutex!");
    while (1);
  }

  // Initialise MAX30100
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(100000);
  initSensor();

  // Initialise GPS
  gpsSerial.begin(GPS_BAUDRATE, SERIAL_8N1, RXD1, TXD1);
  pinMode(PPS_PIN, INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(PPS_PIN), onPPS, RISING);
  Serial.println("[GPS] Started. Waiting for fix...");

  // Start the network task pinned to Core 0
  xTaskCreatePinnedToCore(
    networkTaskCode,
    "NetworkTask",
    10000,
    NULL,
    1,
    &NetworkTask,
    0
  );
}

// ── LOOP (Core 1) ─────────────────────────────────────
void loop() {
  // Must be called frequently — cannot be blocked by HTTP
  pox.update();

  // ── MAX30100 reporting ────────────────────────────
  if (millis() - lastReport > REPORTING_MS) {
    lastReport = millis();

    float bpm  = pox.getHeartRate();
    int   spo2 = pox.getSpO2();

    // FIX 2 + FIX 4: Validate reading properly before accepting it.
    // spo2 == 0 means no signal; spo2 > 100 means sensor noise / bad contact.
    // Both cases are invalid and should reset the counter.
    bool validReading = (bpm > 0) && (spo2 > 0) && (spo2 <= 100);

    // FIX 4: Ignore all readings during the stabilisation window after init.
    bool stabilised = (millis() - sensorInitTime) >= STABILIZE_MS;

    if (!validReading || !stabilised) {
      // Accumulate invalid ticks; reinit if sensor seems stuck
      if (!stabilised) {
        // Still warming up — don't count this against the sensor
        Serial.println("[OXY] Stabilising...");
      } else {
        // Genuinely bad reading
        noReadingCount++;
        Serial.printf("[OXY] No valid reading (%d/60). BPM:%.1f SpO2:%d\n",
                      noReadingCount, bpm, spo2);

        if (noReadingCount >= 60) {
          noReadingCount = 0;
          Serial.println("[OXY] Restarting sensor...");
          // Clear the shared BPM so the network task won't post stale data
          if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(200)) == pdTRUE) {
            shared_bpm = 0.0;
            xSemaphoreGive(dataMutex);
          }
          initSensor();
        }
      }
    } else {
      // FIX 5: Feed the valid sample into the rolling average.
      // addBpmSample() returns 0 until BPM_SAMPLE_COUNT samples are collected,
      // preventing a single noisy spike from being posted.
      float smoothedBpm = addBpmSample(bpm);
      noReadingCount = 0;

      Serial.printf("[OXY] Raw BPM: %.2f | SpO2: %d%% | Smoothed BPM: %.2f\n",
                    bpm, spo2, smoothedBpm);

      // FIX 3: Take the mutex before writing to shared variables
      if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(200)) == pdTRUE) {
        shared_bpm = smoothedBpm; // Will be 0 until buffer is full
        xSemaphoreGive(dataMutex);
      }
    }
  }

  // ── GPS feed ─────────────────────────────────────
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isValid()) {
    // FIX 3: Mutex-protected write for GPS coordinates too
    if (xSemaphoreTake(dataMutex, pdMS_TO_TICKS(50)) == pdTRUE) {
      shared_lat = gps.location.lat();
      shared_lng = gps.location.lng();
      xSemaphoreGive(dataMutex);
    }
  }

  // ── PPS pulse ────────────────────────────────────
  noInterrupts();
  bool          pps           = ppsTriggered;
  unsigned long ppsMicrosLocal = ppsMicros;
  if (pps) ppsTriggered = false;
  interrupts();

  if (pps) {
    Serial.printf("[PPS] Pulse at micros: %lu\n", ppsMicrosLocal);

    if (gps.time.isValid()) {
      Serial.printf("[GPS] UTC: %02d:%02d:%02d\n",
        gps.time.hour(), gps.time.minute(), gps.time.second());
    }

    if (gps.location.isValid()) {
      Serial.printf("[GPS] Lat: %.6f | Lng: %.6f | Sats: %d\n",
        gps.location.lat(), gps.location.lng(), gps.satellites.value());
    } else {
      Serial.println("[GPS] Pulse received, no fix yet.");
    }
    Serial.println("----------------------------");
  }
}