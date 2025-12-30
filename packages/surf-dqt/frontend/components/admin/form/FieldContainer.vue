<template>
  <div :class="['field-container', type, key, { row, reverse }]">

    <label v-if="label" :for="clickable()" class="field-label">
      <span class="label-text" v-html="label"></span>
      <span v-if="required && !forceDisableFields" class="required-indicator">*</span>
    </label>

    <label v-if="sublabel" class="field-sublabel" v-html="sublabel" />

    <div v-if="validateMessage" class="field-validate-message">
      {{ validateMessage }}
    </div>

    <FieldInput
      v-if="type === 'text'"
      :value="value"
      :state="state"
      :placeholder="placeholder"
      :disabled="disabled"
      :pre="pre"
      :chars="chars"
      :icon="icon"
      :namespace="namespace"
      @updateValue="updateValue" />

    <FieldImage
      v-if="type === 'image'"
      :section-id="sectionId"
      :value="value"
      :state="state"
      :description="description"
      :disabled="disabled"
      :namespace="namespace"
      @updateValue="updateValue" />

    <FieldTextarea
      v-if="type === 'textarea'"
      :placeholder="placeholder"
      :value="value"
      :disabled="disabled"
      :state="state"
      :pre="pre"
      :chars="chars"
      :namespace="namespace"
      @updateValue="updateValue" />

    <FieldWysiwyg
      v-if="type === 'wysiwyg'"
      :placeholder="placeholder"
      :value="value"
      :disabled="disabled"
      :state="state"
      :pre="pre"
      :chars="chars"
      :namespace="namespace"
      @updateValue="updateValue" />

    <FieldDropdown
      v-if="type === 'dropdown'"
      :placeholder="placeholder"
      :value="value"
      :state="state"
      :disabled="disabled"
      :options-key="optionsKey"
      :options="options"
      :namespace="namespace"
      @updateValue="updateValue" />

    <!-- <FieldInputPredictive
      v-if="type === 'input-predictive'"
      :value="value"
      :state="state"
      :placeholder="placeholder"
      :disabled="disabled"
      :options-key="optionsKey"
      :options="options"
      :pre="pre"
      @updateValue="updateValue" /> -->

    <!-- <FieldInputMulti
      v-if="type === 'input-multi'"
      :value="value"
      :state="state"
      :placeholder="placeholder"
      :disabled="disabled"
      :pre="pre"
      :chars="chars"
      @updateValue="updateValue" /> -->

    <!-- <FieldInputMultiRow
      v-if="type === 'input-multi-row'"
      :value="value"
      :template="template"
      :state="state"
      :disabled="disabled"
      :validation="validation"
      :pre="pre"
      :chars="chars"
      @updateValue="updateValue" /> -->

    <!-- <FieldCheckbox
      v-if="type === 'checkbox'"
      :type="type"
      :value="value"
      :state="state"
      :model-key="key"
      :disabled="disabled"
      @updateValue="updateValue" /> -->

    <!-- <FieldCheckboxMulti
      v-if="type === 'checkbox-multi'"
      :name="key"
      :value="value"
      :state="state"
      :template="template"
      :disabled="disabled"
      @updateValue="updateValue" /> -->

    <!-- <FieldRadio
      v-if="type === 'radio'"
      :type="type"
      :name="key"
      :value="value"
      :highlight="highlight"
      :template="template"
      @updateValue="updateValue" /> -->

    <!-- <FieldRadioMulti
      v-if="type === 'radio-multi'"
      :name="key"
      :value="value"
      :state="state"
      :template="template"
      :disabled="disabled"
      @updateValue="updateValue" /> -->

  </div>
</template>

<script>
// ===================================================================== Imports
import CloneDeep from 'lodash/cloneDeep'

import FieldImage from '@/components/admin/form/FieldImage'
import FieldInput from '@/components/admin/form/FieldInput'
import FieldTextarea from '@/components/admin/form/FieldTextarea'
import FieldWysiwyg from '@/components/admin/form/FieldWysiwyg'

// import FieldDropdown from '@/components/admin/form/FieldDropdown'
// import FieldInputPredictive from '@/components/admin/form/FieldInputPredictive'
// import FieldInputMulti from '@/components/admin/form/FieldInputMulti'
// import FieldInputMultiRow from '@/components/admin/form/FieldInputMultiRow'
// import FieldCheckbox from '@/components/admin/form/FieldCheckbox'
// import FieldCheckboxMulti from '@/components/admin/form/FieldCheckboxMulti'
// import FieldRadio from '@/components/admin/form/FieldRadio'
// import FieldRadioMulti from '@/components/admin/form/FieldRadioMulti'

