CREATE TABLE public.performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metric_name TEXT NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  page_url TEXT NOT NULL,
  visitor_id TEXT,
  device_type TEXT,
  is_slow_connection BOOLEAN DEFAULT false,
  connection_type TEXT
);

-- Enable RLS
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for inserts (anon)
CREATE POLICY "Anyone can insert performance logs" 
ON public.performance_logs 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing (admin only)
CREATE POLICY "Admins can view performance logs" 
ON public.performance_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);