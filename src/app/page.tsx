'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaKey, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa"
import { useRouter } from "next/navigation"

export default function Home() {
    const router = useRouter()

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [connectionStatus, setConnectionStatus] = useState("checking")
    const [lastCardId, setLastCardId] = useState("")

    // Reset card state when component mounts
    useEffect(() => {
        const resetCardReader = async () => {
            try {
                await fetch("http://localhost:3001/api/reset", {
                    method: "POST"
                });
                setLastCardId("")
            } catch (err) {
                console.error("Error resetting card reader:", err)
            }
        }
        resetCardReader()
    }, [])

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

    // Poll for card data
    useEffect(() => {
        const pollCardData = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/card")
                const data = await response.json()
                if (data.cardId && data.cardId !== lastCardId) {
                    console.log("New card detected:", data.cardId)
                    setLastCardId(data.cardId)
                }
            } catch (err) {
                console.error("Error polling card data:", err)
            }
        }

        const interval = setInterval(pollCardData, 1000)
        return () => clearInterval(interval)
    }, [lastCardId])

    const handleRFIDAuth = async (cardId: string) => {
        setIsLoading(true)
        setError("")
        try {
            console.log("Sending auth request with card:", cardId)
            const response = await fetch("http://localhost:3001/api/auth/rfid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cardId: cardId.replace(/\s+/g, "") }),
            })
            console.log("Auth response:", response.status)
            const data = await response.json()
            if (response.ok) {
                setIsAuthenticated(true)
                setError("")
                // Store authentication state
                sessionStorage.setItem("isAuthenticated", "true")
                sessionStorage.setItem("lastCardId", cardId)
                // Navigate to success page
                router.push("/success")
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

    const handleManualAuth = () => {
        if (lastCardId) {
            handleRFIDAuth(lastCardId)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 space-y-6 max-w-md w-full"
            >
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                        <FaKey className="text-6xl text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-center gradient-text">
                        RFID Authentication
                    </h1>
                    <div className="flex items-center gap-2">
                        {connectionStatus === "connected" ? (
                            <>
                                <FaCheckCircle className="text-success" />
                                <span className="text-success">Connection Established</span>
                            </>
                        ) : connectionStatus === "error" ? (
                            <>
                                <FaTimesCircle className="text-error" />
                                <span className="text-error">Connection Error</span>
                            </>
                        ) : (
                            <>
                                <FaSpinner className="animate-spin text-warning" />
                                <span className="text-warning">Checking Connection...</span>
                            </>
                        )}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={error ? "error" : "success"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="w-full flex justify-center"
                    >
                        {error && (
                            <p className="text-error text-center">{error}</p>
                        )}
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLoading ? "loading" : "button"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full flex justify-center pt-6"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="auth-button px-8 py-4 rounded-xl
                                     flex items-center justify-center gap-3 min-w-[300px]
                                     transition-all duration-200"
                            onClick={handleManualAuth}
                            disabled={!lastCardId || connectionStatus !== "connected"}
                        >
                            <FaKey className="text-xl" />
                            {lastCardId ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-lg tracking-wide">Authenticate Card</span>
                                    <span className="text-sm opacity-90 font-medium">{lastCardId}</span>
                                </div>
                            ) : (
                                <span className="text-lg tracking-wide">Tap RFID Card to Authenticate</span>
                            )}
                        </motion.button>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </main>
    )
}
