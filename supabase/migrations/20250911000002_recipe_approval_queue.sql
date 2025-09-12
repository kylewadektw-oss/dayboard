-- Recipe Approval Queue System
-- Migration for managing recipe imports from external APIs like Spoonacular

-- Create enum for recipe queue status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_queue_status') THEN
    CREATE TYPE recipe_queue_status AS ENUM ('pending', 'approved', 'rejected', 'needs_review');
  END IF;
END $$;

-- Recipe import queue table
CREATE TABLE IF NOT EXISTS recipe_import_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL, -- Spoonacular recipe ID
  external_source text NOT NULL DEFAULT 'spoonacular', -- 'spoonacular', 'manual', etc.
  raw_data jsonb NOT NULL, -- Full API response
  processed_data jsonb, -- Normalized recipe data ready for recipes table
  status recipe_queue_status DEFAULT 'pending',
  
  -- Extracted key fields for easy filtering/searching
  title text,
  description text,
  image_url text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  total_time_minutes integer,
  servings integer,
  difficulty text,
  cuisine text,
  meal_types text[], -- array of meal types
  diet_types text[], -- array of diet restrictions
  tags text[], -- array of tags
  
  -- Approval workflow
  submitted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  review_notes text,
  approved_at timestamptz,
  rejected_at timestamptz,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate imports
  UNIQUE(external_source, external_id)
);

-- Recipe approval decisions log
CREATE TABLE IF NOT EXISTS recipe_approval_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id uuid REFERENCES recipe_import_queue(id) ON DELETE CASCADE,
  action recipe_queue_status NOT NULL,
  performed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  previous_status recipe_queue_status,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_status ON recipe_import_queue(status);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_source ON recipe_import_queue(external_source);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_external_id ON recipe_import_queue(external_source, external_id);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_submitted_by ON recipe_import_queue(submitted_by);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_reviewed_by ON recipe_import_queue(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_recipe_import_queue_created_at ON recipe_import_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_recipe_approval_log_queue_item ON recipe_approval_log(queue_item_id);

-- Enable RLS
ALTER TABLE recipe_import_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_approval_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Recipe import queue policies
CREATE POLICY "Super admins can manage all queue items" ON recipe_import_queue
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own submissions" ON recipe_import_queue
  FOR SELECT TO authenticated USING (submitted_by = auth.uid());

CREATE POLICY "Users can submit to queue" ON recipe_import_queue
  FOR INSERT TO authenticated WITH CHECK (submitted_by = auth.uid());

-- Approval log policies
CREATE POLICY "Super admins can manage approval log" ON recipe_approval_log
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view logs for their submissions" ON recipe_approval_log
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM recipe_import_queue 
      WHERE id = recipe_approval_log.queue_item_id 
      AND submitted_by = auth.uid()
    )
  );

-- Function to normalize Spoonacular data to our recipe format
CREATE OR REPLACE FUNCTION normalize_spoonacular_recipe(raw_data jsonb)
RETURNS jsonb AS $$
DECLARE
  normalized jsonb;
  ingredient jsonb;
  ingredients_array jsonb[] := '{}';
  instruction_text text;
  instructions_array text[] := '{}';
  nutrition_data jsonb;
