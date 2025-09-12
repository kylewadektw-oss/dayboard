import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { spoonacularService } from '@/utils/spoonacular/service'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { recipeId, action = 'submit' } = body

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'submit': {
        // Submit single recipe to queue
        const result = await spoonacularService.submitRecipeToQueue(recipeId, user.id)
        return NextResponse.json(result)
      }

      case 'bulk_submit': {
        const { recipeIds } = body
        if (!Array.isArray(recipeIds)) {
          return NextResponse.json({ error: 'recipeIds must be an array' }, { status: 400 })
        }
        
        const results = await spoonacularService.bulkSubmitRecipesToQueue(recipeIds, user.id)
        return NextResponse.json({ results })
      }

      case 'search_and_submit': {
        const { query, cuisine, diet, maxResults = 10 } = body
        
        const results = await spoonacularService.searchAndSubmitRecipes({
          query,
          cuisine,
          diet,
          maxResults,
          userId: user.id,
        })
        
        return NextResponse.json(results)
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error in recipe import API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
