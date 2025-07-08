"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Search, Book, MessageCircle, Mail, ExternalLink, Video, FileText, Lightbulb } from "lucide-react"

const faqData = [
  {
    question: "How do I upload and analyze Excel files?",
    answer:
      "To upload Excel files, go to the Dashboard and use the drag-and-drop area or click 'Choose File'. Supported formats include .xlsx and .xls files up to 10MB. Once uploaded, our AI will automatically analyze your data and suggest visualizations.",
  },
  {
    question: "What types of charts can I create?",
    answer:
      "DataViz supports various chart types including bar charts, line charts, pie charts, scatter plots, area charts, and more. You can also create interactive dashboards combining multiple visualizations.",
  },
  {
    question: "How do I share my projects with team members?",
    answer:
      "You can share projects by clicking the 'Share' button in any project. You can invite team members by email and set their permissions (Viewer, Editor, or Admin). Shared projects appear in the 'Shared with Me' section.",
  },
  {
    question: "Can I export my visualizations?",
    answer:
      "Yes, you can export your charts and dashboards in various formats including PNG, PDF, and interactive HTML. Go to any visualization and click the export button to choose your preferred format.",
  },
  {
    question: "How does the AI Vizard work?",
    answer:
      "AI Vizard is our intelligent assistant that can analyze your data, suggest optimal visualizations, and answer questions about your datasets. Simply chat with Vizard using natural language to get insights and create charts automatically.",
  },
  {
    question: "What are the storage limits?",
    answer:
      "Storage limits depend on your plan: Starter (1GB), Professional (10GB), Enterprise (unlimited). You can check your current usage in Settings > Data Management.",
  },
]

const tutorials = [
  {
    title: "Getting Started with DataViz",
    description: "Learn the basics of uploading data and creating your first visualization",
    duration: "5 min",
    type: "Video",
  },
  {
    title: "Advanced Chart Customization",
    description: "Customize colors, fonts, and styling to match your brand",
    duration: "8 min",
    type: "Video",
  },
  {
    title: "Team Collaboration Features",
    description: "How to work with team members and manage permissions",
    duration: "6 min",
    type: "Article",
  },
  {
    title: "Using AI Vizard Effectively",
    description: "Tips and tricks for getting the most out of our AI assistant",
    duration: "10 min",
    type: "Video",
  },
]

const resources = [
  {
    title: "API Documentation",
    description: "Complete reference for DataViz API",
    icon: FileText,
    link: "#",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    icon: Video,
    link: "#",
  },
  {
    title: "Best Practices Guide",
    description: "Tips for effective data visualization",
    icon: Lightbulb,
    link: "#",
  },
  {
    title: "Community Forum",
    description: "Connect with other users",
    icon: MessageCircle,
    link: "#",
  },
]

export default function HelpPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Find answers, tutorials, and get help with DataViz</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search help articles, tutorials, and FAQs..." className="pl-10" />
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Tutorials & Guides
              </CardTitle>
              <CardDescription>Step-by-step guides to help you master DataViz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {tutorials.map((tutorial, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{tutorial.type}</Badge>
                        <span className="text-xs text-muted-foreground">{tutorial.duration}</span>
                      </div>
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        {tutorial.type === "Video" ? (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Watch Video
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Read Article
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>Explore more resources to enhance your DataViz experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {resources.map((resource, index) => {
                  const IconComponent = resource.icon
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-muted rounded">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{resource.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Check the current status of DataViz services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">API Services</span>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">File Processing</span>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">AI Vizard</span>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>Get help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="w-full min-h-[100px] px-3 py-2 text-sm border border-input bg-background rounded-md"
                    placeholder="Describe your issue in detail..."
                  />
                </div>
                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
                <CardDescription>Alternative contact methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email Support</p>
                      <p className="text-xs text-muted-foreground">support@dataviz.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Live Chat</p>
                      <p className="text-xs text-muted-foreground">Available 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Book className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Documentation</p>
                      <p className="text-xs text-muted-foreground">Comprehensive guides and API docs</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Response Times</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Critical issues: Within 2 hours</p>
                    <p>• General inquiries: Within 24 hours</p>
                    <p>• Feature requests: Within 3 business days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
