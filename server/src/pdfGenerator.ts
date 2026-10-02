/**
 * Standalone PDF Generator for Digi8 Solutions Invoices
 * Generates standards-compliant ISO 32000-1 (PDF-1.4) binary document
 * with zero external dependencies for maximum speed and portability.
 */

export interface InvoicePdfData {
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  invoice_status: string;
  payment_status: string;
  company_name?: string;
  company_address?: string;
  company_city?: string;
  company_state?: string;
  company_pincode?: string;
  company_phone?: string;
  company_email?: string;
  company_gstin?: string;
  company_pan?: string;
  customer_name: string;
  customer_company?: string;
  customer_mobile?: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_gstin?: string;
  project_name?: string;
  project_code?: string;
  subtotal: number;
  discount_total: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tax_total: number;
  tax_type?: string;
  round_off?: number;
  grand_total: number;
  amount_paid: number;
  balance_amount: number;
  items: Array<{
    item_name: string;
    description?: string;
    quantity: number;
    unit_market_price?: number;
    unit_selling_price: number;
    discount_amount?: number;
    tax_percentage?: number;
    total_amount: number;
  }>;
  payment_details?: {
    bank_name?: string;
    bank_account_holder?: string;
    bank_account_number?: string;
    bank_ifsc?: string;
    bank_branch?: string;
    upi_id?: string;
    upi_display_name?: string;
    payment_instructions?: string;
  };
  terms_conditions?: string;
}

// Helper to escape PDF string literal characters: \ -> \\, ( -> \(, ) -> \)
function escapePdfText(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Replace non-ascii with spaces for Type1 Helvetica safety
}

