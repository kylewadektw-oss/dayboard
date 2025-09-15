import { createClient } from '@/utils/supabase/server'

export interface SpoonacularRecipe {
  id: number
  title: string
  image?: string
  imageType?: string
  servings?: number
  readyInMinutes?: number
  preparationMinutes?: number
  cookingMinutes?: number
  aggregateLikes?: number
  spoonacularScore?: number
  healthScore?: number
  creditsText?: string
  sourceName?: string
  sourceUrl?: string
  summary?: string
  cuisines?: string[]
  dishTypes?: string[]
  diets?: string[]
  occasions?: string[]
  instructions?: string
  analyzedInstructions?: Array<{
    name: string
    steps: Array<{
      number: number
      step: string
      ingredients?: Array<{
        id: number
        name: string
        localizedName: string
        image: string
      }>
      equipment?: Array<{
        id: number
        name: string
        localizedName: string
        image: string
      }>
      length?: {
        number: number
        unit: string
      }
    }>
  }>
  extendedIngredients?: Array<{
    id: number
    aisle: string
    image: string
    consistency: string
    name: string
    nameClean: string
    original: string
    originalString: string
    originalName: string
    amount: number
    unit: string
    meta: string[]
    measures: {
      us: {
        amount: number
        unitShort: string
        unitLong: string
      }
      metric: {
        amount: number
        unitShort: string
        unitLong: string
      }
    }
  }>
  nutrition?: {
    nutrients: Array<{
      name: string
      amount: number
      unit: string
      percentOfDailyNeeds?: number
    }>
    properties: Array<{
      name: string
      amount: number
      unit: string
    }>
    flavonoids: Array<{
      name: string
      amount: number
      unit: string
    }>
    ingredients: Array<{
      id: number
      name: string
      amount: number
      unit: string
      nutrients: Array<{
        name: string
        amount: number
        unit: string
        percentOfDailyNeeds?: number
      }>
    }>
    caloricBreakdown: {
      percentProtein: number
      percentFat: number
      percentCarbs: number
    }
    weightPerServing: {
      amount: number
      unit: string
    }
  }
}

export interface SpoonacularSearchResponse {
  results: Array<{
    id: number
    title: string
    image?: string
    imageType?: string
    nutrition?: {
      nutrients: Array<{
        name: string
        amount: number
        unit: string
      }>
    }
  }>
  offset: number
  number: number
  totalResults: number
}

class SpoonacularService {
  private apiKey: string | null = null
  private baseUrl = 'https://api.spoonacular.com/recipes'

  constructor() {
    // Don't validate API key at construction time to avoid build failures
  }

  private initializeApiKey() {
    if (this.apiKey === null) {
      this.apiKey = process.env.SPOONACULAR_API_KEY || ''
      if (!this.apiKey) {
        throw new Error('Spoonacular API key not found in environment variables')
      }
    }
  }

