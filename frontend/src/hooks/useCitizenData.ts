/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { useState, useEffect } from 'react';
import { CitizenEntity } from '@/types/citizen-data';

// Domain tương ứng với Backend: weather, air, parking, bus
export type DataSourceDomain = 'weather' | 'air' | 'parking' | 'bus';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useCitizenData = (domain: DataSourceDomain) => {
  const [data, setData] = useState<CitizenEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gọi API Backend: GET /:domain/status
        const response = await fetch(`${API_BASE_URL}/${domain}/status?limit=20`);

        if (!response.ok) {
          throw new Error(`Lỗi kết nối: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching citizen data:", err);
          setError(err.message || 'Không thể tải dữ liệu.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [domain]);

  return { data, loading, error };
};