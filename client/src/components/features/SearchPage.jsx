import React, { useState } from "react";
import { Search, Filter, FileText, BarChart3, Users, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockData = [
  { type: "Project", name: "Sales Dashboard" },
  { type: "Project", name: "Marketing Analytics" },
  { type: "Chart", name: "Revenue Growth Q1" },
  { type: "Chart", name: "User Acquisition Funnel" },
];

const getTypeIcon = (type) => {
  switch (type) {
    case "Project":
      return <FileText className="h-4 w-4" />;
    case "Chart":
      return <BarChart3 className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case "Project":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Chart":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? []
      : mockData.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-slate-100 dark:from-primary/10 dark:via-background dark:to-slate-900">
      <div className="max-w-4xl mx-auto py-8 px-2 sm:px-4">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Search className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-slate-600 dark:from-primary dark:to-slate-400 bg-clip-text text-transparent">
            Search Everything
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Find projects and charts in seconds
          </p>
        </div>

        {/* Search Input */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                className="pl-12 pr-4 py-4 sm:py-6 text-base sm:text-lg border-0 focus-visible:ring-2 focus-visible:ring-primary/20 bg-transparent"
                placeholder="Search projects, charts, teams..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search projects, charts, teams"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Filter className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {query && (
          <div className="space-y-6">
            {filtered.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or explore our available content
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-2xl font-semibold">
                    Search Results
                    <span className="ml-2 text-base sm:text-lg text-muted-foreground">
                      ({filtered.length} {filtered.length === 1 ? 'result' : 'results'})
                    </span>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {filtered.map((item, idx) => (
                    <Card 
                      key={idx} 
                      className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm hover:bg-primary/5 dark:hover:bg-primary/10"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4">
                          <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg group-hover:bg-primary/20 transition-colors">
                            {getTypeIcon(item.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Badge 
                                variant="secondary" 
                                className={`${getTypeColor(item.type)} font-medium`}
                              >
                                {item.type}
                              </Badge>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </div>
                          
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Search className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!query && (
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Search className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start searching</h3>
              <p className="text-muted-foreground mb-6">
                Enter a search term above to find projects and charts
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="px-3 py-1">Projects</Badge>
                <Badge variant="outline" className="px-3 py-1">Charts</Badge>
                <Badge variant="outline" className="px-3 py-1">Analytics</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}