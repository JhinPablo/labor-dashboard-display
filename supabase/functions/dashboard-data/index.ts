
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DashboardParams {
  selectedRegion?: string
  selectedYear?: number
  selectedCountry?: string
}

interface MetricData {
  populationTotal: { label: string; value: string; trend: number }
  laborForceRate: { label: string; value: string; trend: number }
  fertilityRate: { label: string; value: string; trend: number }
  dependencyRatio: { label: string; value: string; trend: number }
}

interface ChartDataPoint {
  year: number
  rate?: number
  country: string
  male?: number
  female?: number
  age?: string
  population?: number
  latitude?: number
  longitude?: number
  dependencyRatio?: number
  region?: string
}

// Load CSV data helper functions
const loadGeoData = async () => {
  try {
    const geoText = await Deno.readTextFile('./geo_data_rows.csv')
    const lines = geoText.split('\n').slice(1) // Skip header
    return lines.filter(line => line.trim()).map(line => {
      const [geo, latitude, longitude, un_region] = line.split(',')
      return {
        geo: geo?.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        un_region: un_region?.trim()
      }
    }).filter(item => item.geo && !isNaN(item.latitude) && !isNaN(item.longitude))
  } catch (error) {
    console.error('Error loading geo data:', error)
    return []
  }
}

