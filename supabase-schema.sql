-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('designer', 'client', 'admin')),
  avatar TEXT,
  bio TEXT,
  date_of_birth TEXT,
  gender TEXT,
  location TEXT,
  phone TEXT,
  website TEXT,
  experience TEXT,
  skills TEXT,
  specialization TEXT,
  instagram TEXT,
  twitter TEXT,
  linkedin TEXT,
  is_pro BOOLEAN DEFAULT false,
  pro_plan TEXT,
  pro_expiry TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Designs
CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  category_id TEXT REFERENCES categories(id),
  price REAL DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  source_files TEXT,
  preview_images TEXT,
  view_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  display_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  designer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  design_id TEXT NOT NULL REFERENCES designs(id),
  buyer_id TEXT NOT NULL REFERENCES users(id),
  designer_id TEXT NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  commission REAL DEFAULT 0,
  total_paid REAL NOT NULL,
  payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content TEXT NOT NULL,
  design_id TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  design_id TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(design_id, user_id)
);

-- Followers
CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content TEXT NOT NULL,
  sender_id TEXT NOT NULL REFERENCES users(id),
  receiver_id TEXT NOT NULL REFERENCES users(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  design_id TEXT REFERENCES designs(id),
  designer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Withdrawals
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read profiles, only own user can update
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Designs: viewable by everyone, only designer can create/update their own
CREATE POLICY "Designs are viewable by everyone" ON designs FOR SELECT USING (true);
CREATE POLICY "Designers can create designs" ON designs FOR INSERT WITH CHECK (auth.uid()::text = designer_id);
CREATE POLICY "Designers can update their own designs" ON designs FOR UPDATE USING (auth.uid()::text = designer_id);
CREATE POLICY "Designers can delete their own designs" ON designs FOR DELETE USING (auth.uid()::text = designer_id);

-- Orders: buyers/designers can see their own, admins can see all
CREATE POLICY "Users can see their own orders" ON orders FOR SELECT USING (auth.uid()::text = buyer_id OR auth.uid()::text = designer_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND is_admin = true));
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = buyer_id);

-- Comments: viewable by all, authenticated users can create
CREATE POLICY "Comments viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Likes: viewable by all, authenticated can create their own
CREATE POLICY "Likes viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid()::text = user_id);

-- Follows
CREATE POLICY "Follows viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON follows FOR INSERT WITH CHECK (auth.uid()::text = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid()::text = follower_id);

-- Messages
CREATE POLICY "Messages visible to sender and receiver" ON messages FOR SELECT USING (auth.uid()::text = sender_id OR auth.uid()::text = receiver_id);
CREATE POLICY "Authenticated users can message" ON messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

-- Reviews
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = author_id);

-- Withdrawals
CREATE POLICY "Users can see their own withdrawals" ON withdrawals FOR SELECT USING (auth.uid()::text = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND is_admin = true));
CREATE POLICY "Users can create withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Trigger to auto-set user id from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id::text, NEW.email, NEW.raw_user_meta_data->>'name', COALESCE(NEW.raw_user_meta_data->>'role', 'designer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
