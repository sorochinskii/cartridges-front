<template>
  <div class="modal" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Room</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="emit('update', roomForm)">
            <div class="mb-3">
              <label for="roomName" class="form-label">Room Name</label>
              <input
                type="text"
                class="form-control"
                id="roomName"
                v-model="roomForm.name"
                required
              />
            </div>
            <div class="mb-3">
              <label for="buildingFilter" class="form-label">Filter Buildings</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  id="buildingFilter"
                  v-model="buildingFilter"
                  placeholder="Type to filter buildings..."
                  @input="filterBuildings"
                />
                <button 
                  v-if="buildingFilter" 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="clearBuildingFilter"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label for="buildingSelect" class="form-label">Building</label>
              <select
                class="form-select"
                id="buildingSelect"
                v-model="roomForm.building_id"
                required
              >
                <option value="" disabled>Select a building</option>
                <option 
                  v-for="building in filteredBuildings" 
                  :key="building.id" 
                  :value="building.id"
                >
                  {{ building.name }}
                </option>
              </select>
            </div>
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" @click="emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">Update Room</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useBuildings } from '../../Buildings/composables/useBuildings'

export default {
  props: {
    room: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const roomForm = ref({ ...props.room })
    const buildingFilter = ref('')
    
    // Use the useBuildings composable
    const { 
      buildings, 
      loading, 
      fetchBuildingsWithFilter 
    } = useBuildings()
    
    // Computed property for filtered buildings
    const filteredBuildings = computed(() => {
      if (!buildingFilter.value) return buildings.value
      
      const filter = buildingFilter.value.toLowerCase()
      return buildings.value.filter(building => 
        building.name.toLowerCase().includes(filter)
      )
    })
    
    // Function to filter buildings
    const filterBuildings = async () => {
      if (buildingFilter.value) {
        await fetchBuildingsWithFilter(buildingFilter.value)
      } else {
        // If filter is cleared, fetch all buildings
        await fetchBuildingsWithFilter()
      }
    }
    
    // Function to clear the building filter
    const clearBuildingFilter = async () => {
      buildingFilter.value = ''
      await fetchBuildingsWithFilter()
    }

    onMounted(async () => {
      // Fetch all buildings when component is mounted
      await fetchBuildingsWithFilter()
    })

    // Update form when room prop changes
    watch(() => props.room, (newRoom) => {
      roomForm.value = { ...newRoom }
    }, { deep: true })

    return {
      roomForm,
      buildings,
      loading,
      buildingFilter,
      filteredBuildings,
      filterBuildings,
      clearBuildingFilter,
      emit
    }
  }
}
</script>
