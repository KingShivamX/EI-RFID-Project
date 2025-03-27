"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaKey, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa"

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [connectionStatus, setConnectionStatus] = useState("checking")
    const [lastCardId, setLastCardId] = useState("")

    // Check connection status
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/status")
                const data = await response.json()
                setConnectionStatus(data.status)
            } catch (err) {
                setConnectionStatus("error")
            }
        }

        checkConnection()
        const interval = setInterval(checkConnection, 5000)
        return () => clearInterval(interval)
    }, [])

    // Check for new card readings
    useEffect(() => {
        const checkCard = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/card")
                const data = await response.json()
                console.log("Card data received:", data) // Debug log
                if (data.cardId && data.cardId !== lastCardId) {
                    console.log("New card detected:", data.cardId) // Debug log
                    setLastCardId(data.cardId)
                }
            } catch (err) {
                console.error("Error checking card:", err)
            }
        }

        const interval = setInterval(checkCard, 1000)
        return () => clearInterval(interval)
    }, [lastCardId])

    const handleRFIDAuth = async (cardId: string) => {
        setIsLoading(true)
        setError("")
        try {
            console.log("Sending auth request with card:", cardId) // Debug log
            const response = await fetch("http://localhost:3001/api/auth/rfid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cardId: cardId.replace(/\s+/g, "") }), // Remove spaces from card ID
            })
            console.log("Auth response:", response.status) // Debug log
            const data = await response.json()
            if (response.ok) {
                setIsAuthenticated(true)
                setError("")
            } else {
                setError(data.error || "Authentication failed")
                setIsAuthenticated(false)
            }
        } catch (err) {
            console.error("Auth request failed:", err)
            setError("Failed to connect to RFID reader")
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    const handleManualAuth = async () => {
        if (!lastCardId) {
            setError("No card detected")
            return
        }
        if (connectionStatus !== "connected") {
            setError("Arduino not connected")
            return
        }
        try {
            console.log("Attempting authentication with card:", lastCardId) // Debug log
            await handleRFIDAuth(lastCardId)
        } catch (err) {
            console.error("Authentication failed:", err)
            setError("Authentication failed")
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 p-4">
            <div className="w-full max-w-4xl text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold gradient-text mb-4"
                >
                    Secure Access
                </motion.h1>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl text-foreground/80"
                >
                    RFID Based Authentication Using Arduino
                </motion.h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md"
            >
                <div className="card p-8 space-y-6 text-card-foreground">
                    {/* Status Card */}
                    <motion.div 
                        className="status-indicator p-4 rounded-xl text-center glass-effect"
                        animate={{
                            backgroundColor: connectionStatus === "connected" 
                                ? "rgba(34, 197, 94, 0.2)" 
                                : connectionStatus === "error" 
                                ? "rgba(239, 68, 68, 0.2)"
                                : "rgba(245, 158, 11, 0.2)",
                            color: connectionStatus === "connected"
                                ? "var(--color-success)"
                                : connectionStatus === "error"
                                ? "var(--color-error)"
                                : "var(--color-warning)"
                        }}
                    >
                        <div className="flex items-center justify-center gap-3">
                            {connectionStatus === "connected" ? (
                                <FaCheckCircle className="text-2xl" />
                            ) : connectionStatus === "error" ? (
                                <FaTimesCircle className="text-2xl" />
                            ) : (
                                <FaSpinner className="text-2xl animate-spin" />
                            )}
                            <span className="font-medium text-lg text-card-foreground">
                                {connectionStatus === "connected"
                                    ? "RFID Reader Connected"
                                    : connectionStatus === "error"
                                    ? "Connection Error"
                                    : "Checking Connection..."}
                            </span>
                        </div>
                    </motion.div>

                    <p className="text-lg text-center text-card-foreground/90">
                        Please scan your RFID card to authenticate
                    </p>

                    {/* Authentication Status */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-center gap-3 p-4"
                            >
                                <FaSpinner className="text-2xl animate-spin text-color-primary" />
                                <span className="text-lg">Authenticating...</span>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-xl glass-effect text-center"
                                style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "var(--color-error)" }}
                            >
                                <p className="text-lg">{error}</p>
                            </motion.div>
                        )}

                        {isAuthenticated && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-xl glass-effect text-center"
                                style={{ backgroundColor: "rgba(34, 197, 94, 0.2)", color: "var(--color-success)" }}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <FaCheckCircle className="text-2xl" />
                                    <span className="text-lg">Authentication Successful!</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Authentication Button */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex justify-center pt-6"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary/90 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary transition-colors disabled:opacity-50"
                            onClick={handleManualAuth}
                            disabled={!lastCardId || connectionStatus !== "connected"}
                        >
                            {lastCardId ? `Authenticate Card ${lastCardId.slice(-4)}` : "Tap RFID Card to Authenticate"}
                        </motion.button>
                    </motion.div>

                    {/* Key Icon */}
                    <div className="flex justify-center pt-4">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition = {{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        >
                            <FaKey className="text-7xl text-color-primary opacity-80" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </main>
    )
}
