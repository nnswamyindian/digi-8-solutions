import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    seal_url?: string;
    signature_url?: string;
    authorized_signatory_name?: string;
    authorized_signatory_title?: string;
    razorpay_enabled?: boolean;
    razorpay_primary_payment?: boolean;
    razorpay_key_id?: string;
    payment_url?: string;
    show_bank_details?: boolean;
    show_upi_qr?: boolean;
  };
  razorpay_enabled?: boolean;
  razorpay_primary_payment?: boolean;
  razorpay_key_id?: string;
  payment_url?: string;
  razorpay_payment_link_url?: string;
  show_bank_details?: boolean;
  show_upi_qr?: boolean;
  seal_url?: string;
  signature_url?: string;
  authorized_signatory_name?: string;
  authorized_signatory_title?: string;
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

function formatPdfDate(dateStr?: string | Date | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr).slice(0, 15);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return String(dateStr).slice(0, 15);
  }
}

function wrapText(text: string | undefined | null, maxCharsPerLine = 55): string[] {
  if (!text) return [];
  const lines: string[] = [];
  const rawParagraphs = String(text).split(/\r?\n/);
  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    const words = trimmed.split(/\s+/);
    let currentLine = '';
    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

interface ImageResource {
  alias: string;
  objNum: number;
  width: number;
  height: number;
  dictHeader: string;
  streamData: Buffer;
  maskObjNum?: number;
  maskHeader?: string;
  maskStreamData?: Buffer;
}

function getJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let offset = 2;
  while (offset < buf.length - 8) {
    if (buf[offset] !== 0xFF) {
      offset++;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xD8 || marker === 0xD9 || (marker >= 0xD0 && marker <= 0xD7)) {
      offset += 2;
      continue;
    }
    const len = buf.readUInt16BE(offset + 2);
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height };
    }
    offset += 2 + len;
  }
  return null;
}

