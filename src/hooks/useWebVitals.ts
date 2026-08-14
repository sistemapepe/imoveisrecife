import { useEffect } from 'react';
import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Hook to measure Web Vitals and log them to Supabase for analysis.
 */
export function useWebVitals() {
  useEffect(() => {
    // Check if the user is on a slow connection
    const connection = (navigator as any).connection;
    const isSlow = connection && (connection.saveData || /2g|3g/.test(connection.effectiveType));
    
    const logMetric = ({ name, value, id, rating }: { name: string; value: number; id: string; rating?: string }) => {
      // Basic log to console for immediate visibility during dev/testing
      console.log(`[Web Vitals] ${name}:`, value, `(${id})`, isSlow ? '[Slow Connection]' : '', rating ? `[${rating}]` : '');

      // Log to Supabase for persistent tracking
      supabase.from('performance_logs' as any).insert({
        metric_name: name,
        metric_value: value,
        page_url: window.location.pathname,
        visitor_id: localStorage.getItem('visitor_id') || 'anon',
        device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
        is_slow_connection: !!isSlow,
        connection_type: connection?.effectiveType || 'unknown',
        context: {
          id,
          rating,
          timestamp: new Date().toISOString()
        }
      }).then(({ error }) => {
        if (error) {
          logger.error('Error logging web vitals', { metricName: name, id }, error as unknown as Error);
        }
      });
    };

    // Initialize observers
    onCLS(logMetric);
    onLCP(logMetric);
    onINP(logMetric);
    onFCP(logMetric);
    onTTFB(logMetric);
  }, []);
}
