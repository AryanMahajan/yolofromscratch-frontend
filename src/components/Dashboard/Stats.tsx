import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaHistory
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { historyApi, type DetectionHistoryStats } from '../../lib/api';
import { useToast } from '../../hooks/useToast';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DetectionHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const statsData = await historyApi.getStats();
      setStats(statsData);
    } catch (error) {
      showToast('Failed to fetch dashboard stats', 'error');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const topClassesData = stats?.top_detected_classes.map(([name, value]) => ({ name, value })) || [];

  return (
    <div className="p-6 bg-black text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FaChartBar className="text-2xl text-purple-400 mr-3" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : !stats ? (
        <div className="text-center py-12">
          <FaHistory className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Statistics Available</h3>
          <p className="text-gray-400">Statistics will appear here once you start using the detection features.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat Cards */}
          <div className="bg-neutral-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Detections</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.total_detections}</p>
          </div>
          <div className="bg-neutral-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Objects Detected</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.total_objects_detected}</p>
          </div>
          <div className="bg-neutral-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.recent_activity}</p>
            <p className="text-sm text-gray-400">Last 7 days</p>
          </div>
          <div className="bg-neutral-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Avg Objects/Detection</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.avg_objects_per_detection}</p>
          </div>

          {/* Top Detected Classes Bar Chart and Actions */}
          {topClassesData.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6 md:col-span-2 lg:col-span-4">
              <div className="bg-neutral-900 p-4 rounded-lg flex-grow">
                <h3 className="text-lg font-semibold mb-4 flex items-center"><FaChartLine className="mr-2 text-purple-400"/>Top Detected Classes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={topClassesData}>
                    <XAxis dataKey="name" stroke="#8884d8" />
                    <YAxis stroke="#8884d8" />
                    <Tooltip wrapperClassName="bg-gray-800 !border-purple-500" />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="Detections" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-neutral-900 p-4 rounded-lg flex flex-col justify-center items-center md:w-1/3">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <Link to="/live-detection" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg mb-4 w-full text-center">
                  Start Live Detection
                </Link>
                <Link to="/upload-video" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg w-full text-center">
                  Upload Video
                </Link>
              </div>
            </div>
          )}
          
          {/* Detection Type Distribution Pie Chart */}
          {stats.detection_type_distribution && (
            <div className="bg-neutral-900 p-4 rounded-lg md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center"><FaChartPie className="mr-2 text-purple-400"/>Detection Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(stats.detection_type_distribution).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.entries(stats.detection_type_distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip wrapperClassName="bg-gray-800 !border-purple-500" />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
