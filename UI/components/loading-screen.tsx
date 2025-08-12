import { Shield } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 bg-cyan-600 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Verifying your session...</p>
        </div>
      </div>
    </div>
  )
}
