#include <TinyGPS++.h>
#include <HardwareSerial.h>

#define RXD1 44   // D7 ->  TX
#define TXD1 43   // D6 ->  RX
#define PPS_PIN 1 // D0 ->  PPS

#define GPS_BAUDRATE 9600

TinyGPSPlus gps;
HardwareSerial gpsSerial(1);

volatile bool ppsTriggered = false;
volatile unsigned long ppsMicros = 0;

void IRAM_ATTR onPPS() {
  ppsMicros = micros();
  ppsTriggered = true;
}



void setup() {
  delay(3000);
  Serial.begin(115200);
  while (!Serial);

  Serial.println("=== ESP32-S3 + ATGM336H GPS Initialized ===");

  gpsSerial.begin(GPS_BAUDRATE, SERIAL_8N1, RXD1, TXD1);
  pinMode(PPS_PIN, INPUT_PULLDOWN);
  attachInterrupt(digitalPinToInterrupt(PPS_PIN), onPPS, RISING);

  Serial.println("GPS Serial started. Waiting for fix...");
}



void loop() {
  // Feed GPS data to TinyGPS++
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }


  // Print raw NMEA debug (first 60 seconds only)
  if (millis() < 60000) {
    static unsigned long lastDebug = 0;
    if (millis() - lastDebug > 2000) {
      lastDebug = millis();
      Serial.printf("[DEBUG] Chars: %lu | Parsed: %lu | WithFix: %lu | BadChecksum: %lu\n",
        gps.charsProcessed(),
        gps.passedChecksum() + gps.failedChecksum(),
        gps.sentencesWithFix(),
        gps.failedChecksum());
    }
  }

  // Safely read ISR variables
  noInterrupts();
  bool pps = ppsTriggered;
  unsigned long ppsMicrosLocal = ppsMicros;
  if (pps) ppsTriggered = false;
  interrupts();

  

  // PPS triggered - print time + location
  if (pps) {
    Serial.print("[PPS] micros: ");
    Serial.println(ppsMicrosLocal);

    if (gps.time.isValid()) {
      Serial.printf("UTC Time : %02d:%02d:%02d\n",
        gps.time.hour(), gps.time.minute(), gps.time.second());
    }

    if (gps.location.isValid()) {
      Serial.printf("Latitude  : %.6f\n", gps.location.lat());
      Serial.printf("Longitude : %.6f\n", gps.location.lng());
      Serial.printf("Altitude  : %.2f m\n", gps.altitude.meters());
      Serial.printf("Satellites: %d | HDOP: %.2f\n",
        gps.satellites.value(), gps.hdop.hdop());
    } else {
      Serial.println("Location  : No fix yet...");
    }

    Serial.println("----------------------------");
  }
}