<template>
  <div class="dropzone-container">
    <div
      ref="dropzoneRef"
      :class="['dropzone relative flex flex-col items-center justify-center border-1 border-dashed rounded-4xl aspect-square p-8 cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-stroke-blue-500', {
        'border-solid': isDragging,
        'hover:bg-gray-100': !isDragging && !selectedFile,
        'is-dragging': isDragging,
        'has-file': selectedFile
      }]"
      @dragover.prevent="onDragOver"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="selectedFile ? null : openFileDialog">
      
      <input
        v-if="!selectedFile"
        ref="fileInput"
        type="file"
        accept="application/pdf"
        class="absolute top-0 left-0 w-full h-full z-100 opacity-0 cursor-pointer"
        @change="onFileChange" />

      <!-- Show dropzone content when no file is selected -->
      <template v-if="!selectedFile">
        <div class="hover-indicator absolute top-0 left-0 w-full h-full flex items-center justify-center z-50">
          Drop PDF file here
        </div>
        <div class="inner-content text-center flex flex-col items-center gap-2">
          <span class="text-sm text-dark">
            Drag & drop PDF files here
          </span>
          <span class="text-xs text-dark">
            or click to select
          </span>
          <UiKbd theme="light">
            Shift+Cmd+U
          </UiKbd>
        </div>
      </template>

      <!-- Show selected file when file is selected -->
      <div v-else class="inner-content text-center flex flex-col items-center gap-3">
        <!-- File Icon -->
        <Icon name="iconoir:page" size="32" class="text-gray-600"/>
        
        <!-- File Info -->
        <div class="text-center">
          <div class="text-sm font-medium text-dark truncate max-w-48">
            {{ selectedFile.name }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            {{ useFormatBytes(selectedFile.size) }}
          </div>
        </div>
        
        <!-- Remove Button -->
        <button
          class="mt-2 pr-2 pl-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-md transition-colors duration-150 flex items-center gap-1"
          @click.stop="removeFile">
          <Icon name="iconoir:xmark" size="14" class="inline mr-0.5" />
          Remove
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['files-selected', 'error'])

const fileInput = ref(null)
const dropzoneRef = ref(null)
const isDragging = ref(false)
const selectedFile = ref(null)

/**
 * Validates that the file is a PDF
 * @param file - File to validate
 * @returns True if file is PDF
 */
const validateAllowedFileType = (file) => {
  const allowedTypes = ['application/pdf']
  return allowedTypes.includes(file.type)
}

/**
 * Sets the selected file
 * @param file - File to set as selected
 */
const setFile = (file) => {
  selectedFile.value = file
  emit('files-selected', [file])
}

/**
 * Removes the selected file
 */
const removeFile = () => {
  selectedFile.value = null
  emit('files-selected', [])
}

/**
 * Handles drag over event (required to enable drop)
 */
const onDragOver = () => {
  // This is required for drop to work and to avoid flickering when dragging over
  // child elements, but we don't set isDragging here
}

/**
 * Handles drag enter event and sets dragging state
 */
const onDragEnter = () => {
  if (!selectedFile.value) {
    isDragging.value = true
  }
}

/**
 * Handles drag leave event and resets dragging state only when actually leaving the dropzone
 * @param event - The drag leave event
 */
const onDragLeave = (event) => {
  // Only set isDragging to false if we're actually leaving the dropzone container
  // This prevents flickering when dragging over child elements
  if (!dropzoneRef.value.contains(event.relatedTarget)) {
    isDragging.value = false
  }
}

/**
 * Handles file drop event and validates PDF files
 * @param event - The drop event
 */
const onDrop = (event) => {
  isDragging.value = false
  if (selectedFile.value) return // Don't accept new files if one is already selected
  const files = Array.from(event.dataTransfer.files)
  const file = files[0] // Only take the first file
  if (!file || !validateAllowedFileType(file)) {
    emit('error', 'Only PDF files are accepted')
    return
  }
  setFile(file)
}

/**
 * Handles file input change event and validates PDF files
 * @param event - The input change event
 */
const onFileChange = (event) => {
  const files = Array.from(event.target.files)
  const file = files[0] // Only take the first file
  if (!file || !validateAllowedFileType(file)) {
    emit('error', 'Only PDF files are accepted')
    return
  }
  setFile(file)
  // Clear the input so the same file can be selected again if needed
  event.target.value = ''
}

/**
 * Opens the file dialog by triggering the hidden input click
 */
const openFileDialog = () => {
  fileInput.value.click()
}

// Expose the openFileDialog method to parent components
defineExpose({
  openFileDialog
})
</script>

<style lang="scss" scoped>
.dropzone {
  &.is-dragging:not(.has-file) {
    .inner-content {
      transition: 150ms ease-in;
      transform: translateY(16px);
      opacity: 0;
    }
    .hover-indicator {
      transition: 150ms ease-in;
      opacity: 1;
      transform: translateY(0);
    }
  }
  &:hover:not(.has-file) {
    .inner-content {
      transition: 150ms ease-in;
      transform: scale(1.05);
    }
  }
  &.has-file {
    cursor: default;
    border-color: #e5e7eb;
    background-color: #f9fafb;
  }
}

.inner-content {
  transition: 150ms ease-out;
}

.hover-indicator {
  transition: 150ms ease-out;
  opacity: 0;
  transform: translateY(-24px);
  pointer-events: none;
}
</style>
