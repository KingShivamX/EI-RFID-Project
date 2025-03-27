const { SerialPort } = require("serialport")
const { ReadlineParser } = require("@serialport/parser-readline")
const express = require("express")
const cors = require("cors")
const app = express()

// List available ports
async function listPorts() {
    try {
        const ports = await SerialPort.list()
        console.log("Available ports:")
        ports.forEach((port) => {
            console.log(
                `${port.path} - ${port.manufacturer || "Unknown manufacturer"}`
            )
        })
        return ports
    } catch (err) {
        console.error("Error listing ports:", err)
        return []
    }
}

// Configure express
app.use(cors())
app.use(express.json())

let lastCardId = null
let serialPort = null
let isConnected = false

async function setupSerialPort() {
    try {
        const ports = await listPorts()
        if (ports.length === 0) {
            console.log("No serial ports found. Is your Arduino connected?")
            isConnected = false
            return
        }

        // Try to find Arduino port
        const arduinoPort = ports.find(
            (port) =>
                port.manufacturer?.toLowerCase().includes("arduino") ||
                port.manufacturer?.toLowerCase().includes("wch") || // Common for CH340 chips
                port.manufacturer?.toLowerCase().includes("silicon labs") // Common for CP2102 chips
        )

        const portPath = arduinoPort ? arduinoPort.path : ports[0].path
        console.log(`Attempting to connect to ${portPath}`)

        serialPort = new SerialPort({
            path: portPath,
            baudRate: 9600,
        })

        const parser = serialPort.pipe(
            new ReadlineParser({ delimiter: "\r\n" })
        )

        serialPort.on("open", () => {
            console.log("Serial port opened successfully")
            isConnected = true
        })

        serialPort.on("error", (err) => {
            console.error("Serial port error:", err)
            isConnected = false
        })

        serialPort.on("close", () => {
            console.log("Serial port closed")
            isConnected = false
        })

        parser.on("data", (data) => {
            console.log("Card detected:", data)
            // Extract the UID from the data
            const match = data.toString().match(/RFID Tag UID:\s+([0-9A-F\s]+)/i)
            if (match) {
                const cardId = match[1].trim()
                if (cardId !== lastCardId) {
                    lastCardId = cardId
                    console.log("New card ID set:", cardId)
                }
            }
        })
    } catch (err) {
        console.error("Error setting up serial port:", err)
    }
}

// API endpoint to get the last detected card
app.get("/api/card", (req, res) => {
    res.json({ cardId: lastCardId })
})

// Authentication endpoint
app.post("/api/auth/rfid", (req, res) => {
    const { cardId } = req.body
    console.log("Auth request received for card:", cardId)
    
    // Check if card ID matches the last detected card
    if (!cardId) {
        return res.status(400).json({ error: "No card ID provided" })
    }

    // Remove spaces for comparison
    const normalizedCardId = cardId.replace(/\s+/g, "")
    const normalizedLastCardId = lastCardId ? lastCardId.replace(/\s+/g, "") : null

    console.log("Comparing cards:", {
        received: normalizedCardId,
        lastDetected: normalizedLastCardId
    })

    if (normalizedCardId === normalizedLastCardId) {
        return res.status(200).json({ success: true })
    } else {
        return res.status(401).json({ error: "Invalid card" })
    }
})

// Reset last card ID
app.post("/api/reset", (req, res) => {
    lastCardId = null
    res.json({ success: true })
})

// Endpoint to list available ports
app.get("/api/ports", async (req, res) => {
    const ports = await listPorts()
    res.json(ports)
})

// Status endpoint
app.get("/api/status", (req, res) => {
    res.json({ status: isConnected ? "connected" : "error" })
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Arduino bridge running on port ${PORT}`)
    setupSerialPort()
})
