<template>
  <div class="field-textarea">

    <div v-if="disabled" :class="['textarea border validation', { disabled }]">
      {{ value }}
    </div>

    <div v-else class="textarea-container">
      <textarea
        :class="['textarea border validation', state]"
        :placeholder="placeholder"
        :value="value"
        @input="$emit('updateValue', $event.target.value)"></textarea>
      <div v-if="typeof chars === 'number'" class="char-validation">
        {{ chars }}
      </div>
    </div>

  </div>
</template>

<script>
// =================================================================== Functions
const preValidate = (instance, value, pre) => {
  if (typeof pre !== 'string') { return }
  const regex = new RegExp(pre)
  if (regex.test(value)) { // value contains restricted characters
    const stripped = value.replace(regex, '')
    instance.$emit('updateValue', stripped)
  }
}

// ====================================================================== Export
export default {
  name: 'FieldTextarea',

  props: {
    placeholder: {
      type: String,
      required: false,
      default: 'Enter a value'
    },
    value: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pre: {
      type: [String, Boolean],
      required: false,
      default: false
    },
    chars: {
      type: [Number, Boolean],
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  watch: {
    value (value) {
      preValidate(this, value, this.pre)
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.textarea {
  display: block;
  width: 100%;
  min-height: 10rem;
  padding: 0.5rem 0.875rem;
}
</style>
