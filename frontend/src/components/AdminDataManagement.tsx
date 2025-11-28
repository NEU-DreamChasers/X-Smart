'use client';

import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Database, Upload, Search, Plus, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { ApiService } from '../services/api.service';

// Define the exact border style
const borderStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

const dataSources = [
  { name: 'OpenWeatherMap', type: 'Weather API', status: 'connected', lastSync: '15 phút trước', records: 'Live' },
  { name: 'OpenAQ', type: 'Air Quality API', status: 'connected', lastSync: '5 phút trước', records: 'Live' },
  { name: 'IoT Sensors', type: 'SOSA/SSN', status: 'connected', lastSync: '1 phút trước', records: 'Live' },
];

export function AdminDataManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('entities');
  
  const [entities, setEntities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [weather, air, bus, parking] = await Promise.all([
        ApiService.weather.getAll(),
        ApiService.air.getAll(),
        ApiService.bus.getAll(),
        ApiService.parking.getAll()
      ]);

      const combined = [
        ...weather.map((i: any) => ({ ...i, category: 'Weather', location: i.address?.addressLocality || 'Unknown' })),
        ...air.map((i: any) => ({ ...i, category: 'AirQuality', location: i.address?.addressLocality || 'Unknown' })),
        ...bus.map((i: any) => ({ ...i, category: 'Bus', location: i.address?.addressLocality || 'Unknown' })),
        ...parking.map((i: any) => ({ ...i, category: 'Parking', location: i.address?.addressLocality || 'Unknown' }))
      ];
      
      setEntities(combined);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, category: string) => {
    if (!confirm(`Bạn có chắc muốn xóa entity: ${id}?`)) return;
    try {
      if (category === 'Weather') await ApiService.weather.delete(id);
      if (category === 'AirQuality') await ApiService.air.delete(id);
      if (category === 'Bus') await ApiService.bus.delete(id);
      if (category === 'Parking') await ApiService.parking.delete(id);
      loadData();
    } catch (error) {
      alert("Xóa thất bại (Có thể do lỗi server hoặc quyền hạn).");
    }
  };

  const filteredEntities = entities.filter(e => 
    e.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Data Sources Status */}
      <div 
        className="bg-white rounded-[14px] p-6 shadow-sm"
        style={borderStyle}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Nguồn dữ liệu</h3>
            <p className="text-sm text-gray-500">Tích hợp API và dữ liệu mở</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-[14px]" onClick={loadData} disabled={isLoading} style={borderStyle}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
            {isLoading ? 'Đang tải...' : 'Đồng bộ'}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((source, index) => (
            <div 
              key={index} 
              className="p-4 bg-gray-50 rounded-[14px] hover:bg-white transition-all"
              style={borderStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">{source.name}</p>
                <Badge variant={source.status === 'connected' ? 'default' : 'secondary'} className="rounded-[8px]">{source.status}</Badge>
              </div>
              <p className="text-xs text-gray-600 mb-3">{source.type}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{source.records}</span>
                <span>{source.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Data Management */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-full bg-gray-100 p-1 gap-1 w-full max-w-md">
          {['entities', 'models', 'import'].map(tab => (
             <TabsTrigger key={tab} value={tab} className="flex-1 rounded-full capitalize text-sm">{tab}</TabsTrigger>
          ))}
        </TabsList>

        {/* Entities Tab */}
        <TabsContent value="entities">
          <div 
            className="bg-white rounded-[14px] p-6 shadow-sm"
            style={borderStyle}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">NGSI-LD Entities</h3>
                <p className="text-sm text-gray-500">Quản lý các entity trong Context Broker</p>
              </div>
              <Button className="rounded-[14px] bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" /> Thêm Entity
              </Button>
            </div>
            
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Tìm kiếm entity theo ID hoặc Type..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10 rounded-[14px] shadow-sm"
                style={borderStyle} 
              />
            </div>

            <div className="space-y-3">
              {isLoading ? (
                 <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    Đang tải dữ liệu từ API...
                 </div>
              ) : filteredEntities.length === 0 ? (
                 <div className="text-center py-10 text-gray-500">Không tìm thấy dữ liệu nào.</div>
              ) : (
                filteredEntities.map((entity) => (
                  <div 
                    key={entity.id} 
                    className="p-4 bg-gray-50 rounded-[14px] hover:bg-white transition-all"
                    style={borderStyle}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 font-mono truncate pr-4" title={entity.id}>{entity.id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-white text-gray-800" style={borderStyle}>{entity.type}</Badge>
                          <Badge variant="default" className="bg-green-600 rounded-[8px]">active</Badge>
                          <span className="text-xs text-gray-600 truncate max-w-[200px]">{entity.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-900"><Edit className="w-4 h-4" /></Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(entity.id, entity.category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500 border-t border-gray-200 pt-2">
                      <span>Source: {entity.category}</span>
                      <span>Time: {entity.dateObserved ? new Date(entity.dateObserved).toLocaleTimeString() : 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="models">
           <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">FIWARE Smart Data Models</h3>
              <div className="p-8 text-center text-gray-500">Đang đồng bộ models...</div>
           </div>
        </TabsContent>
        
        <TabsContent value="import">
           <div className="bg-white rounded-[14px] p-6 shadow-sm" style={borderStyle}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import / Export</h3>
              <div 
                className="border-2 border-dashed rounded-[14px] p-12 text-center border-gray-300 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50"
              >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-900 font-medium">Kéo thả file hoặc click để chọn</p>
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ JSON, CSV (Max 10MB)</p>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}