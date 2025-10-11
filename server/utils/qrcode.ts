import QRCode from 'qrcode';

export interface QRCodeData {
  type: 'order' | 'bag' | 'item';
  id: string;
}

export function generateQRPayload(data: QRCodeData): string {
  const prefixMap = {
    order: 'o',
    bag: 'b',
    item: 'i',
  };
  
  const prefix = prefixMap[data.type];
  return `mrbl://${prefix}/${data.id}`;
}

export async function generateQRCode(payload: string): Promise<string> {
  // Generate QR code as data URL (base64 encoded PNG)
  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 1,
  });
  
  return qrDataUrl;
}

export async function generateQRCodeBuffer(payload: string): Promise<Buffer> {
  // Generate QR code as buffer for server-side processing
  const qrBuffer = await QRCode.toBuffer(payload, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 300,
    margin: 1,
  });
  
  return qrBuffer;
}

export function parseQRPayload(payload: string): QRCodeData | null {
  const match = payload.match(/^mrbl:\/\/([obi])\/(.+)$/);
  if (!match) return null;
  
  const [, prefix, id] = match;
  const typeMap: Record<string, 'order' | 'bag' | 'item'> = {
    o: 'order',
    b: 'bag',
    i: 'item',
  };
  
  const type = typeMap[prefix];
  if (!type) return null;
  
  return { type, id };
}
