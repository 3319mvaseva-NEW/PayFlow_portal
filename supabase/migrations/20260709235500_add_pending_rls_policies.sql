-- Политика за РЕДАКЦИЯ (UPDATE) само ако статусът е pending
CREATE POLICY "Users can update their own pending requests" 
ON public.payment_requests 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Политика за ИЗТРИВАНЕ (DELETE) само ако статусът е pending
CREATE POLICY "Users can delete their own pending requests" 
ON public.payment_requests 
FOR DELETE 
USING (auth.uid() = user_id AND status = 'pending');