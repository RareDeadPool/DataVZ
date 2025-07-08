"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, FileSpreadsheet, BarChart3, Users } from "lucide-react"

const searchResults = [
  {
    id: 1,
    title: "Q4 Sales Analysis Dashboard",
    type: "Dashboard",
    description: "Comprehensive Q4 sales performance analysis with regional breakdowns and trend analysis",
    lastModified: "2 hours ago",
    owner: "Aditya Sawant",
    tags: ["sales", "q4", "dashboard", "analytics"],
  },
  {
    id: 2,
    title: "Customer Segmentation Report",
    type: "Report",
    description: "Detailed customer segmentation analysis based on purchasing behavior and demographics",
    lastModified: "1 day ago",
    owner: "Sarah Johnson",
    tags: ["customers", "segmentation", "behavior", "demographics"],
  },
  {
    id: 3,
    title: "Marketing ROI Chart",
    type: "Chart",
    description: "Return on investment analysis for marketing campaigns across different channels",
    lastModified: "3 days ago",
    owner: "Mike Chen",
    tags: ["marketing", "roi", "campaigns", "channels"],
  },
  {
    id: 4,
    title: "Product Performance Analysis",
    type: "Analysis",
    description: "Monthly product performance metrics including sales, returns, and customer satisfaction",
    lastModified: "1 week ago",
    owner: "Emily Davis",
    tags: ["products", "performance", "metrics", "satisfaction"],
  },
]

const recentSearches = [
  "sales dashboard",
  "customer analytics",
  "marketing roi",
  "product performance",
  "financial reports",
]

const popularTags = [
  "dashboard",
  "analytics",
  "sales",
  "marketing",
  "customers",
  "reports",
  "charts",
  "performance",
  "roi",
  "trends",
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("all")
  const [sortBy, setSortBy] = useState("relevance")
  const [filteredResults, setFilteredResults] = useState(searchResults)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredResults(searchResults)
      return
    }

    const filtered = searchResults.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = searchType === "all" || item.type.toLowerCase() === searchType.toLowerCase()

      return matchesQuery && matchesType
    })

    setFilteredResults(filtered)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "dashboard":
        return <BarChart3 className="h-4 w-4" />
      case "report":
        return <FileSpreadsheet className="h-4 w-4" />
      case "chart":
        return <BarChart3 className="h-4 w-4" />
      case "analysis":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <FileSpreadsheet className="h-4 w-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "dashboard":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "report":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "chart":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "analysis":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          <p className="text-muted-foreground">Find your projects, dashboards, and analytics</p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, dashboards, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="dashboard">Dashboards</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
              <SelectItem value="chart">Charts</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="recent">Recent Searches</TabsTrigger>
          <TabsTrigger value="popular">Popular Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date Modified</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredResults.map((result) => (
              <Card key={result.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(result.type)}
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                    </div>
                    <Badge className={getTypeColor(result.type)}>{result.type}</Badge>
                  </div>
                  <CardDescription className="text-sm">{result.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{result.owner}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{result.lastModified}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResults.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No results found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search terms or filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>Your recent search queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 bg-transparent"
                    onClick={() => {
                      setSearchQuery(search)
                      handleSearch()
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
              <CardDescription>Commonly used tags in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(tag)
                      handleSearch()
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
