import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ReportPayload {
  category: 'traffic' | 'weather' | 'environment' | 'infrastructure';
  description: string;
  address: string;
  lat: number;
  lng: number;
  imageBase64?: string | null;
  reporterName?: string;
}

// Interface for the raw NGSI-LD data coming from backend
export interface NgsiReport {
  id: string;
  type: string;
  category?: { value: string };
  description?: { value: string };
  address?: { value: any }; // Could be string or object
  location?: { value: { coordinates: [number, number] } };
  status?: { value: string };
  dateObserved?: { value: string };
  media?: { value: string };
  reporter?: { value: string };
  [key: string]: any;
}

export const createCitizenReport = async (data: ReportPayload) => {
  const reportId = `rep_${Date.now()}`;
  const domain = 'citizen'; 

  // Mapping simple data to NGSI-LD structure for the "Generic Adapter" to handle
  const body = {
    id: `urn:ngsi-ld:IssueReporting:${reportId}`,
    type: 'IssueReporting',
    category: { type: 'Property', value: data.category },
    description: { type: 'Property', value: data.description },
    address: { type: 'Property', value: data.address },
    location: {
      type: 'GeoProperty',
      value: { type: 'Point', coordinates: [data.lng, data.lat] }
    },
    media: data.imageBase64 ? { type: 'Property', value: data.imageBase64 } : undefined,
    reporter: { type: 'Property', value: data.reporterName || 'Anonymous' },
    status: { type: 'Property', value: 'pending' },
    dateObserved: { type: 'Property', value: new Date().toISOString() }
  };

  try {
    // Using the generic "upsert" endpoint
    const response = await axios.post(
      `${API_URL}/${domain}/status/${reportId}`,
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to submit report:', error);
    throw error;
  }
};

export const getReports = async (): Promise<NgsiReport[]> => {
  try {
    const domain = 'citizen';
    const response = await axios.get(`${API_URL}/${domain}/status`);
    // The backend returns an array of NGSI-LD entities
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return [];
  }
};