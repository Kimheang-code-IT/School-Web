import { useState, useEffect, useCallback } from 'react';
import { get } from '../services/api.js';
import { ENDPOINTS } from '../api/endpoints.js';
import contactInfoFallback from '../data/contactInfo.json';

const cache = { data: null, loading: false, error: null };

export function useContactInfo() {
  const [data, setData] = useState(cache.data !== null ? cache.data : null);
  const [loading, setLoading] = useState(cache.loading);
  const [error, setError] = useState(cache.error);

  const fetchData = useCallback(async () => {
    if (cache.data !== null && !cache.error) return cache.data;
    cache.loading = true;
    setLoading(true);
    setError(null);
    try {
      const result = await get(ENDPOINTS.CONTACT);
      const obj = result && typeof result === 'object' && !Array.isArray(result) ? result : result?.data ?? {};
      cache.data = obj;
      cache.loading = false;
      cache.error = null;
      setData(obj);
      setLoading(false);
      setError(null);
      return obj;
    } catch (e) {
      const fallback = contactInfoFallback && typeof contactInfoFallback === 'object' ? contactInfoFallback : {};
      cache.data = fallback;
      cache.loading = false;
      cache.error = null;
      setData(fallback);
      setLoading(false);
      setError(null);
      return fallback;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data: data ?? {}, loading, error, refetch: fetchData };
}
