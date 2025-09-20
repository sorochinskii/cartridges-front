import api from '@/api'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'

export function useBuildings() {
  const buildings = ref([])
  const loading = ref(false)
  const headers = ref(['Name'])
  const newBuilding = ref({
    name: '',
    id: uuidv4(),
  })

  const fetchBuildings = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/buildings', { params })
      const items = response.data.items || response.data
      buildings.value = items

      return {
        items,
        total: response.data.total_count || items.length,
      }
    } catch (error) {
      console.error('Error fetching buildings:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Add this function to fetch buildings with filters
  const fetchBuildingsWithFilter = async (filterText = '') => {
    loading.value = true
    try {
      const params = {}
      if (filterText) {
        params.name = filterText
      }
      
      const response = await api.get(`/buildings/name/${filterText}`)
      const items = response.data.items || response.data
      buildings.value = items

      return {
        items,
        total: response.data.total_count || items.length,
      }
    } catch (error) {
      console.error('Error fetching buildings with filter:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const loadBuildings = async (params = {}) => {
    return await fetchBuildings(params)
  }

  const createBuilding = async (buildingData) => {
    try {
      const response = await api.post('/buildings', buildingData)
      buildings.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Error creating building:', error)
      throw error
    }
  }

  const updateBuilding = async (buildingId, buildingData) => {
    try {
      const response = await api.patch(`/buildings/${buildingId}`, buildingData)
      // Update the building in the local state
      const index = buildings.value.findIndex(b => b.id === buildingId)
      if (index !== -1) {
        buildings.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Error updating building:', error)
      throw error
    }
  }

  const deleteBuildings = async (buildingIds) => {
    if (!buildingIds || buildingIds.length === 0) {
      console.warn('No building IDs provided for deletion')
      return { success: false, message: 'No buildings selected for deletion' }
    }

    const results = {
      successful: [],
      failed: [],
      errors: []
    }

    try {
      // Process each building ID individually
      for (const id of buildingIds) {
        try {
          // Make API request to delete a single building
          await api.delete(`/buildings/${id}`)
          
          // If successful, add to successful list and remove from local state
          results.successful.push(id)
          buildings.value = buildings.value.filter(building => building.id !== id)
        } catch (error) {
          // If failed, add to failed list and store error
          results.failed.push(id)
          results.errors.push({
            id,
            error: error.response?.data?.message || error.message || 'Unknown error'
          })
          console.error(`Error deleting building with ID ${id}:`, error)
        }
      }

      // Return comprehensive results
      return {
        success: results.failed.length === 0,
        message: `Deletion completed: ${results.successful.length} successful, ${results.failed.length} failed`,
        details: results
      }
    } catch (error) {
      // This would catch any unexpected errors in the overall process
      console.error('Unexpected error during building deletion process:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during the deletion process',
        error: error.message
      }
    }
  }

  return {
    buildings,
    loading,
    headers,
    newBuilding,
    fetchBuildings,
    fetchBuildingsWithFilter, // Add this to the return statement
    loadBuildings,
    createBuilding,
    updateBuilding,
    deleteBuildings,
  }
}
