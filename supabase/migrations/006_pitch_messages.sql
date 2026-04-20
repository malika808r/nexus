-- Migration 006: Pitch Messages

CREATE TABLE IF NOT EXISTS public.pitch_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pitch_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pitch messages they are involved in" 
ON public.pitch_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages" 
ON public.pitch_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);