// ====================================================================== Export
export default {
  name: 'FieldContainer',

  components: {
    FieldImage,
    FieldInput,
    FieldTextarea,
    FieldWysiwyg
    // FieldDropdown,
    // FieldInputPredictive,
    // FieldInputMulti,
    // FieldInputMultiRow,
    // FieldCheckbox,
    // FieldCheckboxMulti,
    // FieldRadio,
    // FieldRadioMulti
  },

  props: {
    field: {
      type: Object,
      required: true
    },
    forceDisableFields: {
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
    type () {
      return this.field.type
    },
    key () {
      return this.field.key
    },
    sectionId () {
      return this.field.id
    },
    value () {
      return this.field.value || ''
    },
    label () {
      return this.field.label
    },
    sublabel () {
      return this.field.sub_label
    },
    row () {
      const type = this.type
      let row = false
      switch (type) {
        case 'checkbox': row = true; break
      }
      return row
    },
    reverse () {
      const type = this.type
      let reverse = false
      switch (type) {
        case 'checkbox': reverse = true; break
      }
      return reverse
    },
    placeholder () {
      return this.field.placeholder
    },
    description () {
      return this.field.description
    },
    originalValue () {
      return this.field.originalValue
    },
    required () {
      return this.field.required
    },
    repeatable () {
      return this.field.repeatable
    },
    disabled () {
      const force = this.forceDisableFields
      if (force) { return force }
      return this.field.disabled
    },
    optionsKey () {
      return this.field.options_key
    },
    options () {
      return this.field.options
    },
    template () {
      return this.field.template
    },
    pre () {
      return this.field.pre
    },
    icon () {
      return this.field.icon
    },
    chars () {
      const field = this.field
      const chars = field.chars
      if (chars) {
        const value = this.value
        const max = chars.max
        if (typeof value === 'string') {
          const len = field.type === 'wysiwyg' ? value.replace(/(<([^>]+)>)/gi, '').length : value.length
          if (len > max) { return len }
          return false
        } else if (Array.isArray(value)) {
          return chars
        }
        return false
      }
      return false
    },
    validate () {
      return this.field.validate
    },
    validation () {
      return this.field.validation
    },
    validateMessage () {
      const message = this.field.validate_message
      const validation = this.validation
      if (message && validation && typeof message === 'object') {
        return message[validation]
      }
      return false
    },
    state () { // 'valid', 'caution' or 'error'
      return this.field.state
    }
  },

  methods: {
    updateValue (value) {
      const field = CloneDeep(this.field)
      field.value = value
      field.state = 'valid'
      field.validation = false
      this.$emit('updateValue', field)
    },
    clickable () {
      return this.type === 'checkbox' ? `checkbox-${this.key}` : false
    }
  }
}
</script>

<style lang="scss" scoped>
$error: red;
$caution: darkorange;
$success: green;
$valid: #CCCCCC;
$focusBorderColor: $electricViolet; // black;
$disabledBackgroundColor: #EEEEEE;

@if variable-exists(formStateError) { $error: $formStateError; }
@if variable-exists(formStateCaution) { $caution: $formStateCaution; }
@if variable-exists(formStateSuccess) { $success: $formStateSuccess; }
@if variable-exists(formStateValid) { $success: $formStateValid; }
@if variable-exists(formBorderColorFocus) { $focusBorderColor: $formBorderColorFocus; }
@if variable-exists(formDisabledBackgroundColor) { $disabledBackgroundColor: $formDisabledBackgroundColor; }

// ///////////////////////////////////////////////////////////////////// General
.field-container {
  &.row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
  &.reverse {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
  &.checkbox {
    position: relative;
    margin-top: 3rem;
    .field-validate-message {
      position: absolute;
      bottom: calc(100% - 0.75rem);
      left: 0;
    }
    .field-label {
      font-weight: 400;
    }
    .field-checkbox {
      margin-top: 0.375rem;
    }
  }
}

.field-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.75rem;
  &[for] {
    cursor: pointer;
  }
}

::v-deep .label-text {
  a {
    &:focus {
      @include focusBoxShadowLink;
    }
  }
}

::v-deep .field-sublabel {
  display: block;
  font-size: 0.75rem;
  opacity: 0.75;
  font-style: italic;
  margin-top: -0.75rem;
  margin-bottom: 0.75rem;
  ul {
    padding-left: 1rem;
    margin-top: 0.5rem;
    li {
      font-size: inherit;
    }
  }
}

.required-indicator {
  font-size: 1rem;
  color: red;
}

::v-deep {
  a {
    color: blue;
    &:hover {
      text-decoration: underline;
    }
  }
}

.field-validate-message {
  font-size: 0.75rem;
  font-weight: 500;
  color: $error;
  margin-bottom: 0.5rem;
}

::v-deep .border {
  border: 2px solid $whisper;
  border-radius: 0.25rem;
  overflow: hidden;
  transition: border-color 250ms, box-shadow 250ms;
  &:hover {
    border-color: $coldPurple;
  }
  &:focus,
  &.focused {
    border-color: $focusBorderColor;
  }
  &.circle {
    border-radius: 50%;
  }
  &.validation {
    &:not(.error) {
      &:focus {
        border-color: $focusBorderColor;
      }
    }
    &.error {
      border-color: $error;
    }
    &.caution {
      border-color: $caution;
    }
  }
  &.disabled {
    background-color: $disabledBackgroundColor;
    cursor: no-drop;
    overflow-y: hidden;
    overflow-x: scroll;
  }
}

// ////////////////////////////////////////////////////////////////////// Inputs
::v-deep .input-container,
::v-deep .textarea-container {
  position: relative;
  overflow: hidden;
}

::v-deep .input-container {
  .char-validation {
    top: 2px;
    right: 2px;
    height: calc(100% - 4px);
    padding: 0 0.5rem;
    border-left: 2px solid $valid;
    border-radius: 0 0.25rem 0.25rem 0;
  }
}

::v-deep .input {
  &.disabled {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}

::v-deep .textarea-container,
::v-deep .wysiwyg-container {
  .char-validation {
    justify-content: center;
    bottom: 2px;
    right: 0.5rem;
    height: 2rem;
    padding: 0.5rem;
    border: 2px solid $valid;
    border-bottom: 0;
    border-radius: 0.25rem 0.25rem 0 0;
  }
}

::v-deep .wysiwyg-container {
  .char-validation {
    bottom: 0;
  }
}

::v-deep .char-validation {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  color: $error;
  background-color: white;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
