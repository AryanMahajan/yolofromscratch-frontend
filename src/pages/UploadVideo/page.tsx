import React, { useState, useRef } from 'react';
import { Upload, FileVideo, CheckCircle2, AlertCircle, Loader2, Play, BarChart3, Clock, Target } from 'lucide-react';
import { inferenceApi } from '@/lib/api';
import SpotlightCard from '@/components/SpotlightCard';
import { useToast } from '@/hooks/useToast';

interface DetectionStats {
  total_frames: number;
  total_objects_detected: number;
  class_distribution: Record<string, number>;
  fps: number;
  duration: number;
}

interface UploadResult {
  id: number;
  video_url: string;
  stats: DetectionStats;
  detected_classes: string[];
}

const UploadVideo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setResult(null);
      } else {
        showToast('Please upload a video file.', 'error');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      const data = await inferenceApi.uploadVideo(file, confidenceThreshold);
      setResult(data);
      showToast('Video processed successfully!', 'success');
    } catch (error: any) {
      console.error('Upload failed:', error);
      showToast(error.response?.data?.error || 'Failed to process video. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return url.endsWith('/') ? url.slice(0, -1) : url;
  };

  const normalizePath = (path: string | null) => {
    if (!path) return '';
    return path.replace(/\\/g, '/');
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            Video Object Detection
          </h1>
          <p className="text-xl text-gray-400">
            Upload your video and let our YOLO model detect objects in every frame.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload and Settings */}
          <div className="lg:col-span-1 space-y-6">
            <SpotlightCard className="p-6" spotlightColor="rgba(168, 85, 247, 0.15)">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Upload className="mr-2 text-purple-500" size={24} />
                Upload Video
              </h2>

              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-600'
                } ${file ? 'border-green-500/50 bg-green-500/5' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <FileVideo className="text-green-500" size={32} />
                    </div>
                    <p className="text-sm font-medium text-gray-200 mb-1 truncate max-w-full">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button 
                      onClick={onButtonClick}
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      Change Video
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                      <Upload className="text-purple-500" size={32} />
                    </div>
                    <p className="text-sm font-medium text-gray-300 mb-1">
                      Drag and drop your video
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      MP4, WEBM, MOV up to 50MB
                    </p>
                    <button 
                      onClick={onButtonClick}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold transition-colors"
                    >
                      Select File
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center">
                    <Target size={16} className="mr-2 text-purple-400" />
                    Confidence Threshold
                  </label>
                  <span className="text-sm font-bold text-purple-400">{Math.round(confidenceThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-[10px] text-gray-500 italic">
                  Higher threshold means fewer but more certain detections.
                </p>
              </div>

              <button
                disabled={!file || uploading}
                onClick={handleUpload}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 ${
                  !file || uploading 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transform hover:-translate-y-1'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    Processing Video...
                  </>
                ) : (
                  <>
                    <Play className="mr-2" size={20} />
                    Start Detection
                  </>
                )}
              </button>
            </SpotlightCard>
          </div>

          {/* Right Column: Video Player and Results */}
          <div className="lg:col-span-2 space-y-6">
            <SpotlightCard className="p-0 overflow-hidden min-h-[400px]" spotlightColor="rgba(168, 85, 247, 0.1)">
              {result ? (
                <div className="flex flex-col h-full">
                  <div className="bg-gray-900 aspect-video w-full relative">
                    <video 
                      controls 
                      src={`${getBaseUrl()}${normalizePath(result.video_url)}`}
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="p-6 bg-black/40 backdrop-blur-md border-t border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center">
                        <CheckCircle2 className="mr-2 text-green-500" size={20} />
                        Detection Results
                      </h3>
                      <div className="flex gap-2">
                        {result.detected_classes.map(cls => (
                          <span key={cls} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] font-medium text-purple-300 uppercase tracking-wider">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="text-gray-400 text-xs mb-1 flex items-center">
                          <BarChart3 size={14} className="mr-1" /> Total Objects
                        </div>
                        <div className="text-2xl font-bold text-white">{result.stats.total_objects_detected}</div>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="text-gray-400 text-xs mb-1 flex items-center">
                          <Clock size={14} className="mr-1" /> Duration
                        </div>
                        <div className="text-2xl font-bold text-white">{formatDuration(result.stats.duration)}</div>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="text-gray-400 text-xs mb-1 flex items-center">
                          <Target size={14} className="mr-1" /> Avg Objects/Sec
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {(result.stats.total_objects_detected / result.stats.duration).toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="text-gray-400 text-xs mb-1 flex items-center">
                          <BarChart3 size={14} className="mr-1" /> Total Frames
                        </div>
                        <div className="text-2xl font-bold text-white">{result.stats.total_frames}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 p-12 text-center">
                  {uploading ? (
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="relative">
                        <Loader2 className="animate-spin text-purple-500" size={64} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target className="text-purple-300" size={24} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-white mb-2">Analyzing Video...</p>
                        <p className="max-w-md">Our AI is scanning every frame to identify objects. This might take a few minutes depending on video length.</p>
                      </div>
                      <div className="w-full max-w-xs bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-600 h-full animate-pulse-width"></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                        <Play size={40} className="text-gray-600 ml-1" />
                      </div>
                      <p className="text-lg font-medium">Ready for Detection</p>
                      <p className="text-sm max-w-sm mt-2">
                        Your processed video with bounding boxes will appear here once the analysis is complete.
                      </p>
                    </>
                  )}
                </div>
              )}
            </SpotlightCard>
            
            {result && (
              <SpotlightCard className="p-6" spotlightColor="rgba(34, 197, 94, 0.1)">
                <h3 className="text-lg font-bold mb-4">Class Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(result.stats.class_distribution).sort((a, b) => b[1] - a[1]).map(([label, count]) => {
                    const percentage = (count / result.stats.total_objects_detected) * 100;
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-gray-300">{label}</span>
                          <span className="text-gray-500">{count} detections</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-purple-600 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SpotlightCard>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-width {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-pulse-width {
          animation: pulse-width 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadVideo;
