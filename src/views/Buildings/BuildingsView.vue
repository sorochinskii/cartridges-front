<template>
  <div class="container mt-4">
    <h2>Buildings List</h2>

    <!-- Toast notification -->
    <div v-if="showSuccessToast" class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-success text-white">
          <strong class="me-auto">Success</strong>
          <button type="button" class="btn-close btn-close-white" @click="showSuccessToast = false"></button>
        </div>
        <div class="toast-body">
          {{ successMessage }}
        </div>
      </div>
    </div>

    <div class="mb-3 d-flex gap-2">
      <button class="btn btn-success" @click="showCreateModal = true">
        <i class="bi bi-plus-circle"></i> Add New Building
      </button>
      <button class="btn btn-primary" @click="triggerFileInput">
        <i class="bi bi-upload"></i> Upload CSV
      </button>
      <button 
        v-if="selectedItems.length === 1"
        class="btn btn-warning"
        @click="openEditModal"
      >
        <i class="bi bi-pencil"></i> Edit Selected
      </button>
      <button 
        v-if="selectedItems.length > 0"
        class="btn btn-danger"
        @click="deleteSelected"
      >
        <i class="bi bi-trash"></i> Delete Selected ({{ selectedItems.length }})
      </button>
      <input
        type="file"
        ref="fileInput"
        accept=".csv"
        style="display: none"
        @change="handleFileUpload"
      />
    </div>

    <BuildingsUploadModal
      v-if="showCsvPreviewModal"
      :data="csvPreviewData"
      :loading="uploadingBuildings"
      @close="showCsvPreviewModal = false"
      @confirm="uploadBuildingsFromCsv"
    />

    <BuildingsTable
      :loading="loading"
      :buildings="buildings"
      :headers="headers"
      :current-page="currentPage"
      :has-next-page="hasNextPage"
      :items-per-page="itemsPerPage"
      :selected-items="selectedItems"
      :are-all-selected="areAllSelected"
      @page-change="goToPage"
      @items-per-page-change="changeItemsPerPage"
      @toggle-select="toggleSelect"
      @toggle-select-all="toggleSelectAll"
    />

    <BuildingsCreateModal
      v-if="showCreateModal"
      @close="closeCreateModal"
      @create="handleCreateBuilding"
    />

    <BuildingsEditModal
      v-if="showEditModal"
      :building="selectedBuilding"
      @close="closeEditModal"
      @update="handleUpdateBuilding"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BuildingsTable from './components/BuildingsTable.vue'
import BuildingsUploadModal from './components/BuildingsUploadModal.vue'
import BuildingsCreateModal from './components/BuildingsCreateModal.vue'
import BuildingsEditModal from './components/BuildingsEditModal.vue'
import { useBuildings } from './composables/useBuildings'
import { usePagination } from './composables/usePagination'
import { useFileUpload } from './composables/useFileUpload'

export default {
  components: {
    BuildingsTable,
    BuildingsUploadModal,
    BuildingsCreateModal,
    BuildingsEditModal,
  },
  setup() {
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showSuccessToast = ref(false)
    const successMessage = ref('')
    const selectedBuilding = ref(null)
    const selectedItems = ref([])
    const areAllSelected = ref(false)

    // Use the useBuildings composable
    const { 
      buildings, 
      loading, 
      headers, 
      newBuilding, 
      loadBuildings, 
      createBuilding, 
      updateBuilding, 
      deleteBuildings 
    } = useBuildings()

    // Use the usePagination composable
    const { 
      currentPage, 
      itemsPerPage, 
      hasNextPage, 
      goToPage, 
      changeItemsPerPage 
    } = usePagination(loadBuildings)

    // Use the useFileUpload composable
    const { 
      fileInput, 
      csvPreviewData, 
      uploadingBuildings, 
      showCsvPreviewModal, 
      triggerFileInput, 
      handleFileUpload, 
      uploadBuildingsFromCsv 
    } = useFileUpload(loadBuildings)

    // Load buildings when component is mounted
    onMounted(() => {
      goToPage(1)
    })

    // Methods for handling UI interactions
    const openEditModal = () => {
      if (selectedItems.value.length === 1) {
        const buildingId = selectedItems.value[0]
        selectedBuilding.value = buildings.value.find(b => b.id === buildingId)
        showEditModal.value = true
      }
    }

    const closeCreateModal = () => {
      showCreateModal.value = false
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const handleCreateBuilding = async (buildingData) => {
      try {
        await createBuilding(buildingData)
        showCreateModal.value = false
        showSuccessToast.value = true
        successMessage.value = 'Building created successfully'
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error creating building:', error)
      }
    }

    const handleUpdateBuilding = async (updatedBuilding) => {
      try {
        await updateBuilding(updatedBuilding.id, updatedBuilding)
        showEditModal.value = false
        showSuccessToast.value = true
        successMessage.value = 'Building updated successfully'
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        // Refresh the buildings list
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error updating building:', error)
      }
    }

    const deleteSelected = async () => {
      if (selectedItems.value.length === 0) return
      
      try {
        const result = await deleteBuildings(selectedItems.value)
        showSuccessToast.value = true
        successMessage.value = result.message
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        // Refresh the buildings list and reset selection
        selectedItems.value = []
        areAllSelected.value = false
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error deleting buildings:', error)
      }
    }

    const toggleSelect = (buildingId) => {
      const index = selectedItems.value.indexOf(buildingId)
      if (index === -1) {
        selectedItems.value.push(buildingId)
      } else {
        selectedItems.value.splice(index, 1)
      }
      
      // Update areAllSelected based on whether all items are selected
      areAllSelected.value = selectedItems.value.length === buildings.value.length
    }

    const toggleSelectAll = (selected) => {
      if (selected) {
        selectedItems.value = buildings.value.map(building => building.id)
      } else {
        selectedItems.value = []
      }
      areAllSelected.value = selected
    }

    return {
      buildings,
      loading,
      headers,
      currentPage,
      hasNextPage,
      itemsPerPage,
      selectedItems,
      areAllSelected,
      showCreateModal,
      showEditModal,
      showSuccessToast,
      successMessage,
      selectedBuilding,
      fileInput,
      csvPreviewData,
      uploadingBuildings,
      showCsvPreviewModal,
      newBuilding,
      goToPage,
      changeItemsPerPage,
      toggleSelect,
      toggleSelectAll,
      openEditModal,
      closeCreateModal,
      closeEditModal,
      handleCreateBuilding,
      handleUpdateBuilding,
      deleteSelected,
      triggerFileInput,
      handleFileUpload,
      uploadBuildingsFromCsv,
    }
  }
}
</script>
