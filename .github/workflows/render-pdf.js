const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const htmlPath = path.resolve(__dirname, 'ems_pitch_deck.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  await page.setContent(htmlContent, { waitUntil: ['networkidle0', 'domcontentloaded'] });

  // Scroll to the bottom to trigger all lazy-loaded content
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });

  // Wait a little longer to let any animations/tabs complete
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Print-friendly styling
  await page.addStyleTag({
    content: `
      * { box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        margin: 0;
        padding: 20px;
      }
      h1, h2, h3, h4 {
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      p, div, table {
        page-break-inside: avoid;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 8px;
        text-align: left;
        border: 1px solid #ccc;
      }
      .pagebreak {
        page-break-before: always;
      }
    `
  });

  // Wait for web fonts if any
  await page.evaluateHandle('document.fonts.ready');

  // Save the PDF
  await page.pdf({
    path: 'ems_pitch_deck.pdf',
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    printBackground: true,
  });

  await browser.close();
})();
