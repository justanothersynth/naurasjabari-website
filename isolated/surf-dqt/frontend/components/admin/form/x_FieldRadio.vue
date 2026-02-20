<template>
  <div :class="['field-radio', typeof highlight === 'string' ? highlight : '']">

    <div
      v-for="(button, index) in template"
      :key="button.key"
      :class="['radio-container', { disabled: button.disabled }]"
      :data-tooltip="button.tooltip"
      data-tooltip-theme="dark">
      <div class="input-container">
        <component
          :is="button.disabled ? 'button' : 'input'"
          :id="`${componentId}-radio-${button.key}`"
          type="radio"
          :name="`${componentId}-${name}`"
          :value="value"
          :checked="checked(button.key)"
          :disabled="button.disabled"
          class="radio-button"
          @input="$emit('updateValue', button.key)">
        </component>
        <div class="checker"></div>
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
  name: 'FieldRadio',

  props: {
    type: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    highlight: {
      type: [Boolean, String],
      required: false,
      default: false
    },
    template: {
      type: Array,
      required: true
    }
  },

  data () {
    const self = this
    return {
      componentId: self.$uuid.v4()
    }
  },

  methods: {
    checked (key) {
      return key === this.value
    }
  }
}
</script>

<style lang="scss" scoped>
$dimension: 1.25rem;
$error: red;
$caution: darkorange;
$borderColor: #CCCCCC;
$focusBorderColor: black;
$disabledBackgroundColor: #EEEEEE;

@if variable-exists(formErrorHighlight) { $error: $formErrorHighlight; }
@if variable-exists(formCautionHighlight) { $caution: $formCautionHighlight; }
@if variable-exists(formBorderColor) { $borderColor: $formBorderColor; }
@if variable-exists(formFocusBorderColor) { $focusBorderColor: $formFocusBorderColor; }
@if variable-exists(formDisabledBackgroundColor) { $disabledBackgroundColor: $formDisabledBackgroundColor; }

@keyframes shrink-bounce {
  0% { transform: scale(1); }
  33% { transform: scale(0.85); }
  100% { transform: scale(1); }
}

// ///////////////////////////////////////////////////////////////////// General
.field-radio {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.radio-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  &:not(:last-child) {
    margin-right: 1rem;
  }
  &.disabled {
    .radio-button,
    .label {
      opacity: 0.5;
      cursor: no-drop;
    }
  }
}

.input-container {
  position: relative;
  width: $dimension;
  height: $dimension;
}

.radio-button {
  width: $dimension;
  height: $dimension;
  opacity: 0;
  z-index: 10;
  cursor: pointer;
  &:checked {
    background: red;
    + .checker {
      border-color: $focusBorderColor;
      background-color: $focusBorderColor;
      &:before {
        animation: shrink-bounce 200ms cubic-bezier(0.4, 0, 0.23, 1);
      }
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
  border-radius: 0.25rem;
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
