import { NextRequest, NextResponse } from 'next/server'
import { spoonacularService } from '@/utils/spoonacular/service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'search'

    switch (action) {
      case 'search': {
        const query = searchParams.get('query') || ''
        const cuisine = searchParams.get('cuisine') || undefined
        const diet = searchParams.get('diet') || undefined
        const number = parseInt(searchParams.get('number') || '10')

        const results = await spoonacularService.searchRecipes({
          query,
          cuisine,
          diet,
          number,
          addRecipeInformation: true,
          addRecipeNutrition: false,
        })

        return NextResponse.json(results)
      }

      case 'random': {
        const number = parseInt(searchParams.get('number') || '5')
        const tags = searchParams.get('tags') || undefined

        const results = await spoonacularService.getRandomRecipes({
          number,
          tags,
          limitLicense: true,
        })

        return NextResponse.json(results)
      }

      case 'details': {
        const id = searchParams.get('id')
        if (!id) {
          return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 })
        }

        const recipe = await spoonacularService.getRecipeById(parseInt(id), true)
        return NextResponse.json(recipe)
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error in Spoonacular API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Spoonacular',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, maxResults = 20 } = body

    switch (action) {
      case 'populate_category': {
        const { category, userId } = body
        
        const results = await spoonacularService.searchAndSubmitRecipes({
          query: category,
          maxResults,
          userId,
        })
        
        return NextResponse.json(results)
      }

      case 'bulk_import': {
        const { queries, userId } = body
        if (!Array.isArray(queries)) {
          return NextResponse.json({ error: 'queries must be an array' }, { status: 400 })
        }

        const allResults = []
        for (const queryText of queries) {
          const result = await spoonacularService.searchAndSubmitRecipes({
            query: queryText,
            maxResults: Math.floor(maxResults / queries.length),
            userId,
          })
          allResults.push({ query: queryText, ...result })
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return NextResponse.json({ results: allResults })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error in Spoonacular bulk operations:', error)
    return NextResponse.json(
      { 
        error: 'Bulk operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
