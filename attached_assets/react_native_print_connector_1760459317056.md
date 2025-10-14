
# Mr Bubbles Express — Phomemo M220 Print Connector (React Native)

This example shows how to:
1) Generate a **unique QR** payload
2) Render a **70×70 mm** label as a bitmap (560×560 px @203 dpi)
3) Send **TSPL** to the **Phomemo M220** over Bluetooth

> Libraries: `react-native-ble-plx` or `react-native-bluetooth-escpos-printer` (community)  
> iOS note: Phomemo M220 uses BLE; ensure you request Bluetooth permissions and include `NSBluetoothAlwaysUsageDescription`.

## QR Payload (signed)
```ts
// createPayload.ts
import { createHmac } from "crypto";

export function makeQrPayload({ orderId, customerId, propertyNo, balanceDueEUR, updatedISO }: {
  orderId: string, customerId: string, propertyNo: string, balanceDueEUR: number, updatedISO: string
}) {
  const body = {
    v: 1,
    type: "order_label",
    order_id: orderId,
    customer_id: customerId,
    property_no: propertyNo,
    balance_due_eur: balanceDueEUR,
    updated: updatedISO,
    ts: Math.floor(Date.now()/1000),
  };
  const canonical = JSON.stringify(body); // compact JSON
  // Sign on the **server** only:
  // const sig = createHmac("sha256", process.env.QR_SECRET!).update(canonical).digest("hex");
  // body.sig = sig;
  return `mrbl://order?${JSON.stringify(body)}`;
}
```

## TSPL Builder
```ts
// tspl.ts
export function buildTspl({ title, qr, property, balance, updated }: {
  title: string, qr: string, property: string, balance: string, updated: string
}) {
  const DPI = 203;
  const dotsPerMM = DPI / 25.4;
  const h = Math.round(70 * dotsPerMM);
  const margin = Math.round(2 * dotsPerMM);
  return [
    `! 0 200 200 ${h} 1`,
    `SIZE 70 mm,70 mm`,
    `DENSITY 10`,
    `GAP 0 mm,0 mm`,
    `CLS`,
    `TEXT ${margin},${margin},"0",0,1,1,"${title}"`,
    `QRCODE ${margin},${margin+90},L,8,A,0,"${qr.replace(/"/g, '\"')}"`,
    `TEXT ${margin},${h-margin-110},"0",0,1,1,"Property: ${property}"`,
    `TEXT ${margin},${h-margin-80},"0",0,1,1,"Balance Due: €${balance}"`,
    `TEXT ${margin},${h-margin-50},"0",0,1,1,"Updated: ${updated}"`,
    `PRINT 1`
  ].join("\n");
}
```

## Android Bluetooth (Classic SPP) — send TSPL
```ts
// androidBle.ts (pseudo; use your chosen BT library)
import { NativeModules } from "react-native";

export async function sendToPhomemo(tspl: string) {
  // Discover paired devices, pick name "M220"
  // Connect to RFCOMM channel 1, then write bytes
  // On BLE libs, use writeCharacteristicWithResponse to device service/char UUIDs
}
```

**Trigger:** call on driver **Accept Order** tap or via a **Print Label** button.