BEGIN
  -- Extract basic recipe information
  normalized := jsonb_build_object(
    'title', raw_data->>'title',
    'description', COALESCE(raw_data->>'summary', raw_data->>'title'),
    'image_url', raw_data->>'image',
    'prep_time_minutes', COALESCE((raw_data->>'preparationMinutes')::integer, 0),
    'cook_time_minutes', COALESCE((raw_data->>'cookingMinutes')::integer, 0),
    'total_time_minutes', COALESCE((raw_data->>'readyInMinutes')::integer, 0),
    'servings', COALESCE((raw_data->>'servings')::integer, 1),
    'difficulty', CASE 
      WHEN (raw_data->>'readyInMinutes')::integer <= 15 THEN 'easy'
      WHEN (raw_data->>'readyInMinutes')::integer <= 45 THEN 'medium'
      ELSE 'hard'
    END,
    'cuisine', COALESCE(
      (raw_data->'cuisines'->0)::text, 
      'international'
    ),
    'rating', COALESCE((raw_data->>'spoonacularScore')::numeric / 20, 0), -- Convert 0-100 to 0-5
    'rating_count', COALESCE((raw_data->>'aggregateLikes')::integer, 0),
    'source_url', raw_data->>'sourceUrl',
    'external_id', raw_data->>'id',
    'is_verified', true,
    'is_public', false -- Default to private until approved
  );

  -- Process ingredients
  IF raw_data ? 'extendedIngredients' AND jsonb_array_length(raw_data->'extendedIngredients') > 0 THEN
    FOR ingredient IN SELECT * FROM jsonb_array_elements(raw_data->'extendedIngredients')
    LOOP
      ingredients_array := ingredients_array || jsonb_build_object(
        'name', ingredient->>'name',
        'amount', COALESCE(ingredient->>'amount', '1'),
        'unit', COALESCE(ingredient->>'unit', 'piece'),
        'original', ingredient->>'original'
      );
    END LOOP;
  END IF;
  
  normalized := normalized || jsonb_build_object('ingredients', to_jsonb(ingredients_array));

  -- Process instructions
  IF raw_data ? 'analyzedInstructions' AND jsonb_array_length(raw_data->'analyzedInstructions') > 0 THEN
    -- Extract steps from the first instruction set
    FOR instruction_text IN 
      SELECT step->>'step' 
      FROM jsonb_array_elements(raw_data->'analyzedInstructions'->0->'steps') AS step
    LOOP
      instructions_array := instructions_array || instruction_text;
    END LOOP;
  ELSIF raw_data ? 'instructions' THEN
    -- Fallback to simple instructions
    instructions_array := ARRAY[raw_data->>'instructions'];
  END IF;
  
  normalized := normalized || jsonb_build_object('instructions', to_jsonb(instructions_array));

  -- Process dietary information
  normalized := normalized || jsonb_build_object(
    'diet_types', COALESCE(raw_data->'diets', '[]'::jsonb),
    'meal_type', COALESCE(raw_data->'dishTypes', '["main"]'::jsonb),
    'tags', COALESCE(raw_data->'dishTypes', '[]'::jsonb)
  );

  -- Add nutrition if available
  IF raw_data ? 'nutrition' THEN
    nutrition_data := raw_data->'nutrition';
    normalized := normalized || jsonb_build_object(
      'nutrition', jsonb_build_object(
        'calories', COALESCE((nutrition_data->'nutrients'->0->>'amount')::numeric, 0),
        'protein', COALESCE((nutrition_data->'nutrients'->1->>'amount')::numeric, 0),
        'carbs', COALESCE((nutrition_data->'nutrients'->2->>'amount')::numeric, 0),
        'fat', COALESCE((nutrition_data->'nutrients'->3->>'amount')::numeric, 0)
      )
    );
  END IF;

  RETURN normalized;
END;
$$ LANGUAGE plpgsql;

-- Function to submit recipe from Spoonacular API
CREATE OR REPLACE FUNCTION submit_spoonacular_recipe(
  spoonacular_id text,
  api_data jsonb,
  submitter_id uuid DEFAULT auth.uid()
)
RETURNS uuid AS $$
DECLARE
  queue_id uuid;
  normalized_data jsonb;
