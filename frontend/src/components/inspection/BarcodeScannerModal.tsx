import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, X, CheckCircle2, PackageCheck } from 'lucide-react';
import { useInspectionStore } from '../../store/inspectionStore';
import { useToastStore } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose }) => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scannedMetadata, setScannedMetadata] = useState<any | null>(null);
  const { setActiveBatchNo, setSelectedFoodTypeHint } = useInspectionStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5QrcodeScanner(
      'qr-code-scanner-element',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        setScannedResult(decodedText);
        handleScannedCode(decodedText);
        scanner.clear();
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isOpen]);

  const handleScannedCode = (code: string) => {
    const mockBatch = `BAT-2026-${code.replace(/\D/g, '').substring(0, 4) || '9821'}-QR`;
    let crop = 'Apple';
    if (code.toLowerCase().includes('ban') || code.includes('02')) crop = 'Banana';
    if (code.toLowerCase().includes('tom') || code.includes('03')) crop = 'Tomato';
    if (code.toLowerCase().includes('man') || code.includes('04')) crop = 'Mango';

    const meta = {
      batchId: mockBatch,
      productName: `${crop} Export Grade A`,
      cropType: crop,
      manufacturer: 'AgriCorp Global Supply Ltd',
      origin: 'Kochi Port Terminal, IN',
      scanTimestamp: new Date().toLocaleString(),
    };

    setScannedMetadata(meta);
    setActiveBatchNo(mockBatch);
    setSelectedFoodTypeHint(crop);

    addToast({
      type: 'success',
      title: 'Barcode / QR Scanned',
      message: `Batch ID: ${mockBatch} | Crop: ${crop} auto-populated into system telemetry.`,
    });
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] bg-card border shadow-xl rounded-xl overflow-hidden flex flex-col"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <QrCode className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground font-mono">
                  BARCODE & QR CODE SCANNER
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Auto-populate Batch ID, Crop & Line Metadata
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
             aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scanner Container */}
          <div className="p-6 bg-background flex flex-col items-center justify-center min-h-[300px]">
            {!scannedMetadata ? (
              <div id="qr-code-scanner-element" className="w-full rounded-2xl overflow-hidden text-foreground" />
            ) : (
              <div className="w-full bg-card border border-cyan-500/40 rounded-2xl p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" /> BARCODE DECODED SUCCESSFULLY
                </div>

                <div className="space-y-2 bg-background p-4 rounded-xl border border-border text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Raw Code:</span>
                    <span className="font-bold text-foreground">{scannedResult}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto Batch ID:</span>
                    <span className="font-bold text-primary">{scannedMetadata.batchId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crop Type:</span>
                    <span className="font-bold text-blue-400">{scannedMetadata.cropType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span className="text-foreground">{scannedMetadata.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scan Time:</span>
                    <span className="text-muted-foreground">{scannedMetadata.scanTimestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => setScannedMetadata(null)}
                  className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold transition-colors"
                >
                  Scan Another Code
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-card border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-primary" /> GS1-128 • EAN-13 • QR Compliant
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
             aria-label="Close">
              Done
            </button>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
