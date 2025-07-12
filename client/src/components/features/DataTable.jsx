import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function DataTable({ data }) {
  // All hooks at the top!
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterText, setFilterText] = useState('');

  // Defensive: columns, filteredData, sortedData, paginatedData must always be defined
  const columns = useMemo(() => (data && data.length > 0 ? Object.keys(data[0]) : []), [data]);
  const totalColumns = columns.length;

  // Filtering
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!filterText) return data;
    return data.filter(row =>
      columns.some(col => String(row[col]).toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [data, filterText, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortColumn] === b[sortColumn]) return 0;
      if (sortDirection === 'asc') {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Data Preview</h3>
          <p className="text-sm text-slate-600">
            Showing {filteredData.length} rows and {totalColumns} columns
          </p>
        </div>
        <div className="flex space-x-2 items-center">
          <Badge variant="outline">{filteredData.length} rows</Badge>
          <Badge variant="outline">{totalColumns} columns</Badge>
          <Input
            placeholder="Search..."
            value={filterText}
            onChange={e => { setFilterText(e.target.value); setPage(1); }}
            className="w-40 text-sm"
          />
        </div>
      </div>

      <Card>
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="font-semibold cursor-pointer select-none"
                    onClick={() => handleSort(column)}
                  >
                    {column}
                    {sortColumn === column && (
                      <span className="ml-1 text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm text-slate-500">
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {row[column]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-2 border-t bg-slate-50">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}