import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, ShieldCheck, CheckCircle2, SwitchCamera, X } from 'lucide-react';
import { analyzeFoodImageWithGemini } from '../../services/geminiService';
import { useInspectionStore } from '../../store/inspectionStore';
import { useToastStore } from '../../store/toastStore';
import type { InspectionRecord } from '../../types';
import { Button } from '../ui/Button';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectionComplete?: (record: InspectionRecord) => void;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({ isOpen, onClose, onInspectionComplete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastRecord, setLastRecord] = useState<InspectionRecord | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { activeBatchNo, selectedFoodTypeHint, addRecentInspection, setActiveInspection } = useInspectionStore();
  const { addToast } = useToastStore();
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, capturedImage, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Webcam permission error:', err);
      setCameraError('Unable to access optical camera. Please ensure webcam permissions are enabled.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(base64Image);
    stopCamera();

    setIsAnalyzing(true);
    addToast({
      type: 'info',
      title: 'Analyzing Frame',
      message: 'Running multi-spectral inference via Gemini Vision AI...',
    });

    try {
      const result = await analyzeFoodImageWithGemini(base64Image, activeBatchNo, selectedFoodTypeHint);

      const record: InspectionRecord = {
        id: crypto.randomUUID(),
        batch_id: activeBatchNo,
        food_type: selectedFoodTypeHint,
        metrics: result.metrics,
        defects: result.defects,
        detected_items: result.detected_items,
        timestamp: new Date().toISOString(),
        raw_image_url: base64Image,
        processing_time_ms: 450,
      };

      setLastRecord(record);
      setActiveInspection(record);
      addRecentInspection(record);

      addToast({
        type: 'success',
        title: 'Inference Complete',
        message: `Analysis successful. Final Grade: ${record.metrics.quality_grade}`,
      });

      if (onInspectionComplete) onInspectionComplete(record);
    } catch (err: any) {
      console.error('Live camera inspection error:', err);
      addToast({
        type: 'error',
        title: 'Inspection Failed',
        message: err.message || 'Failed to process optical frame',
      });
    } finally {
      setIsCapturing(false);
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setLastRecord(null);
    startCamera();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-card border shadow-xl rounded-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground font-mono">
                  LIVE OPTICAL CAMERA INSPECTOR
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Batch: {activeBatchNo} • Target: {selectedFoodTypeHint}
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

          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Viewport */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden shrink-0">
              <canvas ref={canvasRef} className="hidden" />

              {!capturedImage ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                    <div className="mb-4">
                      <span className="bg-background/80 text-foreground text-xs px-3 py-1 rounded-full border shadow-sm backdrop-blur-sm font-medium tracking-wide">
                        LIVE STREAM • READY
                      </span>
                    </div>
                {/* Center Target Box */}
                <div className="w-64 h-64 border border-primary/50 rounded-xl relative">
                  <span className="absolute -top-px -left-px h-6 w-6 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                  <span className="absolute -top-px -right-px h-6 w-6 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                  <span className="absolute -bottom-px -left-px h-6 w-6 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                  <span className="absolute -bottom-px -right-px h-6 w-6 border-b-2 border-r-2 border-primary rounded-br-xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-1 w-1 rounded-full bg-primary/50" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <img src={capturedImage} alt="Captured frame" className="w-full h-full object-cover" />
              {lastRecord && lastRecord.defects && (
                <div className="absolute inset-0 pointer-events-none">
                  {lastRecord.defects.map((d, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-destructive bg-destructive/20 rounded shadow-sm"
                      style={{
                        left: `${(d.bbox[0] / 500) * 100}%`,
                        top: `${(d.bbox[1] / 500) * 100}%`,
                        width: `${((d.bbox[2] - d.bbox[0]) / 500) * 100}%`,
                        height: `${((d.bbox[3] - d.bbox[1]) / 500) * 100}%`,
                      }}
                    >
                      <span className="absolute -top-6 left-0 bg-background text-destructive border border-destructive text-[10px] font-medium px-1.5 py-0.5 rounded shadow">
                        {d.defect_type} ({(d.severity * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-destructive text-sm font-medium mb-4">{cameraError}</p>
              <Button onClick={startCamera} variant="secondary">
                Retry Camera Access
              </Button>
            </div>
          )}
        </div>

        {/* Telemetry Banner */}
        {lastRecord && (
          <div className="p-4 bg-muted/30 border-t flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="px-2 py-1 rounded bg-primary/10 text-primary font-semibold">
                GRADE: {lastRecord.metrics.quality_grade}
              </div>
              <div className="text-muted-foreground">
                FRESHNESS: <span className="text-foreground font-semibold">{lastRecord.metrics.freshness_score}%</span>
              </div>
              <div className="text-muted-foreground">
                DEFECT AREA: <span className="text-foreground font-semibold">{lastRecord.metrics.damage_percentage}%</span>
              </div>
            </div>
            <div className="text-muted-foreground text-[11px] max-w-[200px] truncate" title={lastRecord.metrics.recommendation}>
              {lastRecord.metrics.recommendation}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="p-4 bg-card border-t grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          {!capturedImage ? (
            <>
              <div className="flex items-center justify-center sm:justify-start">
                <span className="text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Sensor: {facingMode === 'environment' ? 'Rear' : 'Front'}
                </span>
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleCaptureAndAnalyze}
                  disabled={isCapturing || !!cameraError}
                  className="w-full sm:w-auto gap-2"
                >
                  <Camera className="h-4 w-4" /> Capture Frame
                </Button>
              </div>

              <div className="flex items-center justify-center sm:justify-end">
                <Button
                  onClick={toggleCamera}
                  variant="outline"
                  className="gap-2"
                >
                  <SwitchCamera className="h-4 w-4" /> Switch
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center sm:justify-start">
                <Button
                  onClick={handleRetake}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Retake
                </Button>
              </div>
              
              <div className="flex justify-center sm:col-span-2 sm:justify-end">
                <Button
                  onClick={onClose}
                  className="w-full sm:w-auto gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Save to Batch Logs
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      </motion.div>
    </div>
    </AnimatePresence>,
    document.body
  );
};
