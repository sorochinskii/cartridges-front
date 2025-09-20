<template>
  <div class="modal" tabindex="-1" style="display: block; background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">CSV Preview ({{ data.length }} rooms)</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID (UUID)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in data" :key="index">
                  <td>{{ item.name }}</td>
                  <td>{{ item.id || 'Will be generated' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button
            type="button"
            class="btn btn-primary"
            @click="$emit('confirm')"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm"></span>
            {{ loading ? 'Uploading...' : 'Upload rooms' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'confirm'],
}
</script>

<style scoped>
.modal {
  z-index: 1050;
}
.table-responsive {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
