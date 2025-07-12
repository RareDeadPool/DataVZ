import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';
import { ChartRenderer } from './dashboard/ChartRenderer';

export function ChartGrid({ charts, onEditChart, onDeleteChart }) {
  const getChartIcon = (type) => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'line': return LineChart;
      case 'pie': return PieChart;
      default: return TrendingUp;
    }
  };

  const getChartColor = (type) => {
    switch (type) {
      case 'bar': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'line': return 'bg-green-100 text-green-700 border-green-200';
      case 'pie': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (charts.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No charts yet</h3>
          <p className="text-slate-500 text-center mb-4">
            Create your first chart to start visualizing your data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {charts.map((chart) => {
        const Icon = getChartIcon(chart.type);
        const chartId = chart._id || chart.id;
        return (
          <Card key={chartId} className="group hover:shadow-lg transition-shadow" data-chart-id={chartId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getChartColor(chart.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{chart.title}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditChart(chart)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteChart(chartId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center mb-3">
                {chart.data && chart.xKey && chart.yKey ? (
                  <ChartRenderer
                    type={chart.type}
                    data={chart.data}
                    xKey={chart.xKey}
                    yKey={chart.yKey}
                    style={{ height: '100%', width: '100%' }}
                  />
                ) : (
                  <div className="text-center">
                    <Icon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Chart Preview</p>
                  </div>
                )}
              </div>
              <div className="text-sm text-slate-600">
                <p><span className="font-medium">X-Axis:</span> {chart.xKey}</p>
                <p><span className="font-medium">Y-Axis:</span> {chart.yKey}</p>
                <p><span className="font-medium">Data Points:</span> {chart.data?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}