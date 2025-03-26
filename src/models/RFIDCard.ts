import mongoose from "mongoose"

const RFIDCardSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true,
        unique: true,
    },
    isAuthorized: {
        type: Boolean,
        default: false,
    },
    lastUsed: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.models.RFIDCard ||
    mongoose.model("RFIDCard", RFIDCardSchema)