function resolveImageFileBuffer(imagePathOrUrl?: string, defaultFilename?: string): Buffer | null {
  try {
    if (imagePathOrUrl && imagePathOrUrl.startsWith('data:image/')) {
      const commaIdx = imagePathOrUrl.indexOf(',');
      if (commaIdx !== -1) {
        return Buffer.from(imagePathOrUrl.slice(commaIdx + 1), 'base64');
      }
    }

    const candidatePaths: string[] = [];
    const addPath = (p: string) => {
      try {
        if (p && !candidatePaths.includes(p)) candidatePaths.push(p);
      } catch {}
    };

    if (imagePathOrUrl && !imagePathOrUrl.startsWith('data:') && !imagePathOrUrl.startsWith('http')) {
      const clean = imagePathOrUrl.replace(/^\/+/, '');
      const base = path.basename(clean);
      addPath(path.resolve(process.cwd(), clean));
      addPath(path.resolve(process.cwd(), 'public', clean));
      addPath(path.resolve(process.cwd(), '../public', clean));
      addPath(path.resolve(process.cwd(), 'public/images', base));
      addPath(path.resolve(process.cwd(), '../public/images', base));
      addPath(path.resolve(process.cwd(), 'server/uploads', clean));
      addPath(path.resolve(process.cwd(), 'server/uploads', base));
      addPath(path.resolve(process.cwd(), 'uploads', clean));
      addPath(path.resolve(process.cwd(), 'uploads', base));
      addPath(path.resolve(process.cwd(), '../uploads', base));
      addPath(path.resolve(__dirname, '../../public', clean));
      addPath(path.resolve(__dirname, '../../public/images', base));
      addPath(path.resolve(__dirname, '../uploads', clean));
      addPath(path.resolve(__dirname, '../uploads', base));
    }

    if (defaultFilename) {
      addPath(path.resolve(process.cwd(), 'public/images', defaultFilename));
      addPath(path.resolve(process.cwd(), '../public/images', defaultFilename));
      addPath(path.resolve(process.cwd(), 'server/uploads', defaultFilename));
      addPath(path.resolve(process.cwd(), 'uploads', defaultFilename));
      addPath(path.resolve(process.cwd(), '../uploads', defaultFilename));
      addPath(path.resolve(__dirname, '../../public/images', defaultFilename));
      addPath(path.resolve(__dirname, '../uploads', defaultFilename));
    }

    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          if (buf && buf.length > 0) {
            return buf;
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[PDF] Error resolving image file buffer:', err);
  }
  return null;
}

function createPdfImageResource(
  alias: string,
  imagePathOrUrl: string | undefined,
  defaultFilename: string,
  allocObjNum: () => number
): ImageResource | null {
  try {
    const rawBuf = resolveImageFileBuffer(imagePathOrUrl, defaultFilename);
    if (!rawBuf || rawBuf.length === 0) return null;

    // 1. Is it a JPEG (or JFIF)?
    if (rawBuf.length > 4 && rawBuf[0] === 0xFF && rawBuf[1] === 0xD8) {
      const dims = getJpegDimensions(rawBuf);
      if (dims && dims.width > 0 && dims.height > 0) {
        const objNum = allocObjNum();
        return {
          alias,
          objNum,
          width: dims.width,
          height: dims.height,
          dictHeader: `<< /Type /XObject /Subtype /Image /Width ${dims.width} /Height ${dims.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${rawBuf.length} >>`,
          streamData: rawBuf
        };
      }
    }

    // 2. Is it a PNG?
    try {
      const png = PNG.sync.read(rawBuf);
      const pixelCount = png.width * png.height;
      const rgb = Buffer.alloc(pixelCount * 3);
      const alpha = Buffer.alloc(pixelCount);
      let hasAlpha = false;

      for (let i = 0, j = 0, k = 0; i < png.data.length; i += 4, j += 3, k += 1) {
        rgb[j] = png.data[i];
        rgb[j + 1] = png.data[i + 1];
        rgb[j + 2] = png.data[i + 2];
        const a = png.data[i + 3];
        alpha[k] = a;
        if (a < 255) hasAlpha = true;
      }

      const deflatedRgb = zlib.deflateSync(rgb);
      if (hasAlpha) {
        const deflatedAlpha = zlib.deflateSync(alpha);
        const maskObjNum = allocObjNum();
        const objNum = allocObjNum();
        return {
          alias,
          objNum,
          width: png.width,
          height: png.height,
          maskObjNum,
          maskHeader: `<< /Type /XObject /Subtype /Image /Width ${png.width} /Height ${png.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${deflatedAlpha.length} >>`,
          maskStreamData: deflatedAlpha,
          dictHeader: `<< /Type /XObject /Subtype /Image /Width ${png.width} /Height ${png.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask ${maskObjNum} 0 R /Length ${deflatedRgb.length} >>`,
          streamData: deflatedRgb
        };
      } else {
        const objNum = allocObjNum();
        return {
          alias,
          objNum,
          width: png.width,
          height: png.height,
          dictHeader: `<< /Type /XObject /Subtype /Image /Width ${png.width} /Height ${png.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${deflatedRgb.length} >>`,
          streamData: deflatedRgb
        };
      }
    } catch {}
  } catch (err) {
    console.warn(`[PDF] Failed to create image resource for ${alias}:`, err);
  }
  return null;
}

export function generateInvoicePdfBuffer(data: InvoicePdfData): Buffer {
  let nextObjId = 7;
  const allocObjNum = () => nextObjId++;

  const sealImg = createPdfImageResource(
    'ImSeal',
    data.seal_url || data.payment_details?.seal_url,
    'seal.png',
    allocObjNum
  );

  const sigImg = createPdfImageResource(
    'ImSig',
    data.signature_url || data.payment_details?.signature_url,
    'signature.png',
    allocObjNum
  );

  const imageResources: ImageResource[] = [];
  if (sealImg) imageResources.push(sealImg);
  if (sigImg) imageResources.push(sigImg);

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

  const drawCircle = (cx: number, cy: number, r: number, red: number, green: number, blue: number, lineWidth = 1) => {
    const k = r * 0.55228475;
    streamLines.push(`${red} ${green} ${blue} RG`);
    streamLines.push(`${lineWidth} w`);
    streamLines.push(`${(cx + r).toFixed(2)} ${cy.toFixed(2)} m`);
    streamLines.push(`${(cx + r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c`);
    streamLines.push(`${(cx - k).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c`);
    streamLines.push(`${(cx - r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c`);
    streamLines.push(`${(cx + k).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c`);
    streamLines.push(`S`);
  };

  const drawSignature = (startX: number, startY: number) => {
    // Rich royal blue calligraphic fountain pen stroke
    streamLines.push(`0.06 0.22 0.62 RG`);
    streamLines.push(`1.3 w`);
    streamLines.push(`${startX.toFixed(2)} ${startY.toFixed(2)} m`);
    streamLines.push(`${(startX + 10).toFixed(2)} ${(startY + 13).toFixed(2)} ${(startX + 16).toFixed(2)} ${(startY - 5).toFixed(2)} ${(startX + 24).toFixed(2)} ${(startY + 9).toFixed(2)} c`);
    streamLines.push(`${(startX + 30).toFixed(2)} ${(startY + 18).toFixed(2)} ${(startX + 35).toFixed(2)} ${(startY + 2).toFixed(2)} ${(startX + 42).toFixed(2)} ${(startY + 5).toFixed(2)} c`);
    streamLines.push(`${(startX + 48).toFixed(2)} ${(startY + 9).toFixed(2)} ${(startX + 54).toFixed(2)} ${(startY - 4).toFixed(2)} ${(startX + 62).toFixed(2)} ${(startY + 11).toFixed(2)} c`);
    streamLines.push(`${(startX + 70).toFixed(2)} ${(startY + 16).toFixed(2)} ${(startX + 78).toFixed(2)} ${(startY + 3).toFixed(2)} ${(startX + 88).toFixed(2)} ${(startY + 7).toFixed(2)} c`);
    streamLines.push(`${(startX + 95).toFixed(2)} ${(startY + 11).toFixed(2)} ${(startX + 104).toFixed(2)} ${(startY - 2).toFixed(2)} ${(startX + 114).toFixed(2)} ${(startY + 2).toFixed(2)} c`);
    streamLines.push(`S`);

    // Under-signature calligraphic flourish
    streamLines.push(`0.8 w`);
    streamLines.push(`${(startX + 8).toFixed(2)} ${(startY - 3).toFixed(2)} m`);
    streamLines.push(`${(startX + 45).toFixed(2)} ${(startY - 7).toFixed(2)} ${(startX + 85).toFixed(2)} ${(startY - 5).toFixed(2)} ${(startX + 120).toFixed(2)} ${(startY - 1).toFixed(2)} c`);
    streamLines.push(`S`);
  };

  const drawSeal = (cx: number, cy: number) => {
    // Official Corporate Circular Stamp in Indigo/Blue Ink
    drawCircle(cx, cy, 30, 0.08, 0.25, 0.62, 1.8);
    drawCircle(cx, cy, 26, 0.08, 0.25, 0.62, 0.7);
    drawCircle(cx, cy, 14, 0.08, 0.25, 0.62, 0.4);

    addText('DIGI8 SOLUTIONS', cx - 27, cy + 18, 5.5, 'F2', 0.08, 0.25, 0.62);
    addText('* PVT. LTD. *', cx - 18, cy + 9, 5.5, 'F2', 0.08, 0.25, 0.62);
    addText('OFFICIAL', cx - 13, cy - 1, 6, 'F2', 0.08, 0.25, 0.62);
    addText('SEAL', cx - 7, cy - 8, 6, 'F2', 0.08, 0.25, 0.62);
    addText('VERIFIED', cx - 13, cy - 18, 5.5, 'F2', 0.08, 0.25, 0.62);
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

  const rawAddress = (data.company_address || 'Level 5, Mindspace Tech Park, Malad West').trim();
  const rawCity = (data.company_city || '').trim();
  const rawState = (data.company_state || '').trim();
  const rawPin = (data.company_pincode || '').trim();

  const addrLower = rawAddress.toLowerCase();
  const hasCity = rawCity && addrLower.includes(rawCity.toLowerCase());
  const hasPin = rawPin && addrLower.includes(rawPin);

  if (hasCity || hasPin) {
    // Address already contains city or pincode: wrap neatly without duplicate second line
    const addrLines = wrapText(rawAddress, 48);
    for (const al of addrLines.slice(0, 2)) {
      addText(al, 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
      currentY -= 11;
    }
  } else {
    // Street address on line 1, City, State - Pincode on line 2
    addText(rawAddress, 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
    currentY -= 11;
    const locParts = [rawCity, rawState].filter(Boolean).join(', ') + (rawPin ? ` - ${rawPin}` : '');
    if (locParts) {
      addText(locParts, 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
      currentY -= 11;
    }
  }

  // GSTIN & PAN
  const taxParts: string[] = [];
  if (data.company_gstin && data.company_gstin.trim()) taxParts.push(`GSTIN: ${data.company_gstin.trim()}`);
  if (data.company_pan && data.company_pan.trim()) taxParts.push(`PAN: ${data.company_pan.trim()}`);
  if (taxParts.length > 0) {
    addText(taxParts.join('  |  '), 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
    currentY -= 11;
  }

  // Email & Phone
  const contactParts: string[] = [];
  if (data.company_email && data.company_email.trim()) contactParts.push(`Email: ${data.company_email.trim()}`);
  if (data.company_phone && data.company_phone.trim()) contactParts.push(`Phone: ${data.company_phone.trim()}`);
  if (contactParts.length > 0) {
    addText(contactParts.join('  |  '), 36, currentY, 8, 'F1', 0.35, 0.4, 0.45);
    currentY -= 11;
  }

  // Right column: Invoice Number & Dates box
  const boxX = pageWidth - 210;
  const boxY = pageHeight - 145;
  drawRect(boxX, boxY, 174, 52, 0.96, 0.97, 0.99); // Soft light grey box
  drawRect(boxX, boxY, 174, 52, 0.85, 0.9, 0.95, false);

  addText(`Invoice No: ${data.invoice_number}`, boxX + 8, boxY + 38, 9, 'F2', 0.05, 0.1, 0.2);
  addText(`Invoice Date: ${formatPdfDate(data.invoice_date)}`, boxX + 8, boxY + 25, 8, 'F1', 0.3, 0.35, 0.4);
  addText(`Due Date: ${formatPdfDate(data.due_date) || 'Due on Receipt'}`, boxX + 8, boxY + 12, 8, 'F1', 0.3, 0.35, 0.4);

  // 3. Horizontal Separator (clears both columns)
  currentY = Math.min(currentY - 2, boxY - 12);
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
    const itemTotal = (item.total_amount && Number(item.total_amount) > 0)
      ? Number(item.total_amount)
      : (Number(item.unit_selling_price || 0) * (Number(item.quantity) || 1));
    addText(formatCurrency(itemTotal), 488, currentY + 3, 8, 'F2', 0.05, 0.1, 0.2);

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

  // Left Side: Payment Details (Bank & UPI / Razorpay) + Scannable QR Code
  let payY = summaryTopY;
  const p = data.payment_details || {};
  const isPaid = (data.payment_status?.toLowerCase() === 'paid') || (Number(data.balance_amount) <= 0);
  const isRazorpay = Boolean(
    data.razorpay_enabled !== undefined
      ? data.razorpay_enabled
      : (p.razorpay_enabled !== undefined ? p.razorpay_enabled : Boolean(data.razorpay_key_id || p.razorpay_key_id))
  );
  const isRazorpayPrimary = data.razorpay_primary_payment !== false && p.razorpay_primary_payment !== false;
  const showBankDetails = data.show_bank_details !== false && p.show_bank_details !== false;

  const fallbackDomain = 'https://digi8solutions.com';
  const paymentUrl = (data.payment_url || data.razorpay_payment_link_url || `${fallbackDomain}/pay?inv=${encodeURIComponent(data.invoice_number || 'INV')}`).trim();

  const upiId = p.upi_id || 'digi8solutions@hdfcbank';
  const payeeName = p.upi_display_name || p.bank_account_holder || data.company_name || 'Digi8 Solutions Pvt Ltd';
  const amountToPay = (data.balance_amount > 0 ? data.balance_amount : data.grand_total).toFixed(2);
  const invoiceRef = data.invoice_number || 'INV';
  const upiPayIntent = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amountToPay}&cu=INR&tn=${encodeURIComponent('Invoice ' + invoiceRef)}`;

  if (isPaid) {
    addText('PAYMENT STATUS & RECONCILIATION', 36, payY, 8, 'F2', 0.08, 0.55, 0.25);

    const badgeX = 36;
    const badgeY = payY - 74;
    const badgeW = 68;
    const badgeH = 68;

    // Soft emerald verified badge box
    drawRect(badgeX - 2, badgeY - 2, badgeW + 4, badgeH + 4, 0.93, 0.98, 0.94, true);
    drawRect(badgeX - 2, badgeY - 2, badgeW + 4, badgeH + 4, 0.15, 0.65, 0.35, false);
    drawRect(badgeX + 2, badgeY + 2, badgeW - 4, badgeH - 4, 0.72, 0.9, 0.76, false);

    // Paid stamp badge text
    addText('PAID', badgeX + 17, badgeY + 40, 14, 'F2', 0.08, 0.55, 0.25);
    addText('IN FULL', badgeX + 15, badgeY + 24, 9, 'F2', 0.1, 0.58, 0.28);
    addText('VERIFIED RECEIPT', badgeX + 6, badgeY + 10, 6, 'F1', 0.2, 0.45, 0.3);

    const textX = 116;
    payY -= 12;
    addText('Payment Status: FULLY SETTLED / PAID', textX, payY, 8.5, 'F2', 0.08, 0.55, 0.25);
    payY -= 11;
    addText(`Settled Amount: ${formatCurrency(data.grand_total)}`, textX, payY, 8, 'F2', 0.15, 0.2, 0.25);
    payY -= 11;
    addText('Outstanding Due: Rs. 0.00 (Nil Balance)', textX, payY, 8, 'F1', 0.2, 0.6, 0.3);
    payY -= 11;
    addText(`Invoice Ref: ${data.invoice_number}  |  Settled: ${formatPdfDate(data.invoice_date)}`, textX, payY, 7.5, 'F1', 0.3, 0.35, 0.4);
    payY -= 11;
    addText(isRazorpay ? 'Channel: Razorpay Enterprise Online Gateway' : 'Channel: Direct Corporate Bank Settlement', textX, payY, 7.5, 'F1', 0.3, 0.35, 0.4);
    payY -= 12;
    addText('Official digital receipt recorded in Digi8 ledger. Thank you!', textX, payY, 7, 'F2', 0.1, 0.5, 0.25);
  } else {
    // Generate Scannable QR Code (Razorpay payment portal or fallback UPI intent)
    const qrPayload = isRazorpay ? paymentUrl : upiPayIntent;
    let qrModules: any = null;
    try {
      const createFn = (QRCode as any).create || (QRCode as any).default?.create;
      if (typeof createFn === 'function') {
        const qrSymbol = createFn(qrPayload, { errorCorrectionLevel: 'M' });
        if (qrSymbol && qrSymbol.modules) {
          qrModules = qrSymbol.modules;
        }
      }
    } catch (err) {
      console.warn('PDF QR symbol notice:', err);
    }

    const qrSize = qrModules ? qrModules.size : 0;
    const qrWidth = 64;
    const qrCellSize = qrSize > 0 ? qrWidth / qrSize : 0;
    const qrX = 36;
    const qrY = payY - 74;
    const bankX = qrModules ? 116 : 36;

    if (isRazorpay) {
      addText('ONLINE PAYMENT & RAZORPAY GATEWAY', 36, payY, 8, 'F2', 0.0, 0.55, 0.75);
    } else {
      addText('PAYMENT INSTRUCTIONS & BANK DETAILS', 36, payY, 8, 'F2', 0.0, 0.6, 0.7);
    }

    // Draw QR code on left if available
    if (qrModules) {
      // QR Box background and border
      drawRect(qrX - 3, qrY - 3, qrWidth + 6, qrWidth + 6, 1, 1, 1, true);
      drawRect(qrX - 3, qrY - 3, qrWidth + 6, qrWidth + 6, 0.82, 0.85, 0.9, false);

      // Draw QR modules
      for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
          if (qrModules.get(r, c)) {
            const cy = qrY + (qrSize - 1 - r) * qrCellSize;
            const cx = qrX + c * qrCellSize;
            drawRect(cx, cy, qrCellSize + 0.1, qrCellSize + 0.1, 0, 0, 0, true);
          }
        }
      }

      if (isRazorpay) {
        addText('SCAN TO PAY ONLINE', qrX - 2, qrY - 10, 6.2, 'F2', 0.0, 0.5, 0.7);
        addText('Razorpay: UPI, Cards & NetBanking', qrX - 6, qrY - 18, 5.2, 'F1', 0.35, 0.45, 0.55);
      } else {
        addText('SCAN TO PAY (UPI)', qrX + 2, qrY - 10, 6.5, 'F2', 0.0, 0.5, 0.7);
      }
    }

    if (isRazorpay && isRazorpayPrimary) {
      payY -= 12;
      addText('Gateway: Razorpay Enterprise Online', bankX, payY, 7.5, 'F2', 0.0, 0.45, 0.75);
      payY -= 11;
      const cleanDisplayHost = paymentUrl.replace(/^https?:\/\//i, '').replace(/%2F/gi, '/');
      const cleanPayUrl = cleanDisplayHost.length > 38 ? `${cleanDisplayHost.slice(0, 36)}...` : cleanDisplayHost;
      addText(`Pay Portal: ${cleanPayUrl}`, bankX, payY, 7, 'F2', 0.0, 0.5, 0.8);
      payY -= 10;
      addText('Accepted: UPI, Debit/Credit Cards & Net Banking', bankX, payY, 6.8, 'F1', 0.2, 0.25, 0.3);
      payY -= 10;
      addText('Auto-Reconciliation: Instant Receipt & Settlement', bankX, payY, 6.8, 'F1', 0.2, 0.25, 0.3);
      payY -= 10;
      if (showBankDetails && p.bank_account_number) {
        addText(`Wire: ${p.bank_name || 'HDFC Bank'} | A/C: ${p.bank_account_number}`, bankX, payY, 6.5, 'F1', 0.3, 0.35, 0.4);
        payY -= 9;
        addText(`IFSC: ${p.bank_ifsc || 'HDFC0000123'}`, bankX, payY, 6.5, 'F1', 0.3, 0.35, 0.4);
        payY -= 9;
      }
      addText('Scan QR with phone camera or UPI app.', bankX, payY, 6.5, 'F1', 0.4, 0.45, 0.5);
    } else {
      payY -= 13;
      addText(`Bank Name: ${p.bank_name || 'HDFC Bank Ltd'}`, bankX, payY, 8, 'F1', 0.2, 0.25, 0.3);
      payY -= 11;
      addText(`Account Holder: ${p.bank_account_holder || data.company_name || 'Digi8 Solutions Pvt Ltd'}`, bankX, payY, 8, 'F1', 0.2, 0.25, 0.3);
      payY -= 11;
      addText(`Account Number: ${p.bank_account_number || '50200098765432'}`, bankX, payY, 8, 'F2', 0.1, 0.15, 0.2);
      payY -= 11;
      addText(`IFSC: ${p.bank_ifsc || 'HDFC0000123'}  |  Branch: ${p.bank_branch || 'Mindspace Branch'}`, bankX, payY, 7.5, 'F1', 0.3, 0.35, 0.4);
      payY -= 11;
      addText(`UPI ID: ${p.upi_id || 'digi8solutions@hdfcbank'}`, bankX, payY, 8, 'F2', 0.0, 0.5, 0.8);
      payY -= 12;
      addText('Scan UPI QR or transfer via NEFT/RTGS.', bankX, payY, 7, 'F1', 0.4, 0.45, 0.5);
    }
  }

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

  const computedSubtotal = (data.subtotal && data.subtotal > 0)
    ? data.subtotal
    : ((data.taxable_amount || 0) + (data.discount_total || 0) || data.grand_total || 0);
  addSummaryRow('Market Value / Subtotal:', formatCurrency(computedSubtotal));
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

  // 8. Terms, Official Seal & Authorized Signatory Section
  const bottomSectionTopY = Math.min(payY, sY) - 18;

  // Left Column: Terms & Statutory Declaration Box
  const termsBoxWidth = 240;
  const termsBoxHeight = 58;
  const termsBoxY = bottomSectionTopY - termsBoxHeight;
  drawRect(36, termsBoxY, termsBoxWidth, termsBoxHeight, 0.97, 0.98, 0.99);
  drawRect(36, termsBoxY, termsBoxWidth, termsBoxHeight, 0.88, 0.9, 0.93, false);
  addText('TERMS & STATUTORY DECLARATION:', 44, termsBoxY + termsBoxHeight - 11, 7.5, 'F2', 0.1, 0.2, 0.35);

  const termLines = wrapText(
    data.terms_conditions || '1. Payment due within 15 days of invoice date. 2. Custom software deliverables governed by MSA. 3. Subject to jurisdiction.',
    50
  );
  let termY = termsBoxY + termsBoxHeight - 21;
  for (let i = 0; i < Math.min(3, termLines.length); i++) {
    addText(termLines[i], 44, termY, 6.2, 'F1', 0.35, 0.4, 0.45);
    termY -= 8;
  }
  addText(`This is a computer generated official invoice authorized by ${data.company_name || 'Digi8 Solutions Pvt Ltd'}.`, 44, termsBoxY + 5, 5.8, 'F1', 0.45, 0.5, 0.55);

  // Center-Right: Official Company Seal / Stamp
  const sealCenterX = 332;
  const sealCenterY = termsBoxY + 28;
  if (sealImg) {
    const sealDrawSize = 62;
    const sealDrawX = 296;
    const sealDrawY = termsBoxY - 2;
    streamLines.push(`q`);
    streamLines.push(`${sealDrawSize.toFixed(2)} 0 0 ${sealDrawSize.toFixed(2)} ${sealDrawX.toFixed(2)} ${sealDrawY.toFixed(2)} cm`);
    streamLines.push(`/${sealImg.alias} Do`);
    streamLines.push(`Q`);
  } else {
    drawSeal(sealCenterX, sealCenterY);
  }

  // Far-Right: Authorized Signatory & Signature
  const sigX = 405;
  const sigY = termsBoxY + 24;
  const legalCompanyHeader = `For ${(data.company_name || 'DIGI8 SOLUTIONS PRIVATE LIMITED').toUpperCase()}`;
  addText(legalCompanyHeader, sigX, termsBoxY + 54, 7.2, 'F2', 0.1, 0.15, 0.25);

  if (sigImg) {
    const sigTargetWidth = 120;
    const aspect = sigImg.height / sigImg.width;
    const sigTargetHeight = Math.min(48, Math.max(26, Math.round(sigTargetWidth * aspect)));
    const sigDrawX = 412;
    const sigDrawY = termsBoxY + 4;
    streamLines.push(`q`);
    streamLines.push(`${sigTargetWidth.toFixed(2)} 0 0 ${sigTargetHeight.toFixed(2)} ${sigDrawX.toFixed(2)} ${sigDrawY.toFixed(2)} cm`);
    streamLines.push(`/${sigImg.alias} Do`);
    streamLines.push(`Q`);
  } else {
    drawSignature(sigX, sigY + 6);
  }

  drawLine(sigX - 10, termsBoxY + 2, pageWidth - 36, termsBoxY + 2, 0.3, 0.35, 0.45, 0.8);
  addText(
    data.authorized_signatory_name || data.payment_details?.authorized_signatory_name || 'Authorized Signatory',
    sigX + 16,
    termsBoxY - 9,
    8,
    'F2',
    0.08,
    0.18,
    0.32
  );
  addText(
    data.authorized_signatory_title || data.payment_details?.authorized_signatory_title || 'Corporate Finance & Accounts Division',
    sigX + 2,
    termsBoxY - 18,
    6.8,
    'F1',
    0.4,
    0.45,
    0.5
  );

  // 9. Footer
  drawRect(0, 0, pageWidth, 24, 0.04, 0.08, 0.16);
  addText(`${data.company_name || 'Digi8 Solutions Private Limited'}  |  https://digi8solutions.com  |  Support: ${data.company_email || 'hello@digi8solutions.com'}`, 120, 8, 7.5, 'F1', 0.7, 0.8, 0.9);

  // Construct standard PDF objects
  const contentStream = streamLines.join('\n');
  const streamLength = Buffer.byteLength(contentStream, 'utf-8');

  const objects: Buffer[] = [];

  // Obj 1: Catalog
  objects.push(Buffer.from(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`, 'utf-8'));

  // Obj 2: Pages
  objects.push(Buffer.from(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`, 'utf-8'));

  // Obj 3: Page
  let xobjectsDict = '';
  if (imageResources.length > 0) {
    xobjectsDict = '/XObject << ' + imageResources.map(img => `/${img.alias} ${img.objNum} 0 R`).join(' ') + ' >> ';
  }
  objects.push(
    Buffer.from(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> ${xobjectsDict}>> /Contents 6 0 R >>\nendobj\n`,
      'utf-8'
    )
  );

  // Obj 4: Helvetica Regular
  objects.push(Buffer.from(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`, 'utf-8'));

  // Obj 5: Helvetica Bold
  objects.push(Buffer.from(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`, 'utf-8'));

  // Obj 6: Content Stream
  objects.push(
    Buffer.from(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`, 'utf-8')
  );

  // Obj 7+: Image XObjects & Soft Masks
  for (const img of imageResources) {
    if (img.maskObjNum && img.maskHeader && img.maskStreamData) {
      objects.push(
        Buffer.concat([
          Buffer.from(`${img.maskObjNum} 0 obj\n${img.maskHeader}\nstream\n`, 'utf-8'),
          img.maskStreamData,
          Buffer.from(`\nendstream\nendobj\n`, 'utf-8')
        ])
      );
    }
    objects.push(
      Buffer.concat([
        Buffer.from(`${img.objNum} 0 obj\n${img.dictHeader}\nstream\n`, 'utf-8'),
        img.streamData,
        Buffer.from(`\nendstream\nendobj\n`, 'utf-8')
      ])
    );
  }

  // Header
  const headerBuf = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary');
  let currentOffset = headerBuf.length;
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset);
    currentOffset += objects[i].length;
  }

  const startxref = currentOffset;

  // Cross-reference table
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ` 00000 n \n`;
  }

  // Trailer
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const xrefBuf = Buffer.from(xref, 'utf-8');
  const trailerBuf = Buffer.from(trailer, 'utf-8');

  return Buffer.concat([headerBuf, ...objects, xrefBuf, trailerBuf]);
}
