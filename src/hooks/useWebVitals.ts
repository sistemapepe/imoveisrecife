import { useEffect } from 'react';
import { onLCP, onFID, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to measure Web Vitals and log them to Supabase for analysis.
 */
export function useWebVitals() {
  useEffect(() => {
    // Check if the user is on a slow connection
    const connection = (navigator as any).connection;
    const isSlow = connection && (connection.saveData || /2g|3g/.test(connection.effectiveType));
    
    const logMetric = ({ name, value, id }: { name: string; value: number; id: string }) => {
      // Basic log to console for immediate visibility during dev/testing
      console.log(`[Web Vitals] ${name}:`, value, `(${id})`, isSlow ? '[Slow Connection]' : '');

      // Log to Supabase for persistent tracking
      // We use a non-blocking background task
      supabase.from('performance_logs' as any).insert({
        metric_name: name,
        metric_value: value,
        page_url: window.location.pathname,
        visitor_id: localStorage.getItem('visitor_id'),
        device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
        is_slow_connection: !!isSlow,
        connection_type: connection?.effectiveType || 'unknown'
      }).then(({ error }) => {
        if (error) console.error('Error logging web vitals:', error);
      });
    };

    // Initialize observers
    onCLS(logMetric);
    onFID(logMetric);
    onLCP(logMetric);
    onINP(logMetric);
    onFCP(logMetric);
    onTTFB(logMetric);
  }, []);
}
