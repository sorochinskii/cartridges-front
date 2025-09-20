<template>
  <div class="container mt-4">
    <h2>Rooms List</h2>

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
        <i class="bi bi-plus-circle"></i> Add New Room
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

    <RoomsUploadModal
      v-if="showCsvPreviewModal"
      :data="csvPreviewData"
      :loading="uploadingRooms"
      @close="showCsvPreviewModal = false"
      @confirm="uploadRoomsFromCsv"
    />

    <RoomsTable
      :loading="loading"
      :rooms="rooms"
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

    <RoomsCreateModal
      v-if="showCreateModal"
      @close="closeCreateModal"
      @create="handleCreateRoom"
    />

    <RoomsEditModal
      v-if="showEditModal"
      :room="selectedRoom"
      @close="closeEditModal"
      @update="handleUpdateRoom"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import RoomsTable from './components/RoomsTable.vue'
import RoomsUploadModal from './components/RoomsUploadModal.vue'
import RoomsCreateModal from './components/RoomsCreateModal.vue'
import RoomsEditModal from './components/RoomsEditModal.vue'
import { useRooms } from './composables/useRooms'
import { usePagination } from './composables/usePagination'
import { useFileUpload } from './composables/useFileUpload'

export default {
  components: {
    RoomsTable,
    RoomsUploadModal,
    RoomsCreateModal,
    RoomsEditModal,
  },
  setup() {
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showSuccessToast = ref(false)
    const successMessage = ref('')
    const selectedRoom = ref(null)
    const selectedItems = ref([])
    const areAllSelected = ref(false)

    // Use the useRooms composable
    const { 
      rooms, 
      loading, 
      headers, 
      newRoom, 
      loadRooms, 
      createRoom, 
      updateRoom, 
      deleteRooms 
    } = useRooms()

    // Use the usePagination composable
    const { 
      currentPage, 
      itemsPerPage, 
      hasNextPage, 
      goToPage, 
      changeItemsPerPage 
    } = usePagination(loadRooms)

    // Use the useFileUpload composable
    const { 
      fileInput, 
      csvPreviewData, 
      uploadingRooms, 
      showCsvPreviewModal, 
      triggerFileInput, 
      handleFileUpload, 
      uploadRoomsFromCsv 
    } = useFileUpload(loadRooms)

    // Load rooms when component is mounted
    onMounted(() => {
      goToPage(1)
    })

    // Methods for handling UI interactions
    const openEditModal = () => {
      if (selectedItems.value.length === 1) {
        const roomId = selectedItems.value[0]
        selectedRoom.value = rooms.value.find(r => r.id === roomId)
        showEditModal.value = true
      }
    }

    const closeCreateModal = () => {
      showCreateModal.value = false
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const handleCreateRoom = async (roomData) => {
      try {
        await createRoom(roomData)
        showCreateModal.value = false
        showSuccessToast.value = true
        successMessage.value = 'Room created successfully'
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        // Refresh the rooms list
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error creating room:', error)
      }
    }

    const handleUpdateRoom = async (updatedRoom) => {
      try {
        await updateRoom(updatedRoom.id, updatedRoom)
        showEditModal.value = false
        showSuccessToast.value = true
        successMessage.value = 'Room updated successfully'
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        // Refresh the rooms list
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error updating room:', error)
      }
    }

    const deleteSelected = async () => {
      if (selectedItems.value.length === 0) return
      
      try {
        const result = await deleteRooms(selectedItems.value)
        showSuccessToast.value = true
        successMessage.value = result.message
        setTimeout(() => {
          showSuccessToast.value = false
        }, 3000)
        // Refresh the rooms list and reset selection
        selectedItems.value = []
        areAllSelected.value = false
        goToPage(currentPage.value)
      } catch (error) {
        console.error('Error deleting rooms:', error)
      }
    }

    const toggleSelect = (roomId) => {
      const index = selectedItems.value.indexOf(roomId)
      if (index === -1) {
        selectedItems.value.push(roomId)
      } else {
        selectedItems.value.splice(index, 1)
      }
      
      // Update areAllSelected based on whether all items are selected
      areAllSelected.value = selectedItems.value.length === rooms.value.length
    }

    const toggleSelectAll = (selected) => {
      if (selected) {
        selectedItems.value = rooms.value.map(room => room.id)
      } else {
        selectedItems.value = []
      }
      areAllSelected.value = selected
    }

    return {
      rooms,
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
      selectedRoom,
      fileInput,
      csvPreviewData,
      uploadingRooms,
      showCsvPreviewModal,
      newRoom,
      goToPage,
      changeItemsPerPage,
      toggleSelect,
      toggleSelectAll,
      openEditModal,
      closeCreateModal,
      closeEditModal,
      handleCreateRoom,
      handleUpdateRoom,
      deleteSelected,
      triggerFileInput,
      handleFileUpload,
      uploadRoomsFromCsv,
    }
  }
}
</script>
