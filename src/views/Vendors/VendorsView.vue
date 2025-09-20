<template>
  <div class="container mt-4">
    <h2>Vendors List</h2>

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
        <i class="bi bi-plus-circle"></i> Add New Vendor
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

    <VendorsUploadModal
      v-if="showCsvPreviewModal"
      :data="csvPreviewData"
      :loading="uploadingVendors"
      @close="showCsvPreviewModal = false"
      @confirm="uploadVendorsFromCsv"
    />

    <VendorsTable
      :loading="loading"
      :vendors="vendors"
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

    <VendorsCreateModal
      v-if="showCreateModal"
      @close="closeCreateModal"
      @create="handleCreateVendor"
    />

    <VendorsEditModal
      v-if="showEditModal"
      :vendor="selectedVendor"
      @close="closeEditModal"
      @update="handleUpdateVendor"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import VendorsTable from './components/VendorsTable.vue'
import VendorsUploadModal from './components/VendorsUploadModal.vue'
import VendorsCreateModal from './components/VendorsCreateModal.vue'
import VendorsEditModal from './components/VendorsEditModal.vue'
import { useVendors } from './composables/useVendors'
import { usePagination } from './composables/usePagination'
import { useFileUpload } from './composables/useFileUpload'

export default {
  components: {
    VendorsTable,
    VendorsUploadModal,
    VendorsCreateModal,
    VendorsEditModal,
  },
  setup() {
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showSuccessToast = ref(false)
    const successMessage = ref('')
    const selectedVendor = ref(null)
    const selectedItems = ref([])
    const areAllSelected = ref(false)

    // Use the useVendors composable
    const { 
      vendors, 
      loading, 
      headers, 
      newVendor, 
      loadVendors, 
      createVendor, 
      updateVendor, 
      deleteVendors 
    } = useVendors()

    // Use the usePagination composable
    const { 
      currentPage, 
      itemsPerPage, 
      hasNextPage, 
      goToPage, 
      changeItemsPerPage 
    } = usePagination(loadVendors)

    // Use the useFileUpload composable
    const { 
      fileInput, 
      csvPreviewData, 
      uploadingVendors, 
      showCsvPreviewModal, 
      triggerFileInput, 
      handleFileUpload, 
      uploadVendorsFromCsv 
    } = useFileUpload(loadVendors)

    // Load vendors when component is mounted
    onMounted(() => {
      goToPage(1)
    })

    // Methods for handling UI interactions
    const openEditModal = () => {
      if (selectedItems.value.length === 1) {
        const vendorId = selectedItems.value[0]
        selectedVendor.value = vendors.value.find(b => b.id === vendorId)
        showEditModal.value = true
      }
    }

    const closeCreateModal = () => {
      showCreateModal.value = false
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const handleCreateVendor = async (vendorData) => {
      try {
        await createVendor(vendorData)
        showCreateModal.value = false
        showSuccessToast.value = true
        successMessage.value = 'Vendor created successfully'
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error creating vendor:', error)
      }
    }

    const handleUpdateVendor = async (updatedVendor) => {
      try {
        await updateVendor(updatedVendor.id, updatedVendor)
        showEditModal.value = false
        showSuccessToast.value = true
        successMessage.value = 'Vendor updated successfully'
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        // Refresh the vendors list
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error updating vendor:', error)
      }
    }

    const deleteSelected = async () => {
      if (selectedItems.value.length === 0) return
      
      try {
        const result = await deleteVendors(selectedItems.value)
        showSuccessToast.value = true
        successMessage.value = result.message
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        // Refresh the vendors list and reset selection
        selectedItems.value = []
        areAllSelected.value = false
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error deleting vendors:', error)
      }
    }

    const toggleSelect = (vendorId) => {
      const index = selectedItems.value.indexOf(vendorId)
      if (index === -1) {
        selectedItems.value.push(vendorId)
      } else {
        selectedItems.value.splice(index, 1)
      }
      
      // Update areAllSelected based on whether all items are selected
      areAllSelected.value = selectedItems.value.length === vendors.value.length
    }

    const toggleSelectAll = (selected) => {
      if (selected) {
        selectedItems.value = vendors.value.map(vendor => vendor.id)
      } else {
        selectedItems.value = []
      }
      areAllSelected.value = selected
    }

    return {
      vendors,
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
      selectedVendor,
      fileInput,
      csvPreviewData,
      uploadingVendors,
      showCsvPreviewModal,
      newVendor,
      goToPage,
      changeItemsPerPage,
      toggleSelect,
      toggleSelectAll,
      openEditModal,
      closeCreateModal,
      closeEditModal,
      handleCreateVendor,
      handleUpdateVendor,
      deleteSelected,
      triggerFileInput,
      handleFileUpload,
      uploadVendorsFromCsv,
    }
  }
}
</script>
