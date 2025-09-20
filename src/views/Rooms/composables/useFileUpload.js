import { ref } from 'vue'
import { parse } from 'papaparse'
import { v4 as uuidv4 } from 'uuid'
import api from '@/api'

export function useFileUpload(fetchCallback) {
    const fileInput = ref(null)
    const csvPreviewData = ref([])
    const uploadReadyData = ref([])
    const uploadingRooms = ref(false)
    const showCsvPreviewModal = ref(false)

    const triggerFileInput = () => {
        fileInput.value.click()
    }

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = e => resolve(e.target.result)
            reader.onerror = reject
            reader.readAsText(file)
        })
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        try {
            const text = await readFileAsText(file)
            const { data } = parse(text, { header: true, skipEmptyLines: true })

            if (!data.length || !data[0].name) {
                throw new Error('CSV must contain "name" column')
            }

            csvPreviewData.value = data.map(item => ({ name: item.name }))
            uploadReadyData.value = data.map(item => ({
                name: item.name,
                id: uuidv4()
            }))

            showCsvPreviewModal.value = true
        } catch (error) {
            console.error('Error parsing CSV:', error)
            throw error
        } finally {
            event.target.value = ''
        }
    }

    const uploadRoomsFromCsv = async () => {
        uploadingRooms.value = true
        try {
            await api.post('/rooms/batch/create', uploadReadyData.value)
            showCsvPreviewModal.value = false
            csvPreviewData.value = []
            uploadReadyData.value = []
            await fetchCallback()
        } catch (error) {
            console.error('Error uploading rooms:', error)
            throw error
        } finally {
            uploadingRooms.value = false
        }
    }

    return {
        fileInput,
        csvPreviewData,
        uploadingRooms,
        uploadReadyData,
        showCsvPreviewModal,
        triggerFileInput,
        handleFileUpload,
        uploadRoomsFromCsv
    }
}