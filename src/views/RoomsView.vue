<template>
  <div class="container mt-4">
    <h2>Rooms List</h2>
    
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
          <tr v-for="room in rooms" :key="room.id">
            <td>{{ room.name }}</td>
            <td>{{ room.building_name }}</td>
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
import { API_BASE_URL } from '@/config/api'
import api from '@/api'

export default {
  name: 'RoomsView',
  data() {
    return {
      loading: false,
      rooms: [], // Теперь будет содержать и информацию о зданиях
      headers: ['Name', 'Building Name'], // Обновлённые заголовки
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      customLimit: 10,
      customOffset: 0,
      manualMode: false
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
  methods: {
    async fetchRooms() {
      this.loading = true
      this.error = null
      try {
        // 1. Запрашиваем комнаты
        const params = {
          limit: this.manualMode ? this.customLimit : this.itemsPerPage,
          offset: this.manualMode ? this.customOffset : (this.currentPage - 1) * this.itemsPerPage
        }

        const roomsResponse = await api.get(`${API_BASE_URL}/rooms`, {
          params,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${this.$store.state.accessToken}`,
          },
        })
        
        const roomsData = roomsResponse.data.items || roomsResponse.data
        this.totalItems = roomsResponse.data.total_count || roomsResponse.data.length || 0

        // 2. Получаем уникальные building_id
        const buildingIds = [...new Set(roomsData.map(room => room.building_id))]
          .filter(id => id) // Фильтруем null/undefined
        
        if (buildingIds.length > 0) {
          // 3. Запрашиваем информацию о зданиях
          const buildingsResponse = await api.post(`${API_BASE_URL}/buildings/batch`, 
            buildingIds,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${this.$store.state.accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          // 4. Создаем словарь зданий для быстрого доступа
          const buildingsMap = {}
          buildingsResponse.data.forEach(building => {
            buildingsMap[building.id] = building.name
          })
          
          // 5. Объединяем данные
          this.rooms = roomsData.map(room => ({
            ...room,
            building_name: buildingsMap[room.building_id] || 'Unknown'
          }))
        } else {
          this.rooms = roomsData.map(room => ({
            ...room,
            building_name: 'No building'
          }))
        }
        
      } catch (error) {
        console.error('Error fetching data:', error)
        this.error = error.response?.data?.message || 'Failed to load data'
        this.rooms = [] // Очищаем список комнат при ошибке
      } finally {
        this.loading = false
      }
    },
    
    // Методы автоматической пагинации
    goToPage(page) {
      this.currentPage = page
      this.manualMode = false
      this.fetchRooms()
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.manualMode = false
        this.fetchRooms()
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.manualMode = false
        this.fetchRooms()
      }
    },
    
    // Методы ручного управления
    applyCustomPagination() {
      this.manualMode = true
      this.fetchRooms()
    },
    resetPagination() {
      this.manualMode = false
      this.currentPage = 1
      this.customLimit = 10
      this.customOffset = 0
      this.fetchRooms()
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
</style>