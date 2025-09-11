-- Create recipes table for meal planning and recipe management
-- Migration: Add comprehensive recipes table with full meal planning features

-- Create enums for recipe-related types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_difficulty') THEN
    CREATE TYPE recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_meal_type') THEN
    CREATE TYPE recipe_meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'beverage');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_diet_type') THEN
    CREATE TYPE recipe_diet_type AS ENUM ('none', 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'paleo', 'low_carb', 'mediterranean');
  END IF;
END $$;

-- Main recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title text NOT NULL,
  description text,
  image_url text,
  image_emoji text DEFAULT '🍽️',
  
  -- Recipe details
  prep_time_minutes integer DEFAULT 0,
  cook_time_minutes integer DEFAULT 0,
  total_time_minutes integer GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
  servings integer DEFAULT 1,
  difficulty recipe_difficulty DEFAULT 'medium',
  
  -- Classification
  cuisine text,
  meal_type recipe_meal_type[] DEFAULT ARRAY['dinner'],
  diet_types recipe_diet_type[] DEFAULT ARRAY['none'],
  tags text[] DEFAULT ARRAY[]::text[],
  
  -- Recipe content
  ingredients jsonb NOT NULL DEFAULT '[]', -- Array of ingredient objects {name, amount, unit, notes}
  instructions jsonb NOT NULL DEFAULT '[]', -- Array of instruction steps
  notes text,
  
  -- Nutrition (optional)
  nutrition jsonb, -- {calories, protein, carbs, fat, fiber, etc}
  
  -- Rating and favorites
  rating numeric(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  rating_count integer DEFAULT 0,
  
  -- Source information
  source_name text, -- "Family Recipe", "AllRecipes", "Food Network", etc.
  source_url text,
  external_id text, -- ID from external API if imported
  
  -- Household relationship
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Flags
  is_favorite boolean DEFAULT false,
  is_public boolean DEFAULT false, -- Can be shared with other households
  is_verified boolean DEFAULT false, -- Verified by household members
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_cooked_at timestamptz
);

-- Recipe ratings by users
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Recipe favorites by users
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Recipe cooking history
CREATE TABLE IF NOT EXISTS recipe_cooking_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  cooked_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  cooked_at timestamptz DEFAULT now(),
  servings_made integer,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5)
);

-- Meal planning (recipes scheduled for specific dates)
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  planned_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  planned_date date NOT NULL,
  meal_type recipe_meal_type NOT NULL DEFAULT 'dinner',
  servings_planned integer DEFAULT 1,
  notes text,
  status text DEFAULT 'planned', -- 'planned', 'preparing', 'completed', 'skipped'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recipe collections/categories
