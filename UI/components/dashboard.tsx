"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, LogOut, ExternalLink } from "lucide-react"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const tools = [
    {
      title: "Daily Ending Balances",
      description: "View and analyze your daily account balances",
      icon: BarChart3,
      url: "https://openmca.com/ending-balances",
      color: "bg-blue-500",
    },
    {
      title: "Statement Analysis",
      description: "Highlights areas of interest and performs keyword search",
      icon: FileText,
      url: "https://openmca.com",
      color: "bg-green-500",
    },
  ]

  const handleToolClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await onLogout()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Tools</h1>
            <p className="text-gray-600">Choose your analysis tool</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <Card
                key={index}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-0 shadow-md"
                onClick={() => handleToolClick(tool.url)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${tool.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                        <span>{tool.title}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">{tool.description}</CardDescription>
                  <div className="mt-4">
                    <Button
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToolClick(tool.url)
                      }}
                    >
                      Open Tool
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
