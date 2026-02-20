<template>
  <div class="uploader">

    <div v-if="uploading" class="uploading">
      CSV file is currently <span>uploading</span>
    </div>

    <div v-if="processing" class="processing">
      CSV file is currently <span>processing</span>
    </div>

    <div v-if="success" class="success">
      CSV Uploaded successfully: {{ success }}
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div class="dropzone-wrapper">
      <Dropzone
        :id="$uuid.v4()"
        ref="dropzone"
        :options="options"
        :use-custom-slot="true"
        :include-styling="false"
        class="dropzone"
        @vdropzone-sending="sending"
        @vdropzone-error="uploadError"
        @vdropzone-success="uploadSuccess"
        @vdropzone-files-added="multipleFilesAdded">

        <div class="drop-message">
          <div class="title">
            Drag and drop to upload content
          </div>
          <div class="subtitle">
            ...or click to select a file from your computer
          </div>
        </div>

      </Dropzone>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import Dropzone from 'nuxt-dropzone'

// ====================================================================== Export
export default {
  name: 'CsvUploader',

  components: {
    Dropzone
  },

  props: {
    options: {
      type: Object,
      required: true
    },
    processing: {
      type: Boolean,
      required: true
    },
    uploading: {
      type: Boolean,
      required: true
    },
    success: {
      type: [Boolean, String],
      required: true
    },
    error: {
      type: [Boolean, String],
      required: true
    }
  },

  data () {
    return {
      dropzone: false
    }
  },

  mounted () {
    this.dropzone = this.$refs.dropzone.dropzone
  },

  methods: {
    clearDropzone () {
      this.dropzone.removeAllFiles(true)
    },
    sending (file, xhr, formData) {
      this.$emit('fileSending')
      formData.append('metadata', JSON.stringify({
        origin: window.location.origin,
        hostname: window.location.hostname
      }))
      xhr.ontimeout = (e) => {
        this.clearDropzone()
      }
    },
    uploadError (file, message) {
      this.clearDropzone()
    },
    uploadSuccess (response) {
      const xhr = response.xhr
      this.clearDropzone()
      this.$emit('fileUploaded', xhr)
    },
    multipleFilesAdded (files) {
      if (files.length > 1) {
        this.clearDropzone()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.dropzone-wrapper {
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  height: 12rem;
  background-color: $voidBorderColorLessLight;
  margin-top: 2rem;
}

.uploading,
.processing,
.success {
  margin-top: 1rem;
  word-break: break-word;
}

.uploading {
  span {
    color: darkorange;
  }
}

.processing {
  span {
    color: darkblue;
  }
}

.success {
  color: green;
}

.error {
  color: red;
}

// //////////////////////////////////////////////////////////////////// Dropzone
.dropzone {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border: 2px dashed $gray400;
  border-radius: 1rem;
  cursor: pointer;
  height: 100%;
  width: 100%;
  transition: 250ms ease-out;
  &:hover,
  &.dz-drag-hover {
    transition: 250ms ease;
    background-color: $gray200;
  }
  &.dz-drag-hover {
    border: 4px solid $gray600;
  }
  &.dz-started {
    .drop-message {
      display: none;
    }
  }
}

.drop-message {
  text-align: center;
  .subtitle {
    opacity: 0.75;
  }
}

::v-deep .dz-preview {
  position: relative;
  &.dz-error {
    .dz-filename {
      color: red;
    }
  }
  &.dz-success {
    .dz-filename {
      color: green;
    }
  }
  .dz-image {
    display: none;
  }
  .dz-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 2rem;
  }
  .dz-size {
    @include label;
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    background-color: $gray100;
    margin-bottom: 0.5rem;
  }
  .dz-filename {
    text-align: center;
    font-weight: 600;
    transition: 250ms ease;
  }
  .dz-progress {
    position: relative;
    width: 100%;
    height: 2px;
    background-color: $gray200;
    border-radius: 0.25rem;
    margin: 1rem 0;
    overflow: hidden;
  }
  .dz-upload {
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    background-color: $gray500;
    height: 100%;
    transition: 250ms ease-in;
  }
  .dz-success-mark,
  .dz-error-mark {
    display: none;
  }
}
</style>
