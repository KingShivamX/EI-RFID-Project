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
        <main className="min-h-screen flex flex-col items-center justify-start pt-16 p-4 bg-gradient-to-br from-background to-background-light">
            <div className="text-center mb-8 space-y-2">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold gradient-text tracking-tight"
                >
                    Secure Access: RFID-Based
                    <br />
                    Authentication with Arduino
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-foreground/80 text-[1.8rem] font-bold"
                >
                    EI IOT Project
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 space-y-8 max-w-md w-full"
            >
                <div className="flex flex-col items-center gap-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="bg-success/20 p-4 rounded-full"
                    >
                        <FaCheckCircle className="text-6xl text-success" />
                    </motion.div>
                    <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-bold gradient-text">
                            Authentication Successful!
                        </h2>
                        {cardId && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-background/50 rounded-lg p-3 mt-4"
                            >
                                <p className="text-lg text-foreground/90">
                                    Card ID: <span className="font-medium text-primary">{cardId}</span>
                                </p>
                            </motion.div>
                        )}
                        <p className="text-foreground/80 text-lg mt-2">
                            You have been successfully authenticated using your RFID card.
                        </p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="auth-button w-full px-6 py-4 rounded-xl
                             flex items-center justify-center gap-3 text-lg"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt className="text-xl" />
                    Logout
                </motion.button>
            </motion.div>
        </main>
    )
}