CREATE TABLE IF NOT EXISTS recipe_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#6366f1',
  icon text DEFAULT '📚',
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Many-to-many relationship between recipes and collections
CREATE TABLE IF NOT EXISTS recipe_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES recipe_collections(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, collection_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_household_id ON recipes(household_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes USING GIN(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_diet_types ON recipes USING GIN(diet_types);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON recipes(rating DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_total_time ON recipes(total_time_minutes);
CREATE INDEX IF NOT EXISTS idx_recipes_is_favorite ON recipes(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_recipes_search ON recipes USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(cuisine, '')));

CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_user_id ON recipe_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_user_id ON recipe_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorites_recipe_id ON recipe_favorites(recipe_id);

CREATE INDEX IF NOT EXISTS idx_meal_plans_household_id ON meal_plans(household_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_planned_date ON meal_plans(planned_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_recipe_id ON meal_plans(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipe_cooking_history_household_id ON recipe_cooking_history(household_id);
CREATE INDEX IF NOT EXISTS idx_recipe_cooking_history_cooked_by ON recipe_cooking_history(cooked_by);
CREATE INDEX IF NOT EXISTS idx_recipe_cooking_history_cooked_at ON recipe_cooking_history(cooked_at DESC);

-- RLS Policies
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_cooking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collection_items ENABLE ROW LEVEL SECURITY;

-- Recipes policies
CREATE POLICY "Household members can view recipes" ON recipes
  FOR SELECT TO authenticated USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    ) OR is_public = true
  );

CREATE POLICY "Household members can insert recipes" ON recipes
  FOR INSERT TO authenticated WITH CHECK (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Recipe creators and admins can update recipes" ON recipes
  FOR UPDATE TO authenticated USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND household_id = recipes.household_id 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Recipe creators and admins can delete recipes" ON recipes
  FOR DELETE TO authenticated USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND household_id = recipes.household_id 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Recipe ratings policies
CREATE POLICY "Users can manage their own ratings" ON recipe_ratings
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Household members can view recipe ratings" ON recipe_ratings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN profiles p ON p.id = auth.uid()
      WHERE r.id = recipe_ratings.recipe_id 
      AND (r.household_id = p.household_id OR r.is_public = true)
    )
  );

-- Recipe favorites policies
CREATE POLICY "Users can manage their own favorites" ON recipe_favorites
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Meal plans policies
CREATE POLICY "Household members can manage meal plans" ON meal_plans
  FOR ALL TO authenticated USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Recipe cooking history policies
CREATE POLICY "Household members can view cooking history" ON recipe_cooking_history
  FOR SELECT TO authenticated USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can add their own cooking history" ON recipe_cooking_history
  FOR INSERT TO authenticated WITH CHECK (
    cooked_by = auth.uid() AND
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Recipe collections policies
CREATE POLICY "Household members can manage collections" ON recipe_collections
  FOR ALL TO authenticated USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Household members can manage collection items" ON recipe_collection_items
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM recipe_collections rc
      JOIN profiles p ON p.id = auth.uid()
      WHERE rc.id = recipe_collection_items.collection_id 
      AND rc.household_id = p.household_id
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_ratings_updated_at BEFORE UPDATE ON recipe_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_collections_updated_at BEFORE UPDATE ON recipe_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update recipe rating when ratings change
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE recipes SET 
      rating = COALESCE((
        SELECT ROUND(AVG(rating::numeric), 1)
        FROM recipe_ratings 
        WHERE recipe_id = OLD.recipe_id
      ), 0),
      rating_count = (
        SELECT COUNT(*)
        FROM recipe_ratings 
        WHERE recipe_id = OLD.recipe_id
      )
    WHERE id = OLD.recipe_id;
    RETURN OLD;
  ELSE
    UPDATE recipes SET 
      rating = (
        SELECT ROUND(AVG(rating::numeric), 1)
        FROM recipe_ratings 
        WHERE recipe_id = NEW.recipe_id
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM recipe_ratings 
        WHERE recipe_id = NEW.recipe_id
      )
    WHERE id = NEW.recipe_id;
    RETURN NEW;
  END IF;
END;
$$ language plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_recipe_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON recipe_ratings
  FOR EACH ROW EXECUTE FUNCTION update_recipe_rating();

-- Insert default recipe collections for households
CREATE OR REPLACE FUNCTION create_default_recipe_collections()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO recipe_collections (name, description, household_id, created_by, is_default, sort_order, icon, color)
  VALUES 
    ('Favorites', 'Family favorite recipes', NEW.id, NEW.created_by, true, 1, '❤️', '#ef4444'),
    ('Quick Meals', 'Fast and easy recipes under 30 minutes', NEW.id, NEW.created_by, true, 2, '⚡', '#f59e0b'),
    ('Healthy Options', 'Nutritious and balanced meals', NEW.id, NEW.created_by, true, 3, '🥗', '#10b981'),
    ('Comfort Food', 'Hearty and satisfying dishes', NEW.id, NEW.created_by, true, 4, '🍲', '#8b5cf6'),
    ('Special Occasions', 'Recipes for holidays and celebrations', NEW.id, NEW.created_by, true, 5, '🎉', '#ec4899');
  
  RETURN NEW;
END;
$$ language plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_default_recipe_collections_trigger
  AFTER INSERT ON households
  FOR EACH ROW EXECUTE FUNCTION create_default_recipe_collections();

-- Insert some sample recipes (you can remove this in production)
DO $$
DECLARE
  sample_household_id uuid;
  sample_user_id uuid;
BEGIN
  -- Get a sample household and user for demo data
  SELECT h.id, h.created_by INTO sample_household_id, sample_user_id
  FROM households h
  LIMIT 1;
  
  IF sample_household_id IS NOT NULL THEN
    INSERT INTO recipes (
      title, description, image_emoji, prep_time_minutes, cook_time_minutes, 
      servings, difficulty, cuisine, meal_type, diet_types, tags,
      ingredients, instructions, household_id, created_by, rating, rating_count
    ) VALUES 
    (
      'Classic Spaghetti Carbonara',
      'Creamy Italian pasta dish with eggs, cheese, and pancetta',
      '🍝',
      10, 15, 4, 'medium', 'Italian',
      ARRAY['dinner'], ARRAY['none'],
      ARRAY['pasta', 'italian', 'quick', 'eggs'],
      '[
        {"name": "Spaghetti", "amount": "400", "unit": "g"},
        {"name": "Pancetta", "amount": "150", "unit": "g"},
        {"name": "Egg yolks", "amount": "3", "unit": "large"},
        {"name": "Parmesan cheese", "amount": "1", "unit": "cup", "notes": "grated"},
        {"name": "Black pepper", "amount": "1", "unit": "tsp", "notes": "freshly ground"}
      ]',
      '[
        "Cook spaghetti according to package directions",
        "Crisp pancetta in a large skillet",
        "Whisk egg yolks with cheese and pepper",
        "Toss hot pasta with pancetta and egg mixture",
        "Serve immediately with extra cheese"
      ]',
      sample_household_id, sample_user_id, 4.7, 12
    ),
    (
      'Honey Garlic Chicken',
      'Sweet and savory chicken thighs with a sticky glaze',
      '🍗',
      15, 25, 4, 'easy', 'American',
      ARRAY['dinner'], ARRAY['none'],
      ARRAY['chicken', 'easy', 'gluten-free', 'garlic'],
      '[
        {"name": "Chicken thighs", "amount": "8", "unit": "pieces", "notes": "bone-in, skin-on"},
        {"name": "Honey", "amount": "1/3", "unit": "cup"},
        {"name": "Soy sauce", "amount": "1/4", "unit": "cup"},
        {"name": "Garlic", "amount": "4", "unit": "cloves", "notes": "minced"},
        {"name": "Ginger", "amount": "1", "unit": "tsp", "notes": "grated"}
      ]',
      '[
        "Season chicken with salt and pepper",
        "Sear chicken skin-side down until golden",
        "Flip and cook until done",
        "Mix honey, soy sauce, garlic, and ginger",
        "Pour sauce over chicken and simmer until thick"
      ]',
      sample_household_id, sample_user_id, 4.8, 18
    );
  END IF;
END $$;

-- Enable realtime for recipes table
ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE recipe_favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_plans;
