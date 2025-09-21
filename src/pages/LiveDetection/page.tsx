import React, { useRef, useEffect, useState } from 'react';

const LiveDetection: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [processedFrame, setProcessedFrame] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    const startLiveFeed = () => {
        setIsLive(true);
    };

    const stopLiveFeed = () => {
        setIsLive(false);
    };

    const refreshProcessedStream = () => {
        setProcessedFrame(null);
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        if (isLive) {
            const ws = new WebSocket('ws://localhost:8000/ws/video/');
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
                            ws.send(JSON.stringify({ frame: data }));
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
            };

            const startVideo = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoElement) {
                        videoElement.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing webcam: ", err);
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
    }, [isLive]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-200">
            <h1 className="text-3xl font-bold mb-4">Live Object Detection</h1>
            <div className="flex space-x-4 mb-4">
                <button onClick={startLiveFeed} disabled={isLive} className="px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                    Start
                </button>
                <button onClick={stopLiveFeed} disabled={!isLive} className="px-6 py-3 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                    Stop
                </button>
                {/* {isLive && (
                    <button onClick={refreshProcessedStream} className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Refresh
                    </button>
                )} */}
            </div>
            <div className="flex space-x-4">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Live Feed</h2>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-lg rounded-lg shadow-lg bg-gray-900"></video>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Processed Feed</h2>
                    {processedFrame && isLive ? (
                        <img src={processedFrame} alt="Processed Frame" className="w-full max-w-lg rounded-lg shadow-lg" />
                    ) : (
                        <div className="w-full max-w-lg h-full bg-gray-900 rounded-lg shadow-lg flex items-center justify-center">
                            <p>{isLive ? 'Waiting for processed frame...' : 'Live feed stopped'}</p>
                        </div>
                    )}
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default LiveDetection;