  private async fetchFromAPI<T>(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
    // Initialize API key on first use
    this.initializeApiKey()
    
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    // Add API key and default params
    url.searchParams.append('apiKey', this.apiKey!)
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    console.log(`🔗 Spoonacular API Request: ${url.toString()}`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Spoonacular API Error (${response.status}):`, errorText)
      throw new Error(`Spoonacular API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  }

  /**
   * Search for recipes with various filters
   */
  async searchRecipes(params: {
    query?: string
    cuisine?: string
    diet?: string
    intolerances?: string
    type?: string
    minReadyTime?: number
    maxReadyTime?: number
    minServings?: number
    maxServings?: number
    minCalories?: number
    maxCalories?: number
    sort?: 'meta-score' | 'popularity' | 'healthiness' | 'price' | 'time' | 'random'
    sortDirection?: 'asc' | 'desc'
    offset?: number
    number?: number
    addRecipeInformation?: boolean
    addRecipeNutrition?: boolean
  } = {}): Promise<SpoonacularSearchResponse> {
    return this.fetchFromAPI<SpoonacularSearchResponse>('/complexSearch', {
      ...params,
      addRecipeInformation: params.addRecipeInformation ?? true,
      addRecipeNutrition: params.addRecipeNutrition ?? false,
      number: params.number ?? 10,
      offset: params.offset ?? 0,
    })
  }

  /**
   * Get detailed recipe information by ID
   */
  async getRecipeById(
    id: number,
    includeNutrition: boolean = true
  ): Promise<SpoonacularRecipe> {
    return this.fetchFromAPI<SpoonacularRecipe>(`/${id}/information`, {
      includeNutrition,
    })
  }

  /**
   * Get random recipes
   */
  async getRandomRecipes(params: {
    limitLicense?: boolean
    tags?: string
    number?: number
  } = {}): Promise<{ recipes: SpoonacularRecipe[] }> {
    return this.fetchFromAPI<{ recipes: SpoonacularRecipe[] }>('/random', {
      limitLicense: params.limitLicense ?? true,
      tags: params.tags,
      number: params.number ?? 1,
    })
  }

  /**
   * Submit a recipe to the approval queue (logging version until DB is ready)
   */
  async submitRecipeToQueue(
    recipeId: number,
    userId?: string
  ): Promise<{ success: boolean; queueId?: string; error?: string }> {
    try {
      // Get detailed recipe data from Spoonacular
      console.log(`📥 Fetching recipe ${recipeId} from Spoonacular...`)
      const recipeData = await this.getRecipeById(recipeId, true)
      const normalizedData = this.normalizeRecipeData(recipeData)

      // For now, log the complete recipe data for manual processing
      console.log(`📝 Recipe ${recipeId} ready for queue:`)
      console.log('Raw Spoonacular data:', JSON.stringify(recipeData, null, 2))
      console.log('Normalized data:', JSON.stringify(normalizedData, null, 2))
      
      // Store in a temporary format that could be easily imported later
      const queueEntry = {
        external_id: recipeId.toString(),
        external_source: 'spoonacular',
        raw_data: recipeData,
        processed_data: normalizedData,
        title: normalizedData.title,
        description: normalizedData.description,
        image_url: normalizedData.image_url,
        prep_time_minutes: normalizedData.prep_time_minutes,
        cook_time_minutes: normalizedData.cook_time_minutes,
        total_time_minutes: normalizedData.total_time_minutes,
        servings: normalizedData.servings,
        difficulty: normalizedData.difficulty,
        cuisine: normalizedData.cuisine,
        meal_types: normalizedData.meal_type,
        diet_types: normalizedData.diet_types,
        tags: normalizedData.tags,
        submitted_by: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      
      const queueId = `logged_${recipeId}_${Date.now()}`
      
      return { 
        success: true, 
        queueId,
        error: 'Recipe logged to console - database setup pending'
      }
    } catch (error) {
      console.error('❌ Error in submitRecipeToQueue:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Normalize Spoonacular data to our format
   */
  private normalizeRecipeData(rawData: SpoonacularRecipe) {
    const ingredients = rawData.extendedIngredients?.map(ing => ({
      name: ing.name,
      amount: ing.amount?.toString() || '1',
      unit: ing.unit || 'piece',
      original: ing.original,
    })) || []

    const instructions = rawData.analyzedInstructions?.[0]?.steps.map(step => step.step) || 
                        (rawData.instructions ? [rawData.instructions] : [])

    return {
      title: rawData.title,
      description: rawData.summary || rawData.title,
      image_url: rawData.image,
      prep_time_minutes: rawData.preparationMinutes || 0,
      cook_time_minutes: rawData.cookingMinutes || 0,
      total_time_minutes: rawData.readyInMinutes || 0,
      servings: rawData.servings || 1,
      difficulty: this.getDifficulty(rawData.readyInMinutes || 0),
      cuisine: rawData.cuisines?.[0] || 'international',
      rating: rawData.spoonacularScore ? rawData.spoonacularScore / 20 : 0,
      rating_count: rawData.aggregateLikes || 0,
      source_url: rawData.sourceUrl,
      external_id: rawData.id?.toString(),
      is_verified: true,
      is_public: false,
      ingredients,
      instructions,
      diet_types: rawData.diets || [],
      meal_type: rawData.dishTypes || ['main'],
      tags: rawData.dishTypes || [],
      nutrition: rawData.nutrition ? {
        calories: rawData.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0,
        protein: rawData.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 0,
        carbs: rawData.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
        fat: rawData.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 0,
      } : undefined,
    }
  }

  /**
   * Calculate difficulty based on cook time
   */
  private getDifficulty(totalMinutes: number): string {
    if (totalMinutes <= 15) return 'easy'
    if (totalMinutes <= 45) return 'medium'
    return 'hard'
  }

  /**
   * Bulk submit multiple recipes to queue
   */
  async bulkSubmitRecipesToQueue(
    recipeIds: number[],
    userId?: string
  ): Promise<Array<{ recipeId: number; success: boolean; queueId?: string; error?: string }>> {
    const results = []
    
    for (const recipeId of recipeIds) {
      console.log(`🔄 Processing recipe ${recipeId}...`)
      const result = await this.submitRecipeToQueue(recipeId, userId)
      results.push({ recipeId, ...result })
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    return results
  }

  /**
   * Search and auto-submit recipes based on criteria
   */
  async searchAndSubmitRecipes(params: {
    query?: string
    cuisine?: string
    diet?: string
    maxResults?: number
    userId?: string
  }): Promise<{
    searchResults: number
    submitted: number
    errors: Array<{ recipeId: number; error: string }>
  }> {
    try {
      // Search for recipes
      const searchResults = await this.searchRecipes({
        query: params.query,
        cuisine: params.cuisine,
        diet: params.diet,
        number: params.maxResults ?? 10,
        addRecipeInformation: true,
        sort: 'meta-score',
        sortDirection: 'desc',
      })

      console.log(`🔍 Found ${searchResults.results.length} recipes for query: ${params.query}`)

      // Extract recipe IDs
      const recipeIds = searchResults.results.map(recipe => recipe.id)

      // Submit to queue
      const submissionResults = await this.bulkSubmitRecipesToQueue(recipeIds, params.userId)

      const successful = submissionResults.filter(r => r.success).length
      const errors = submissionResults
        .filter(r => !r.success)
        .map(r => ({ recipeId: r.recipeId, error: r.error || 'Unknown error' }))

      return {
        searchResults: searchResults.results.length,
        submitted: successful,
        errors,
      }
    } catch (error) {
      console.error('❌ Error in searchAndSubmitRecipes:', error)
      throw error
    }
  }
}

// Export singleton instance
export const spoonacularService = new SpoonacularService()

// Helper function to get popular recipes by category
export async function populateRecipesByCategory(
  category: string,
  maxRecipes: number = 20,
  userId?: string
) {
  const queries = {
    breakfast: 'breakfast',
    lunch: 'lunch quick healthy',
    dinner: 'dinner main course',
    dessert: 'dessert sweet',
    vegetarian: 'vegetarian',
    vegan: 'vegan',
    'low-carb': 'low carb keto',
    healthy: 'healthy nutrition',
    italian: 'italian pasta',
    mexican: 'mexican tacos',
    asian: 'asian stir fry',
    comfort: 'comfort food hearty',
  }

  const query = queries[category as keyof typeof queries] || category

  return spoonacularService.searchAndSubmitRecipes({
    query,
    maxResults: maxRecipes,
    userId,
  })
}
