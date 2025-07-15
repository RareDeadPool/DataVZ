import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, Printer, Share2, FileDown, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import {
  downloadDataAsCSV,
  captureElement,
  downloadCanvasAsPNG
} from '@/utils/exportUtils';
import jsPDF from 'jspdf';
import { ChartRenderer } from './dashboard/ChartRenderer';
import { askGeminiSummary } from '@/services/api';

async function fetchAISummary(project, charts) {
  const prompt = `Project Name: ${project?.name || 'Untitled'}\nDescription: ${project?.description || 'No description.'}\nSummarize the key insights, trends, and findings from the following charts for a business audience.`;
  try {
    const response = await askGeminiSummary({ prompt, data: charts });
    return response?.text || 'No summary available.';
  } catch (err) {
    return 'AI summary could not be generated.';
  }
}

export function ExportActions({ charts, data, project }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingChart, setExportingChart] = useState(null);
  const [includeAISummary, setIncludeAISummary] = useState(false);
  const exportAreaRef = useRef();

  // Helper: Render all charts in a hidden export area
  const renderExportArea = () => (
    <div ref={exportAreaRef} style={{ position: 'fixed', top: -9999, left: -9999, width: 1200, background: '#fff', zIndex: -1 }}>
      {charts.map((chart) => (
        <div key={chart._id || chart.id} data-export-chart-id={chart._id || chart.id} style={{ width: 1000, height: 400, marginBottom: 32, background: '#fff', padding: 24, borderRadius: 8, boxSizing: 'border-box' }}>
          <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>{chart.title || `Chart ${chart._id || chart.id}`}</h3>
          <ChartRenderer
            type={chart.type}
            data={chart.data}
            xKey={chart.xKey}
            yKey={chart.yKey}
            zKey={chart.zKey}
            palette={chart.palette}
            customColors={chart.customColors}
            style={{ width: '100%', height: 320, background: '#fff' }}
          />
        </div>
      ))}
    </div>
  );

  // Helper: get chart DOM node from export area
  const getExportChartElement = (chartId) => {
    if (!exportAreaRef.current) return null;
    return exportAreaRef.current.querySelector(`[data-export-chart-id="${chartId}"]`);
  };

  // Beautified PDF export with project info, AI summary, and chart details
  const handleExportPDFAllInOne = async () => {
    if (charts.length === 0) return;
    setIsExporting(true);
    const toastId = toast.loading('Generating PDF report...');
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin + 10;
      let pageNumber = 1;

      // Project Info
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text(project?.name || 'Project Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 12;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      if (project?.description) {
        pdf.text(project.description, margin, currentY, { maxWidth: pageWidth - 2 * margin });
        currentY += 10;
      }
      pdf.setFontSize(10);
      pdf.text(`Exported on: ${new Date().toLocaleString()}`, margin, currentY);
      currentY += 8;
      if (project?.ownerName) {
        pdf.text(`Owner: ${project.ownerName}`, margin, currentY);
        currentY += 8;
      }
      pdf.setDrawColor(180);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10; // Extra space before AI summary

      // AI Summary (optional)
      if (includeAISummary) {
        // Draw a subtle colored background and border for the summary box
        const summaryBoxTop = currentY - 2;
        const summaryBoxLeft = margin - 2;
        const summaryBoxWidth = pageWidth - 2 * margin + 4;
        let summaryBoxHeight = 0; // We'll calculate as we go
        // Icon: Draw a small lightbulb before heading
        pdf.setDrawColor(255, 204, 0);
        pdf.setFillColor(255, 204, 0);
        pdf.circle(margin + 3, currentY + 2, 2.5, 'F');
        pdf.setDrawColor(180);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text('AI Summary', margin + 9, currentY + 3);
        currentY += 10;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        const summary = await fetchAISummary(project, charts);
        let summaryLines = summary.split('\n').map(line => line.trim()).filter(Boolean);
        let bulletLines = summaryLines.filter(line => line.startsWith('*'));
        let nonBulletLines = summaryLines.filter(line => !line.startsWith('*'));
        let boxStartY = currentY;
        if (nonBulletLines.length) {
          const splitText = pdf.splitTextToSize(nonBulletLines.join(' '), pageWidth - 2 * margin - 6);
          pdf.setFillColor(245, 245, 255);
          pdf.rect(margin, currentY - 2, pageWidth - 2 * margin, splitText.length * 6 + 8, 'F');
          pdf.setDrawColor(120, 140, 255);
          pdf.setLineWidth(1);
          pdf.line(margin, currentY - 2, margin, currentY - 2 + splitText.length * 6 + 8);
          pdf.setTextColor(30, 30, 80);
          pdf.text(splitText, margin + 4, currentY + 4);
          currentY += splitText.length * 6 + 10;
          summaryBoxHeight += splitText.length * 6 + 10;
        }
        if (bulletLines.length) {
          bulletLines.forEach(line => {
            // Remove all asterisks and trim
            let cleanLine = line.replace(/\*+/g, '').trim();
            const splitBullet = pdf.splitTextToSize(cleanLine, pageWidth - 2 * margin - 14);
            // Draw background and border for each bullet
            pdf.setFillColor(245, 245, 255);
            pdf.rect(margin, currentY - 2, pageWidth - 2 * margin, splitBullet.length * 6 + 8, 'F');
            pdf.setDrawColor(120, 140, 255);
            pdf.setLineWidth(1);
            pdf.line(margin, currentY - 2, margin, currentY - 2 + splitBullet.length * 6 + 8);
            // Draw bullet
            pdf.setTextColor(80, 120, 255);
            pdf.circle(margin + 4, currentY + 2, 1.7, 'F');
            pdf.setTextColor(30, 30, 80);
            pdf.text(splitBullet, margin + 10, currentY + 4);
            currentY += splitBullet.length * 6 + 12; // Extra space between bullets
            summaryBoxHeight += splitBullet.length * 6 + 12;
          });
        }
        if (!nonBulletLines.length && !bulletLines.length) {
          pdf.setFillColor(245, 245, 255);
          pdf.rect(margin, currentY - 2, pageWidth - 2 * margin, 14, 'F');
          pdf.setDrawColor(120, 140, 255);
          pdf.setLineWidth(1);
          pdf.line(margin, currentY - 2, margin, currentY + 12);
          pdf.setTextColor(30, 30, 80);
          pdf.text('No summary available.', margin + 4, currentY + 8);
          currentY += 16;
          summaryBoxHeight += 16;
        }
        pdf.setTextColor(0);
        pdf.setLineWidth(0.2);
        currentY += 2;
        pdf.setDrawColor(220);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 6;
      }

      // Charts
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const chartId = chart._id || chart.id;
        const chartElement = getExportChartElement(chartId);
        if (currentY + 120 > pageHeight) {
          pdf.addPage();
          pageNumber++;
          currentY = margin;
        }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text(chart.title || `Chart ${i + 1}`, margin, currentY); // Always use chart.title
        currentY += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text(`Type: ${chart.type}`, margin, currentY);
        currentY += 6;
        pdf.text(`X-Axis: ${chart.xKey || '-'}`, margin, currentY);
        currentY += 6;
        pdf.text(`Y-Axis: ${chart.yKey || '-'}`, margin, currentY);
        currentY += 6;
        pdf.text(`Data Points: ${chart.data?.length || 0}`, margin, currentY);
        currentY += 6;
        if (chart.description) {
          pdf.text(`Description: ${chart.description}`, margin, currentY);
          currentY += 6;
        }
        // Chart image
        if (chartElement) {
          const canvas = await captureElement(chartElement);
          if (canvas) {
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            if (currentY + imgHeight + 20 > pageHeight) {
              pdf.addPage();
              pageNumber++;
              currentY = margin;
            }
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 10;
          }
        }
        pdf.setDrawColor(220);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 6;
      }
      for (let i = 1; i <= pageNumber; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        // Watermark
        pdf.setTextColor(180);
        pdf.setFontSize(11);
        pdf.text('Made with DataViz', pageWidth / 2, pageHeight - 4, { align: 'center' });
        pdf.setTextColor(0);
      }
      pdf.save(`${project?.name ? project.name.replace(/\s+/g, '_') : 'project'}-report.pdf`);
      toast.success('PDF exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // Export each chart as a separate PDF
  const handleExportPDFSeparate = async () => {
    if (charts.length === 0) return;
    setIsExporting(true);
    const toastId = toast.loading('Exporting each chart as a separate PDF...');
    try {
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const chartId = chart._id || chart.id;
        const chartElement = getExportChartElement(chartId);
        if (chartElement) {
          const canvas = await captureElement(chartElement);
          if (canvas) {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.setFontSize(16);
            pdf.text(chart.title || `Chart ${i + 1}`, pageWidth / 2, 30, { align: 'center' });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, 40, imgWidth, imgHeight);
            pdf.save(`${chart.title || 'chart'}-${Date.now()}.pdf`);
            if (i < charts.length - 1) await new Promise(r => setTimeout(r, 200));
          }
        }
      }
      toast.success('All charts exported as separate PDFs!', { id: toastId });
    } catch (error) {
      console.error('Error exporting separate PDFs:', error);
      toast.error('Failed to export PDFs. Please try again.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // Always export images as separate PNGs using export area
  const handleExportImage = async () => {
    if (charts.length === 0) return;
    setIsExporting(true);
    const toastId = toast.loading(`Exporting ${charts.length} chart${charts.length !== 1 ? 's' : ''} as PNG...`);
    try {
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const chartId = chart._id || chart.id;
        const chartElement = getExportChartElement(chartId);
        if (chartElement) {
          const canvas = await captureElement(chartElement);
          if (canvas) {
            const filename = `${chart.title || 'chart'}-${Date.now()}.png`;
            downloadCanvasAsPNG(canvas, filename);
            if (i < charts.length - 1) await new Promise(r => setTimeout(r, 100));
          }
        }
      }
      toast.success(`Successfully exported ${charts.length} chart${charts.length !== 1 ? 's' : ''}!`, { id: toastId });
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error(error.message || 'Failed to export images. Please try again.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSingleChart = async (chart) => {
    if (!chart) return;
    setExportingChart(chart._id || chart.id);
    const toastId = toast.loading(`Exporting ${chart.title || 'chart'}...`);
    try {
      const chartId = chart._id || chart.id;
      const chartElement = getExportChartElement(chartId);
      if (chartElement) {
        const canvas = await captureElement(chartElement);
        if (canvas) {
          const filename = `${chart.title || 'chart'}-${Date.now()}.png`;
          downloadCanvasAsPNG(canvas, filename);
          toast.success(`${chart.title || 'Chart'} exported successfully!`, { id: toastId });
        } else {
          throw new Error('Failed to capture chart');
        }
      } else {
        throw new Error('Chart element not found');
      }
    } catch (error) {
      console.error('Error exporting single chart:', error);
      toast.error('Failed to export chart. Please try again.', { id: toastId });
    } finally {
      setExportingChart(null);
    }
  };

  const handleExportData = () => {
    if (data.length === 0) return;
    const toastId = toast.loading('Preparing data export...');
    try {
      downloadDataAsCSV(data, `data-export-${Date.now()}.csv`);
      toast.success(`Data exported successfully! (${data.length} rows)`, { id: toastId });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.', { id: toastId });
    }
  };

  const handlePrint = () => {
    toast.info('Opening print dialog...');
    window.print();
  };

  return (
    <div className="space-y-6">
      {renderExportArea()}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Export & Share</h2>
        <p className="text-slate-600 dark:text-slate-400">Export your charts and data in various formats</p>
      </div>
      {/* AI Summary Toggle */}
      <div className="mb-2 flex items-center gap-3">
        <input
          type="checkbox"
          id="ai-summary-toggle"
          checked={includeAISummary}
          onChange={e => setIncludeAISummary(e.target.checked)}
          disabled={isExporting}
        />
        <label htmlFor="ai-summary-toggle" className="font-medium cursor-pointer">Include AI Summary in PDF</label>
      </div>

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Charts Ready</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{charts.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Data Rows</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Export Ready</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {charts.length > 0 ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <FileText className="w-5 h-5" />
              Document Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleExportPDFAllInOne}
              disabled={charts.length === 0 || isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export All Charts as Single PDF'}
              <Badge variant="secondary" className="ml-auto">
                {charts.length} charts
              </Badge>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleExportPDFSeparate}
              disabled={charts.length === 0 || isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Each Chart as Separate PDF'}
              <Badge variant="secondary" className="ml-auto">
                {charts.length} charts
              </Badge>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handlePrint}
              disabled={charts.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <Image className="w-5 h-5" />
              Image Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleExportImage}
              disabled={charts.length === 0 || isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export All as PNG (Separate Files)'}
              <Badge variant="secondary" className="ml-auto">
                High Quality
              </Badge>
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleExportData}
              disabled={data.length === 0}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export Data as CSV
              <Badge variant="secondary" className="ml-auto">
                {data.length} rows
              </Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Individual Chart Export */}
      {charts.length > 0 && (
        <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground dark:text-white">
              <FileImage className="w-5 h-5" />
              Individual Chart Export
            </CardTitle>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Export individual charts as high-quality PNG images
              </p>
            </CardContent>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {charts.map((chart) => (
                <Button
                  key={chart._id || chart.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportSingleChart(chart)}
                  disabled={isExporting || exportingChart === (chart._id || chart.id)}
                  className="justify-start"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {exportingChart === (chart._id || chart.id) ? 'Exporting...' : chart.title || `Chart ${chart._id || chart.id}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Preview */}
      {charts.length > 0 && (
        <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white">Export Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-[#0a0f1a] rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-600">
                <p className="text-center text-slate-600 dark:text-slate-400">
                  Your {charts.length} chart{charts.length !== 1 ? 's' : ''} will be exported with the current layout and styling
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Export Quality: High (300 DPI)</span>
                <span>File Size: ~{Math.round(charts.length * 0.5)}MB estimated</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {charts.length === 0 && (
        <Card className="border-dashed border-2 bg-white dark:bg-[#0a0f1a] border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No charts to export</h3>
            <p className="text-slate-500 dark:text-slate-500 text-center">
              Create some charts first to enable export functionality
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}