const loadFertilityData = async () => {
  try {
    const fertilityText = await Deno.readTextFile('./fertility_rows.csv')
    const lines = fertilityText.split('\n').slice(1) // Skip header
    return lines.filter(line => line.trim()).map(line => {
      const [geo, year, fertility_rate, id] = line.split(',')
      return {
        geo: geo?.trim(),
        year: parseInt(year),
        fertility_rate: parseFloat(fertility_rate),
        id: parseInt(id)
      }
    }).filter(item => item.geo && !isNaN(item.year) && !isNaN(item.fertility_rate))
  } catch (error) {
    console.error('Error loading fertility data:', error)
    return []
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const selectedRegion = url.searchParams.get('region') || 'all'
    const selectedYear = parseInt(url.searchParams.get('year') || '2020')
    const selectedCountry = url.searchParams.get('country') || 'all'

    console.log('Dashboard request:', { selectedRegion, selectedYear, selectedCountry })

    // Load CSV data
    const geoData = await loadGeoData()
    const csvFertilityData = await loadFertilityData()

    console.log('Loaded CSV data:', { 
      geoCount: geoData.length, 
      fertilityCount: csvFertilityData.length 
    })

    // Get countries for the selected region
    let countryFilter: string[] = []
    if (selectedRegion !== 'all') {
      countryFilter = geoData
        .filter(g => g.un_region === selectedRegion)
        .map(g => g.geo)
      
      console.log(`Found ${countryFilter.length} countries for region ${selectedRegion}`)
    }

    const regions = [...new Set(geoData.map(r => r.un_region).filter(Boolean))]
      .map(region => ({ region }))

    const countries = geoData.filter(item => item.geo && item.latitude && item.longitude)

    // Get available years from CSV data
    const availableYears = [...new Set(csvFertilityData.map(f => f.year))].sort((a, b) => a - b)
    const effectiveYear = availableYears.includes(selectedYear) ? selectedYear : Math.max(...availableYears)

    console.log('Available years:', availableYears)
    console.log('Using year:', effectiveYear)

    // Fetch data from Supabase with proper filtering
    const buildCountryFilter = (query: any) => {
      if (selectedRegion !== 'all' && countryFilter.length > 0) {
        return query.in('geo', countryFilter)
      }
      return query
    }

    // Fetch metrics data from Supabase
    const metricsPromises = [
      // Population data
      buildCountryFilter(
        supabaseClient
          .from('population')
          .select('population, geo')
          .eq('sex', 'Total')
          .eq('age', 'Total')
          .eq('year', effectiveYear)
      ),
      // Labor force data
      buildCountryFilter(
        supabaseClient
          .from('labor')
          .select('labour_force, sex, geo')
          .eq('year', effectiveYear)
      ),
      // Fertility data (use CSV as fallback)
      buildCountryFilter(
        supabaseClient
          .from('fertility')
          .select('fertility_rate, geo')
          .eq('year', effectiveYear)
      )
    ]

    const [
      { data: popData },
      { data: laborData },
      { data: dbFertilityData }
    ] = await Promise.all(metricsPromises)

    // Use CSV fertility data if DB data is insufficient
    const fertilityData = dbFertilityData && dbFertilityData.length > 0 
      ? dbFertilityData 
      : csvFertilityData
          .filter(f => f.year === effectiveYear)
          .filter(f => selectedRegion === 'all' || countryFilter.includes(f.geo))
          .map(f => ({ fertility_rate: f.fertility_rate, geo: f.geo }))

    console.log('Data counts:', {
      population: popData?.length || 0,
      labor: laborData?.length || 0,
      fertility: fertilityData?.length || 0
    })

    // Calculate metrics
    const totalPop = popData?.reduce((sum, item) => sum + (item.population || 0), 0) || 0
    const totalLaborForce = laborData?.reduce((sum, item) => sum + (item.labour_force || 0), 0) || 0
    const avgFertility = fertilityData?.length 
      ? fertilityData.reduce((sum, item) => sum + (item.fertility_rate || 0), 0) / fertilityData.length 
      : 0

    const metrics: MetricData = {
      populationTotal: {
        label: 'Population',
        value: `${(totalPop / 1_000_000).toFixed(1)}M`,
        trend: 2.5
      },
      laborForceRate: {
        label: 'Labor Force',
        value: `${(totalLaborForce / 1_000_000).toFixed(1)}M`,
        trend: 1.8
      },
      fertilityRate: {
        label: 'Fertility Rate',
        value: avgFertility.toFixed(2),
        trend: -0.5
      },
      dependencyRatio: {
        label: 'Dependency Ratio',
        value: '45.2%',
        trend: -1.2
      }
    }

    // Process chart data
    const chartData = {
      fertilityData: csvFertilityData
        .filter(item => selectedRegion === 'all' || countryFilter.includes(item.geo))
        .map(item => ({
          year: item.year,
          rate: item.fertility_rate || 0,
          country: item.geo
        })),
      
      laborForceData: laborData
        ?.filter(item => selectedRegion === 'all' || countryFilter.includes(item.geo))
        .reduce((acc: any[], item) => {
          const existing = acc.find(a => a.year === effectiveYear && a.country === item.geo)
          if (existing) {
            if (item.sex === 'Males') existing.male = item.labour_force || 0
            if (item.sex === 'Females') existing.female = item.labour_force || 0
          } else {
            acc.push({
              year: effectiveYear,
              country: item.geo,
              male: item.sex === 'Males' ? (item.labour_force || 0) : 0,
              female: item.sex === 'Females' ? (item.labour_force || 0) : 0
            })
          }
          return acc
        }, [])
        .map(item => {
          const total = item.male + item.female || 1
          return {
            ...item,
            male: parseFloat(((item.male / total) * 100).toFixed(1)),
            female: parseFloat(((item.female / total) * 100).toFixed(1))
          }
        }) || [],
      
      populationPyramidData: [],
      
      dependencyRatioData: geoData.map(country => ({
        country: country.geo,
        region: country.un_region,
        dependencyRatio: 45 + Math.random() * 20, // Sample data
        year: effectiveYear,
        latitude: country.latitude,
        longitude: country.longitude
      })),
      
      regions,
      countries,
      years: availableYears
    }

    const response = {
      success: true,
      data: {
        metrics,
        chartData,
        metadata: {
          selectedRegion,
          selectedYear: effectiveYear,
          selectedCountry,
          totalCountries: countryFilter.length || countries.length,
          dataPoints: {
            fertility: chartData.fertilityData.length,
            laborForce: chartData.laborForceData.length,
            population: 0,
            dependency: chartData.dependencyRatioData.length
          }
        }
      }
    }

    console.log('Response summary:', {
      metricsCount: Object.keys(metrics).length,
      chartDataPoints: response.data.metadata.dataPoints,
      totalCountries: response.data.metadata.totalCountries
    })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Dashboard data error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
