<template>
  <div>
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <template v-else>
      <!-- Filter Section -->
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Filter buildings..."
              v-model="filterText"
              @input="applyFilter"
            />
            <button
              v-if="filterText"
              class="btn btn-outline-secondary"
              type="button"
              @click="clearFilter"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>

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
          <tr v-for="building in filteredBuildings" :key="building.id">
            <td class="checkbox-column">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="selectedItems.includes(building.id)"
                @change="$emit('toggle-select', building.id)"
              />
            </td>
            <td>{{ building.name }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Results info -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          Showing {{ filteredBuildings.length }} of {{ buildings.length }} buildings
          <span v-if="filterText">(filtered)</span>
        </div>
      </div>

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
    buildings: Array,
    headers: Array,
    currentPage: Number,
    hasNextPage: Boolean,
    itemsPerPage: Number,
    selectedItems: Array,
    areAllSelected: Boolean,
    refreshTrigger: Boolean, // New prop to trigger refresh
  },
  emits: ['page-change', 'items-per-page-change', 'toggle-select', 'toggle-select-all', 'refresh-data'],
  data() {
    return {
      filterText: '',
      filteredBuildings: [],
    };
  },
  created() {
    // Initialize filteredBuildings with all buildings
    this.filteredBuildings = [...this.buildings];
  },
  watch: {
    // Update filteredBuildings when buildings prop changes
    buildings: {
      handler() {
        this.applyFilter();
      },
      immediate: true
    },
    // Watch for refresh trigger
    refreshTrigger(newVal) {
      if (newVal) {
        this.$emit('refresh-data');
      }
    },
  },
  methods: {
    applyFilter() {
      if (!this.filterText.trim()) {
        this.filteredBuildings = [...this.buildings];
        return;
      }

      const filterValue = this.filterText.toLowerCase().trim();
      this.filteredBuildings = this.buildings.filter(building => 
        building.name.toLowerCase().includes(filterValue)
      );
    },
    clearFilter() {
      this.filterText = '';
      this.applyFilter();
    },
  },
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