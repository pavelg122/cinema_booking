/*
  # Add ratings table
  
  1. New Tables
    - `ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `rating` (integer, 0-5)
      - `comment` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on ratings table
    - Add policies for authenticated users
*/

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert own ratings" ON public.ratings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own ratings" ON public.ratings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.ratings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);