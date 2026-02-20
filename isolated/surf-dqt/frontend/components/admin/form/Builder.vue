<template>
  <div v-if="form" class="form-builder">

    <FormSection
      v-for="(section, sectionIndex) in form"
      :key="namespace + sectionIndex"
      :section="section"
      :namespace="namespace"
      @updateValue="updateValue" />

    <div class="toolbar">
      <button
        class="submit-button"
        @click="submitForm">
        <SpinnerMaterialCircle v-if="loading" class="spinner" />
        <span v-if="!loading">Submit</span>
      </button>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import { mapGetters } from 'vuex'
import CloneDeep from 'lodash/cloneDeep'

import SpinnerMaterialCircle from '@/components/Shared/Spinner_MaterialCircle'
import FormSection from '@/components/admin/form/FormSection'

// =================================================================== Functions
// /////////////////////////////////////////////////////////////////////// match
const match = (fields) => {
  for (const field of fields) {
    const type = field.type
    const fields = field.fields
    if (type === 'group' && fields && fields.length > 0) {
      match(fields)
    } else {
      field.originalValue = field.value
      field.state = 'valid'
      field.validation = false
    }
  }
  return fields
}

// /////////////////////////////////////////////////////////////////////// strip
const strip = (fields) => {
  for (const field of fields) {
    const type = field.type
    const fields = field.fields
    if (type === 'group' && fields && fields.length > 0) {
      strip(fields)
    } else {
      delete field.originalValue
      delete field.state
      delete field.validation
    }
  }
  return fields
}

// //////////////////////////////////////////////////////////////// replaceField
const replaceField = (field, fields) => {
  const loop = (fields, len) => {
    for (let i = 0; i < len; i++) {
      const loopField = fields[i]
      const type = loopField.type
      const subfields = loopField.fields
      if (type === 'group' && subfields && subfields.length > 0) {
        loop(subfields, subfields.length)
      } else {
        if (loopField.id === field.id) {
          fields.splice(i, 1, field)
        }
      }
    }
  }
  const len = fields.length
  if (len > 0) { loop(fields, len) }
}

// /////////////////////////////////////////////////////////////// checkRequired
const checkRequired = (value) => {
  const type = typeof value
  let state = 'valid'
  if (type === 'string' || type === 'boolean') {
    if (value === '' || !value) { state = 'error' }
  } else if (Array.isArray(value)) {
    if (value.length === 0) { state = 'error' }
  }
  return { state, validation: 'required' }
}

// //////////////////////////////////////////////////////////////// checkPattern
const checkPattern = (value, pattern) => {
  const regex = new RegExp(pattern)
  let state = 'valid'
  if (value !== '' && !regex.test(value)) { state = 'error' }
  return { state, validation: 'pattern' }
}

// ////////////////////////////////////////////////////////////////// checkChars
const checkChars = (fieldType, value, chars) => {
  const min = chars.min
  const max = chars.max
  const len = fieldType === 'wysiwyg' ? value.replace(/(<([^>]+)>)/gi, '').length : value.length
  let state = 'valid'
  if (typeof value === 'string' && value.trim() !== '' && (len < min || len > max)) {
    state = 'error'
  }
  return { state, validation: 'chars' }
}

// /////////////////////////////////////////////// validateFields & validateLoop
const validateFields = (fields, next) => {
  const len = fields.length
  let state = true
  const loop = (fields, len) => {
    for (let i = 0; i < len; i++) {
      const field = fields[i]
      const type = field.type
      const subfields = field.fields
      let check = { state: 'valid' }
      if (type === 'group' && subfields && subfields.length > 0) {
        loop(subfields, subfields.length)
      } else {
        const required = field.required
        const pattern = field.pattern
        const chars = field.chars
        if (required) { check = checkRequired(field.value) }
        if (check.state === 'valid' && chars) { check = checkChars(field.type, field.value, chars) }
        if (check.state === 'valid' && pattern) { check = checkPattern(field.value, pattern) }
        if (check.state !== 'valid') {
          state = false
          field.state = check.state
          field.validation = check.validation
        }
      }
    }
  }
  if (len > 0) { loop(fields, len) }
  if (next) { return next(state, fields) }
}

// ====================================================================== Export
export default {
  name: 'FormBuilder',

  components: {
    SpinnerMaterialCircle,
    FormSection
  },

  props: {
    fields: {
      type: Array,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    namespace: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      state: 'valid',
      form: false
    }
  },

  computed: {
    ...mapGetters({
      loading: 'admin/loading'
    }),
    stateText () {
      const state = this.state
      if (state === 'error') { return 'validation errors present' }
      if (state === 'caution') { return 'fields have been modified' }
      return 'everything looks great'
    },
    valid () {
      return this.state === 'valid'
    },
    submitButtonDisabled () {
      return this.state === 'error'
    }
  },

  watch: {
    fields (newVal) {
      this.form = match(CloneDeep(this.fields))
    }
  },

  created () {
    this.form = match(CloneDeep(this.fields))
  },

  methods: {
    // ...mapActions({
    //   removeLoader: 'core/removeLoader'
    // }),
    updateValue (field) {
      if (this.state !== 'valid') { this.state = 'valid' }
      replaceField(field, this.form)
    },
    submitForm () {
      validateFields(this.form, (valid, fields) => {
        if (valid) {
          this.state = 'valid'
          this.$emit('submitForm', {
            slug: this.slug,
            form: strip(fields)
          })
        } else {
          // this.removeLoader(this.submitAction)
          this.state = 'error'
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.toolbar {
  padding: 2rem;
  border-top: 1px solid $whisper;
}

.submit-button {
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 124px;
  font-weight: 700;
  color: $electricViolet;
  text-transform: uppercase;
  border: 1px solid $whisper;
  border-radius: 0.25rem;
  &:not(.selected) {
    &:hover {
      text-decoration: underline;
    }
  }
  &.selected {
    color: white;
    background-color: $electricViolet;
    border-color: $electricViolet;
    cursor: default;
  }
}
</style>
