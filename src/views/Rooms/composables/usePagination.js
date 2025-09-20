import { ref } from 'vue'

export function usePagination(fetchCallback) {
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const hasNextPage = ref(false)

    const goToPage = async (page) => {
        if (page < 1) return

        currentPage.value = page
        const limit = itemsPerPage.value
        const offset = (page - 1) * limit

        const response = await fetchCallback({
            limit: limit + 1,
            offset
        })

        hasNextPage.value = response.items.length > itemsPerPage.value

        if (hasNextPage.value) {
            response.items = response.items.slice(0, -1)
        }
    }

    const changeItemsPerPage = async (newSize) => {
        itemsPerPage.value = parseInt(newSize)
        await goToPage(1)
    }

    return {
        currentPage,
        itemsPerPage,
        hasNextPage,
        goToPage,
        changeItemsPerPage
    }
}