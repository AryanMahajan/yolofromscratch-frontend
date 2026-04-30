import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  History,
  Activity,
  Box,
  Target,
  ArrowUpRight,
  Plus,
  Video,
  LayoutDashboard
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { historyApi, type DetectionHistoryStats } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import SpotlightCard from '../SpotlightCard';

const COLORS = ['#A855F7', '#6366F1', '#EC4899', '#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#64748B'];

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-24 bg-black/40 backdrop-blur-md rounded-3xl border border-gray-800 m-6">
        <History className="text-6xl text-gray-700 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Statistics Available</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Perform your first detection to see powerful insights and trends here.
        </p>
        <div className="mt-8 flex justify-center gap-4">
            <Link to="/live-detection" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all">
                Start Detection
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center tracking-tight">
            <LayoutDashboard className="mr-3 text-purple-500" size={32} />
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Real-time detection metrics and system health.</p>
        </div>
        
        <div className="flex gap-3">
          <Link to="/live-detection" className="flex items-center px-4 py-2 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 font-bold rounded-xl transition-all">
            <Activity className="mr-2" size={18} />
            Live Feed
          </Link>
          <Link to="/upload-video" className="flex items-center px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-xl transition-all">
            <Video className="mr-2" size={18} />
            Upload
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpotlightCard className="p-6" spotlightColor="rgba(168, 85, 247, 0.15)">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Detections</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.total_detections}</h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-400">
            <TrendingUp size={14} className="mr-1" />
            <span>+12.5% from last month</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6" spotlightColor="rgba(99, 102, 241, 0.15)">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Objects Found</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.total_objects_detected}</h3>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
              <Box size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <Activity size={14} className="mr-1" />
            <span>Across all sessions</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6" spotlightColor="rgba(236, 72, 153, 0.15)">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Activity</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.recent_activity}</h3>
            </div>
            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
              <History size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <span>Last 7 days active</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6" spotlightColor="rgba(16, 185, 129, 0.15)">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Objects</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.avg_objects_per_detection}</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Target size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400">
            <span>Per detection session</span>
          </div>
        </SpotlightCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
            <SpotlightCard className="p-6" spotlightColor="rgba(168, 85, 247, 0.1)">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <TrendingUp className="mr-2 text-purple-500" size={20} />
                        Detection Trends
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={topClassesData}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                stroke="#4B5563" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#4B5563" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#111827', 
                                    border: '1px solid #374151',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#A855F7' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#A855F7" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorVal)" 
                                name="Detections"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </SpotlightCard>
        </div>

        {/* Distribution Section */}
        <div className="lg:col-span-1">
            <SpotlightCard className="p-6 h-full" spotlightColor="rgba(99, 102, 241, 0.1)">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <PieChartIcon className="mr-2 text-indigo-500" size={20} />
                    Class Share
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={topClassesData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {topClassesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#111827', 
                                    border: '1px solid #374151',
                                    borderRadius: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                    {topClassesData.slice(0, 4).map((item, index) => (
                        <div key={item.name} className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-sm text-gray-400 capitalize">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </SpotlightCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
