import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { Multer } from 'multer';
import pdf from 'html-pdf';
import * as fs from 'fs/promises';
import { logger } from './logger';

@Injectable()
export class FileUtils {
  static xlsxToJsonConvertor(file: any) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    return jsonData;
  }
  static async htmlPdfBuffer(html: string) {
    pdf.create(html).toBuffer((err, buffer) => {
      if (err) {
        console.error(err);
        logger.error('PdfGenrateError: ' + JSON.stringify(err));
      } else {
        console.log('PDF generated:', buffer);
      }
    });
  }

  static async generatePDF(invoiceContent, pdfFileName) {
    // await fs.mkdir('pdfs', { recursive: true });
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox'],
    // });
    // const page = await browser.newPage();
    // await page.setContent(invoiceContent);
    // // Adjust the options as needed (e.g., format, margin, etc.).
    // const pdfOptions = {
    //   path: `pdfs/${pdfFileName}`,
    // };

    // await page.pdf(pdfOptions);

    // await browser.close();
  }
}
