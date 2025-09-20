import api from '@/api'
import { v4 as uuidv4 } from 'uuid'
import { ref, reactive } from 'vue'

export function useRooms() {
  const rooms = ref([])
  const loading = ref(false)
  const headers = ref(['Name', 'Building name'])
  const newRoom = ref({
    name: '',
    id: uuidv4(),
  })
  
  const error = ref(null)
  const buildingsMap = reactive({})
  const totalItems = ref(0)
  
  const fetchBuildings = async (buildingIds, params = {}) => {
    try {
      const response = await api.post('/buildings/batch', buildingIds, { params })
      response.data.forEach((building) => {
        buildingsMap[building.id] = building.name
      })
    } catch (error) {
      console.error('Error fetching buildings:', error)
    }
  }

  const fetchRooms = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/rooms', { params })
      const items = response.data.items || response.data

      totalItems.value = response.data.total_count || items.length

      const buildingIds = [...new Set(items.map((room) => room.building_id))].filter(
        (id) => id && !buildingsMap[id],
      )

      if (buildingIds.length > 0) {
        await fetchBuildings(buildingIds, params)
      }

      rooms.value = items.map((room) => ({
        ...room,
        building_name: room.building_id
          ? buildingsMap[room.building_id] || 'Loading...'
          : 'No building',
      }))

      return {
        items: rooms.value,
        total: totalItems.value,
      }
    } catch (err) {
      console.error('Error fetching rooms:', err)
      error.value = err.response?.data?.detail || 'Failed to load data'
      rooms.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add loadRooms function that calls fetchRooms
  const loadRooms = async (params = {}) => {
    return await fetchRooms(params)
  }

  const createRoom = async (roomData) => {
    try {
      const response = await api.post('/rooms', roomData)
      rooms.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }

  const updateRoom = async (roomId, roomData) => {
    try {
      const response = await api.patch(`/rooms/${roomId}`, roomData)
      // Update the room in the local state
      const index = rooms.value.findIndex(r => r.id === roomId)
      if (index !== -1) {
        rooms.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Error updating room:', error)
      throw error
    }
  }

  const deleteRooms = async (roomIds) => {
    if (!roomIds || roomIds.length === 0) {
      console.warn('No room IDs provided for deletion')
      return { success: false, message: 'No rooms selected for deletion' }
    }

    const results = {
      successful: [],
      failed: [],
      errors: []
    }

    try {
      // Process each room ID individually
      for (const id of roomIds) {
        try {
          // Make API request to delete a single room
          await api.delete(`/rooms/${id}`)
          
          // If successful, add to successful list and remove from local state
          results.successful.push(id)
          rooms.value = rooms.value.filter(room => room.id !== id)
        } catch (error) {
          // If failed, add to failed list and store error
          results.failed.push(id)
          results.errors.push({
            id,
            error: error.response?.data?.message || error.message || 'Unknown error'
          })
          console.error(`Error deleting room with ID ${id}:`, error)
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
      console.error('Unexpected error during room deletion process:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during the deletion process',
        error: error.message
      }
    }
  }

  return {
    rooms,
    loading,
    headers,
    newRoom,
    fetchRooms,
    loadRooms,
    createRoom,
    updateRoom,
    deleteRooms,
  }
}
