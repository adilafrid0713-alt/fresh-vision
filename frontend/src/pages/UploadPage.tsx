import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, AlertCircle, Scan, ArrowRight, X, Layers, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useInspectionStore } from '../store/inspectionStore';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUpload, setIsUploading, setIsProcessing, setProcessingStage, selectedFoodTypeHint } = useInspectionStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activePreviewFilter, setActivePreviewFilter] = useState<'rgb' | 'uv' | 'nir'>('rgb');

  // Curated industrial sample food images for instant executive testing
  const sampleImages = [
    {
      name: 'Fuji Apple (Fresh, Grade A)',
      url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
      type: 'Apple',
      expectedGrade: 'A'
    },
    {
      name: 'Roma Tomato (Slight Bruise, Grade B)',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      type: 'Tomato',
      expectedGrade: 'B'
    },
    {
      name: 'Cavendish Banana (Overripe, Grade C)',
      url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
      type: 'Banana',
      expectedGrade: 'C'
    },
    {
      name: 'Navel Orange (Rot Defect, Reject)',
      url: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80',
      type: 'Orange',
      expectedGrade: 'Reject'
    },
    {
      name: 'Assorted Produce Basket (5 Items, Good & Bad)',
      url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
      type: 'Mixed Multi-Item Batch',
      expectedGrade: 'Multi'
    }
  ];

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      setError('Invalid file format or file exceeds 15MB size limit. Please upload JPEG, PNG, or WEBP.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileData(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 15 * 1024 * 1024, // 15MB
    multiple: false,
  });

  const handleSampleSelect = async (sample: typeof sampleImages[0]) => {
    setError(null);
    setPreview(sample.url);
    
    // Convert sample URL to fake File object for processing
    try {
      const response = await fetch(sample.url);
      if (!response.ok) throw new Error('Network fetch failed');
      const blob = await response.blob();
      const fname = sample.type === 'Mixed Multi-Item Batch' ? 'mixed_multi_item_batch.jpg' : `${sample.type.toLowerCase()}_sample.jpg`;
      const file = new File([blob], fname, { type: 'image/jpeg' });
      setFileData(file);
    } catch (err) {
      // Generate a valid JPEG synthetic canvas image so offline backend vision OpenCV processing always succeeds
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 500, 500);
        if (sample.type === 'Mixed Multi-Item Batch') {
          // Draw multiple colorful circles representing fruits in a tray
          ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(150, 150, 60, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.arc(350, 150, 55, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(250, 300, 65, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(150, 380, 50, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#451a03'; ctx.beginPath(); ctx.arc(160, 370, 20, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(350, 380, 58, 0, Math.PI * 2); ctx.fill();
        } else {
          const baseColor = sample.type === 'Banana' ? '#facc15' : sample.type === 'Tomato' ? '#ef4444' : sample.type === 'Orange' ? '#f97316' : '#84cc16';
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          ctx.arc(250, 250, 180, 0, Math.PI * 2);
          ctx.fill();
          if (sample.expectedGrade === 'Reject' || sample.expectedGrade === 'C') {
            ctx.fillStyle = sample.expectedGrade === 'Reject' ? '#451a03' : '#854d0e';
            ctx.beginPath();
            ctx.arc(280, 220, sample.expectedGrade === 'Reject' ? 65 : 35, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      canvas.toBlob((blob) => {
        if (blob) {
          const fname = sample.type === 'Mixed Multi-Item Batch' ? 'mixed_multi_item_batch.jpg' : `${sample.type.toLowerCase()}_offline_sample.jpg`;
          const file = new File([blob], fname, { type: 'image/jpeg' });
          setFileData(file);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleStartInspection = () => {
    if (!preview) return;

    setIsUploading(true);
    setTimeout(() => {
      setUpload({
        file_id: `UPLOAD-${Date.now()}`,
        url: preview,
        filename: fileData?.name || 'industrial_produce_capture.jpg',
        size_bytes: fileData?.size || 142050,
      });
      setIsUploading(false);
      setIsProcessing(true);
      setProcessingStage(0);
      navigate('/processing');
    }, 400);
  };

  const triggerCameraSimulation = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      setIsCameraActive(false);
      // Select the Apple sample as simulated camera capture
      handleSampleSelect(sampleImages[0]);
    }, 1500);
  };

  const getFilterStyle = () => {
    switch (activePreviewFilter) {
      case 'uv':
        return 'filter hue-rotate-[140deg] contrast-200 brightness-90 saturate-[3]';
      case 'nir':
        return 'filter invert-[0.15] contrast-150 saturate-[1.8] sepia-[0.3] hue-rotate-[280deg]';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge label="AUTONOMOUS VISION INGESTION v2.4" variant="premium" glow pulse />
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-100 tracking-tight font-sans">
          AI Quality Inspection <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Ingestion Portal</span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Ingest optical captures via high-speed conveyor camera feed or drag-and-drop. All captures undergo sub-50ms multi-spectral defect segmentation and wholesale valuation indexing.
        </p>
      </div>

      {/* Main Upload / Preview Area */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Dropzone Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-3 border-2 border-dashed border-slate-700/80 bg-slate-900/60 backdrop-blur-2xl">
            {!preview ? (
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center p-14 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isDragActive
                    ? 'bg-emerald-500/15 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[0.99]'
                    : 'hover:bg-slate-800/60 hover:border-emerald-500/40 group'
                }`}
              >
                <input {...getInputProps()} />
                <div className="p-5 rounded-2xl bg-slate-800/90 text-emerald-400 mb-5 shadow-xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all border border-white/10">
                  <Upload className={`h-10 w-10 ${isDragActive ? 'animate-bounce' : ''}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-100 text-center tracking-tight">
                  {isDragActive ? 'Drop image for instant AI inference...' : 'Drag & drop produce photograph here'}
                </h3>
                <p className="text-xs text-slate-400 text-center mt-2 font-mono">
                  Supports JPEG, PNG, WEBP up to 15MB • Auto-scaled to 1024px tensor matrix
                </p>
                <button
                  type="button"
                  className="mt-7 px-6 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-emerald-300 transition-all shadow-md group-hover:border-emerald-500/30"
                >
                  Browse Filesystem Directory
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-emerald-500/40 shadow-2xl group">
                  {/* Scanning laser animation */}
                  <div className="animate-laser z-20" />

                  <img src={preview} alt="Selected produce for inspection" className={`w-full h-full object-contain transition-all duration-500 ${getFilterStyle()}`} />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-30">
                    <button
                      onClick={() => { setPreview(null); setFileData(null); }}
                      className="px-4 py-2.5 rounded-xl bg-red-600/90 text-white shadow-xl hover:bg-red-500 font-bold text-xs flex items-center gap-2 transition-transform hover:scale-105"
                      title="Remove Image"
                    >
                      <X className="h-4 w-4" />
                      <span>Discard Capture</span>
                    </button>
                  </div>

                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 font-mono text-[10px] text-emerald-400 font-bold shadow">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>OPTICAL MATRIX ARMED</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono z-20 shadow-lg">
                    <span className="text-slate-200 truncate max-w-[240px] font-bold">
                      {fileData?.name || 'sample_image.jpg'}
                    </span>
                    <span className="text-emerald-400 font-extrabold tracking-wider">READY FOR INFERENCE</span>
                  </div>
                </div>

                {/* Filter preview selector */}
                <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 font-mono text-xs">
                  <span className="text-slate-400">PREVIEW SPECTRUM:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setActivePreviewFilter('rgb')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${activePreviewFilter === 'rgb' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      RGB
                    </button>
                    <button
                      onClick={() => setActivePreviewFilter('uv')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${activePreviewFilter === 'uv' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      UV ROT
                    </button>
                    <button
                      onClick={() => setActivePreviewFilter('nir')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${activePreviewFilter === 'nir' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      NIR BRIX
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Camera Capture Simulation Button */}
          <div className="flex justify-center">
            <button
              onClick={triggerCameraSimulation}
              disabled={isCameraActive}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/90 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold hover:bg-blue-950/60 hover:border-blue-400 transition-all shadow-lg shadow-blue-950/30 disabled:opacity-50 cursor-pointer"
            >
              <Camera className={`h-4 w-4 ${isCameraActive ? 'animate-ping text-blue-400' : ''}`} />
              <span>{isCameraActive ? 'SYNCHRONIZING WITH LINE CAMERA #04...' : 'SIMULATE LIVE CONVEYOR CAMERA CAPTURE'}</span>
            </button>
          </div>

          {/* Error Callout */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/90 border border-red-500/40 text-red-300 text-xs shadow-lg animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}
        </div>

        {/* Right Side: Quick Testing & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Quick Test Sample Library" subtitle="Select pre-loaded industrial produce for instant demo" glow={!!preview}>
            <div className="grid gap-3">
              {sampleImages.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSampleSelect(sample)}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                    preview === sample.url
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-950/60 scale-[1.01]'
                      : 'bg-slate-900/70 border-white/10 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/15 relative">
                    <img src={sample.url} alt={sample.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    {preview === sample.url && (
                      <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-300 drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">{sample.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">Target Crop: <span className="text-slate-200 font-bold">{sample.type}</span></div>
                  </div>
                  <Badge 
                    label={sample.expectedGrade === 'Multi' ? 'Multi-Item' : `Gr. ${sample.expectedGrade}`} 
                    variant={sample.expectedGrade === 'A' ? 'success' : sample.expectedGrade === 'B' || sample.expectedGrade === 'Multi' ? 'info' : sample.expectedGrade === 'C' ? 'warning' : 'danger'}
                    size="sm"
                    glow={preview === sample.url}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Action Card */}
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/60 border-emerald-500/40 shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between font-mono text-xs text-slate-300 border-b border-white/10 pb-3">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <span>TARGET TENSOR:</span>
                </span>
                <span className="text-emerald-400 font-extrabold bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">{selectedFoodTypeHint}</span>
              </div>

              <button
                onClick={handleStartInspection}
                disabled={!preview}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 transition-all shadow-2xl ${
                  preview
                    ? 'glass-button-primary cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed'
                }`}
              >
                <Scan className="h-5 w-5 animate-pulse" />
                <span>Execute AI Vision Inspection</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                Runs 12-stage automated vision pipeline (CLAHE, Chromatic CV, HSV Rot &amp; Spot Indexing)
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

