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

async function setupSerialPort() {
    try {
        const ports = await listPorts()
        if (ports.length === 0) {
            console.log("No serial ports found. Is your Arduino connected?")
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
        })

        serialPort.on("error", (err) => {
            console.error("Serial port error:", err)
        })

        parser.on("data", (data) => {
            const cardId = data.toString().trim()
            if (cardId && cardId !== lastCardId) {
                lastCardId = cardId
                console.log("Card detected:", cardId)
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

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Arduino bridge running on port ${PORT}`)
    setupSerialPort()
})
