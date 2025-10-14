// Order label component for printing 70x70mm labels
// Based on Mr Bubbles Express label specification

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Printer, Loader2 } from 'lucide-react';

interface OrderLabelProps {
  orderId: string;
  customerId: string;
  propertyNo: string;
  balanceDue: number;
  updatedDate: string;
  open: boolean;
  onClose: () => void;
}

interface LabelQRData {
  qrPayload: string;
  orderId: string;
  customerId: string;
  propertyNo: string;
  balanceDue: number;
  updatedDate: string;
}

export function OrderLabel({
  orderId,
  customerId,
  propertyNo,
  balanceDue,
  updatedDate,
  open,
  onClose,
}: OrderLabelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Fetch signed QR payload from server
  const { data: labelData, isLoading: isLoadingLabel } = useQuery<LabelQRData>({
    queryKey: ['/api/orders', orderId, 'label-qr'],
    enabled: open && !!orderId,
  });

  // Label specifications (70x70mm at 203 DPI)
  const DPI = 203;
  const MM_TO_INCHES = 1 / 25.4;
  const LABEL_SIZE_MM = 70;
  const LABEL_SIZE_PX = Math.round(LABEL_SIZE_MM * MM_TO_INCHES * DPI); // ~559 pixels
  const MARGIN_PX = 16;

  useEffect(() => {
    if (!open || !canvasRef.current || !labelData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = LABEL_SIZE_PX;
    canvas.height = LABEL_SIZE_PX;

    // Use server-generated signed QR payload
    const qrData = labelData.qrPayload;

    // Generate QR code
    QRCode.toDataURL(qrData, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }).then((url) => {
      setQrDataUrl(url);

      // Clear canvas with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, LABEL_SIZE_PX, LABEL_SIZE_PX);

      // Draw title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Mr Bubbles Express', LABEL_SIZE_PX / 2, MARGIN_PX + 28);

      // Draw QR code
      const qrImage = new Image();
      qrImage.onload = () => {
        const qrSize = 320;
        const qrX = (LABEL_SIZE_PX - qrSize) / 2;
        const qrY = 60;
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        // Draw text information (use server data)
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'left';
        const textY = qrY + qrSize + 30;

        ctx.fillText(`Property: ${labelData.propertyNo}`, MARGIN_PX, textY);
        ctx.fillText(`Balance Due: €${labelData.balanceDue.toFixed(2)}`, MARGIN_PX, textY + 30);
        ctx.fillText(`Updated: ${labelData.updatedDate}`, MARGIN_PX, textY + 60);
      };
      qrImage.src = url;
    });
  }, [open, orderId, labelData]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Open print dialog with the canvas image
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - Order ${orderId}</title>
          <style>
            @page { size: 70mm 70mm; margin: 0; }
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; }
            img { width: 70mm; height: 70mm; }
          </style>
        </head>
        <body>
          <img src="${canvas.toDataURL()}" />
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-label-${orderId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Label</DialogTitle>
          <DialogDescription>
            Print or download the label for order {orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Label Preview */}
          <div className="flex justify-center p-4 bg-muted rounded-lg">
            {isLoadingLabel ? (
              <div className="flex items-center justify-center" style={{ width: '280px', height: '280px' }}>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="border-2 border-border rounded"
                style={{ width: '280px', height: '280px' }}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              className="flex-1"
              data-testid="button-print-label"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Label
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1"
              data-testid="button-download-label"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground text-center">
            <p>Label size: 70mm × 70mm (203 DPI)</p>
            <p className="mt-1">Compatible with Phomemo M220 thermal printer</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
