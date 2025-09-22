import React, { useState, useEffect } from 'react';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaTrash, 
  FaEye, 
  FaCalendarAlt,
  FaChartBar,
  FaImage,
  FaVideo,
  FaWifi,
  FaClock,
  FaBullseye
} from 'react-icons/fa';
import { historyApi, type DetectionHistory, type DetectionHistoryStats } from '../../lib/api';
import { useToast } from '../../hooks/useToast';

interface HistoryFilters {
  detection_type: string;
  search_class: string;
  start_date: string;
  end_date: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<DetectionHistory[]>([]);
  const [stats, setStats] = useState<DetectionHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilters>({
    detection_type: '',
    search_class: '',
    start_date: '',
    end_date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<DetectionHistory | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const { showToast } = useToast();

  const fetchHistory = async (page = 1, useFilters = false) => {
    setLoading(true);
    try {
      let response;
      
      if (useFilters && (filters.search_class || filters.start_date || filters.end_date)) {
        // Use search endpoint with filters
        const searchParams: any = { page };
        if (filters.search_class) searchParams.class = filters.search_class;
        if (filters.start_date) searchParams.start_date = filters.start_date;
        if (filters.end_date) searchParams.end_date = filters.end_date;
        
        response = await historyApi.searchHistory(searchParams);
      } else {
        // Use regular history endpoint
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

  const fetchStats = async () => {
    try {
      const statsData = await historyApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchHistory(1);
    fetchStats();
  }, []);

  useEffect(() => {
    fetchHistory(currentPage, true);
  }, [currentPage]);

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

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this detection history entry?')) {
      return;
    }

    try {
      await historyApi.deleteHistory(id);
      showToast('Detection history deleted successfully', 'success');
      fetchHistory(currentPage, true);
      fetchStats();
    } catch (error) {
      showToast('Failed to delete detection history', 'error');
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all detection history? This action cannot be undone.')) {
      return;
    }

    try {
      await historyApi.clearHistory();
      showToast('All detection history cleared successfully', 'success');
      setHistory([]);
      fetchStats();
    } catch (error) {
      showToast('Failed to clear detection history', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getDetectionTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <FaImage className="text-purple-400" />;
      case 'video': return <FaVideo className="text-purple-400" />;
      case 'live': return <FaWifi className="text-purple-400" />;
      default: return <FaHistory />;
    }
  };

  const getDetectionTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Image Detection';
      case 'video': return 'Video Detection'; 
      case 'live': return 'Live Feed';
      default: return 'Unknown';
    }
  };

  const getDetectionModeLabel = (mode: string) => {
    switch (mode) {
      case 'coordinates_only': return 'Coords Only';
      case 'optimized': return 'Optimized';
      case 'ultra_light': return 'Ultra Light';
      default: return 'Standard';
    }
  };

  const getSessionSummary = (item: DetectionHistory) => {
    const sessionData = item.detection_data?.session_summary;
    if (!sessionData) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400 mt-2">
        {sessionData.session_duration_seconds && (
          <div className="flex items-center">
            <FaClock className="mr-1" />
            Duration: {formatDuration(sessionData.session_duration_seconds)}
          </div>
        )}
        {sessionData.total_frames && (
          <div>
            Frames: {sessionData.total_frames}
          </div>
        )}
        {sessionData.unique_classes_detected && (
          <div>
            Classes: {sessionData.unique_classes_detected}
          </div>
        )}
        {sessionData.detection_mode && (
          <div>
            Mode: {getDetectionModeLabel(sessionData.detection_mode)}
          </div>
        )}
      </div>
    );
  };

  const getClassDistribution = (item: DetectionHistory) => {
    const classDistribution = item.detection_data?.class_counts || item.detection_data?.session_summary?.class_distribution;
    if (!classDistribution || Object.keys(classDistribution).length === 0) return null;

    // Sort classes by count
    const sortedClasses = Object.entries(classDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 8); // Show top 8 classes

    return (
      <div className="mt-2">
        <div className="text-xs text-gray-400 mb-1">Class Distribution:</div>
        <div className="flex flex-wrap gap-1">
          {sortedClasses.map(([className, count]) => (
            <span 
              key={className} 
              className="bg-purple-600 px-2 py-1 rounded text-xs flex items-center"
            >
              {className}: {count}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-black text-gray-200">
      <main className="flex-grow overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <FaHistory className="text-2xl text-purple-400 mr-3" />
              <h1 className="text-3xl font-bold">Detection History</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <FaChartBar className="mr-2" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaFilter className="mr-2" />
                Filters
              </button>

              <button
                onClick={handleClearAllHistory}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                disabled={history.length === 0}
              >
                <FaTrash className="mr-2" />
                Clear All
              </button>
            </div>
          </div>

          {/* Stats Panel */}
          {showStats && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total Detections</h3>
                <p className="text-2xl font-bold text-purple-400">{stats.total_detections}</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Objects Detected</h3>
                <p className="text-2xl font-bold text-purple-400">{stats.total_objects_detected}</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                <p className="text-2xl font-bold text-purple-400">{stats.recent_activity}</p>
                <p className="text-sm text-gray-400">Last 7 days</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Avg Objects</h3>
                <p className="text-2xl font-bold text-purple-400">{stats.avg_objects_per_detection}</p>
                <p className="text-sm text-gray-400">Per detection</p>
              </div>
              
              {stats.top_detected_classes.length > 0 && (
                <div className="bg-gray-900 p-4 rounded-lg md:col-span-2 lg:col-span-4">
                  <h3 className="text-lg font-semibold mb-2">Top Detected Classes</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.top_detected_classes.map(([className, count], index) => (
                      <span key={index} className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                        {className}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Detection Type</label>
                  <select
                    value={filters.detection_type}
                    onChange={(e) => handleFilterChange('detection_type', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Types</option>
                    <option value="image">Image Detection</option>
                    <option value="video">Video Detection</option>
                    <option value="live">Live Feed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Search Class</label>
                  <input
                    type="text"
                    placeholder="e.g., person, car, dog"
                    value={filters.search_class}
                    onChange={(e) => handleFilterChange('search_class', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* History List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <FaHistory className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Detection History</h3>
              <p className="text-gray-400">Your detection history will appear here once you start using the detection features.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        {getDetectionTypeIcon(item.detection_type)}
                        <span className="ml-2 font-semibold">
                          {getDetectionTypeLabel(item.detection_type)}
                        </span>
                        <span className="ml-2 text-sm text-gray-400">
                          {formatDate(item.timestamp)}
                        </span>
                        {item.detection_data?.session_summary?.detection_mode && (
                          <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs">
                            {getDetectionModeLabel(item.detection_data.session_summary.detection_mode)}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-400">Objects Detected:</span>
                          <span className="ml-2 font-medium text-purple-400">{item.objects_detected}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Confidence:</span>
                          <span className="ml-2 font-medium">{(item.confidence_threshold * 100).toFixed(0)}%</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-sm text-gray-400">Classes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.detected_classes && item.detected_classes.length > 0 ? (
                              <>
                                {item.detected_classes.slice(0, 5).map((className, index) => (
                                  <span key={index} className="bg-purple-600 px-2 py-1 rounded text-xs">
                                    {className}
                                  </span>
                                ))}
                                {item.detected_classes.length > 5 && (
                                  <span className="bg-gray-600 px-2 py-1 rounded text-xs">
                                    +{item.detected_classes.length - 5} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">No classes detected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced session summary */}
                      {getSessionSummary(item)}
                      
                      {/* Class distribution */}
                      {getClassDistribution(item)}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedHistory(item)}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && history.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-400">
                Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} results
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Detail Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detection Details</h2>
              <button
                onClick={() => setSelectedHistory(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                {getDetectionTypeIcon(selectedHistory.detection_type)}
                <span className="ml-2 font-semibold">
                  {getDetectionTypeLabel(selectedHistory.detection_type)}
                </span>
                {selectedHistory.detection_data?.session_summary?.detection_mode && (
                  <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-xs">
                    {getDetectionModeLabel(selectedHistory.detection_data.session_summary.detection_mode)}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-400">Timestamp:</span>
                  <p className="font-medium">{formatDate(selectedHistory.timestamp)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Objects Detected:</span>
                  <p className="font-medium text-purple-400">{selectedHistory.objects_detected}</p>
                </div>
                <div>
                  <span className="text-gray-400">Confidence Threshold:</span>
                  <p className="font-medium">{(selectedHistory.confidence_threshold * 100).toFixed(0)}%</p>
                </div>
                {selectedHistory.detection_data?.session_summary?.session_duration_seconds && (
                  <div>
                    <span className="text-gray-400">Session Duration:</span>
                    <p className="font-medium">{formatDuration(selectedHistory.detection_data.session_summary.session_duration_seconds)}</p>
                  </div>
                )}
                {selectedHistory.detection_data?.session_summary?.total_frames && (
                  <div>
                    <span className="text-gray-400">Total Frames:</span>
                    <p className="font-medium">{selectedHistory.detection_data.session_summary.total_frames}</p>
                  </div>
                )}
                {selectedHistory.detection_data?.session_summary?.unique_classes_detected && (
                  <div>
                    <span className="text-gray-400">Unique Classes:</span>
                    <p className="font-medium">{selectedHistory.detection_data.session_summary.unique_classes_detected}</p>
                  </div>
                )}
              </div>
              
              <div>
                <span className="text-gray-400">Detected Classes:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedHistory.detected_classes && selectedHistory.detected_classes.length > 0 ? (
                    selectedHistory.detected_classes.map((className, index) => (
                      <span key={index} className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                        {className}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No classes detected</span>
                  )}
                </div>
              </div>

              {/* Enhanced class distribution */}
              {selectedHistory.detection_data?.class_counts && Object.keys(selectedHistory.detection_data.class_counts).length > 0 && (
                <div>
                  <span className="text-gray-400">Class Distribution:</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {Object.entries(selectedHistory.detection_data.class_counts)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .map(([className, count]) => (
                      <div key={className} className="bg-gray-800 px-3 py-2 rounded flex justify-between">
                        <span className="text-sm">{className}</span>
                        <span className="text-purple-400 font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedHistory.detection_data && (
                <div>
                  <span className="text-gray-400">Detection Data:</span>
                  <pre className="bg-black p-3 rounded-md text-sm mt-2 overflow-x-auto max-h-60">
                    {JSON.stringify(selectedHistory.detection_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
