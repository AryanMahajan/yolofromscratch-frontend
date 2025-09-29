import React, { useRef, useEffect, useState } from 'react';
import { historyApi } from '../../lib/api';
import { useToast } from '../../hooks/useToast';

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

    // Color palette for different classes
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

        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach((detection) => {
            const { bbox, class: className, confidence } = detection;
            const color = getColorForClass(className);

            // Scale coordinates to canvas size
            const scaleX = canvas.width / videoDimensions.width;
            const scaleY = canvas.height / videoDimensions.height;

            const x1 = bbox.x1 * scaleX;
            const y1 = bbox.y1 * scaleY;
            const x2 = bbox.x2 * scaleX;
            const y2 = bbox.y2 * scaleY;

            const width = x2 - x1;
            const height = y2 - y1;

            // Draw bounding box
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, width, height);

            // Draw label background
            const label = `${className} ${(confidence * 100).toFixed(0)}%`;
            ctx.font = '14px Arial';
            const labelWidth = ctx.measureText(label).width;
            const labelHeight = 20;

            ctx.fillStyle = color;
            ctx.fillRect(x1, y1 - labelHeight, labelWidth + 10, labelHeight);

            // Draw label text
            ctx.fillStyle = 'white';
            ctx.fillText(label, x1 + 5, y1 - 5);
        });
    };

    const startLiveFeed = () => {
        setIsLive(true);
        setDetectionStats(prev => ({ ...prev, totalDetections: 0, objectsInCurrentFrame: 0 }));
    };

    const stopLiveFeed = () => {
        setIsLive(false);
        // Save the last detection to history when stopping
        saveDetectionToHistory();
    };

    const saveDetectionToHistory = async () => {
        if (!lastDetectionDataRef.current) {
            return;
        }

        try {
            await historyApi.createHistory({
                detection_data: lastDetectionDataRef.current,
                detection_type: 'live',
                confidence_threshold: detectionStats.confidenceThreshold,
            });
            
            showToast('Detection session saved to history', 'success');
        } catch (error) {
            console.error('Failed to save detection to history:', error);
            showToast('Failed to save detection to history', 'error');
        }
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        
        if (isLive) {
            // Determine WebSocket path based on detection mode
            let wsPath = '';
            switch (detectionMode) {
                case 'coords':
                    wsPath = 'ws/video/coords/';
                    break;
                case 'optimized':
                    wsPath = 'ws/video/optimized/';
                    break;
                case 'ultralight':
                    wsPath = 'ws/video/ultralight/';
                    break;
                default:
                    wsPath = 'ws/video/';
            }

            const ws = new WebSocket(`ws://localhost:8000/${wsPath}`);
            socketRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                const sendFrame = () => {
                    if (videoElement && canvasRef.current && ws.readyState === WebSocket.OPEN) {
                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');

                        if (context) {
                            canvas.width = 640;
                            canvas.height = 480;
                            context.drawImage(videoElement, 0, 0, 640, 480);
                            const data = canvas.toDataURL('image/jpeg');
                            ws.send(JSON.stringify({ 
                                frame: data,
                                confidence_threshold: detectionStats.confidenceThreshold
                            }));
                        }
                    }
                };

                const intervalId = setInterval(sendFrame, detectionMode === 'coords' ? 100 : 200); // Faster for coords mode

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    clearInterval(intervalId);
                };
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                // Handle different response formats
                if (data.mode === 'coordinates_only') {
                    // Coordinates-only mode - draw on overlay canvas
                    setCurrentDetections(data.detections || []);
                    
                    if (data.video_dimensions) {
                        setVideoDimensions(data.video_dimensions);
                    }

                    // Draw detections on overlay canvas
                    if (overlayCanvas && data.detections) {
                        drawDetections(data.detections, overlayCanvas);
                    }
                } else {
                    // Normal mode with processed frame
                    if (data.frame) {
                        setProcessedFrame(data.frame);
                    }
                    setCurrentDetections(data.detections || []);
                }
                
                // Update detection stats
                if (data.frame_stats) {
                    setDetectionStats(prev => ({
                        ...prev,
                        totalDetections: data.frame_stats.total_frames_processed,
                        objectsInCurrentFrame: data.frame_stats.objects_in_frame
                    }));

                    // Store the latest detection data for history saving
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
                        video: { 
                            width: 640, 
                            height: 480 
                        } 
                    });
                    streamRef.current = stream;
                    if (videoElement) {
                        videoElement.srcObject = stream;
                        
                        // Set up overlay canvas to match video dimensions
                        videoElement.onloadedmetadata = () => {
                            if (overlayCanvas) {
                                overlayCanvas.width = videoElement.videoWidth;
                                overlayCanvas.height = videoElement.videoHeight;
                            }
                        };
                    }
                } catch (err) {
                    console.error("Error accessing webcam: ", err);
                    showToast('Error accessing webcam. Please check permissions.', 'error');
                }
            };

            startVideo();

            return () => {
                if (ws) {
                    ws.close();
                }
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                if (videoElement) {
                    videoElement.srcObject = null;
                }
            };
        } else {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoElement) {
                videoElement.srcObject = null;
            }
            // Clear overlay canvas
            if (overlayCanvas) {
                const ctx = overlayCanvas.getContext('2d');
                ctx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            }
        }
    }, [isLive, detectionStats.confidenceThreshold, detectionMode]);

    const handleConfidenceChange = (newConfidence: number) => {
        setDetectionStats(prev => ({
            ...prev,
            confidenceThreshold: newConfidence
        }));
    };

    const getDetectionModeLabel = (mode: string) => {
        switch (mode) {
            case 'coords':
                return 'Coordinates Only (Fastest/Less Acurate)';
            case 'optimized':
                return 'Optimized';
            case 'ultralight':
                return 'Ultra-light';
            default:
                return 'Original';
        }
    };

    const getDetectionModeDescription = (mode: string) => {
        switch (mode) {
            case 'coords':
                return 'Sends only bounding box coordinates - fastest performance, overlays detections on live feed';
            case 'optimized':
                return 'Balanced performance with processed video frames';
            case 'ultralight':
                return 'Minimal processing for maximum speed';
            default:
                return 'Original YOLO processing';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-200 p-4">
            <div className="w-full max-w-6xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-purple-400"><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Live Object Detection</span></h1>
                
                {/* Controls */}
                <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                    <button 
                        onClick={startLiveFeed} 
                        disabled={isLive} 
                        className="cursor-pointer px-6 py-3 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Detection
                    </button>
                    
                    <button 
                        onClick={stopLiveFeed} 
                        disabled={!isLive} 
                        className="cursor-pointer px-6 py-3 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Stop Detection
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <label htmlFor="confidence" className="text-sm font-medium">
                            Confidence: {(detectionStats.confidenceThreshold * 100).toFixed(0)}%
                        </label>
                        <input
                            id="confidence"
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={detectionStats.confidenceThreshold}
                            onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
                            disabled={isLive}
                            className="cursor-pointer w-20 accent-purple-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="detection-mode" className="text-sm font-medium">Detection Mode:</label>
                        <select
                            id="detection-mode"
                            value={detectionMode}
                            onChange={(e) => setDetectionMode(e.target.value)}
                            disabled={isLive}
                            className="cursor-pointer bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
                        >
                            <option value="coords">Coordinates Only</option>
                            <option value="ultralight">Ultra-light</option>
                            <option value="optimized">Optimized</option>
                            <option value="original">Original</option>
                        </select>
                    </div>
                </div>

                {/* Mode Description */}
                <div className="mb-6 bg-neutral-900 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                        {getDetectionModeLabel(detectionMode)}
                    </h3>
                    <p className="text-gray-300 text-sm">
                        {getDetectionModeDescription(detectionMode)}
                    </p>
                </div>

                {/* Stats Display */}
                {isLive && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-neutral-900 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-purple-400">Frames Processed</h3>
                            <p className="text-2xl font-bold">{detectionStats.totalDetections}</p>
                        </div>
                        <div className="bg-neutral-900 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-purple-400">Objects in Frame</h3>
                            <p className="text-2xl font-bold">{detectionStats.objectsInCurrentFrame}</p>
                        </div>
                        <div className="bg-neutral-900 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-purple-400">Confidence Threshold</h3>
                            <p className="text-2xl font-bold">{(detectionStats.confidenceThreshold * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                )}

                {/* Current Detections List */}
                {isLive && currentDetections.length > 0 && (
                    <div className="mb-6 bg-neutral-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-400 mb-3">Current Detections</h3>
                        <div className="flex flex-wrap gap-2">
                            {currentDetections.map((detection, index) => (
                                <div 
                                    key={index}
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{ backgroundColor: getColorForClass(detection.class) + '40', color: getColorForClass(detection.class) }}
                                >
                                    {detection.class}: {(detection.confidence * 100).toFixed(0)}%
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Video Feeds */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">Live Camera Feed</h2>
                        <div className="relative bg-neutral-900 rounded-lg overflow-hidden aspect-video">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay canvas for coordinates mode */}
                            {detectionMode === 'coords' && (
                                <canvas
                                    ref={overlayCanvasRef}
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                    style={{ mixBlendMode: 'screen' }}
                                />
                            )}
                            {!isLive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 bg-opacity-75">
                                    <p className="text-gray-400">Camera feed stopped</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">
                            {detectionMode === 'coords' ? 'Detection Overlay (Live Feed)' : 'Detection Results'}
                        </h2>
                        <div className="relative bg-neutral-900 rounded-lg overflow-hidden aspect-video">
                            {detectionMode === 'coords' ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        {isLive ? (
                                            <div>
                                                <div className="animate-pulse text-purple-400 text-lg mb-2">
                                                    Coordinates Mode Active
                                                </div>
                                                <p className="text-gray-400">
                                                    Detections are overlaid on the live feed (left panel)
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    This mode provides the fastest performance by only sending coordinates
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">Detection stopped</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                processedFrame && isLive ? (
                                    <img 
                                        src={processedFrame} 
                                        alt="Processed Frame" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            {isLive ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                                    <p className="text-gray-400">Waiting for detection results...</p>
                                                </>
                                            ) : (
                                                <p className="text-gray-400">Detection stopped</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-neutral-900 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li><strong>Coordinates Only</strong>: Fastest mode - overlays detections directly on live feed</li>
                        <li><strong>Ultra-light</strong>: Minimal processing for speed with processed video output</li>
                        <li><strong>Optimized</strong>: Balanced performance with adaptive frame processing</li>
                        <li><strong>Original</strong>: Full YOLO processing with complete detection data</li>
                        <li>Adjust the confidence threshold to filter detection results</li>
                        <li>Your detection session will be automatically saved to history when you stop</li>
                        <li>Make sure to allow camera access when prompted</li>
                    </ul>
                </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default LiveDetection;