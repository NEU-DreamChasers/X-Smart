/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { CitizenEntity } from "@/types/citizen-data";

const getValue = (prop: any) => {
  if (!prop) return '';
  if (typeof prop === 'object' && 'value' in prop) return prop.value;
  return prop;
};

export const generateFilename = (domain: string, extension: 'json' | 'csv') => {
  const date = new Date().toISOString().slice(0, 10);
  const domainName = domain === 'weather' ? 'ThoiTiet' : 'ChatLuongKhongKhi';
  return `XSmart_OpenData_${domainName}_${date}.${extension}`;
};

export const exportToJSON = (data: CitizenEntity[], filename: string) => {
  const exportData = {
    meta: {
      source: "X-Smart City Platform",
      license: "MIT License - Open Data",
      exportedAt: new Date().toISOString(),
      count: data.length
    },
    data: data
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = filename;
  link.click();
};

export const exportToCSV = (data: CitizenEntity[], filename: string, domain: string) => {
  if (!data || data.length === 0) return;

  let headers = ['ID', 'Ten_Tram', 'Vi_Do', 'Kinh_Do', 'Thoi_Gian_Cap_Nhat'];
  
  if (domain === 'weather') headers.push('Nhiet_Do_C', 'Do_Am_Percent', 'Trang_Thai');
  if (domain === 'air') headers.push('AQI', 'Bui_PM25', 'Khi_CO');

  const rows = data.map(item => {
    const lat = item.location?.value?.coordinates?.[1] ?? '';
    const lon = item.location?.value?.coordinates?.[0] ?? '';
    const time = getValue(item.dateObserved) || item.modifiedAt || '';
    const name = getValue(item.name) || item.id;

    const baseData = [item.id, name, lat, lon, time];

    let specificData: any[] = [];
    
    if (domain === 'weather') {
      specificData = [
        getValue(item.temperature), 
        getValue(item.relativeHumidity), 
        getValue(item.weatherType)
      ];
    } else if (domain === 'air') {
      specificData = [
        getValue(item.airQualityIndex), 
        getValue(item.pm25), 
        getValue(item.co)
      ];
    }

    return [...baseData, ...specificData]
      .map(field => `"${String(field).replace(/"/g, '""')}"`)
      .join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};