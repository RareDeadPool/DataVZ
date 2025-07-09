import React, { useState } from "react";

const mockData = [
  { type: "Project", name: "Sales Dashboard" },
  { type: "Project", name: "Marketing Analytics" },
  { type: "Chart", name: "Revenue Growth Q1" },
  { type: "Chart", name: "User Acquisition Funnel" },
  { type: "Team", name: "Data Science" },
  { type: "Team", name: "Marketing" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? []
      : mockData.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <input
        type="text"
        className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring"
        placeholder="Search projects, charts, teams..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <div>
          {filtered.length === 0 ? (
            <div className="text-gray-500">No results found.</div>
          ) : (
            <ul>
              {filtered.map((item, idx) => (
                <li key={idx} className="py-2 border-b flex items-center gap-2">
                  <span className="text-xs bg-gray-200 rounded px-2 py-1 mr-2">{item.type}</span>
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
