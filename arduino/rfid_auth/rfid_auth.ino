#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 7

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println(F("Initializing RFID..."));

  SPI.begin();
  rfid.PCD_Init();

  // Test if RFID reader is responding
  byte v = rfid.PCD_ReadRegister(rfid.VersionReg);
  if (v == 0x00 || v == 0xFF) {
    Serial.println("ERROR: RFID reader not responding. Check connections.");
  } else {
    Serial.println("SUCCESS: RFID reader connected and ready.");
    Serial.print("Firmware version: 0x");
    Serial.println(v, HEX);
  }
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent()) {
    delay(500);
    return;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    Serial.println(F("Failed to read card."));
    return;
  }

  // Format card ID as a single string without spaces
  String cardId = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      cardId += "0"; // Add leading zero for single digit hex numbers
    }
    cardId += String(rfid.uid.uidByte[i], HEX);
  }
  cardId.toUpperCase();
  
  // Send the card ID to the computer
  Serial.println(cardId);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  delay(1000); // Prevent too rapid readings
} 