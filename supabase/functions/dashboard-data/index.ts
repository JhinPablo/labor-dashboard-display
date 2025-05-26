
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DashboardParams {
  selectedRegion?: string
  selectedYear?: number
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
    const url = new URL(req.url)
    const selectedRegion = url.searchParams.get('region') || 'all'
    const selectedYear = parseInt(url.searchParams.get('year') || '2020')

    console.log('Dashboard request:', { selectedRegion, selectedYear })

    // Load CSV data
    const geoData = await loadGeoData()
    const fertilityData = await loadFertilityData()

    console.log('Loaded CSV data:', { 
      geoCount: geoData.length, 
      fertilityCount: fertilityData.length 
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

    // Get available years from fertility data
    const availableYears = [...new Set(fertilityData.map(f => f.year))].sort((a, b) => a - b)
    const effectiveYear = availableYears.includes(selectedYear) ? selectedYear : Math.max(...availableYears)

    console.log('Available years:', availableYears)
    console.log('Using year:', effectiveYear)

    // Filter fertility data by region and year
    const filteredFertilityData = fertilityData
      .filter(f => f.year === effectiveYear)
      .filter(f => selectedRegion === 'all' || countryFilter.includes(f.geo))

    // Calculate metrics from CSV data
    const avgFertility = filteredFertilityData.length 
      ? filteredFertilityData.reduce((sum, item) => sum + (item.fertility_rate || 0), 0) / filteredFertilityData.length 
      : 0

    // Generate sample data for other metrics based on filtered countries
    const totalCountries = selectedRegion === 'all' ? geoData.length : countryFilter.length
    const estimatedPopulation = totalCountries * 10000000 // 10M per country average
    const estimatedLaborForce = estimatedPopulation * 0.6 // 60% labor force participation

    const metrics: MetricData = {
      populationTotal: {
        label: 'Population',
        value: `${(estimatedPopulation / 1_000_000).toFixed(1)}M`,
        trend: 2.5
      },
      laborForceRate: {
        label: 'Labor Force',
        value: `${(estimatedLaborForce / 1_000_000).toFixed(1)}M`,
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
      fertilityData: filteredFertilityData.map(item => ({
        year: item.year,
        rate: item.fertility_rate || 0,
        country: item.geo
      })),
      
      laborForceData: countries
        .filter(country => selectedRegion === 'all' || countryFilter.includes(country.geo))
        .map(country => ({
          year: effectiveYear,
          country: country.geo,
          male: 45 + Math.random() * 10, // Sample data
          female: 45 + Math.random() * 10
        })),
      
      populationPyramidData: [],
      
      dependencyRatioData: countries
        .filter(country => selectedRegion === 'all' || countryFilter.includes(country.geo))
        .map(country => ({
          country: country.geo,
          region: country.un_region,
          dependencyRatio: 35 + Math.random() * 30,
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
          selectedCountry: 'all',
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
