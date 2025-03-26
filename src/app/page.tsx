"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaKey } from "react-icons/fa"

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
                if (data.cardId && data.cardId !== lastCardId) {
                    setLastCardId(data.cardId)
                    handleRFIDAuth(data.cardId)
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
            const response = await fetch("/api/auth/rfid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cardId }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsAuthenticated(true)
            } else {
                setError(data.error || "Authentication failed")
            }
        } catch (err) {
            setError("Failed to connect to RFID reader")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-4xl font-bold mb-8">
                    Arduino RFID Project, EI subject
                </h1>

                {/* Connection Status */}
                <div className="mb-6">
                    <div
                        className={`inline-block px-4 py-2 rounded-lg ${
                            connectionStatus === "connected"
                                ? "bg-green-500"
                                : connectionStatus === "error"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                        }`}
                    >
                        {connectionStatus === "connected"
                            ? "RFID Reader Connected"
                            : connectionStatus === "error"
                            ? "RFID Reader Error"
                            : "Checking RFID Reader..."}
                    </div>
                </div>

                {!isAuthenticated ? (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-gray-800 p-8 rounded-lg shadow-xl"
                    >
                        <FaKey className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                        <h2 className="text-2xl mb-4">RFID Authentication</h2>
                        <p className="mb-6 text-gray-300">
                            Please tap your RFID card to authenticate
                        </p>

                        {lastCardId && (
                            <p className="text-sm text-gray-400 mb-4">
                                Last card detected: {lastCardId}
                            </p>
                        )}

                        <button
                            onClick={() => handleRFIDAuth(lastCardId)}
                            disabled={isLoading || !lastCardId}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading
                                ? "Authenticating..."
                                : "Authenticate Card"}
                        </button>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 mt-4"
                            >
                                {error}
                            </motion.p>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-green-800 p-8 rounded-lg shadow-xl"
                    >
                        <h2 className="text-2xl mb-4">
                            Authentication Successful!
                        </h2>
                        <p className="mb-6">Welcome to the system</p>
                        <p className="text-sm text-gray-300 mb-4">
                            Authenticated Card: {lastCardId}
                        </p>
                        <button
                            onClick={() => setIsAuthenticated(false)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </main>
    )
}
