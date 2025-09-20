<template>
  <div>
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <template v-else>
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th class="checkbox-column">
              <input 
                type="checkbox" 
                class="form-check-input" 
                :checked="areAllSelected"
                @change="$emit('toggle-select-all', $event.target.checked)"
              />
            </th>
            <th v-for="header in headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in rooms" :key="room.id">
            <td>
              <input 
                type="checkbox" 
                class="form-check-input" 
                :checked="selectedItems.includes(room.id)"
                @change="$emit('toggle-select', room.id)"
              />
            </td>
            <td>{{ room.name }}</td>
            <td>{{ room.building_name }}</td>
          </tr>
        </tbody>
      </table>

      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="d-flex align-items-center">
          <span class="me-2">Items per page:</span>
          <select
            class="form-select form-select-sm"
            :value="itemsPerPage"
            @change="$emit('items-per-page-change', $event.target.value)"
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <div class="d-flex align-items-center">
          <span class="mx-3">Page {{ currentPage }}</span>
          <button
            class="btn btn-outline-primary me-2"
            @click="$emit('page-change', currentPage - 1)"
            :disabled="currentPage === 1"
          >
            Previous
          </button>
          <button
            class="btn btn-outline-primary"
            @click="$emit('page-change', currentPage + 1)"
            :disabled="!hasNextPage"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    rooms: Array,
    headers: Array,
    currentPage: Number,
    hasNextPage: Boolean,
    itemsPerPage: Number,
    selectedItems: Array,
    areAllSelected: Boolean,
  },
  emits: ['page-change', 'items-per-page-change', 'toggle-select', 'toggle-select-all'],
}
</script>

<style scoped>
.checkbox-column {
  width: 40px;
  padding: 0.75rem 0.5rem;
}

.checkbox-column .form-check-input {
  margin: 0;
}
</style>