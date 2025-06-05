import fs from 'fs';
import PDFDocument from 'pdfkit';

class PDFReporter {
  constructor() {
    this.results = [];
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.title,
      project: test._projectId || 'unknown',
      status: result.status
    });
  }

  async onEnd() {
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream('playwright-report.pdf'));
  
    // Page background color (if desired for entire page)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff'); // Light blue background
    doc.fillColor('black');
  
    // Title
    doc.fillColor('#157FAE')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Zealstore Report', { align: 'center' })
       .moveDown(1);
  
    // Column positions
    const xTest = 50;
    const xBrowser = 300;
    const xStatus = 430;
    const tableWidth = 520;
    const rowHeight = 20;
    const padding = 5;
  
    // Header
    const headerY = doc.y;
    doc.rect(xTest - padding, headerY - padding, tableWidth, rowHeight).fill('#f7fbfd');
    doc.fillColor('#157FAE').fontSize(12).font('Helvetica-Bold');
  
    doc.text('Test Name', xTest, headerY, { width: xBrowser - xTest - 10 });
    doc.text('Browser', xBrowser, headerY, { width: xStatus - xBrowser - 10 });
    doc.text('Status', xStatus, headerY);

    const headerBottomY = headerY + rowHeight - padding;
    doc.moveTo(xTest - padding, headerBottomY)
   .lineTo(xTest - padding + tableWidth, headerBottomY)
   .strokeColor('lightblue')
   .lineWidth(0.5)
   .stroke();
    doc.moveDown(0.5);
  
    // Body font
    doc.font('Helvetica').fontSize(10);
  
    // Rows
    for (let i = 0; i < this.results.length; i++) {
      const test = this.results[i];
      const y = doc.y;
  
      // Alternate row background
      const rowColor = i % 2 === 0 ? '#ffffff' : '#f7fbfd';
      doc.rect(xTest - padding, y - padding, tableWidth, rowHeight).fill(rowColor);
  
      // Re-apply text settings after fill
      doc.fillColor('black').font('Helvetica').fontSize(12);
  
      // Text
      doc.text(test.title, xTest, y, { width: xBrowser - xTest - 10 });
      doc.text(test.project || 'unknown', xBrowser, y, { width: xStatus - xBrowser - 10 });
  
      // Status
      let statusText = '';
      let statusColor = 'black';
      if (test.status === 'passed') {
        statusText = 'PASSED';
        statusColor = 'green';
      } else if (test.status === 'failed') {
        statusText = 'FAILED';
        statusColor = 'red';
      } else {
        statusText = 'SKIPPED';
        statusColor = 'orange';
      }
  
      doc.fillColor(statusColor).text(statusText, xStatus, y, { width: 50 });
  
      // Border bottom
      doc.moveTo(xTest - padding, y + rowHeight - padding)
         .lineTo(xTest - padding + tableWidth, y + rowHeight - padding)
         .strokeColor('lightblue')
         .lineWidth(0.5)
         .stroke();
  
      doc.moveDown(0.5); // ~5px spacing
    }
  
    doc.end();
  }
  
}

module.exports = PDFReporter;
