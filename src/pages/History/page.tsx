import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Calendar,
  BarChart3,
  Image as ImageIcon,
  Video,
  Wifi,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  List,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import { historyApi, type DetectionHistory, type DetectionHistoryStats } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import SpotlightCard from '../../components/SpotlightCard';

interface HistoryFilters {
  detection_type: string;
  search_class: string;
  start_date: string;
  end_date: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<DetectionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilters>({
    detection_type: '',
    search_class: '',
    start_date: '',
    end_date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<DetectionHistory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const { showToast } = useToast();

  const fetchHistory = async (page = 1, useFilters = false) => {
    setLoading(true);
    try {
      let response;
      
      if (useFilters && (filters.search_class || filters.start_date || filters.end_date)) {
        const searchParams: any = { page };
        if (filters.search_class) searchParams.class = filters.search_class;
        if (filters.start_date) searchParams.start_date = filters.start_date;
        if (filters.end_date) searchParams.end_date = filters.end_date;
        
        response = await historyApi.searchHistory(searchParams);
      } else {
        const params: any = { page, page_size: 20 };
        if (filters.detection_type) params.detection_type = filters.detection_type;
        
        response = await historyApi.getHistory(params);
      }
      
      setHistory(response.results);
      setTotalCount(response.count);
      setHasNextPage(response.next !== null);
    } catch (error) {
      showToast('Failed to fetch detection history', 'error');
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handleFilterChange = (key: keyof HistoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchHistory(1, true);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      detection_type: '',
      search_class: '',
      start_date: '',
      end_date: '',
    });
    setCurrentPage(1);
    fetchHistory(1);
    setShowFilters(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDetectionTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={18} className="text-blue-400" />;
      case 'video': return <Video size={18} className="text-indigo-400" />;
      case 'live': return <Wifi size={18} className="text-purple-400" />;
      default: return <HistoryIcon size={18} />;
    }
  };

  const getDetectionTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Image Detection';
      case 'video': return 'Video Detection'; 
      case 'live': return 'Live Session';
      default: return 'Detection';
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center tracking-tight">
              <HistoryIcon className="mr-3 text-purple-500" size={32} />
              Detection History
            </h1>
            <p className="text-gray-500 mt-1">Browse and analyze your previous object detection sessions.</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-xl font-bold transition-all ${
                showFilters 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600 text-gray-300'
              }`}
            >
              <Filter className="mr-2" size={18} />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <SpotlightCard className="p-6 mb-8 border border-purple-500/20" spotlightColor="rgba(168, 85, 247, 0.1)">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Type</label>
                <select
                  value={filters.detection_type}
                  onChange={(e) => handleFilterChange('detection_type', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm"
                >
                  <option value="">All Types</option>
                  <option value="image">Image Detection</option>
                  <option value="video">Video Detection</option>
                  <option value="live">Live Feed</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Detected Class</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search person, car..."
                        value={filters.search_class}
                        onChange={(e) => handleFilterChange('search_class', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm"
                    />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">From Date</label>
                <input
                  type="datetime-local"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm text-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">To Date</label>
                <input
                  type="datetime-local"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm text-gray-300"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all text-sm"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all text-sm"
              >
                Apply Filters
              </button>
            </div>
          </SpotlightCard>
        )}

        {/* History List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/20 backdrop-blur-sm rounded-3xl border border-dashed border-gray-800">
            <HistoryIcon className="text-6xl text-gray-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No history found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
                {filters.search_class || filters.detection_type 
                    ? "Try adjusting your filters to find what you're looking for." 
                    : "Your detections will appear here once you start using the live feed or upload tools."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <SpotlightCard 
                key={item.id} 
                className="p-5 group cursor-pointer border border-gray-800/50 hover:border-purple-500/30 transition-all"
                spotlightColor="rgba(168, 85, 247, 0.05)"
                onClick={() => setSelectedHistory(item)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                        {getDetectionTypeIcon(item.detection_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors">
                                {getDetectionTypeLabel(item.detection_type)}
                            </h3>
                            {item.detection_type === 'video' && (
                                <PlayCircle size={14} className="text-purple-500" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Clock size={12} className="mr-1" />
                            {formatDate(item.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center">
                                <Target size={10} className="mr-1" /> Confidence
                            </p>
                            <p className="text-lg font-black text-white">{(item.confidence_threshold * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center">
                                <BarChart3 size={10} className="mr-1" /> Objects
                            </p>
                            <p className="text-lg font-black text-purple-400">{item.objects_detected}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {item.detected_classes && item.detected_classes.slice(0, 4).map((cls, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] font-bold text-purple-400 uppercase tracking-tight">
                                {cls}
                            </span>
                        ))}
                        {item.detected_classes && item.detected_classes.length > 4 && (
                            <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-bold text-gray-500 uppercase">
                                +{item.detected_classes.length - 4} more
                            </span>
                        )}
                    </div>
                  </div>
                  
                  <div className="ml-4 p-2 bg-gray-800/50 rounded-full text-gray-500 group-hover:text-purple-400 transition-all self-center">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && history.length > 0 && (
          <div className="mt-12 flex items-center justify-between border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-white">{(currentPage - 1) * 20 + 1}</span> to <span className="text-white">{Math.min(currentPage * 20, totalCount)}</span> of <span className="text-white">{totalCount}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasNextPage}
                className="p-2 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <SpotlightCard className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden border border-purple-500/20 shadow-2xl" spotlightColor="rgba(168, 85, 247, 0.1)">
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                        {getDetectionTypeIcon(selectedHistory.detection_type)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">{getDetectionTypeLabel(selectedHistory.detection_type)}</h2>
                        <p className="text-xs text-gray-500 font-medium">{formatDate(selectedHistory.timestamp)}</p>
                    </div>
                </div>
                <button
                    onClick={() => setSelectedHistory(null)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-all"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 space-y-10">
                {/* Media/Visuals Section - MOVED TO TOP FOR PROMINENCE */}
                {selectedHistory.image_or_video_ref && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center">
                            {selectedHistory.detection_type === 'video' ? <Video className="mr-2 text-purple-500" size={18} /> : <ImageIcon className="mr-2 text-purple-500" size={18} />}
                            Processed Result
                        </h3>
                        <div className="bg-black rounded-3xl overflow-hidden border border-gray-800 aspect-video group relative shadow-2xl">
                            {selectedHistory.detection_type === 'video' ? (
                                <video 
                                    key={selectedHistory.id}
                                    controls 
                                    autoPlay
                                    className="w-full h-full"
                                >
                                    <source src={`${getBaseUrl()}${normalizePath(selectedHistory.image_or_video_ref)}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img 
                                    src={`${getBaseUrl()}${normalizePath(selectedHistory.image_or_video_ref)}`} 
                                    alt="Detection"
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Confidence</p>
                        <p className="text-2xl font-black text-white">{(selectedHistory.confidence_threshold * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Objects</p>
                        <p className="text-2xl font-black text-purple-500">{selectedHistory.objects_detected}</p>
                    </div>
                    {(selectedHistory.detection_data?.summary?.duration || selectedHistory.detection_data?.session_summary?.session_duration_seconds) && (
                        <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                            <p className="text-2xl font-black text-white">
                                {formatDuration(selectedHistory.detection_data?.summary?.duration || selectedHistory.detection_data?.session_summary?.session_duration_seconds)}
                            </p>
                        </div>
                    )}
                    {(selectedHistory.detection_data?.summary?.total_frames || selectedHistory.detection_data?.session_summary?.total_frames) && (
                        <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Frames</p>
                            <p className="text-2xl font-black text-white">
                                {selectedHistory.detection_data?.summary?.total_frames || selectedHistory.detection_data?.session_summary?.total_frames}
                            </p>
                        </div>
                    )}
                </div>

                {/* Classes Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <LayoutGrid className="mr-2 text-purple-500" size={18} />
                        Detected Classes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedHistory.detected_classes && selectedHistory.detected_classes.length > 0 ? (
                            selectedHistory.detected_classes.map((className, index) => (
                                <span key={index} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm font-bold text-purple-400 uppercase tracking-wider">
                                    {className}
                                </span>
                            ))
                        ) : (
                            <div className="flex items-center text-gray-500 italic p-6 bg-gray-900/20 rounded-2xl border border-dashed border-gray-800 w-full">
                                <AlertCircle size={18} className="mr-3" />
                                No classes detected during this session.
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Dump */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <BarChart3 className="mr-2 text-purple-500" size={18} />
                        Session Raw Data
                    </h3>
                    <div className="bg-black/50 rounded-2xl p-6 border border-gray-800 font-mono text-xs overflow-x-auto text-gray-500 leading-relaxed max-h-60 scrollbar-thin scrollbar-thumb-gray-800">
                        <pre>{JSON.stringify(selectedHistory.detection_data, null, 2)}</pre>
                    </div>
                </div>
            </div>
            
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end">
                <button
                    onClick={() => setSelectedHistory(null)}
                    className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Close Details
                </button>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
};

export default History;
