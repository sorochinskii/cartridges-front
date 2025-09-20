<template>
  <div class="modal" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create New Building</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="buildingName" class="form-label">Building Name</label>
              <input
                type="text"
                class="form-control"
                id="buildingName"
                v-model="formData.name"
                required
                :disabled="loading"
              />
            </div>
            <div class="d-flex justify-content-end">
              <button 
                type="button" 
                class="btn btn-secondary me-2" 
                @click="$emit('close')"
                :disabled="loading"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Creating...' : 'Create Building' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export default {
  setup(props, { emit }) {
    const formData = ref({
      name: '',
      id: uuidv4(),
    })
    const loading = ref(false)

    const handleSubmit = async () => {
      if (!formData.value.name.trim()) return
      
      loading.value = true
      try {
        await emit('create', { ...formData.value })
        formData.value = {
          name: '',
          id: uuidv4(),
        }
      } catch (error) {
        console.error('Error in modal:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      formData,
      loading,
      handleSubmit,
    }
  },
  emits: ['close', 'create'],
}
</script>

<style scoped>
.modal {
  z-index: 1050;
}
</style>