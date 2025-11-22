'use client';

import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Database, Download, Upload, Search, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

const entities = [
  { id: 'urn:ngsi-ld:AirQuality:Q1-001', type: 'AirQualityObserved', location: 'Quận 1', lastUpdate: '2 phút trước', status: 'active', dataModel: 'FIWARE' },
  { id: 'urn:ngsi-ld:BusStop:BS-045', type: 'BusStop', location: 'Bến Thành', lastUpdate: '5 phút trước', status: 'active', dataModel: 'FIWARE' },
  { id: 'urn:ngsi-ld:StreetLight:SL-789', type: 'StreetLight', location: 'Đường Lê Duẩn', lastUpdate: '3 phút trước', status: 'warning', dataModel: 'FIWARE' },
];

const dataSources = [
  { name: 'OpenWeatherMap', type: 'Weather API', status: 'connected', lastSync: '15 phút trước', records: '1,234' },
  { name: 'OpenAQ', type: 'Air Quality API', status: 'connected', lastSync: '5 phút trước', records: '5,678' },
  { name: 'IoT Sensors', type: 'SOSA/SSN', status: 'connected', lastSync: '1 phút trước', records: '45,678' },
];

const cardStyle = { border: '0.8px solid rgba(0, 0, 0, 0.10)' };

export function AdminDataManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('entities');

  return (
    <div className="space-y-6">
      {/* Data Sources Status */}
      <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-950">Nguồn dữ liệu</h3>
            <p className="text-sm text-gray-500">Tích hợp API và dữ liệu mở</p>
          </div>
          <Button size="sm" variant="outline" className="rounded-[10px]" style={cardStyle}>
            <RefreshCw className="w-4 h-4 mr-2" /> Đồng bộ
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((source, index) => (
            <div key={index} className="p-4 bg-gray-50/50 rounded-[14px] hover:bg-white transition-all" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-neutral-950">{source.name}</p>
                <Badge variant={source.status === 'connected' ? 'default' : 'secondary'} className="rounded-md shadow-none">{source.status}</Badge>
              </div>
              <p className="text-xs text-gray-600 mb-3">{source.type}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{source.records} records</span>
                <span>{source.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Data Management */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center !rounded-full bg-gray-100 p-1 gap-1 w-full max-w-md">
          {['entities', 'models', 'import'].map(tab => (
             <TabsTrigger key={tab} value={tab} className="flex-1 !rounded-full capitalize text-sm data-[state=active]:text-neutral-950 text-gray-600">{tab}</TabsTrigger>
          ))}
        </TabsList>

        {/* Entities Tab */}
        <TabsContent value="entities">
          <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-950">NGSI-LD Entities</h3>
                <p className="text-sm text-gray-500">Quản lý các entity trong Context Broker</p>
              </div>
              <Button className="rounded-[10px] bg-neutral-950 text-white hover:bg-neutral-800">
                <Plus className="w-4 h-4 mr-2" /> Thêm Entity
              </Button>
            </div>
            
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Tìm kiếm entity..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-[14px] shadow-none" style={cardStyle} />
            </div>

            <div className="space-y-3">
              {entities.map((entity) => (
                <div key={entity.id} className="p-4 bg-gray-50/50 rounded-[14px] hover:bg-white transition-all" style={cardStyle}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-950 font-mono">{entity.id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-white text-neutral-950" style={cardStyle}>{entity.type}</Badge>
                        <Badge variant={entity.status === 'active' ? 'default' : 'secondary'} className="shadow-none">{entity.status}</Badge>
                        <span className="text-xs text-gray-600">{entity.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full"><Edit className="w-4 h-4 text-gray-600" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500 border-t border-black/5 pt-2">
                    <span>Model: {entity.dataModel}</span>
                    <span>Cập nhật: {entity.lastUpdate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Models & Import Tabs (Simplified for brevity, applied same style) */}
        <TabsContent value="models">
           <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <h3 className="text-lg font-medium text-neutral-950 mb-4">FIWARE Smart Data Models</h3>
              <div className="p-8 text-center text-gray-500">Nội dung tab Models đang cập nhật style...</div>
           </div>
        </TabsContent>
        <TabsContent value="import">
           <div className="bg-white rounded-[14px] p-6 shadow-sm" style={cardStyle}>
              <h3 className="text-lg font-medium text-neutral-950 mb-4">Import / Export</h3>
              <div className="border-2 border-dashed rounded-[14px] p-8 text-center border-gray-200">
                  <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-900">Kéo thả file hoặc click để chọn</p>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}