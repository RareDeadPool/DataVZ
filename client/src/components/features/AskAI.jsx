"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Send, BarChart3, TrendingUp, Search, FileSpreadsheet, Clock } from "lucide-react"

const quickActions = [
  {
    title: "Create Visualization",
    description: "Generate charts from your data",
    icon: BarChart3,
  },
  {
    title: "Analyze Trends",
    description: "Identify patterns and insights",
    icon: TrendingUp,
  },
  {
    title: "Data Insights",
    description: "Extract meaningful information",
    icon: Search,
  },
  {
    title: "Generate Dashboard",
    description: "Create comprehensive reports",
    icon: FileSpreadsheet,
  },
]

const recentConversations = [
  {
    title: "Sales Dashboard Creation",
    time: "2 hours ago",
  },
  {
    title: "Customer Analytics Review",
    time: "1 day ago",
  },
  {
    title: "Inventory Trend Analysis",
    time: "3 days ago",
  },
]

export default function AIVizard() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content:
        "Hello! I'm Vizard, your Excel Analytics AI assistant. I can help you analyze spreadsheets, create charts, generate insights, and answer data-related questions. How can I assist you today?",
      time: "04:26 PM",
    },
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "assistant",
        content:
          "I understand you'd like help with that. Let me analyze your request and provide you with the best solution.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6 bg-background">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-foreground text-background rounded-full">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vizard AI</h1>
            <p className="text-muted-foreground">Your intelligent data visualization assistant</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Real-time Chat
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Search className="h-3 w-3" />
            Smart Insights
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <CardTitle>Vizard Assistant Chat</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-4 bg-muted/20 rounded-lg">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "justify-end" : ""}`}>
                    {msg.type === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-foreground text-background">
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[80%] ${msg.type === "user" ? "order-first" : ""}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-background border shadow-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask Vizard about your data visualization needs..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Press Enter to send • Shift+Enter for new line</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button key={index} variant="outline" className="w-full justify-start h-auto p-3 bg-transparent">
                  <div className="flex items-start gap-3">
                    <action.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentConversations.map((conversation, index) => (
                <div key={index} className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <p className="text-sm font-medium">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">{conversation.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
