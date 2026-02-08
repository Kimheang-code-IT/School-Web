import { useState, useEffect, useCallback } from 'react';
import { get } from '../services/api.js';
import { ENDPOINTS } from '../api/endpoints.js';
import productCategoriesFallback from '../data/productCategories.json';

const cache = { data: null, loading: false, error: null };

export function useProductCategories() {
  const [data, setData] = useState(cache.data !== null ? cache.data : null);
  const [loading, setLoading] = useState(cache.loading);
  const [error, setError] = useState(cache.error);

  const fetchData = useCallback(async () => {
    if (cache.data !== null && !cache.error) return cache.data;
    cache.loading = true;
    setLoading(true);
    setError(null);
    try {
      const result = await get(ENDPOINTS.CATEGORIES_PRODUCTS);
      const list = Array.isArray(result) ? result : result?.data ?? result?.categories ?? [];
      cache.data = list;
      cache.loading = false;
      cache.error = null;
      setData(list);
      setLoading(false);
      setError(null);
      return list;
    } catch (e) {
      const fallback = Array.isArray(productCategoriesFallback) ? productCategoriesFallback : [];
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

  return { data: data ?? [], loading, error, refetch: fetchData };
}
