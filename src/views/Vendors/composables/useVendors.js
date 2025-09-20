import api from '@/api'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'

export function useVendors() {
  const vendors = ref([])
  const loading = ref(false)
  const headers = ref(['Name'])
  const newVendor = ref({
    name: '',
    id: uuidv4(),
  })

  const fetchVendors = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/vendors', { params })
      const items = response.data.items || response.data
      vendors.value = items

      return {
        items,
        total: response.data.total_count || items.length,
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Add this function to fetch vendors with filters
  const fetchVendorsWithFilter = async (filterText = '') => {
    loading.value = true
    try {
      const params = {}
      if (filterText) {
        params.name = filterText
      }
      
      const response = await api.get(`/vendors/name/${filterText}`)
      const items = response.data.items || response.data
      vendors.value = items

      return {
        items,
        total: response.data.total_count || items.length,
      }
    } catch (error) {
      console.error('Error fetching vendors with filter:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const loadVendors = async (params = {}) => {
    return await fetchVendors(params)
  }

  const createVendor = async (vendorData) => {
    try {
      const response = await api.post('/vendors', vendorData)
      vendors.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Error creating vendor:', error)
      throw error
    }
  }

  const updateVendor = async (vendorId, vendorData) => {
    try {
      const response = await api.patch(`/vendors/${vendorId}`, vendorData)
      // Update the vendor in the local state
      const index = vendors.value.findIndex(b => b.id === vendorId)
      if (index !== -1) {
        vendors.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Error updating vendor:', error)
      throw error
    }
  }

  const deleteVendors = async (vendorIds) => {
    if (!vendorIds || vendorIds.length === 0) {
      console.warn('No vendor IDs provided for deletion')
      return { success: false, message: 'No vendors selected for deletion' }
    }

    const results = {
      successful: [],
      failed: [],
      errors: []
    }

    try {
      // Process each vendor ID individually
      for (const id of vendorIds) {
        try {
          // Make API request to delete a single vendor
          await api.delete(`/vendors/${id}`)
          
          // If successful, add to successful list and remove from local state
          results.successful.push(id)
          vendors.value = vendors.value.filter(vendor => vendor.id !== id)
        } catch (error) {
          // If failed, add to failed list and store error
          results.failed.push(id)
          results.errors.push({
            id,
            error: error.response?.data?.message || error.message || 'Unknown error'
          })
          console.error(`Error deleting vendor with ID ${id}:`, error)
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
      console.error('Unexpected error during vendor deletion process:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during the deletion process',
        error: error.message
      }
    }
  }

  return {
    vendors,
    loading,
    headers,
    newVendor,
    fetchVendors,
    fetchVendorsWithFilter, // Add this to the return statement
    loadVendors,
    createVendor,
    updateVendor,
    deleteVendors,
  }
}
