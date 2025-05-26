
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

    // Get countries for the selected region
    let countryFilter: string[] = []
    if (selectedRegion !== 'all') {
      const { data: geoData, error: geoError } = await supabaseClient
        .from('geo_data')
        .select('geo')
        .eq('un_region', selectedRegion)
      
      if (geoError) {
        console.error('Error fetching geo data:', geoError)
        throw geoError
      }
      
      countryFilter = geoData?.map(g => g.geo) || []
      console.log(`Found ${countryFilter.length} countries for region ${selectedRegion}`)
    }

    // Fetch all regions and countries for metadata
    const { data: allGeoData, error: allGeoError } = await supabaseClient
      .from('geo_data')
      .select('geo, un_region, latitude, longitude')
      .not('un_region', 'eq', 'Western Asia')

    if (allGeoError) {
      console.error('Error fetching all geo data:', allGeoError)
      throw allGeoError
    }

    const regions = [...new Set(allGeoData?.map(r => r.un_region).filter(Boolean))]
      .map(region => ({ region }))

    const countries = allGeoData || []

    // Get available years from all tables
    const [
      { data: popYears },
      { data: fertilityYears }, 
      { data: laborYears }
    ] = await Promise.all([
      supabaseClient.from('population').select('year').eq('sex', 'Total').eq('age', 'Total'),
      supabaseClient.from('fertility').select('year'),
      supabaseClient.from('labor').select('year').eq('sex', 'Males')
    ])

    const commonYears = [
      ...new Set([
        ...(popYears?.map(p => p.year) || []),
        ...(fertilityYears?.map(f => f.year) || []),
        ...(laborYears?.map(l => l.year) || [])
      ])
    ].sort((a, b) => a - b)

    console.log('Available years:', commonYears)

    // Use the latest available year if selectedYear is not available
    const effectiveYear = commonYears.includes(selectedYear) ? selectedYear : Math.max(...commonYears)
    console.log('Using year:', effectiveYear)

    // Build country filter for queries
    const applyCountryFilter = (query: any) => {
      if (selectedRegion !== 'all' && countryFilter.length > 0) {
        return query.in('geo', countryFilter)
      }
      return query
    }

    // Fetch metrics data
    const metricsPromises = [
      // Population data
      applyCountryFilter(
        supabaseClient
          .from('population')
          .select('population, geo')
          .eq('sex', 'Total')
          .eq('age', 'Total')
          .eq('year', effectiveYear)
      ),
      // Previous year population
      applyCountryFilter(
        supabaseClient
          .from('population')
          .select('population')
          .eq('sex', 'Total')
          .eq('age', 'Total')
          .eq('year', effectiveYear - 1)
      ),
      // Labor force data
      applyCountryFilter(
        supabaseClient
          .from('labor')
          .select('labour_force, sex, geo')
          .eq('year', effectiveYear)
      ),
      // Previous year labor data
      applyCountryFilter(
        supabaseClient
          .from('labor')
          .select('labour_force, sex')
          .eq('year', effectiveYear - 1)
      ),
      // Fertility data
      applyCountryFilter(
        supabaseClient
          .from('fertility')
          .select('fertility_rate, geo')
          .eq('year', effectiveYear)
      ),
      // Previous year fertility
      applyCountryFilter(
        supabaseClient
          .from('fertility')
          .select('fertility_rate')
          .eq('year', effectiveYear - 1)
      )
    ]

    const [
      { data: popData },
      { data: prevPopData },
      { data: laborData },
      { data: prevLaborData },
      { data: fertilityData },
      { data: prevFertilityData }
    ] = await Promise.all(metricsPromises)

    // Calculate metrics
    const totalPop = popData?.reduce((sum, item) => sum + (item.population || 0), 0) || 0
    const prevTotalPop = prevPopData?.reduce((sum, item) => sum + (item.population || 0), 0) || 0
    const popTrend = prevTotalPop > 0 ? ((totalPop - prevTotalPop) / prevTotalPop) * 100 : 0

    const totalLaborForce = laborData?.reduce((sum, item) => sum + (item.labour_force || 0), 0) || 0
    const prevTotalLaborForce = prevLaborData?.reduce((sum, item) => sum + (item.labour_force || 0), 0) || 0
    const laborTrend = prevTotalLaborForce > 0 ? ((totalLaborForce - prevTotalLaborForce) / prevTotalLaborForce) * 100 : 0

    const avgFertility = fertilityData?.length 
      ? fertilityData.reduce((sum, item) => sum + (item.fertility_rate || 0), 0) / fertilityData.length 
      : 0
    const prevAvgFertility = prevFertilityData?.length 
      ? prevFertilityData.reduce((sum, item) => sum + (item.fertility_rate || 0), 0) / prevFertilityData.length 
      : 0
    const fertilityTrend = prevAvgFertility > 0 ? ((avgFertility - prevAvgFertility) / prevAvgFertility) * 100 : 0

    // Calculate dependency ratio
    const workingAgeGroups = [
      'From 15 to 19 years', 'From 20 to 24 years', 'From 25 to 29 years',
      'From 30 to 34 years', 'From 35 to 39 years', 'From 40 to 44 years',
      'From 45 to 49 years', 'From 50 to 54 years', 'From 55 to 59 years', 'From 60 to 64 years'
    ]
    
    const dependentAgeGroups = [
      'From 0 to 4 years', 'From 5 to 9 years', 'From 10 to 14 years',
      'From 65 to 69 years', 'From 70 to 74 years', 'From 75 to 79 years',
      'From 80 to 84 years', 'From 85 to 89 years', 'From 90 to 94 years',
      'From 95 to 99 years', '100 years and over'
    ]

    const { data: agePopData } = await applyCountryFilter(
      supabaseClient
        .from('population')
        .select('age, population')
        .eq('sex', 'Total')
        .eq('year', effectiveYear)
    )

    const workingPop = agePopData
      ?.filter(p => workingAgeGroups.includes(p.age))
      .reduce((sum, p) => sum + (p.population || 0), 0) || 0
    
    const dependentPop = agePopData
      ?.filter(p => dependentAgeGroups.includes(p.age))
      .reduce((sum, p) => sum + (p.population || 0), 0) || 0

    const dependencyRatio = workingPop > 0 ? (dependentPop / workingPop) * 100 : 0

    const metrics: MetricData = {
      populationTotal: {
        label: 'Population',
        value: `${(totalPop / 1_000_000).toFixed(1)}M`,
        trend: parseFloat(popTrend.toFixed(1))
      },
      laborForceRate: {
        label: 'Labor Force',
        value: `${(totalLaborForce / 1_000_000).toFixed(1)}M`,
        trend: parseFloat(laborTrend.toFixed(1))
      },
      fertilityRate: {
        label: 'Fertility Rate',
        value: avgFertility.toFixed(2),
        trend: parseFloat(fertilityTrend.toFixed(1))
      },
      dependencyRatio: {
        label: 'Dependency Ratio',
        value: `${dependencyRatio.toFixed(1)}%`,
        trend: 0 // Calculate if needed
      }
    }

    // Fetch chart data
    const chartPromises = [
      // Fertility trend data
      supabaseClient
        .from('fertility')
        .select('year, fertility_rate, geo')
        .order('year', { ascending: true }),
      
      // Labor force by gender data
      supabaseClient
        .from('labor')
        .select('year, sex, geo, labour_force')
        .order('year', { ascending: true }),
      
      // Population pyramid data
      applyCountryFilter(
        supabaseClient
          .from('population')
          .select('age, sex, population, geo')
          .eq('year', effectiveYear)
          .not('age', 'eq', 'Total')
          .not('sex', 'eq', 'Total')
      ),
      
      // Dependency ratio map data
      supabaseClient
        .from('geo_data')
        .select('geo, latitude, longitude, un_region')
        .not('un_region', 'eq', 'Western Asia')
    ]

    const [
      { data: fertilityRawData },
      { data: laborRawData },
      { data: populationPyramidRaw },
      { data: geoDataForMap }
    ] = await Promise.all(chartPromises)

    // Process fertility data
    const fertilityData = fertilityRawData
      ?.filter(item => selectedRegion === 'all' || countryFilter.includes(item.geo))
      .map(item => ({
        year: item.year,
        rate: item.fertility_rate || 0,
        country: item.geo
      })) || []

    // Process labor force data
    const laborForceData = laborRawData
      ?.filter(item => selectedRegion === 'all' || countryFilter.includes(item.geo))
      .reduce((acc: any[], item) => {
        const existing = acc.find(a => a.year === item.year && a.country === item.geo)
        if (existing) {
          if (item.sex === 'Males') existing.male = item.labour_force || 0
          if (item.sex === 'Females') existing.female = item.labour_force || 0
        } else {
          acc.push({
            year: item.year,
            country: item.geo,
            male: item.sex === 'Males' ? (item.labour_force || 0) : 0,
            female: item.sex === 'Females' ? (item.labour_force || 0) : 0
          })
        }
        return acc
      }, []) || []

    // Convert to percentages
    const laborForcePercentages = laborForceData.map(item => {
      const total = item.male + item.female || 1
      return {
        ...item,
        male: parseFloat(((item.male / total) * 100).toFixed(1)),
        female: parseFloat(((item.female / total) * 100).toFixed(1))
      }
    })

    // Process population pyramid data
    const totalMalePop = populationPyramidRaw
      ?.filter(p => p.sex === 'Males')
      .reduce((sum, p) => sum + (p.population || 0), 0) || 1
    
    const totalFemalePop = populationPyramidRaw
      ?.filter(p => p.sex === 'Females')
      .reduce((sum, p) => sum + (p.population || 0), 0) || 1

    const populationPyramidData = populationPyramidRaw?.map(p => ({
      age: p.age,
      male: p.sex === 'Males' ? ((p.population || 0) / totalPop) * 100 : 0,
      female: p.sex === 'Females' ? ((p.population || 0) / totalPop) * 100 : 0,
      country: p.geo,
      year: effectiveYear
    })) || []

    // Process dependency ratio data
    const dependencyRatioData = await Promise.all(
      (geoDataForMap || []).map(async country => {
        const { data: countryAgeData } = await supabaseClient
          .from('population')
          .select('age, population')
          .eq('geo', country.geo)
          .eq('sex', 'Total')
          .eq('year', effectiveYear)

        const countryWorkingPop = countryAgeData
          ?.filter(p => workingAgeGroups.includes(p.age))
          .reduce((sum, p) => sum + (p.population || 0), 0) || 0
        
        const countryDependentPop = countryAgeData
          ?.filter(p => dependentAgeGroups.includes(p.age))
          .reduce((sum, p) => sum + (p.population || 0), 0) || 0

        const countryDependencyRatio = countryWorkingPop > 0 ? (countryDependentPop / countryWorkingPop) * 100 : 0

        return {
          country: country.geo,
          region: country.un_region,
          dependencyRatio: countryDependencyRatio,
          year: effectiveYear,
          latitude: country.latitude,
          longitude: country.longitude
        }
      })
    )

    const response = {
      success: true,
      data: {
        metrics,
        chartData: {
          fertilityData,
          laborForceData: laborForcePercentages,
          populationPyramidData,
          dependencyRatioData,
          regions,
          countries,
          years: commonYears
        },
        metadata: {
          selectedRegion,
          selectedYear: effectiveYear,
          selectedCountry,
          totalCountries: countryFilter.length || countries.length,
          dataPoints: {
            fertility: fertilityData.length,
            laborForce: laborForcePercentages.length,
            population: populationPyramidData.length,
            dependency: dependencyRatioData.length
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