function formatCurrency(val: number | undefined | null): string {
  const num = Number(val) || 0;
  return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateInvoicePdfBuffer(data: InvoicePdfData): Buffer {
  const streamLines: string[] = [];

  // Coordinate system: Origin (0,0) is bottom-left, Top-right is (595.28, 841.89) [A4 Page]
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Helper stream primitives
  const drawRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number, fill = true) => {
    streamLines.push(`${r} ${g} ${b} ${fill ? 'rg' : 'RG'}`);
    streamLines.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill ? 'f' : 'S'}`);
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, r = 0.8, g = 0.8, b = 0.8, lineWidth = 0.5) => {
    streamLines.push(`${r} ${g} ${b} RG`);
    streamLines.push(`${lineWidth} w`);
    streamLines.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  };

  const addText = (
    text: string,
    x: number,
    y: number,
    fontSize = 9,
    font = 'F1',
    r = 0.1,
    g = 0.1,
    b = 0.1
  ) => {
    streamLines.push(`BT`);
    streamLines.push(`/${font} ${fontSize} Tf`);
    streamLines.push(`${r} ${g} ${b} rg`);
    streamLines.push(`${x.toFixed(2)} ${y.toFixed(2)} Td`);
    streamLines.push(`(${escapePdfText(text)}) Tj`);
    streamLines.push(`ET`);
  };

  // 1. Top Decorative Brand Banner
  drawRect(0, pageHeight - 75, pageWidth, 75, 0.04, 0.08, 0.16); // Deep slate blue #0a1429
  drawRect(0, pageHeight - 77, pageWidth, 2, 0.0, 0.9, 1.0); // Cyan accent strip #00e5ff

  // Brand Name & Tagline
  addText('DIGI8 SOLUTIONS', 36, pageHeight - 34, 18, 'F2', 0.0, 0.9, 1.0);
  addText('Enterprise Digital Transformation & Software Architecture', 36, pageHeight - 48, 8, 'F1', 0.8, 0.85, 0.95);
  addText('INVOICE / TAX BILL', pageWidth - 190, pageHeight - 34, 16, 'F2', 1.0, 1.0, 1.0);

  const statusLabel = (data.invoice_status || 'ISSUED').toUpperCase();
  addText(`STATUS: ${statusLabel}`, pageWidth - 190, pageHeight - 48, 9, 'F2', 0.0, 0.9, 1.0);

  // 2. Invoice Meta & Company Details
  let currentY = pageHeight - 95;

  // Left column: Company info
  addText(data.company_name || 'Digi8 Solutions Private Limited', 36, currentY, 10, 'F2', 0.1, 0.15, 0.2);
  currentY -= 13;
  addText(data.company_address || 'Level 5, Mindspace Tech Park, Malad West', 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
  currentY -= 11;
  addText(`${data.company_city || 'Mumbai'}, ${data.company_state || 'Maharashtra'} - ${data.company_pincode || '400064'}`, 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
  currentY -= 11;
  addText(`GSTIN: ${data.company_gstin || '27AABCD1234F1Z5'}  |  PAN: ${data.company_pan || 'AABCD1234F'}`, 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
  currentY -= 11;
  addText(`Email: ${data.company_email || 'billing@digi8solutions.com'}  |  Phone: ${data.company_phone || '+91 98200 88888'}`, 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);

  // Right column: Invoice Number & Dates box
  const boxX = pageWidth - 210;
  const boxY = pageHeight - 145;
  drawRect(boxX, boxY, 174, 52, 0.96, 0.97, 0.99); // Soft light grey box
  drawRect(boxX, boxY, 174, 52, 0.85, 0.9, 0.95, false);

  addText(`Invoice No: ${data.invoice_number}`, boxX + 8, boxY + 38, 9, 'F2', 0.05, 0.1, 0.2);
  addText(`Invoice Date: ${data.invoice_date || 'N/A'}`, boxX + 8, boxY + 25, 8, 'F1', 0.3, 0.35, 0.4);
  addText(`Due Date: ${data.due_date || 'Due on Receipt'}`, boxX + 8, boxY + 12, 8, 'F1', 0.3, 0.35, 0.4);

  // 3. Horizontal Separator
  currentY -= 12;
  drawLine(36, currentY, pageWidth - 36, currentY, 0.85, 0.88, 0.92);

  // 4. Bill To & Project Section
  currentY -= 15;
  addText('BILLED TO (CUSTOMER / CLIENT):', 36, currentY, 8, 'F2', 0.0, 0.6, 0.7);
  if (data.project_name) {
    addText('LINKED PROJECT:', 320, currentY, 8, 'F2', 0.0, 0.6, 0.7);
  }

  currentY -= 13;
  addText(data.customer_name || 'Valued Customer', 36, currentY, 10, 'F2', 0.1, 0.15, 0.2);
  if (data.project_name) {
    addText(`${data.project_name} (${data.project_code || 'PROJ'})`, 320, currentY, 9, 'F2', 0.1, 0.15, 0.2);
  }

  currentY -= 11;
  if (data.customer_company) {
    addText(data.customer_company, 36, currentY, 8, 'F1', 0.3, 0.35, 0.4);
  } else {
    addText(`Mobile: ${data.customer_mobile || 'N/A'} | Email: ${data.customer_email || 'N/A'}`, 36, currentY, 8, 'F1', 0.3, 0.35, 0.4);
  }

  currentY -= 11;
  if (data.customer_company) {
    addText(`Mobile: ${data.customer_mobile || 'N/A'} | Email: ${data.customer_email || 'N/A'}`, 36, currentY, 8, 'F1', 0.3, 0.35, 0.4);
    currentY -= 11;
  }

  const custLocation = [data.customer_address, data.customer_city, data.customer_state].filter(Boolean).join(', ');
  if (custLocation) {
    addText(`Address: ${custLocation}`, 36, currentY, 8, 'F1', 0.3, 0.35, 0.4);
    currentY -= 11;
  }

  if (data.customer_gstin) {
    addText(`Customer GSTIN: ${data.customer_gstin}`, 36, currentY, 8, 'F2', 0.2, 0.25, 0.3);
    currentY -= 11;
  }

  // 5. Line Items Table Header
  currentY -= 10;
  const tableHeaderY = currentY - 16;
  drawRect(36, tableHeaderY, pageWidth - 72, 18, 0.06, 0.11, 0.22); // Dark Navy header
  addText('#', 44, tableHeaderY + 5, 8, 'F2', 1, 1, 1);
  addText('ITEM / SERVICE DESCRIPTION', 64, tableHeaderY + 5, 8, 'F2', 1, 1, 1);
  addText('MARKET', 260, tableHeaderY + 5, 8, 'F2', 1, 1, 1);
  addText('QUOTED PRICE', 320, tableHeaderY + 5, 8, 'F2', 1, 1, 1);
  addText('QTY', 410, tableHeaderY + 5, 8, 'F2', 1, 1, 1);
  addText('GST%', 445, tableHeaderY + 5, 8, 'F2', 1, 1, 1);
  addText('TOTAL (INR)', 488, tableHeaderY + 5, 8, 'F2', 1, 1, 1);

  currentY = tableHeaderY;

  // 6. Line Items Rendering
  const items = data.items && data.items.length > 0 ? data.items : [];
  items.forEach((item, index) => {
    currentY -= 20;
    // Row background alternating
    if (index % 2 === 1) {
      drawRect(36, currentY - 4, pageWidth - 72, 20, 0.98, 0.98, 0.99);
    }
    drawLine(36, currentY - 4, pageWidth - 72, currentY - 4, 0.92, 0.93, 0.95);

    addText(String(index + 1), 44, currentY + 3, 8, 'F1', 0.4, 0.45, 0.5);
    addText(item.item_name || 'Software Development Service', 64, currentY + 3, 8, 'F2', 0.1, 0.15, 0.2);
    addText(formatCurrency(item.unit_market_price || item.unit_selling_price), 260, currentY + 3, 8, 'F1', 0.4, 0.45, 0.5);
    addText(formatCurrency(item.unit_selling_price), 320, currentY + 3, 8, 'F2', 0.1, 0.15, 0.2);
    addText(String(item.quantity || 1), 415, currentY + 3, 8, 'F1', 0.2, 0.2, 0.2);
    addText(`${item.tax_percentage !== undefined ? item.tax_percentage : 18}%`, 450, currentY + 3, 8, 'F1', 0.3, 0.35, 0.4);
    addText(formatCurrency(item.total_amount), 488, currentY + 3, 8, 'F2', 0.05, 0.1, 0.2);

    if (item.description) {
      currentY -= 12;
      addText(`  ${item.description}`, 64, currentY + 3, 7, 'F1', 0.45, 0.5, 0.55);
    }
  });

  // 7. Financial Summary & Payment Instructions Section
  currentY -= 22;
  const summaryBoxWidth = 220;
  const summaryBoxX = pageWidth - 36 - summaryBoxWidth;
  const summaryTopY = currentY;

  // Left Side: Payment Details (Bank & UPI)
  let payY = summaryTopY;
  const p = data.payment_details || {};
  addText('PAYMENT INSTRUCTIONS & BANK DETAILS', 36, payY, 8, 'F2', 0.0, 0.6, 0.7);
  payY -= 13;
  addText(`Bank Name: ${p.bank_name || 'HDFC Bank Ltd'}`, 36, payY, 8, 'F1', 0.2, 0.25, 0.3);
  payY -= 11;
  addText(`Account Holder: ${p.bank_account_holder || data.company_name || 'Digi8 Solutions Pvt Ltd'}`, 36, payY, 8, 'F1', 0.2, 0.25, 0.3);
  payY -= 11;
  addText(`Account Number: ${p.bank_account_number || '50200098765432'}  |  IFSC: ${p.bank_ifsc || 'HDFC0000123'}`, 36, payY, 8, 'F2', 0.1, 0.15, 0.2);
  payY -= 11;
  addText(`Branch: ${p.bank_branch || 'Mindspace Branch, Mumbai'}`, 36, payY, 8, 'F1', 0.3, 0.35, 0.4);
  payY -= 11;
  addText(`UPI ID (VPA): ${p.upi_id || 'digi8solutions@hdfcbank'}`, 36, payY, 8, 'F2', 0.0, 0.5, 0.8);
  payY -= 12;
  addText('Scan UPI QR code or transfer directly via NEFT/RTGS/IMPS.', 36, payY, 7.5, 'F1', 0.4, 0.45, 0.5);

  // Right Side: Grand Total & Taxes Box
  let sY = summaryTopY;
  const addSummaryRow = (label: string, value: string, isBold = false, isHighlight = false) => {
    if (isHighlight) {
      drawRect(summaryBoxX - 4, sY - 4, summaryBoxWidth + 8, 18, 0.06, 0.11, 0.22);
      addText(label, summaryBoxX, sY, 9, 'F2', 1, 1, 1);
      addText(value, summaryBoxX + summaryBoxWidth - 75, sY, 9, 'F2', 0.0, 0.9, 1.0);
    } else {
      addText(label, summaryBoxX, sY, 8, isBold ? 'F2' : 'F1', 0.3, 0.35, 0.4);
      addText(value, summaryBoxX + summaryBoxWidth - 75, sY, 8, isBold ? 'F2' : 'F1', 0.1, 0.15, 0.2);
    }
    sY -= 13;
  };

  addSummaryRow('Market Value / Subtotal:', formatCurrency(data.subtotal));
  if (data.discount_total > 0) {
    addSummaryRow('Discount Concession:', `- ${formatCurrency(data.discount_total)}`);
  }
  addSummaryRow('Taxable Amount:', formatCurrency(data.taxable_amount));

  if (data.igst_amount > 0) {
    addSummaryRow('IGST (Inter-state):', formatCurrency(data.igst_amount));
  } else {
    addSummaryRow('CGST (Central Tax):', formatCurrency(data.cgst_amount));
    addSummaryRow('SGST (State Tax):', formatCurrency(data.sgst_amount));
  }

  if (data.round_off) {
    addSummaryRow('Round Off Adjustment:', formatCurrency(data.round_off));
  }

  sY -= 3;
  addSummaryRow('GRAND TOTAL (INR):', formatCurrency(data.grand_total), true, true);
  sY -= 2;
  addSummaryRow('Amount Paid:', formatCurrency(data.amount_paid), true);
  addSummaryRow('Balance Due:', formatCurrency(data.balance_amount), true);

  // 8. Terms & Conditions Box
  const termsY = Math.min(payY, sY) - 15;
  drawRect(36, termsY - 32, pageWidth - 72, 38, 0.97, 0.98, 0.99);
  drawRect(36, termsY - 32, pageWidth - 72, 38, 0.88, 0.9, 0.93, false);
  addText('TERMS & STATUTORY DECLARATION:', 44, termsY - 5, 7.5, 'F2', 0.2, 0.25, 0.3);
  addText(
    data.terms_conditions || '1. Payment due within 15 days. 2. Custom software deliverables governed by MSA. 3. Subject to Mumbai jurisdiction.',
    44,
    termsY - 17,
    7,
    'F1',
    0.4,
    0.45,
    0.5
  );
  addText('This is a computer generated official invoice authorized by Digi8 Solutions Pvt Ltd.', 44, termsY - 27, 6.5, 'F1', 0.5, 0.55, 0.6);

  // 9. Footer
  drawRect(0, 0, pageWidth, 24, 0.04, 0.08, 0.16);
  addText('Digi8 Solutions Private Limited  |  https://digi8solutions.com  |  Support: billing@digi8solutions.com', 120, 8, 7.5, 'F1', 0.7, 0.8, 0.9);

  // Construct standard PDF objects
  const contentStream = streamLines.join('\n');
  const streamLength = Buffer.byteLength(contentStream, 'utf-8');

  const objects: string[] = [];

  // Obj 1: Catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // Obj 2: Pages
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);

  // Obj 3: Page
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`
  );

  // Obj 4: Helvetica Regular
  objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  // Obj 5: Helvetica Bold
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);

  // Obj 6: Content Stream
  objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

  // Header
  let pdfContent = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
  const offsets: number[] = [0]; // 0 is dummy for 65535 'f'

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdfContent, 'utf-8'));
    pdfContent += objects[i];
  }

  const startxref = Buffer.byteLength(pdfContent, 'utf-8');

  // Cross-reference table
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ` 00000 n \n`;
  }

  // Trailer
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  pdfContent += xref + trailer;

  return Buffer.from(pdfContent, 'utf-8');
}
