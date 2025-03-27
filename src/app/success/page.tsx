'use client'

import { motion } from "framer-motion"
import { FaCheckCircle, FaSignOutAlt } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SuccessPage() {
    const router = useRouter()
    const [cardId, setCardId] = useState("")

    useEffect(() => {
        // Check if user is authenticated
        const isAuth = sessionStorage.getItem("isAuthenticated")
        const storedCardId = sessionStorage.getItem("lastCardId")
        if (!isAuth) {
            router.push("/")
        } else if (storedCardId) {
            setCardId(storedCardId)
        }
    }, [router])

    const handleLogout = async () => {
        try {
            // Reset the card reader
            await fetch("http://localhost:3001/api/reset", {
                method: "POST"
            });
            
            // Clear session storage
            sessionStorage.removeItem("isAuthenticated")
            sessionStorage.removeItem("lastCardId")
            
            // Navigate back to login
            router.push("/")
        } catch (err) {
            console.error("Error during logout:", err)
            // Still navigate to login even if reset fails
            router.push("/")
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
                        <FaCheckCircle className="text-6xl text-success" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-center gradient-text">Authentication Successful!</h1>
                    {cardId && (
                        <p className="text-lg text-card-foreground/90 text-center">
                            Card ID: {cardId}
                        </p>
                    )}
                    <p className="text-card-foreground/80 text-center">
                        You have been successfully authenticated using your RFID card.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="auth-button w-full px-6 py-3 rounded-xl
                             flex items-center justify-center gap-2"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt />
                    Logout
                </motion.button>
            </motion.div>
        </main>
    )
}
