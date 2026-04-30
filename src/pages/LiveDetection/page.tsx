import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Square, 
  Settings, 
  Activity, 
  Camera, 
  Zap, 
  Shield, 
  Cpu, 
  Target,
  BarChart3,
  Layers,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { historyApi } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import SpotlightCard from '../../components/SpotlightCard';

interface Detection {
    class: string;
    confidence: number;
    bbox: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
}

const LiveDetection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const [processedFrame, setProcessedFrame] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [detectionMode, setDetectionMode] = useState('ultralight');
    const [detectionStats, setDetectionStats] = useState({
        totalDetections: 0,
        objectsInCurrentFrame: 0,
        confidenceThreshold: 0.5
    });
    const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
    const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const lastDetectionDataRef = useRef<any>(null);
    
    const { showToast } = useToast();

    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    const getColorForClass = (className: string) => {
        const hash = className.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    };

    const drawDetections = (detections: Detection[], canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach((detection) => {
            const { bbox, class: className, confidence } = detection;
            const color = getColorForClass(className);

            const scaleX = canvas.width / videoDimensions.width;
            const scaleY = canvas.height / videoDimensions.height;

            const x1 = bbox.x1 * scaleX;
            const y1 = bbox.y1 * scaleY;
            const x2 = bbox.x2 * scaleX;
            const y2 = bbox.y2 * scaleY;

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            const label = `${className} ${(confidence * 100).toFixed(0)}%`;
            ctx.font = 'bold 12px Inter, system-ui, sans-serif';
            const labelWidth = ctx.measureText(label).width;
            
            ctx.fillStyle = color;
            ctx.fillRect(x1, y1 - 22, labelWidth + 12, 22);

            ctx.fillStyle = 'white';
            ctx.fillText(label, x1 + 6, y1 - 7);
        });
    };

    const startLiveFeed = () => {
        setIsLive(true);
        setDetectionStats(prev => ({ ...prev, totalDetections: 0, objectsInCurrentFrame: 0 }));
    };

    const stopLiveFeed = () => {
        setIsLive(false);
        saveDetectionToHistory();
    };

    const saveDetectionToHistory = async () => {
        if (!lastDetectionDataRef.current) return;
        try {
            await historyApi.createHistory({
                detection_data: lastDetectionDataRef.current,
                detection_type: 'live',
                confidence_threshold: detectionStats.confidenceThreshold,
            });
            showToast('Session saved to history.', 'success');
        } catch (error) {
            console.error('Failed to save session:', error);
            showToast('Failed to save session.', 'error');
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        
        if (isLive) {
            let wsPath = '';
            switch (detectionMode) {
                case 'coords': wsPath = 'ws/video/coords/'; break;
                case 'optimized': wsPath = 'ws/video/optimized/'; break;
                case 'ultralight': wsPath = 'ws/video/ultralight/'; break;
                default: wsPath = 'ws/video/';
            }

            const ws = new WebSocket(`ws://localhost:8000/${wsPath}`);
            socketRef.current = ws;

            ws.onopen = () => {
                const intervalId = setInterval(() => {
                    if (videoElement && canvasRef.current && ws.readyState === WebSocket.OPEN) {
                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');
                        if (context) {
                            canvas.width = 640;
                            canvas.height = 480;
                            context.drawImage(videoElement, 0, 0, 640, 480);
                            ws.send(JSON.stringify({ 
                                frame: canvas.toDataURL('image/jpeg', 0.8),
                                confidence_threshold: detectionStats.confidenceThreshold
                            }));
                        }
                    }
                }, detectionMode === 'coords' ? 100 : 200);

                ws.onclose = () => clearInterval(intervalId);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.mode === 'coordinates_only') {
                    setCurrentDetections(data.detections || []);
                    if (data.video_dimensions) setVideoDimensions(data.video_dimensions);
                    if (overlayCanvas && data.detections) drawDetections(data.detections, overlayCanvas);
                } else {
                    if (data.frame) setProcessedFrame(data.frame);
                    setCurrentDetections(data.detections || []);
                }
                
                if (data.frame_stats) {
                    setDetectionStats(prev => ({
                        ...prev,
                        totalDetections: data.frame_stats.total_frames_processed,
                        objectsInCurrentFrame: data.frame_stats.objects_in_frame
                    }));
                    lastDetectionDataRef.current = {
                        detections: data.detections || [],
                        frame_count: data.frame_stats.total_frames_processed,
                        timestamp: new Date().toISOString(),
                        confidence_threshold: data.frame_stats.confidence_threshold,
                        detection_mode: detectionMode
                    };
                }
            };

            const startVideo = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { width: 640, height: 480 } 
                    });
                    streamRef.current = stream;
                    if (videoElement) {
                        videoElement.srcObject = stream;
                        videoElement.onloadedmetadata = () => {
                            if (overlayCanvas) {
                                overlayCanvas.width = videoElement.videoWidth;
                                overlayCanvas.height = videoElement.videoHeight;
                            }
                        };
                    }
                } catch (err) {
                    showToast('Camera access denied.', 'error');
                }
            };
            startVideo();

            return () => {
                ws.close();
                streamRef.current?.getTracks().forEach(track => track.stop());
                if (videoElement) videoElement.srcObject = null;
            };
        } else {
            socketRef.current?.close();
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (videoElement) videoElement.srcObject = null;
            if (overlayCanvas) overlayCanvas.getContext('2d')?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        }
    }, [isLive, detectionStats.confidenceThreshold, detectionMode]);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white flex items-center tracking-tight">
                            <Activity className="mr-3 text-purple-500" size={32} />
                            Live AI Detection
                        </h1>
                        <p className="text-gray-500 mt-1">Real-time object recognition using YOLO architecture.</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={isLive ? stopLiveFeed : startLiveFeed} 
                            className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                                isLive 
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' 
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                            }`}
                        >
                            {isLive ? <><Square className="mr-2" size={20} /> Stop Stream</> : <><Play className="mr-2" size={20} /> Start Stream</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Controls Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <SpotlightCard className="p-6" spotlightColor="rgba(168, 85, 247, 0.15)">
                            <h2 className="text-lg font-bold mb-6 flex items-center">
                                <Settings className="mr-2 text-purple-500" size={20} />
                                Engine Config
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-400">Confidence</label>
                                        <span className="text-sm font-black text-purple-400">{(detectionStats.confidenceThreshold * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={detectionStats.confidenceThreshold}
                                        onChange={(e) => setDetectionStats(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                                        disabled={isLive}
                                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-gray-400">Model Precision</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['coords', 'ultralight', 'optimized', 'original'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setDetectionMode(mode)}
                                                disabled={isLive}
                                                className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                                                    detectionMode === mode 
                                                    ? 'bg-purple-500/10 border-purple-500 text-purple-400' 
                                                    : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="uppercase tracking-widest">{mode}</span>
                                                    {mode === 'coords' && <Zap size={12} />}
                                                    {mode === 'optimized' && <Cpu size={12} />}
                                                    {mode === 'original' && <Shield size={12} />}
                                                </div>
                                                <p className="font-medium text-[10px] opacity-60 lowercase">
                                                    {mode === 'coords' ? 'Overlay only' : mode === 'ultralight' ? 'Fast' : mode === 'optimized' ? 'Balanced' : 'Full accuracy'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>

                        {isLive && (
                            <SpotlightCard className="p-6 border border-purple-500/20" spotlightColor="rgba(168, 85, 247, 0.1)">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                                    <BarChart3 className="mr-2 text-purple-500" size={16} />
                                    Live Metrics
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-gray-800">
                                        <span className="text-xs text-gray-500">Objects</span>
                                        <span className="text-lg font-black text-purple-400">{detectionStats.objectsInCurrentFrame}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-gray-800">
                                        <span className="text-xs text-gray-500">FPS Avg</span>
                                        <span className="text-lg font-black text-white">~{detectionMode === 'coords' ? '30' : '15'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-gray-800">
                                        <span className="text-xs text-gray-500">Total Frames</span>
                                        <span className="text-lg font-black text-white">{detectionStats.totalDetections}</span>
                                    </div>
                                </div>
                            </SpotlightCard>
                        )}
                    </div>

                    {/* Video Feeds */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                        <Camera className="mr-2" size={16} /> Source Feed
                                    </h3>
                                    {isLive && <span className="flex items-center text-[10px] font-bold text-red-500 animate-pulse"><div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" /> REC</span>}
                                </div>
                                <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {detectionMode === 'coords' && <canvas ref={overlayCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />}
                                    {!isLive && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm">
                                            <div className="p-4 bg-gray-900 rounded-full mb-4">
                                                <Camera className="text-gray-700" size={32} />
                                            </div>
                                            <p className="text-gray-500 font-bold tracking-tight">Feed Inactive</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                        <Target className="mr-2" size={16} /> AI Inference
                                    </h3>
                                    {isLive && <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">Active</span>}
                                </div>
                                <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                                    {detectionMode === 'coords' ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gray-950/40 backdrop-blur-sm">
                                            <div className="p-4 bg-purple-500/10 rounded-full mb-6">
                                                <Zap className="text-purple-500" size={40} />
                                            </div>
                                            <p className="text-xl font-black text-white mb-2 uppercase tracking-tighter italic">Turbo Mode</p>
                                            <p className="text-gray-500 text-sm max-w-xs">Bypassing frame transmission. Detections are rendered directly on the source feed.</p>
                                        </div>
                                    ) : (
                                        processedFrame && isLive ? (
                                            <img src={processedFrame} alt="Result" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm">
                                                {isLive ? (
                                                    <>
                                                        <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
                                                        <p className="text-gray-500 font-bold tracking-tight">Wait for inference...</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-4 bg-gray-900 rounded-full mb-4">
                                                            <Target className="text-gray-700" size={32} />
                                                        </div>
                                                        <p className="text-gray-500 font-bold tracking-tight">AI Offline</p>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detection Chips */}
                        {isLive && currentDetections.length > 0 && (
                            <SpotlightCard className="p-6" spotlightColor="rgba(168, 85, 247, 0.1)">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                                    <Layers className="mr-2" size={14} /> Buffer Classes
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {currentDetections.map((d, i) => (
                                        <div 
                                            key={i}
                                            className="px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center border"
                                            style={{ 
                                                backgroundColor: getColorForClass(d.class) + '15', 
                                                color: getColorForClass(d.class),
                                                borderColor: getColorForClass(d.class) + '30'
                                            }}
                                        >
                                            <Target size={12} className="mr-2" />
                                            {d.class} <span className="ml-2 opacity-60">{(d.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </SpotlightCard>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SpotlightCard className="p-6" spotlightColor="rgba(59, 130, 246, 0.1)">
                                <h4 className="font-bold text-white mb-3 flex items-center text-sm">
                                    <Info className="mr-2 text-blue-500" size={16} /> Mode Info
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Current engine: <span className="text-white font-bold">{detectionMode}</span>. 
                                    {detectionMode === 'coords' && " Optimizing for low-latency by processing only coordinate deltas. Recommended for mobile or weak connections."}
                                    {detectionMode === 'ultralight' && " Using quantized weights for faster inference at slight cost of precision."}
                                    {detectionMode === 'optimized' && " Standard balance between performance and detection accuracy."}
                                    {detectionMode === 'original' && " Maximum precision with full YOLO processing. Highest CPU/GPU usage."}
                                </p>
                            </SpotlightCard>
                            <SpotlightCard className="p-6" spotlightColor="rgba(16, 185, 129, 0.1)">
                                <h4 className="font-bold text-white mb-3 flex items-center text-sm">
                                    <Shield className="mr-2 text-emerald-500" size={16} /> Data Safety
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    All detection data is processed securely. Sessions are automatically indexed and saved to your history for future review and model retraining insights.
                                </p>
                            </SpotlightCard>
                        </div>
                    </div>
                </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default LiveDetection;
