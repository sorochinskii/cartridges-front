<template>
  <div class="modal-backdrop fade show" style="display: block" @click.self="$emit('close')">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Vendor</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label for="vendorName" class="form-label">Name</label>
              <input
                type="text"
                class="form-control"
                id="vendorName"
                v-model="vendorForm.name"
                required
              />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Save Changes
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

export default {
  props: {
    vendor: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const vendorForm = ref({ ...props.vendor })
    const isSubmitting = ref(false)

    const submitForm = async () => {
      isSubmitting.value = true
      try {
        emit('update', vendorForm.value)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      vendorForm,
      isSubmitting,
      submitForm
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  z-index: 1050;
}
</style>
