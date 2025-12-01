import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAddress = (val: any): string => {
  // Nếu null/undefined hoặc các giá trị mặc định
  if (!val || val === 'Unknown Street' || val === 'Unknown' || val === 'N/A') {
    return 'Đang cập nhật địa chỉ chi tiết';
  }
  
  // Nếu đã là string, return luôn
  if (typeof val === 'string') {
    return val;
  }
  
  // Nếu là object, ghép các trường địa chỉ lại
  if (typeof val === 'object') {
    const parts: string[] = [];
    
    // Thứ tự ưu tiên: streetAddress -> road -> các trường khác
    if (val.streetAddress) parts.push(val.streetAddress);
    else {
      if (val.road || val.street) parts.push(val.road || val.street);
      if (val.addressLocality || val.city) parts.push(val.addressLocality || val.city);
      if (val.addressRegion || val.state) parts.push(val.addressRegion || val.state);
      if (val.addressCountry || val.country) parts.push(val.addressCountry || val.country);
    }
    
    const result = parts.filter(Boolean).join(', ');
    return result || 'Đang cập nhật địa chỉ chi tiết';
  }
  
  return 'Đang cập nhật địa chỉ chi tiết';
};
