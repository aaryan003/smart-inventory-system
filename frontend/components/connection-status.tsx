"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { healthCheck } from "@/lib/api"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await healthCheck()
        setIsConnected(response.success)
        setLastChecked(new Date())
      } catch (error) {
        setIsConnected(false)
        setLastChecked(new Date())
      }
    }

    // Initial check
    checkConnection()

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isConnected === null) {
    return null // Don't show anything while checking
  }

  if (isConnected) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>Connected to backend server</span>
            <div className="flex items-center gap-1 text-xs">
              <Wifi className="h-3 w-3" />
              {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString()}`}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-red-200 bg-red-50 mb-4">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="flex items-center justify-between">
          <span>Cannot connect to backend server (localhost:8080)</span>
          <div className="flex items-center gap-1 text-xs">
            <WifiOff className="h-3 w-3" />
            {lastChecked && `Last checked: ${lastChecked.toLocaleTimeString()}`}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
