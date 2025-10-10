export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export const ORDER_STATES = {
  created: { label: 'Created', color: 'status-created' },
  confirmed: { label: 'Confirmed', color: 'status-created' },
  picked_up: { label: 'Picked Up', color: 'status-pickedUp' },
  at_origin_shop: { label: 'At Origin Shop', color: 'status-atShop' },
  subcontracted: { label: 'Subcontracted', color: 'status-processing' },
  at_processing_shop: { label: 'At Processing', color: 'status-atShop' },
  washing: { label: 'Washing', color: 'status-processing' },
  drying: { label: 'Drying', color: 'status-processing' },
  pressing: { label: 'Pressing', color: 'status-processing' },
  qc: { label: 'Quality Check', color: 'status-packed' },
  packed: { label: 'Packed', color: 'status-packed' },
  out_for_delivery: { label: 'Out for Delivery', color: 'status-outForDelivery' },
  delivered: { label: 'Delivered', color: 'status-delivered' },
  closed: { label: 'Closed', color: 'status-completed' },
} as const;

export function formatCurrency(cents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}
