import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Check, Download } from 'lucide-react';
import QRCode from 'qrcode';
import type { Order } from '@shared/schema';

interface QRLabelPrinterProps {
  order: Order;
  onPrintComplete: () => void;
}

export function QRLabelPrinter({ order, onPrintComplete }: QRLabelPrinterProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPrinted, setIsPrinted] = useState(false);

  const generateQRLabel = async () => {
    try {
      setIsPrinting(true);
      
      // Generate QR code with order deep link
      const qrPayload = `mrbl://o/${order.id}`;
      const qrUrl = await QRCode.toDataURL(qrPayload, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      
      setQrDataUrl(qrUrl);
      
      // Simulate printing delay
      setTimeout(() => {
        setIsPrinting(false);
        setIsPrinted(true);
        onPrintComplete();
      }, 2000);
    } catch (error) {
      console.error('Failed to generate label:', error);
      setIsPrinting(false);
    }
  };

  const downloadLabel = () => {
    const labelContent = document.getElementById('label-preview');
    if (!labelContent) return;

    // For now, just download the QR code
    // In production, this would generate a full PDF label
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `mr-bubbles-label-${order.id}.png`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Print Collection Label
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPrinted ? (
          <>
            <div className="text-sm text-muted-foreground">
              Print a label to attach to the customer's laundry bag. The label includes a QR code for tracking.
            </div>
            
            <Button 
              onClick={generateQRLabel}
              disabled={isPrinting}
              className="w-full"
              size="lg"
              data-testid="button-print-label"
            >
              {isPrinting ? (
                <>
                  <Printer className="h-4 w-4 mr-2 animate-pulse" />
                  Printing Label...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* Label Preview */}
            <div 
              id="label-preview"
              className="border-2 border-dashed rounded-lg p-6 bg-white dark:bg-gray-900 text-black dark:text-white"
            >
              {/* Mr Bubbles Logo */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-primary mb-1">🫧 Mr Bubbles Express</h2>
                <p className="text-xs text-muted-foreground">Premium Laundry Service</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {qrDataUrl && (
                  <img 
                    src={qrDataUrl} 
                    alt="Order QR Code" 
                    className="w-40 h-40 border-4 border-primary rounded-lg"
                  />
                )}
              </div>

              {/* Order Details */}
              <div className="space-y-2 border-t pt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Order ID:</div>
                  <div className="font-mono">#{order.id.slice(0, 8)}</div>
                  
                  <div className="font-medium">Customer:</div>
                  <div>{order.customerFullName}</div>
                  
                  <div className="font-medium">Pickup Address:</div>
                  <div className="col-span-2 text-xs">
                    {order.addressLine1}<br />
                    {order.addressLine2 && <>{order.addressLine2}<br /></>}
                    {order.city}
                  </div>
                  
                  <div className="font-medium">Date:</div>
                  <div>{order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : 'N/A'}</div>
                  
                  <div className="font-medium">Time:</div>
                  <div>{order.timeWindow}</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  Scan QR code at pickup and delivery
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={downloadLabel}
                className="flex-1"
                data-testid="button-download-label"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button 
                variant="default"
                onClick={onPrintComplete}
                className="flex-1"
                data-testid="button-confirm-print"
              >
                <Check className="h-4 w-4 mr-2" />
                Label Printed
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Label ready! Attach to laundry bag before pickup.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
