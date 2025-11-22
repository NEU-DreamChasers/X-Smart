import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Users, Zap, Droplets, Bus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SimpleBarChart } from './SimpleBarChart';
import { SimpleLineChart } from './SimpleLineChart';
import { SimplePieChart } from './SimplePieChart';

const monthlyData = [
  { month: 'T1', energy: 2100, water: 420, transport: 18500, population: 8300 },
  { month: 'T2', energy: 1950, water: 410, transport: 17800, population: 8320 },
  { month: 'T3', energy: 2050, water: 425, transport: 18200, population: 8340 },
  { month: 'T4', energy: 2200, water: 440, transport: 19100, population: 8360 },
  { month: 'T5', energy: 2350, water: 455, transport: 19800, population: 8380 },
  { month: 'T6', energy: 2300, water: 450, transport: 19500, population: 8400 },
];

const budgetData = [
  { name: 'Giao thông', value: 35, color: '#3b82f6' },
  { name: 'Y tế', value: 25, color: '#ef4444' },
  { name: 'Giáo dục', value: 20, color: '#10b981' },
  { name: 'Môi trường', value: 12, color: '#f59e0b' },
  { name: 'Khác', value: 8, color: '#6b7280' },
];

const kpis = [
  {
    title: 'Tiêu thụ năng lượng',
    value: '-5.2%',
    trend: 'down',
    icon: Zap,
    description: 'So với tháng trước',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Sử dụng giao thông công cộng',
    value: '+12.8%',
    trend: 'up',
    icon: Bus,
    description: 'So với tháng trước',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Tiết kiệm nước',
    value: '-3.5%',
    trend: 'down',
    icon: Droplets,
    description: 'So với tháng trước',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Tăng trưởng dân số',
    value: '+2.3%',
    trend: 'up',
    icon: Users,
    description: 'Hàng năm',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

const districtComparison = [
  { district: 'Q1', score: 85 },
  { district: 'Q2', score: 92 },
  { district: 'Q3', score: 78 },
  { district: 'Q4', score: 88 },
  { district: 'Q5', score: 80 },
  { district: 'Q6', score: 86 },
  { district: 'Q7', score: 94 },
  { district: 'Q8', score: 82 },
];

const insights = [
  {
    title: 'Tăng trưởng sử dụng GTCC',
    description: 'Số lượng hành khách sử dụng giao thông công cộng tăng 12.8% so với tháng trước',
    impact: 'positive',
    category: 'Giao thông',
  },
  {
    title: 'Giảm tiêu thụ năng lượng',
    description: 'Tiêu thụ điện giảm 5.2% nhờ áp dụng công nghệ LED và năng lượng mặt trời',
    impact: 'positive',
    category: 'Năng lượng',
  },
  {
    title: 'Cải thiện chất lượng không khí',
    description: 'Chỉ số PM 2.5 giảm trung bình 15% trong 3 tháng qua',
    impact: 'positive',
    category: 'Môi trường',
  },
  {
    title: 'Mở rộng mạng lưới cảm biến',
    description: '45 cảm biến mới được lắp đặt để theo dõi môi trường và giao thông',
    impact: 'neutral',
    category: 'Cơ sở hạ tầng',
  },
];

export function DataAnalytics() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={kpi.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <TrendIcon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className={`mt-1 ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng tiêu thụ</CardTitle>
            <CardDescription>6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={monthlyData}
              xAxisKey="month"
              lines={[
                { dataKey: 'energy', stroke: '#3b82f6', name: 'Năng lượng', strokeWidth: 2 },
                { dataKey: 'water', stroke: '#10b981', name: 'Nước', strokeWidth: 2 },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Budget Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ ngân sách</CardTitle>
            <CardDescription>Theo lĩnh vực (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={budgetData} />
          </CardContent>
        </Card>
      </div>

      {/* District Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>So sánh chỉ số thông minh theo quận</CardTitle>
          <CardDescription>Điểm số tổng hợp dựa trên nhiều chỉ tiêu</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleBarChart 
            data={districtComparison}
            xAxisKey="district"
            bars={[
              { dataKey: 'score', fill: '#3b82f6', name: 'Điểm số' },
            ]}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Phân tích và nhận định</CardTitle>
          <CardDescription>Dựa trên dữ liệu thu thập được</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-gray-900">{insight.title}</p>
                    <Badge variant="outline" className="mt-1">{insight.category}</Badge>
                  </div>
                  {insight.impact === 'positive' && (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  )}
                  {insight.impact === 'negative' && (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt dữ liệu</CardTitle>
          <CardDescription>Thống kê tổng quan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Tổng số điểm dữ liệu</p>
              <p className="text-gray-900">1.2M</p>
              <p className="text-xs text-gray-500">Được thu thập trong tháng này</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Nguồn dữ liệu</p>
              <p className="text-gray-900">156</p>
              <p className="text-xs text-gray-500">API và cảm biến hoạt động</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Cập nhật gần nhất</p>
              <p className="text-gray-900">5 phút trước</p>
              <p className="text-xs text-gray-500">Dữ liệu thời gian thực</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}