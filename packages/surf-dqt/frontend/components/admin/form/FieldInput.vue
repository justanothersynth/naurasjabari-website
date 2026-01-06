<template>
  <div class="field-input">

    <div v-if="disabled" :class="['input border validation', { disabled }]">
      {{ value }}
    </div>

    <div v-else :class="['input-container', { 'icon-before': icon && icon.before }]">
      <div v-if="icon && icon.before" class="icon before">
        {{ icon.before }}
      </div>
      <input
        type="text"
        :class="['input border validation', state]"
        :placeholder="placeholder"
        :value="value"
        @input="$emit('updateValue', $event.target.value)" />
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
  name: 'FieldInput',

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
    icon: {
      type: Object,
      required: false,
      default: () => {}
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
$valid: #CCCCCC;

// ///////////////////////////////////////////////////////////////////// General
.input-container {
  display: flex;
  &.icon-before {
    .input {
      padding-left: calc(2.5rem + 0.875rem);
      padding-right: 0.875rem;
    }
  }
}

.input {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.875rem;
  background-color: white;
}

.icon {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 2px;
  width: 2.5rem;
  height: calc(2.5rem - 4px);
  border-color: $valid;
  background-color: white;
  font-weight: 500;
  &.before {
    left: 2px;
    border-right-width: 2px;
    border-right-style: solid;
    border-radius: 0.25rem 0 0 0.25rem;
  }
}
</style>
