# Arduino RFID Authentication Project

This project implements an IoT-based authentication system using an Arduino with an RFID reader and a Next.js web application.

## Hardware Requirements

-   Arduino (Uno or similar)
-   MFRC522 RFID Reader Module
-   RFID Cards/Tags
-   Jumper Wires

## Software Requirements

-   Node.js (v14 or higher)
-   MongoDB (local installation)
-   Arduino IDE
-   Next.js

## Setup Instructions

### 1. Arduino Setup

1. Connect the MFRC522 RFID reader to Arduino:

    - RST -> Pin 9
    - SDA(SS) -> Pin 10
    - MOSI -> Pin 11
    - MISO -> Pin 12
    - SCK -> Pin 13
    - VCC -> 3.3V
    - GND -> GND

2. Install required libraries in Arduino IDE:

    - MFRC522
    - SPI

3. Upload the `arduino/rfid_auth.ino` sketch to your Arduino

### 2. Next.js Application Setup

1. Install dependencies:

    ```bash
    cd ei-project
    npm install
    ```

2. Start the development server:
    ```bash
    npm run dev
    ```

### 3. Arduino Bridge Setup

1. Install dependencies:

    ```bash
    cd arduino-bridge
    npm install
    ```

2. Update the COM port in `index.js` to match your Arduino's port

3. Start the bridge:
    ```bash
    npm start
    ```

### 4. MongoDB Setup

1. Ensure MongoDB is running locally
2. The application will automatically connect to `mongodb://localhost:27017/rfid-auth`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Tap an RFID card on the reader
3. The web interface will show the authentication status
4. Successful authentication will show a welcome message

## Project Structure

-   `/src` - Next.js application source code
-   `/arduino` - Arduino sketch for RFID reader
-   `/arduino-bridge` - Node.js bridge between Arduino and Next.js
-   `/src/models` - MongoDB models
-   `/src/app/api` - API routes

## Security Notes

-   This is a basic implementation for demonstration purposes
-   In a production environment, implement proper security measures
-   Store RFID card IDs securely
-   Use HTTPS for all communications
-   Implement proper session management
