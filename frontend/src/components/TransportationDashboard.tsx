/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bus, Train, Bike, Car, Clock, MapPin, TrendingUp } from 'lucide-react';
import { SimpleLineChart } from './SimpleLineChart';
import { SimpleBarChart } from './SimpleBarChart';

const busRoutes = [
  { route: '01', status: 'Đúng giờ', passengers: 145, nextArrival: '3 phút', color: 'bg-green-500' },
  { route: '12', status: 'Đúng giờ', passengers: 89, nextArrival: '7 phút', color: 'bg-green-500' },
  { route: '23', status: 'Chậm 5 phút', passengers: 156, nextArrival: '12 phút', color: 'bg-yellow-500' },
  { route: '45', status: 'Đúng giờ', passengers: 92, nextArrival: '4 phút', color: 'bg-green-500' },
];

const trafficData = [
  { time: '00:00', buses: 12, bikes: 45, cars: 234 },
  { time: '04:00', buses: 8, bikes: 23, cars: 145 },
  { time: '08:00', buses: 45, bikes: 234, cars: 890 },
  { time: '12:00', buses: 38, bikes: 189, cars: 678 },
  { time: '16:00', buses: 42, bikes: 267, cars: 923 },
  { time: '20:00', buses: 35, bikes: 178, cars: 567 },
];

const parkingData = [
  { name: 'Quận 1', available: 234, total: 500 },
  { name: 'Quận 2', available: 156, total: 400 },
  { name: 'Quận 3', available: 89, total: 350 },
  { name: 'Quận 4', available: 312, total: 600 },
  { name: 'Qu��n 5', available: 167, total: 450 },
];

export function TransportationDashboard() {
  return (
    <div className="space-y-6">
      {/* Transportation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Xe buýt</p>
                <p className="text-gray-900">245 hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Train className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tàu điện</p>
                <p className="text-gray-900">12 tuyến</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Bike className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Xe đạp công cộng</p>
                <p className="text-gray-900">1,234 xe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Car className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bãi đỗ xe</p>
                <p className="text-gray-900">89 địa điểm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bus Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Tuyến xe buýt</CardTitle>
            <CardDescription>Thông tin thời gian thực</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {busRoutes.map((bus) => (
                <div key={bus.route} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        {bus.route}
                      </div>
                      <div>
                        <p className="text-gray-900">Tuyến {bus.route}</p>
                        <Badge variant="outline" className="mt-1">
                          {bus.status}
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${bus.color}`}></div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Đến trong {bus.nextArrival}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{bus.passengers} hành khách</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Parking Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Bãi đỗ xe công cộng</CardTitle>
            <CardDescription>Chỗ trống theo khu vực</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={parkingData}
              xAxisKey="name"
              bars={[
                { dataKey: 'available', fill: '#10b981', name: 'Chỗ trống' },
                { dataKey: 'total', fill: '#3b82f6', name: 'Tổng số' },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Traffic Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Lưu lượng giao thông</CardTitle>
          <CardDescription>Theo thời gian trong ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleLineChart 
            data={trafficData}
            xAxisKey="time"
            lines={[
              { dataKey: 'buses', stroke: '#3b82f6', name: 'Xe buýt', strokeWidth: 2 },
              { dataKey: 'bikes', stroke: '#10b981', name: 'Xe đạp', strokeWidth: 2 },
              { dataKey: 'cars', stroke: '#f59e0b', name: 'Ô tô', strokeWidth: 2 },
            ]}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
}