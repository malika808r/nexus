-- Migration 005: Social Graph and Notifications

-- 1. Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'like', 'follow', 'collab_request'
    content_id UUID, -- Optional: ID of the post/event related to notification
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Policies for follows
CREATE POLICY "Follows are viewable by everyone" 
ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" 
ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 5. Policies for notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications" 
ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can mark own notifications as read" 
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 6. Storage Policies Placeholder
-- These typically require the storage schema to exist.
-- To be safe, we'll assume the user creates 'avatars' and 'post_images' buckets.
-- Below are the SQL commands to set up policies for those buckets if they exist.

-- Avatar policies
-- CREATE POLICY "Avatar images are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Post images policies
-- CREATE POLICY "Post images are public" ON storage.objects FOR SELECT USING (bucket_id = 'post_images');
-- CREATE POLICY "Users can upload post images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post_images' AND auth.uid() IS NOT NULL);
