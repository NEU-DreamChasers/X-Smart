/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Hospital, School, Building2, ShoppingBag, MapPin, Phone, Clock, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const hospitals = [
  { name: 'Bệnh viện Chợ Rẫy', address: 'Quận 5', distance: '2.3 km', status: 'Mở cửa', rating: 4.5, emergency: true },
  { name: 'Bệnh viện Thống Nhất', address: 'Quận 10', distance: '3.8 km', status: 'Mở cửa', rating: 4.2, emergency: true },
  { name: 'Bệnh viện Nhi đồng 1', address: 'Quận 10', distance: '4.1 km', status: 'Mở cửa', rating: 4.7, emergency: true },
  { name: 'Bệnh viện 115', address: 'Quận 10', distance: '3.5 km', status: 'Mở cửa', rating: 4.4, emergency: true },
];

const schools = [
  { name: 'Trường THPT Lê Hồng Phong', address: 'Quận 5', distance: '1.2 km', status: 'Công lập', students: 1200, rating: 4.8 },
  { name: 'Trường THPT Trần Đại Nghĩa', address: 'Quận 1', distance: '2.5 km', status: 'Công lập', students: 1500, rating: 4.9 },
  { name: 'Trường THPT Nguyễn Thượng Hiền', address: 'Quận 3', distance: '1.8 km', status: 'Công lập', students: 1100, rating: 4.6 },
  { name: 'Trường THPT Gia Định', address: 'Quận Bình Thạnh', distance: '3.2 km', status: 'Công lập', students: 1300, rating: 4.7 },
];

const publicBuildings = [
  { name: 'Ủy ban Nhân dân TP', address: '86 Lê Thánh Tôn, Quận 1', hours: '7:30 - 17:30', phone: '028-3829-4000' },
  { name: 'Thư viện Khoa học Tổng hợp', address: '69 Lý Tự Trọng, Quận 1', hours: '8:00 - 20:00', phone: '028-3822-5071' },
  { name: 'Bảo tàng Thành phố', address: '65 Lý Tự Trọng, Quận 1', hours: '8:00 - 17:00', phone: '028-3829-9741' },
  { name: 'Bưu điện Trung tâm', address: '2 Công xã Paris, Quận 1', hours: '24/7', phone: '028-3821-1111' },
];

const markets = [
  { name: 'Chợ Bến Thành', address: 'Quận 1', distance: '1.5 km', status: 'Mở cửa', type: 'Truyền thống', visitors: 'Cao' },
  { name: 'Chợ An Đông', address: 'Quận 5', distance: '2.8 km', status: 'Mở cửa', type: 'Truyền thống', visitors: 'Trung bình' },
  { name: 'Chợ Tân Định', address: 'Quận 1', distance: '1.2 km', status: 'Mở cửa', type: 'Truyền thống', visitors: 'Trung bình' },
  { name: 'Chợ Bình Tây', address: 'Quận 6', distance: '4.5 km', status: 'Mở cửa', type: 'Truyền thống', visitors: 'Cao' },
];

export function PublicServices() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="hospitals" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="hospitals">
            <Hospital className="w-4 h-4 mr-2" />
            Y tế
          </TabsTrigger>
          <TabsTrigger value="schools">
            <School className="w-4 h-4 mr-2" />
            Giáo dục
          </TabsTrigger>
          <TabsTrigger value="buildings">
            <Building2 className="w-4 h-4 mr-2" />
            Công sở
          </TabsTrigger>
          <TabsTrigger value="markets">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Chợ
          </TabsTrigger>
        </TabsList>

        {/* Hospitals */}
        <TabsContent value="hospitals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map((hospital, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Hospital className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{hospital.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {hospital.address} • {hospital.distance}
                        </CardDescription>
                      </div>
                    </div>
                    {hospital.emergency && (
                      <Badge variant="destructive" className="text-xs">Cấp cứu 24/7</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-900">{hospital.rating}</span>
                    </div>
                    <Badge variant={hospital.status === 'Mở cửa' ? 'default' : 'secondary'}>
                      {hospital.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schools */}
        <TabsContent value="schools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <School className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{school.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {school.address} • {school.distance}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">Học sinh: {school.students.toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-900">{school.rating}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{school.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Public Buildings */}
        <TabsContent value="buildings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicBuildings.map((building, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{building.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {building.address}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{building.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{building.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Markets */}
        <TabsContent value="markets">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {markets.map((market, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{market.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {market.address} • {market.distance}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">Loại: {market.type}</p>
                      <p className="text-gray-600">Khách: {market.visitors}</p>
                    </div>
                    <Badge variant={market.status === 'Mở cửa' ? 'default' : 'secondary'}>
                      {market.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Liên hệ khẩn cấp</CardTitle>
          <CardDescription>Số điện thoại quan trọng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-900">Cứu hỏa</p>
              <p className="text-red-600 mt-1">114</p>
            </div>
            <div className="p-4 border rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-900">Cấp cứu</p>
              <p className="text-blue-600 mt-1">115</p>
            </div>
            <div className="p-4 border rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-900">Công an</p>
              <p className="text-green-600 mt-1">113</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