BEGIN
  -- Normalize the Spoonacular data
  normalized_data := normalize_spoonacular_recipe(api_data);
  
  -- Insert into queue
  INSERT INTO recipe_import_queue (
    external_id,
    external_source,
    raw_data,
    processed_data,
    status,
    title,
    description,
    image_url,
    prep_time_minutes,
    cook_time_minutes,
    total_time_minutes,
    servings,
    difficulty,
    cuisine,
    meal_types,
    diet_types,
    tags,
    submitted_by
  )
  VALUES (
    spoonacular_id,
    'spoonacular',
    api_data,
    normalized_data,
    'pending',
    normalized_data->>'title',
    normalized_data->>'description',
    normalized_data->>'image_url',
    (normalized_data->>'prep_time_minutes')::integer,
    (normalized_data->>'cook_time_minutes')::integer,
    (normalized_data->>'total_time_minutes')::integer,
    (normalized_data->>'servings')::integer,
    normalized_data->>'difficulty',
    normalized_data->>'cuisine',
    ARRAY(SELECT jsonb_array_elements_text(normalized_data->'meal_type')),
    ARRAY(SELECT jsonb_array_elements_text(normalized_data->'diet_types')),
    ARRAY(SELECT jsonb_array_elements_text(normalized_data->'tags')),
    submitter_id
  )
  ON CONFLICT (external_source, external_id) 
  DO UPDATE SET
    raw_data = EXCLUDED.raw_data,
    processed_data = EXCLUDED.processed_data,
    updated_at = now()
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve a recipe from the queue
CREATE OR REPLACE FUNCTION approve_recipe_from_queue(
  queue_item_id uuid,
  reviewer_notes text DEFAULT NULL,
  target_household_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  queue_item recipe_import_queue%ROWTYPE;
  new_recipe_id uuid;
  recipe_data jsonb;
BEGIN
  -- Check if user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can approve recipes';
  END IF;

  -- Get queue item
  SELECT * INTO queue_item FROM recipe_import_queue WHERE id = queue_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Queue item not found';
  END IF;

  -- Get processed data
  recipe_data := queue_item.processed_data;

  -- Insert into recipes table
  INSERT INTO recipes (
    title,
    description,
    image_url,
    prep_time_minutes,
    cook_time_minutes,
    total_time_minutes,
    servings,
    difficulty,
    cuisine,
    meal_type,
    diet_types,
    tags,
    ingredients,
    instructions,
    rating,
    rating_count,
    household_id,
    created_by,
    is_favorite,
    is_public,
    is_verified,
    source_url
  )
  VALUES (
    recipe_data->>'title',
    recipe_data->>'description',
    recipe_data->>'image_url',
    (recipe_data->>'prep_time_minutes')::integer,
    (recipe_data->>'cook_time_minutes')::integer,
    (recipe_data->>'total_time_minutes')::integer,
    (recipe_data->>'servings')::integer,
    recipe_data->>'difficulty',
    recipe_data->>'cuisine',
    ARRAY(SELECT jsonb_array_elements_text(recipe_data->'meal_type')),
    ARRAY(SELECT jsonb_array_elements_text(recipe_data->'diet_types')),
    ARRAY(SELECT jsonb_array_elements_text(recipe_data->'tags')),
    recipe_data->'ingredients',
    ARRAY(SELECT jsonb_array_elements_text(recipe_data->'instructions')),
    COALESCE((recipe_data->>'rating')::numeric, 0),
    COALESCE((recipe_data->>'rating_count')::integer, 0),
    target_household_id, -- NULL for public recipes
    auth.uid(),
    false,
    target_household_id IS NULL, -- Public if no household specified
    true,
    recipe_data->>'source_url'
  )
  RETURNING id INTO new_recipe_id;

  -- Update queue item status
  UPDATE recipe_import_queue 
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    review_notes = reviewer_notes,
    approved_at = now(),
    updated_at = now()
  WHERE id = queue_item_id;

  -- Log the approval
  INSERT INTO recipe_approval_log (
    queue_item_id,
    action,
    performed_by,
    notes,
    previous_status
  )
  VALUES (
    queue_item_id,
    'approved',
    auth.uid(),
    reviewer_notes,
    queue_item.status
  );

  RETURN new_recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a recipe from the queue
CREATE OR REPLACE FUNCTION reject_recipe_from_queue(
  queue_item_id uuid,
  rejection_reason text
)
RETURNS void AS $$
DECLARE
  queue_item recipe_import_queue%ROWTYPE;
BEGIN
  -- Check if user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can reject recipes';
  END IF;

  -- Get queue item
  SELECT * INTO queue_item FROM recipe_import_queue WHERE id = queue_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Queue item not found';
  END IF;

  -- Update queue item status
  UPDATE recipe_import_queue 
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    review_notes = rejection_reason,
    rejected_at = now(),
    updated_at = now()
  WHERE id = queue_item_id;

  -- Log the rejection
  INSERT INTO recipe_approval_log (
    queue_item_id,
    action,
    performed_by,
    notes,
    previous_status
  )
  VALUES (
    queue_item_id,
    'rejected',
    auth.uid(),
    rejection_reason,
    queue_item.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get queue statistics
CREATE OR REPLACE FUNCTION get_recipe_queue_stats()
RETURNS TABLE (
  total_pending integer,
  total_approved integer,
  total_rejected integer,
  total_needs_review integer,
  oldest_pending timestamptz,
  newest_submission timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'pending')::integer,
    COUNT(*) FILTER (WHERE status = 'approved')::integer,
    COUNT(*) FILTER (WHERE status = 'rejected')::integer,
    COUNT(*) FILTER (WHERE status = 'needs_review')::integer,
    MIN(created_at) FILTER (WHERE status = 'pending'),
    MAX(created_at)
  FROM recipe_import_queue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_recipe_import_queue_updated_at ON recipe_import_queue;
CREATE TRIGGER update_recipe_import_queue_updated_at
    BEFORE UPDATE ON recipe_import_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
