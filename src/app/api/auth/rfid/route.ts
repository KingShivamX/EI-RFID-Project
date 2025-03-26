import { NextResponse } from "next/server"
import mongoose from "mongoose"

// MongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017/rfid-auth"

// Connect to MongoDB
async function connectDB() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI)
            console.log("Connected to MongoDB")
        }
    } catch (error) {
        console.error("MongoDB connection error:", error)
    }
}

// Define RFID card schema
const RFIDCardSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true,
        unique: true,
    },
    isAuthorized: {
        type: Boolean,
        default: true, // For testing purposes, we'll set this to true
    },
    lastUsed: {
        type: Date,
        default: Date.now,
    },
})

// Get or create the model
const RFIDCard =
    mongoose.models.RFIDCard || mongoose.model("RFIDCard", RFIDCardSchema)

export async function POST(req: Request) {
    try {
        await connectDB()
        const { cardId } = await req.json()

        if (!cardId) {
            return NextResponse.json(
                { error: "Card ID is required" },
                { status: 400 }
            )
        }

        // For testing purposes, we'll create the card if it doesn't exist
        let card = await RFIDCard.findOne({ cardId })
        if (!card) {
            card = await RFIDCard.create({
                cardId,
                isAuthorized: true, // For testing purposes
            })
        }

        if (!card.isAuthorized) {
            return NextResponse.json(
                { error: "Card not authorized" },
                { status: 403 }
            )
        }

        // Update last used timestamp
        card.lastUsed = new Date()
        await card.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("RFID Authentication Error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
