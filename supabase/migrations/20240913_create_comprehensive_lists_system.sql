-- Comprehensive Lists System Migration
-- Creates flexible list management with types, metadata, and household sharing

-- Create lists table with comprehensive type system
CREATE TABLE lists (
  id bigint primary key generated always as identity,
  household_id uuid references households(id) ON DELETE CASCADE,
  title text not null,
  type text not null check (type in (
    -- 🛒 Household & Food
    'grocery', 'pantry_staples', 'meal_prep', 'shopping_general',
    -- 🏡 Home & Projects
    'home_projects', 'chores', 'maintenance', 'wishlist_home',
    -- 👨‍👩‍👧 Family Life
    'baby_names', 'pet_names', 'vacation_ideas', 'restaurants', 'bucket_list',
    -- 📚 Entertainment & Learning
    'books', 'movies', 'podcasts', 'music', 'games',
    -- 🎁 Gifting & Special Occasions
    'gifts', 'birthday_planning', 'anniversary_ideas',
    -- 📈 Personal & Growth
    'goals', 'habits', 'gratitude', 'affirmations',
    -- 🧠 Brainstorm & Creative
    'ideas', 'dreams', 'crafts', 'business_ideas'
  )),
  description text,
  icon text, -- emoji or icon name
  color text, -- hex color for visual organization
  is_template boolean default false, -- for system templates
  is_shared boolean default true, -- household sharing
  created_by uuid references auth.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now(),
  -- List-specific settings
  settings jsonb default '{}' -- category preferences, sorting, etc.
);

-- Create list_items table with flexible metadata
CREATE TABLE list_items (
  id bigint primary key generated always as identity,
  list_id bigint references lists(id) ON DELETE CASCADE,
  content text not null,
  details jsonb default '{}', -- flexible metadata
  checked boolean default false,
  position integer default 0, -- for manual ordering
  created_by uuid references auth.users(id),
  assigned_to uuid references auth.users(id), -- for chores, tasks
  created_at timestamp default now(),
  updated_at timestamp default now(),
  -- Item-specific data
  due_date timestamp, -- for tasks, deadlines
  priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  category text, -- subcategory within list type
  tags text[] default '{}' -- flexible tagging system
);

-- Add indexes for performance
CREATE INDEX idx_lists_household_id ON lists(household_id);
CREATE INDEX idx_lists_type ON lists(type);
CREATE INDEX idx_lists_created_by ON lists(created_by);
CREATE INDEX idx_lists_updated_at ON lists(updated_at);

CREATE INDEX idx_list_items_list_id ON list_items(list_id);
CREATE INDEX idx_list_items_checked ON list_items(checked);
CREATE INDEX idx_list_items_assigned_to ON list_items(assigned_to);
CREATE INDEX idx_list_items_due_date ON list_items(due_date);
CREATE INDEX idx_list_items_priority ON list_items(priority);
CREATE INDEX idx_list_items_position ON list_items(position);
CREATE INDEX idx_list_items_updated_at ON list_items(updated_at);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_list_items_details_gin ON list_items USING gin(details);
CREATE INDEX idx_list_items_tags_gin ON list_items USING gin(tags);
CREATE INDEX idx_lists_settings_gin ON lists USING gin(settings);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lists_updated_at
    BEFORE UPDATE ON lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_list_items_updated_at
    BEFORE UPDATE ON list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- Lists RLS Policies
