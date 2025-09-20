<template>
  <div class="row mb-3">
    <div class="col-md-3">
      <div class="input-group">
        <span class="input-group-text">Limit</span>
        <input
          type="number"
          :value="modelValue.limit"
          @input="$emit('update:modelValue', { ...modelValue, limit: $event.target.value })"
          min="1"
          class="form-control"
        />
      </div>
    </div>
    <div class="col-md-3">
      <div class="input-group">
        <span class="input-group-text">Offset</span>
        <input
          type="number"
          :value="modelValue.offset"
          @input="$emit('update:modelValue', { ...modelValue, offset: $event.target.value })"
          min="0"
          class="form-control"
        />
      </div>
    </div>
    <div class="col-md-6 d-flex align-items-center">
      <button class="btn btn-primary me-2" @click="$emit('apply')" :disabled="manualMode">
        Apply
      </button>
      <button class="btn btn-secondary" @click="$emit('reset')" :disabled="!manualMode">
        Reset
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
      validator: (value) => {
        return 'limit' in value && 'offset' in value
      },
    },
    manualMode: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'apply', 'reset'],
}
</script>

<style scoped>
.input-group {
  margin-bottom: 10px;
}
</style>
