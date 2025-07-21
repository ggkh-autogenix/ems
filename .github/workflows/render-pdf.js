const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1280,
      height: 1920,
    },
  });

  const page = await browser.newPage();

  // Load local HTML file (with full path resolution)
  const htmlPath = path.resolve(__dirname, 'ems_pitch_deck.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  await page.setContent(htmlContent, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
  });

  // Optional: Inject a custom style for global alignment/fonts
  await page.addStyleTag({
    content: `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        font-size: 14px;
        padding: 20px;
        line-height: 1.6;
      }
    `
  });

  // Optional: Wait for fonts to fully load
  await page.evaluateHandle('document.fonts.ready');

  // Generate PDF
  await page.pdf({
    path: 'ems_pitch_deck.pdf',
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    printBackground: true,
  });

  await browser.close();
})();
