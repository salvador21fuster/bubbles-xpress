# Mr Bubbles Express — Ronan Hand‑Off

## What’s inside
- `pricing.json` – all services and prices (per item + per kg), VAT and min order.
- `sample_checkout_summary.json` – example of totals returned by `/checkout/summary`.
- `sample_label_payloads.json` – example QR payloads for N bags.
- `openapi.yaml` – minimal API surface for checkout + driver labels/scans.
- PDFs:
  - MrBubbles_Checkout_Spec.pdf
  - MrBubbles_UberEatsStyle_ItemPicker_Spec.pdf
  - MrBubbles_QR_Label_Print_Spec.pdf
  - MrBubbles_M220_Integration_Addendum.pdf
  - MrBubbles_M220_QuickStart.pdf
  - MrBubbles_TEST_LABEL_50x30mm.pdf

## Build Order (suggested)
1. **Item Picker (Uber Eats style)** – use `pricing.json` to render categories/cards.
2. **Checkout totals panel** – implement `/checkout/summary` (see example).
3. **Driver Dashboard additions** – `Accept → enter bag_count → print labels → scan flows`.
4. **Printing**:
   - v1 (fast): backend returns PNG/PDF labels; app opens share sheet to Phomemo app.
   - v2 (native): integrate M220 SDK and print bitmaps directly.
5. **Scanning** – implement `/scan/intake` and `/scan/deliver` status transitions and audit logs.
6. **Payments** – Stripe PaymentIntent for Apple Pay.

## QR payload
`mbx://bag?v=1&oid={orderId}&bid={i}&bc={N}&cid={customerId}&ts={iso}&sig={hmac}`

Keep `sig` = HMAC‑SHA256 of `orderId|i|ts` using server secret.
