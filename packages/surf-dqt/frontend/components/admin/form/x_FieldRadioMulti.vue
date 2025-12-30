<template>
  <div class="field-radio-multi">

    <div
      v-for="(button, key) in template"
      :key="key"
      :class="['radio-container', { disabled: disabled || button.disabled }]"
      :data-tooltip="button.tooltip"
      data-tooltip-theme="dark">
      <div class="input-container overflow-visible">
        <component
          :is="(disabled || button.disabled) ? 'button' : 'input'"
          :id="`${componentId}-radio-${button.key}`"
          type="radio"
          :name="`${componentId}-${name}`"
          :checked="checked(button.key)"
          :disabled="disabled || button.disabled"
          :class="['radio', { checked: checked(button.key) }]"
          @input="selectRadio(button.key, button.disabled)">
        </component>
        <div :class="['checker border circle validation', state]"></div>
      </div>
      <label
        :for="`${componentId}-radio-${button.key}`"
        class="label">
        {{ button.label }}
      </label>
    </div>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'FieldRadioMulti',

  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: [Array, String],
      required: false,
      default: () => []
    },
    state: {
      type: String,
      required: true
    },
    template: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    const self = this
    return {
      componentId: self.$uuid.v4()
    }
  },

  mounted () {
    const value = this.value
    if (Array.isArray(value)) {
      if (value.length > 1) {
        this.$emit('updateValue', [])
      }
    }
  },

  methods: {
    checked (key) {
      const value = this.value
      if (typeof value === 'string') {
        return value === key
      } else if (Array.isArray(value)) {
        return value.includes(key)
      }
    },
    selectRadio (key, buttonDisabled) {
      if (!this.disabled && !buttonDisabled) {
        const value = this.value
        let updated = value
        if (typeof value === 'string') {
          updated = key
        } else if (Array.isArray(value)) {
          updated = [key]
        }
        this.$emit('updateValue', updated)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$dimension: 1.25rem;

$borderColor: #CCCCCC;
$focusBorderColor: black;

@if variable-exists(formBorderColor) { $borderColor: $formBorderColor; }
@if variable-exists(formBorderColorFocus) { $focusBorderColor: $formBorderColorFocus; }

@keyframes shrink-bounce {
  0% { transform: scale(1); }
  33% { transform: scale(0.85); }
  100% { transform: scale(1); }
}

// ///////////////////////////////////////////////////////////////////// General
.field-radio-multi {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.radio-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 50%;
  margin-bottom: 1rem;
  padding-right: 2rem;
  &.disabled {
    .label {
      opacity: 0.25;
      cursor: no-drop;
    }
    .input-container:before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: white;
      opacity: 0.66;
      display: inline-block;
      visibility: visible;
      z-index: 10;
    }
  }
}

.input-container {
  position: relative;
  width: $dimension;
  height: $dimension;
  overflow: visible !important;
}

.radio {
  position: relative;
  width: $dimension;
  height: $dimension;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
  &:checked,
  &.checked {
    + .checker {
      animation: shrink-bounce 200ms cubic-bezier(0.4, 0, 0.23, 1);
      border-color: $focusBorderColor;
      background-color: $focusBorderColor;
    }
  }
  &:focus {
    + .checker {
      @include focusBoxShadowSmall;
    }
  }
}

.checker {
  position: absolute;
  top: 0;
  left: 0;
  width: $dimension;
  height: $dimension;
  border: 2px solid $borderColor;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
  transition: border-color 250ms, background-color 250ms;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 0.5rem;
    height: 0.5rem;
    background-color: white;
    border-radius: 50%;
    transform: scale(0.85);
  }
}

.label {
  cursor: pointer;
  padding-left: 0.5rem;
}
</style>
