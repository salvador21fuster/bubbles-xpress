// QR payload generation for Mr Bubbles Express order labels
// Based on label_spec_1760459317047.json

import crypto from 'crypto';

export interface OrderLabelPayload {
  v: number; // version
  type: 'order_label';
  order_id: string;
  customer_id: string;
  property_no: string;
  balance_due_eur: number;
  updated: string; // YYYY-MM-DD
  ts: number; // epoch seconds
  sig?: string; // HMAC-SHA256 signature (optional but recommended)
}

/**
 * Generate a signed QR payload for an order label
 */
export function generateOrderLabelPayload({
  orderId,
  customerId,
  propertyNo,
  balanceDueEUR,
  updatedDate,
}: {
  orderId: string;
  customerId: string;
  propertyNo: string;
  balanceDueEUR: number;
  updatedDate: string; // YYYY-MM-DD format
}): string {
  const payload: OrderLabelPayload = {
    v: 1,
    type: 'order_label',
    order_id: orderId,
    customer_id: customerId,
    property_no: propertyNo,
    balance_due_eur: balanceDueEUR,
    updated: updatedDate,
    ts: Math.floor(Date.now() / 1000),
  };

  // Sign the payload (server-side only)
  const canonical = JSON.stringify(payload);
  const secret = process.env.QR_SECRET || process.env.SESSION_SECRET || 'default-secret';
  const sig = crypto.createHmac('sha256', secret).update(canonical).digest('hex');
  payload.sig = sig;

  // Return mrbl://order scheme with JSON payload
  return `mrbl://order?${JSON.stringify(payload)}`;
}

/**
 * Verify a QR payload signature
 */
export function verifyOrderLabelPayload(qrData: string): OrderLabelPayload | null {
  try {
    // Extract JSON from mrbl://order?{...}
    const match = qrData.match(/^mrbl:\/\/order\?(.+)$/);
    if (!match) return null;

    const payload: OrderLabelPayload = JSON.parse(match[1]);
    if (!payload.sig) return payload; // Unsigned payload

    // Verify signature
    const { sig, ...unsignedPayload } = payload;
    const canonical = JSON.stringify(unsignedPayload);
    const secret = process.env.QR_SECRET || process.env.SESSION_SECRET || 'default-secret';
    const expectedSig = crypto.createHmac('sha256', secret).update(canonical).digest('hex');

    if (sig === expectedSig) {
      return payload;
    }

    return null; // Invalid signature
  } catch (error) {
    console.error('Error verifying QR payload:', error);
    return null;
  }
}
