<template>
  <div class="container mt-4">
    <h2>Buildings List</h2>

    <!-- Кнопки управления -->
    <div class="mb-3 d-flex gap-2">
      <button class="btn btn-success" @click="showCreateModal = true">
        <i class="bi bi-plus-circle"></i> Add New Building
      </button>
      
      <!-- Кнопка загрузки CSV -->
      <button class="btn btn-primary" @click="triggerFileInput">
        <i class="bi bi-upload"></i> Upload CSV
      </button>
      <input 
        type="file" 
        ref="fileInput"
        accept=".csv"
        style="display: none"
        @change="handleFileUpload"
      >
    </div>

    <!-- Модальное окно предпросмотра CSV -->
    <div v-if="showCsvPreviewModal" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">CSV Preview ({{ csvPreviewData.length }} buildings)</h5>
            <button type="button" class="btn-close" @click="showCsvPreviewModal = false"></button>
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
                  <tr v-for="(item, index) in csvPreviewData" :key="index">
                    <td>{{ item.name }}</td>
                    <td>{{ item.id || 'Will be generated' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCsvPreviewModal = false">
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="uploadBuildingsFromCsv"
              :disabled="uploadingBuildings"
            >
              <span v-if="uploadingBuildings" class="spinner-border spinner-border-sm"></span>
              {{ uploadingBuildings ? 'Uploading...' : 'Upload Buildings' }}
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Модальное окно предпросмотра CSV -->
    <div v-if="showCsvPreviewModal" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">CSV Preview ({{ csvPreviewData.length }} buildings)</h5>
            <button type="button" class="btn-close" @click="showCsvPreviewModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Building Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in csvPreviewData" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCsvPreviewModal = false">
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="uploadBuildingsFromCsv"
              :disabled="uploadingBuildings"
            >
              <span v-if="uploadingBuildings" class="spinner-border spinner-border-sm"></span>
              {{ uploadingBuildings ? 'Uploading...' : 'Confirm Upload' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Контролы пагинации -->
    <div class="row mb-3">
      <div class="col-md-3">
        <div class="input-group">
          <span class="input-group-text">Limit</span>
          <input 
            type="number" 
            v-model.number="customLimit" 
            min="1" 
            class="form-control"
            @change="applyCustomPagination"
          >
        </div>
      </div>
      <div class="col-md-3">
        <div class="input-group">
          <span class="input-group-text">Offset</span>
          <input 
            type="number" 
            v-model.number="customOffset" 
            min="0" 
            class="form-control"
            @change="applyCustomPagination"
          >
        </div>
      </div>
      <div class="col-md-6 d-flex align-items-center">
        <button class="btn btn-primary me-2" @click="applyCustomPagination">
          Apply
        </button>
        <button class="btn btn-secondary" @click="resetPagination">
          Reset
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else>
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="building in buildings" :key="building.id">
            <td>{{ building.name }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Автоматическая пагинация -->
      <nav v-if="showAutoPagination" aria-label="Page navigation">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="prevPage">Previous</button>
          </li>
          <li class="page-item" v-for="page in totalPages" :key="page" 
              :class="{ active: page === currentPage }">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="nextPage">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { v4 as uuidv4 } from 'uuid' // Для генерации UUID
import { parse } from 'papaparse'

export default {
  name: 'BuildingsView',
  data() {
    return {
      loading: false,
      buildings: [],
      headers: ['Name'],
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      customLimit: 10,
      customOffset: 0,
      manualMode: false,
      showCreateModal: false,
      creatingBuilding: false,
      newBuilding: {
        name: '',
        id: uuidv4() // Генерируем UUID по умолчанию
      },
      showCsvPreviewModal: false,
      csvPreviewData: [], // Только для предпросмотра (без ID)
      uploadReadyData: [], // Полные данные с ID для отправки
      uploadingBuildings: false,
      selectedFile: null
    }
  },
  computed: {
    showAutoPagination() {
      return !this.manualMode && this.totalPages > 1
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage)
    }
  },
  async created() {
    await this.fetchBuildings()
  },
  methods: {
    async fetchBuildings() {
      this.loading = true
      this.error = null
      try {
        const params = {
          limit: this.manualMode ? this.customLimit : this.itemsPerPage,
          offset: this.manualMode ? this.customOffset : (this.currentPage - 1) * this.itemsPerPage
        }

        const response = await api.get(`/buildings`, {
          params,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.$store.state.accessToken}`,
          },
        })
        
        this.buildings = response.data.items || response.data
        this.totalItems = response.data.total_count || response.data.length || 0
      } catch (error) {
        console.error('Error fetching buildings:', error)
        this.error = error.response?.data?.message || 'Failed to load buildings'
        this.buildings = []
      } finally {
        this.loading = false
      }
    },

    async createBuilding() {
      this.creatingBuilding = true
      try {
        const response = await api.post('/buildings', this.newBuilding, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.accessToken}`
          }
        })
        
        // Добавляем новое здание в список
        this.buildings.unshift(response.data)
        this.totalItems++
        
        // Закрываем модальное окно и сбрасываем форму
        this.showCreateModal = false
        this.newBuilding = {
          name: '',
          id: uuidv4() // Генерируем новый UUID для следующего создания
        }
        
        // Показываем уведомление об успехе
        if (typeof this.$toast !== 'undefined') {
          this.$toast.success('Building created successfully!');
        } else {
          console.log('Building created successfully!');
        }
        
      } catch (error) {
        console.error('Error creating building:', error);
        const errorMsg = error.response?.data?.message || 'Failed to create building';
        
        if (typeof this.$toast !== 'undefined') {
          this.$toast.error(errorMsg);
        } else {
          console.error(errorMsg);
        }
      } finally {
        this.creatingBuilding = false;
      }
    },
    // Методы автоматической пагинации
    goToPage(page) {
      this.currentPage = page
      this.manualMode = false
      this.fetchBuildings()
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.manualMode = false
        this.fetchBuildings()
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.manualMode = false
        this.fetchBuildings()
      }
    },
    
    // Методы ручного управления
    applyCustomPagination() {
      this.manualMode = true
      this.fetchBuildings()
    },
    resetPagination() {
      this.manualMode = false
      this.currentPage = 1
      this.customLimit = 10
      this.customOffset = 0
      this.fetchBuildings()
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsText(file)
      })
    },
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.selectedFile = file
      
      try {
        const text = await this.readFileAsText(file)
        const { data } = parse(text, {
          header: true,
          skipEmptyLines: true
        })
        
        // Валидация CSV
        if (!data.length || !data[0].name) {
          throw new Error('CSV must contain "name" column')
        }
        
        // Подготавливаем данные:
        // - Для предпросмотра (только имена)
        this.csvPreviewData = data.map(item => ({ name: item.name }))
        
        // - Для отправки (сгенерировать UUID для каждого элемента)
        this.uploadReadyData = data.map(item => ({
          name: item.name,
          id: uuidv4() // Генерируем UUID для каждого здания
        }))
        
        this.showCsvPreviewModal = true
      } catch (error) {
        console.error('Error parsing CSV:', error)
        this.$toast?.error(`CSV Error: ${error.message}`)
      } finally {
        event.target.value = ''
      }
    },
    
    async uploadBuildingsFromCsv() {
      this.uploadingBuildings = true
      try {
        const response = await api.post('/buildings/batch/create', this.uploadReadyData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.accessToken}`
          }
        })
        
        this.$toast?.success(`Successfully uploaded ${this.uploadReadyData.length} buildings`)
        this.showCsvPreviewModal = false
        this.csvPreviewData = []
        this.uploadReadyData = []
        
        // Обновляем список зданий
        await this.fetchBuildings()
      } catch (error) {
        console.error('Error uploading buildings:', error)
        const errorMsg = error.response?.data?.message || 'Failed to upload buildings'
        this.$toast?.error(errorMsg)
      } finally {
        this.uploadingBuildings = false
      }
    }
  }
}
</script>

<style scoped>
.table {
  margin-top: 20px;
}
.pagination {
  margin-top: 20px;
}
.input-group {
  margin-bottom: 10px;
}
/* Добавляем стили для модального окна */
.modal-backdrop {
  opacity: 0.5;
}
/* Добавляем стили для кнопок */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Стили для таблицы предпросмотра */
.table-responsive {
  max-height: 60vh;
  overflow-y: auto;
}
.table-preview {
  font-size: 0.9rem;
}
.table-preview th, 
.table-preview td {
  padding: 0.5rem;
}
</style>