-- Users can read lists in their household
CREATE POLICY "Users can read household lists"
ON lists FOR SELECT
TO authenticated
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Users can create lists in their household
CREATE POLICY "Users can create household lists"
ON lists FOR INSERT
TO authenticated
WITH CHECK (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Users can update lists in their household
CREATE POLICY "Users can update household lists"
ON lists FOR UPDATE
TO authenticated
USING (
  household_id IN (
    SELECT household_id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Users can delete lists they created or if they have admin role
CREATE POLICY "Users can delete own lists or admins can delete any"
ON lists FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND household_id = lists.household_id 
    AND household_role IN ('admin', 'parent')
  )
);

-- List Items RLS Policies
-- Users can read items in household lists
CREATE POLICY "Users can read household list items"
ON list_items FOR SELECT
TO authenticated
USING (
  list_id IN (
    SELECT id FROM lists 
    WHERE household_id IN (
      SELECT household_id 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Users can create items in household lists
CREATE POLICY "Users can create household list items"
ON list_items FOR INSERT
TO authenticated
WITH CHECK (
  list_id IN (
    SELECT id FROM lists 
    WHERE household_id IN (
      SELECT household_id 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Users can update items in household lists
CREATE POLICY "Users can update household list items"
ON list_items FOR UPDATE
TO authenticated
USING (
  list_id IN (
    SELECT id FROM lists 
    WHERE household_id IN (
      SELECT household_id 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Users can delete items they created or if assigned to them
CREATE POLICY "Users can delete own items or assigned items"
ON list_items FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM lists l
    JOIN profiles p ON p.household_id = l.household_id
    WHERE l.id = list_items.list_id 
    AND p.user_id = auth.uid()
    AND p.household_role IN ('admin', 'parent')
  )
);

-- Create helper functions for list management
CREATE OR REPLACE FUNCTION get_household_lists(target_household_id uuid)
RETURNS TABLE (
  id bigint,
  title text,
  type text,
  description text,
  icon text,
  color text,
  item_count bigint,
  checked_count bigint,
  last_updated timestamp
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    l.id,
    l.title,
    l.type,
    l.description,
    l.icon,
    l.color,
    COUNT(li.id) as item_count,
    COUNT(CASE WHEN li.checked THEN 1 END) as checked_count,
    GREATEST(l.updated_at, MAX(li.updated_at)) as last_updated
  FROM lists l
  LEFT JOIN list_items li ON l.id = li.list_id
  WHERE l.household_id = target_household_id
  GROUP BY l.id, l.title, l.type, l.description, l.icon, l.color, l.updated_at
  ORDER BY l.updated_at DESC;
$$;

-- Function to get list items with user info
CREATE OR REPLACE FUNCTION get_list_items_with_users(target_list_id bigint)
RETURNS TABLE (
  id bigint,
  content text,
  details jsonb,
  checked boolean,
  position integer,
  created_at timestamp,
  updated_at timestamp,
  due_date timestamp,
  priority text,
  category text,
  tags text[],
  created_by_name text,
  assigned_to_name text
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    li.id,
    li.content,
    li.details,
    li.checked,
    li.position,
    li.created_at,
    li.updated_at,
    li.due_date,
    li.priority,
    li.category,
    li.tags,
    p1.full_name as created_by_name,
    p2.full_name as assigned_to_name
  FROM list_items li
  LEFT JOIN profiles p1 ON li.created_by = p1.user_id
  LEFT JOIN profiles p2 ON li.assigned_to = p2.user_id
  WHERE li.list_id = target_list_id
  ORDER BY li.position ASC, li.created_at ASC;
$$;

-- Insert default list templates
INSERT INTO lists (household_id, title, type, description, icon, color, is_template, created_by) VALUES
-- Household & Food Templates
(NULL, 'Weekly Groceries', 'grocery', 'Your weekly grocery shopping list', '🛒', '#22c55e', true, NULL),
(NULL, 'Pantry Essentials', 'pantry_staples', 'Items to always keep stocked', '🏠', '#f59e0b', true, NULL),
(NULL, 'Meal Prep Ingredients', 'meal_prep', 'Ingredients for batch cooking', '🍽️', '#3b82f6', true, NULL),

-- Home & Projects Templates  
(NULL, 'Honey-Do List', 'home_projects', 'Home improvement and DIY projects', '🔨', '#8b5cf6', true, NULL),
(NULL, 'Weekly Chores', 'chores', 'Household tasks and cleaning', '✅', '#06b6d4', true, NULL),
(NULL, 'Home Maintenance', 'maintenance', 'Seasonal and periodic maintenance', '🛠️', '#ef4444', true, NULL),

-- Family Life Templates
(NULL, 'Baby Names', 'baby_names', 'Name ideas for our little one', '👶', '#ec4899', true, NULL),
(NULL, 'Vacation Dreams', 'vacation_ideas', 'Places we want to visit', '✈️', '#10b981', true, NULL),
(NULL, 'Restaurants to Try', 'restaurants', 'New places to eat', '🍽️', '#f97316', true, NULL),

-- Entertainment Templates
(NULL, 'Reading List', 'books', 'Books we want to read', '📚', '#6366f1', true, NULL),
(NULL, 'Movie Night', 'movies', 'Movies and shows to watch', '🎬', '#8b5cf6', true, NULL),
(NULL, 'Game Collection', 'games', 'Games for family fun', '🎲', '#10b981', true, NULL),

-- Personal Growth Templates
(NULL, 'Life Goals', 'goals', 'Our aspirations and objectives', '🎯', '#f59e0b', true, NULL),
(NULL, 'Daily Gratitude', 'gratitude', 'Things we are grateful for', '❤️', '#ec4899', true, NULL);

-- Grant permissions for functions
GRANT EXECUTE ON FUNCTION get_household_lists(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_list_items_with_users(bigint) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE lists IS 'Flexible list management system supporting multiple list types with household sharing';
COMMENT ON TABLE list_items IS 'Items within lists with flexible metadata and assignment capabilities';
COMMENT ON COLUMN list_items.details IS 'JSONB field for type-specific metadata (quantity, price, notes, etc.)';
COMMENT ON COLUMN lists.settings IS 'JSONB field for list-specific configuration (sorting, categories, etc.)';