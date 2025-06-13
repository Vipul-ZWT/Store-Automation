import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

class PDFReporter {
  constructor() {
    this.results = [];
  }

  onTestEnd(test, result) {
    let steps = [];
    const stepsAttachment = result.attachments.find(att => att.name === 'steps');
    if (stepsAttachment && stepsAttachment.body) {
      try {
        const buffer = stepsAttachment.body;
        steps = JSON.parse(buffer.toString('utf-8'));
      } catch (e) {
        console.error('Error parsing steps:', e);
      }
    }

    this.results.push({
      title: test.title,
      project: test._projectId || 'unknown',
      status: result.status,
      steps: steps
    });
  }

  async onEnd() {
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream('playwright-report.pdf'));

    const ensureSpace = (doc, requiredHeight = 50) => {
      const remaining = doc.page.height - doc.y - doc.page.margins.bottom;
      if (remaining < requiredHeight) {
        doc.addPage();
      }
    };

    const logoX = 40;
    const logoY = 30;
    const logoWidth = 50;
    const titleX = logoX + logoWidth + 20;
    const titleY = logoY + 15;

    try {
      doc.image(path.resolve('logo.jpg'), logoX, logoY, { width: logoWidth });
    } catch (err) {
      console.error('Failed to load logo:', err.message);
    }

    // Add the title right next to the image
    doc.fillColor('#157FAE')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Zealousweb Store Report', titleX, titleY)
      .moveDown(1.5);
  
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
    doc.fillColor('#157FAE').fontSize(10).font('Helvetica-Bold');
  
    doc.text('Test Name', xTest, headerY, { width: xBrowser - xTest - 10 });
    doc.text('Browser/Device', xBrowser, headerY, { width: xStatus - xBrowser - 10 });
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
      doc.fillColor('black').font('Helvetica').fontSize(10);
  
      // Text
      doc.text(test.title, xTest, y, { width: xBrowser - xTest - 10 });
      doc.text(test.project == 'setup-chromium' ? 'chromium' : test.project || 'unknown', xBrowser, y, { width: xStatus - xBrowser - 10 });
  
      // Status
      let statusText = '';
      let statusColor = 'black';
      if (test.status === 'passed') {
        statusText = 'PASSED';
        statusColor = '#006400';
      } else if (test.status === 'failed') {
        statusText = 'FAILED';
        statusColor = '#8B0000';
      } else {
        statusText = 'SKIPPED';
        statusColor = '#FF8C00';
      }
  
      doc.fillColor(statusColor).text(statusText, xStatus, y, { width: 50 });
  
      // Border bottom
      doc.moveTo(xTest - padding, y + rowHeight - padding)
         .lineTo(xTest - padding + tableWidth, y + rowHeight - padding)
         .strokeColor('lightblue')
         .lineWidth(0.5)
         .stroke();
  
      doc.moveDown(0.5);

      if (test.steps && test.steps.length > 0) {      
        doc.moveDown(0.5);

        const xStepTitle = xTest + 30;
        const xStepStatus = xStatus;

        test.steps.forEach((step) => {
          ensureSpace(doc, 20);
          const y = doc.y;
          const bullet = `${step.title}`;
          const statusText = step.status?.toUpperCase() || 'SKIPPED';

          doc.fillColor('black')
          .fontSize(10)
          .font('Helvetica')
          .text(bullet, xStepTitle, y, { width: xStepStatus - xStepTitle - 10 });
          
          let statusColor = 'black';
          if (step.status === 'passed') {
            statusColor = '#006400';
          } else if (step.status === 'failed') {
            statusColor = '#8B0000';
          } else{
            statusColor = '#FF8C00';
          }

          doc.fillColor(statusColor)
            .text(statusText, xStepStatus, y);

          doc.moveDown(0.5);
        });
      
        // Draw bottom border after all steps
        const borderY = doc.y;
        doc.moveTo(xTest - 5, borderY)
           .lineTo(xTest - 5 + tableWidth, borderY)
           .strokeColor('lightblue')
           .lineWidth(0.5)
           .stroke();
      
        doc.moveDown(0.5);
      }
    }
  
    doc.end();
  }
  
}

module.exports = PDFReporter;