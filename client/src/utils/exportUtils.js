import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures a DOM element as a canvas
 * @param {HTMLElement} element - The element to capture
 * @param {Object} options - html2canvas options
 * @returns {Promise<HTMLCanvasElement|null>}
 */
export const captureElement = async (element, options = {}) => {
  if (!element) return null;
  
  try {
    const defaultOptions = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight
    };
    
    const canvas = await html2canvas(element, { ...defaultOptions, ...options });
    return canvas;
  } catch (error) {
    console.error('Error capturing element:', error);
    return null;
  }
};

/**
 * Finds all chart elements in the DOM
 * @returns {Array<HTMLElement>}
 */
export const findChartElements = () => {
  const chartElements = document.querySelectorAll('[data-chart-id]');
  return Array.from(chartElements);
};

/**
 * Downloads a canvas as a PNG file
 * @param {HTMLCanvasElement} canvas - The canvas to download
 * @param {string} filename - The filename for the download
 */
export const downloadCanvasAsPNG = (canvas, filename) => {
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

/**
 * Downloads data as a CSV file
 * @param {Array} data - The data to export
 * @param {string} filename - The filename for the download
 */
export const downloadDataAsCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  try {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

/**
 * Creates a PDF with charts
 * @param {Array} charts - Array of chart objects
 * @param {string} filename - The filename for the PDF
 * @returns {Promise<void>}
 */
export const createPDFWithCharts = async (charts, filename = 'data-visualization-report.pdf') => {
  if (!charts || charts.length === 0) return;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  
  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data Visualization Report', pageWidth / 2, 30, { align: 'center' });
  
  // Add timestamp
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' });
  
  let currentY = 60;
  let pageNumber = 1;
  
  // Export each chart
  for (let i = 0; i < charts.length; i++) {
    const chart = charts[i];
    const chartId = chart._id || chart.id;
    
    // Find the chart element in the DOM
    const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`);
    
    if (chartElement) {
      // Capture chart as image
      const canvas = await captureElement(chartElement);
      
      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if we need a new page
        if (currentY + imgHeight + 40 > pageHeight) {
          pdf.addPage();
          pageNumber++;
          currentY = margin;
        }
        
        // Add chart title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(chart.title || `Chart ${i + 1}`, margin, currentY);
        currentY += 10;
        
        // Add chart image
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
        
        // Add chart details
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Type: ${chart.type}`, margin, currentY);
        currentY += 5;
        pdf.text(`Data Points: ${chart.data?.length || 0}`, margin, currentY);
        currentY += 5;
        pdf.text(`X-Axis: ${chart.xKey}`, margin, currentY);
        currentY += 5;
        pdf.text(`Y-Axis: ${chart.yKey}`, margin, currentY);
        currentY += 15;
      }
    }
  }
  
  // Add page numbers
  for (let i = 1; i <= pageNumber; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
  
  // Save the PDF
  pdf.save(filename);
};

/**
 * Exports charts as individual PNG files
 * @param {Array} charts - Array of chart objects
 * @returns {Promise<void>}
 */
export const exportChartsAsPNG = async (charts) => {
  if (!charts || charts.length === 0) return;
  
  const chartElements = findChartElements();
  
  if (chartElements.length === 0) {
    throw new Error('No charts found to export. Please ensure charts are visible.');
  }
  
  // Export each chart individually
  for (let i = 0; i < chartElements.length; i++) {
    const canvas = await captureElement(chartElements[i]);
    
    if (canvas) {
      const filename = `chart-${i + 1}-${Date.now()}.png`;
      downloadCanvasAsPNG(canvas, filename);
      
      // Small delay between downloads to prevent browser blocking
      if (i < chartElements.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
};

/**
 * Waits for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); 