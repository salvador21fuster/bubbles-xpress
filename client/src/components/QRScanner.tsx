import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, MapPin, FileSignature, Upload, X, Video, VideoOff } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  scanType: 'pickup' | 'handoff.to_shop' | 'handoff.to_processing' | 'intake' | 'qc' | 'pack' | 'handoff.to_driver' | 'delivery';
  orderId?: string;
  onScanComplete?: (scan: any) => void;
  onCancel?: () => void;
}

export function QRScanner({ scanType, orderId, onScanComplete, onCancel }: QRScannerProps) {
  const { toast } = useToast();
  const [qrPayload, setQrPayload] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = useRef('qr-reader-' + Math.random().toString(36).substr(2, 9)).current;

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get your location. Scan will proceed without GPS data.',
          });
        }
      );
    }
  }, [toast]);

  const handleQRInput = async (payload: string) => {
    setQrPayload(payload);
    
    try {
      const response: any = await apiRequest('POST', '/api/qr/parse', { payload });
      setParsedData(response);
      toast({
        title: 'QR Code Recognized',
        description: `Scanned ${response.type}: ${response.id.slice(0, 8)}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Invalid QR Code',
        description: error.message || 'Could not parse QR code',
      });
      setParsedData(null);
    }
  };

  // Start camera scanner
  const startScanner = () => {
    setIsScanning(true);
  };

  // Initialize Html5Qrcode after element is rendered
  useEffect(() => {
    if (!isScanning) return;

    const initScanner = async () => {
      try {
        const qrScanner = new Html5Qrcode(scannerElementId);
        qrScannerRef.current = qrScanner;

        await qrScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Stop scanner on successful scan
            stopScanner();
            handleQRInput(decodedText);
          },
          (errorMessage) => {
            // Silent error handling - normal scanning behavior
          }
        );
      } catch (error) {
        console.error('Scanner error:', error);
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description: 'Could not access camera. Please enter QR code manually.',
        });
        setIsScanning(false);
      }
    };

    initScanner();
  }, [isScanning]);

  // Stop camera scanner
  const stopScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!parsedData) {
      toast({
        variant: 'destructive',
        title: 'No QR Code',
        description: 'Please scan a QR code first',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const scanData: any = {
        type: scanType,
        notes,
      };

      // Add entity IDs based on what was scanned
      if (parsedData.type === 'order') {
        scanData.order_id = parsedData.id;
      } else if (parsedData.type === 'bag') {
        scanData.bag_id = parsedData.id;
      } else if (parsedData.type === 'item') {
        scanData.item_id = parsedData.id;
      }

      // Add location if available (backend expects geo.lat and geo.lng)
      if (location) {
        scanData.geo = {
          lat: location.latitude,
          lng: location.longitude,
        };
      }

      // Add signature if provided
      if (signature) {
        scanData.signature = signature;
      }

      // Add photo as base64 if provided (in real app, upload to S3 first)
      if (photoPreview) {
        scanData.photo_url = photoPreview; // In production: upload to storage and use URL
      }

      const result = await apiRequest('POST', '/api/scan', scanData);
      
      toast({
        title: 'Scan Recorded',
        description: `${scanType} scan completed successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/driver/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customer/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });

      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message || 'Could not record scan',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Scan QR Code - {scanType.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Scanner */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>QR Code Scanner</Label>
            {!isScanning ? (
              <Button
                type="button"
                onClick={startScanner}
                variant="default"
                size="sm"
                data-testid="button-start-camera"
              >
                <Video className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button
                type="button"
                onClick={stopScanner}
                variant="destructive"
                size="sm"
                data-testid="button-stop-camera"
              >
                <VideoOff className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            )}
          </div>

          {/* Camera View */}
          {isScanning && (
            <div className="border-2 border-primary rounded-lg overflow-hidden">
              <div id={scannerElementId} />
            </div>
          )}

          {/* Manual Entry */}
          {!isScanning && (
            <>
              <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click "Start Camera" or enter QR code manually
                </p>
              </div>
              <Input
                id="qr-input"
                data-testid="input-qr-payload"
                placeholder="Manual entry: mrbl://..."
                value={qrPayload}
                onChange={(e) => handleQRInput(e.target.value)}
              />
            </>
          )}

          {parsedData && (
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✓ {parsedData.type.toUpperCase()}: {parsedData.id.slice(0, 16)}...
              </p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {location ? (
            <p className="text-sm">
              Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Getting location...</p>
          )}
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photo Evidence (Optional)</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Scan evidence"
                className="w-full h-48 object-cover rounded-md"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                data-testid="button-remove-photo"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-take-photo"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          )}
        </div>

        {/* Signature */}
        {(scanType === 'pickup' || scanType === 'delivery' || scanType.includes('handoff')) && (
          <div className="space-y-2">
            <Label htmlFor="signature">Signature (Optional)</Label>
            <Input
              id="signature"
              data-testid="input-signature"
              placeholder="Type recipient name"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            data-testid="input-scan-notes"
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              data-testid="button-cancel-scan"
            >
              Cancel
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!parsedData || isProcessing}
            data-testid="button-submit-scan"
          >
            {isProcessing ? 'Recording...' : 'Record Scan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
