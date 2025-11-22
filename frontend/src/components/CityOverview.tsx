import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Building, Zap, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from './ui/badge';

const cityStats = [
  {
    title: 'Dân số',
    value: '8.5M',
    change: '+2.3%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Công trình công cộng',
    value: '1,245',
    change: '+12',
    trend: 'up',
    icon: Building,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Tiêu thụ điện',
    value: '2.3 TWh',
    change: '-5.2%',
    trend: 'down',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'Tiêu thụ nước',
    value: '450M m³',
    change: '0%',
    trend: 'neutral',
    icon: Droplets,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
];

const recentUpdates = [
  { title: 'Dữ liệu giao thông công cộng cập nhật', time: '5 phút trước', status: 'success' },
  { title: 'Cảm biến chất lượng không khí - Quận 1', time: '12 phút trước', status: 'success' },
  { title: 'Dữ liệu đỗ xe công cộng', time: '28 phút trước', status: 'success' },
  { title: 'Thống kê năng lượng theo giờ', time: '1 giờ trước', status: 'warning' },
];

export function CityOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cityStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
          
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <Badge 
                    variant={stat.trend === 'up' ? 'default' : stat.trend === 'down' ? 'secondary' : 'outline'}
                    className="flex items-center gap-1"
                  >
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-gray-900 mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bản đồ thành phố</CardTitle>
            <CardDescription>Dữ liệu thời gian thực từ các cảm biến và thiết bị IoT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              {/* Simulated map with data points */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Data points */}
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* Central city marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <p className="mt-2 text-gray-900 bg-white px-3 py-1 rounded-full text-sm shadow-md">
                        Trung tâm thành phố
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Giao thông</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Môi trường</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Năng lượng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Dịch vụ</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật gần đây</CardTitle>
            <CardDescription>Nguồn dữ liệu mở</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    update.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{update.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Nguồn dữ liệu mở</CardTitle>
          <CardDescription>Dữ liệu được thu thập từ các API và nền tảng dữ liệu mở</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <p className="text-gray-900">Giao thông công cộng</p>
              <p className="text-sm text-gray-500 mt-1">API GTCC - Cập nhật mỗi 5 phút</p>
              <Badge className="mt-2" variant="outline">Hoạt động</Badge>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <p className="text-gray-900">Chất lượng không khí</p>
              <p className="text-sm text-gray-500 mt-1">Mạng cảm biến IoT</p>
              <Badge className="mt-2" variant="outline">Hoạt động</Badge>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <p className="text-gray-900">Tiêu thụ năng lượng</p>
              <p className="text-sm text-gray-500 mt-1">Điện lực TP - Theo giờ</p>
              <Badge className="mt-2" variant="outline">Hoạt động</Badge>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <p className="text-gray-900">Dịch vụ công cộng</p>
              <p className="text-sm text-gray-500 mt-1">Cổng thông tin TP</p>
              <Badge className="mt-2" variant="outline">Hoạt động</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
