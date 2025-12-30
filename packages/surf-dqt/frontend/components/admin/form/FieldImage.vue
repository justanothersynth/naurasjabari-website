<template>
  <div :class="['field-image-uploader', state]">

    <div
      :class="['image-preview border validation', state]"
      :style="{ backgroundImage: imageSet ? `url(${imgUrl})` : '' }">
      <input
        v-if="!disabled"
        type="file"
        accept="image/png, image/jpeg, image/svg"
        class="file-input"
        @change="handleImage" />
      <div v-if="!imageSet" class="placeholder">
        Click to upload an image
      </div>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapActions } from 'vuex'

// =================================================================== Functions
const validateImage = (instance, files) => {
  return new Promise((resolve) => {
    const len = files.length
    let validated = true
    let image
    let message
    if (len > 0) {
      // ----- Can only upload 1 image at a time
      if (len > 1) {
        validated = false
        message = 'You can only upload 1 image at a time'
        return resolve({ validated, message })
      } else {
        image = files[0]
      }
      // ----- Image must be a PNG, JPG, JPEG or SVG
      const allowed = ['png', 'jpg', 'jpeg', 'svg']
      const test = new RegExp(allowed.join('|')).test(image.type)
      if (!test) {
        validated = false
        message = 'Image must be a PNG, JPG, JPEG or SVG'
        return resolve({ validated, message })
      }
      // ----- Image must be <= 2000kb
      if (image.size / 1000 > 2000) {
        validated = false
        message = 'Image must be less than or equal to 2MB'
        return resolve({ validated, message })
      }
      return resolve({ validated, message, image })
    }
    return resolve({ validated: false })
  })
}

// ====================================================================== Export
export default {
  name: 'FieldImage',

  components: {
    // Button
  },

  props: {
    description: {
      type: String,
      required: false,
      default: ''
    },
    value: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    sectionId: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    namespace: {
      type: String,
      required: true
    }
  },

  computed: {
    imageSet () {
      return this.value !== ''
    },
    imgUrl () {
      return `${this.$config.backendUrl}/image/original/${this.value}`
    }
  },

  methods: {
    ...mapActions({
      postImage: 'admin/postImage'
    }),
    async handleImage (e) {
      const files = e.target.files
      if (files.length > 0) {
        const payload = await validateImage(this, files)
        const validated = payload.validated
        const image = payload.image
        const message = payload.message
        if (validated) {
          const filename = await this.postImage({
            image,
            sectionId: this.sectionId,
            namespace: this.namespace
          })
          this.$emit('updateValue', filename)
        } else {
          this.$Toaster.addToast({
            type: 'toast',
            category: 'error',
            message
          })
        }
      }
    },
    removeImage () {
      this.$emit('updateValue', '')
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.panel-left {
  flex: 1;
  padding-right: 1rem;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.description {
  font-size: 0.75rem;
  opacity: 0.75;
  margin-top: 1rem;
}

// ///////////////////////////////////////////////////////////////////// Buttons
.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.button {
  &:not(:last-child) {
    margin-right: 1rem;
  }
}

.image-preview {
  position: relative;
  width: 20rem;
  padding-top: calc(20rem - 4px);
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  border: 2px solid transparent;
  border-radius: 0.125rem;
  transition: border-color 250ms;
  &:hover {
    .placeholder {
      transition: 250ms ease-in;
      background-color: $electricViolet;
      color: white;
    }
  }
}

.placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 0.75rem;
  text-align: center;
  padding: 1rem;
  background-color: $gray200;
  z-index: 5;
  transition: 250ms ease-out;
}
</style>
