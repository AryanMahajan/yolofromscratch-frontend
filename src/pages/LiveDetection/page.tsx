import React, { useRef, useEffect, useState } from 'react';
import { historyApi } from '../../lib/api';
import { useToast } from '../../hooks/useToast';

const LiveDetection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [processedFrame, setProcessedFrame] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [detectionStats, setDetectionStats] = useState({
        totalDetections: 0,
        objectsInCurrentFrame: 0,
        confidenceThreshold: 0.5
    });
    const streamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const lastDetectionDataRef = useRef<any>(null);
    
    const { showToast } = useToast();

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
        if (isLive) {
            const ws = new WebSocket('ws://localhost:8000/ws/video/ultralight/');
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

                const intervalId = setInterval(sendFrame, 200);

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    clearInterval(intervalId);
                };
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setProcessedFrame(data.frame);
                
                // Update detection stats and store detection data
                if (data.detections) {
                    const objectCount = data.detections.length;
                    setDetectionStats(prev => ({
                        ...prev,
                        totalDetections: prev.totalDetections + 1,
                        objectsInCurrentFrame: objectCount
                    }));

                    // Store the latest detection data for history saving
                    lastDetectionDataRef.current = {
                        detections: data.detections,
                        frame_count: detectionStats.totalDetections + 1,
                        timestamp: new Date().toISOString(),
                        confidence_threshold: detectionStats.confidenceThreshold
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
        }
    }, [isLive, detectionStats.confidenceThreshold]);

    const handleConfidenceChange = (newConfidence: number) => {
        setDetectionStats(prev => ({
            ...prev,
            confidenceThreshold: newConfidence
        }));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-200 p-4">
            <div className="w-full max-w-6xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Live Object Detection</h1>
                
                {/* Controls */}
                <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                    <button 
                        onClick={startLiveFeed} 
                        disabled={isLive} 
                        className="px-6 py-3 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Detection
                    </button>
                    
                    <button 
                        onClick={stopLiveFeed} 
                        disabled={!isLive} 
                        className="px-6 py-3 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="w-20 accent-purple-500"
                        />
                    </div>
                </div>

                {/* Stats Display */}
                {isLive && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-900 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-purple-400">Frames Processed</h3>
                            <p className="text-2xl font-bold">{detectionStats.totalDetections}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-purple-400">Objects in Frame</h3>
                            <p className="text-2xl font-bold">{detectionStats.objectsInCurrentFrame}</p>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-purple-400">Confidence Threshold</h3>
                            <p className="text-2xl font-bold">{(detectionStats.confidenceThreshold * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                )}

                {/* Video Feeds */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">Live Camera Feed</h2>
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover"
                            />
                            {!isLive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                                    <p className="text-gray-400">Camera feed stopped</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">Detection Results</h2>
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                            {processedFrame && isLive ? (
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-gray-900 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>Click "Start Detection" to begin real-time object detection</li>
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
