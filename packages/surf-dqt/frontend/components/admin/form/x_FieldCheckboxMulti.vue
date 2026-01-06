<template>
  <div class="field-checkbox-multi">

    <div
      v-for="(button, key) in template"
      :key="key"
      :class="['checkbox-container', { disabled: disabled || button.disabled }]"
      :data-tooltip="button.tooltip"
      data-tooltip-theme="dark">
      <div class="input-container">
        <component
          :is="(disabled || button.disabled) ? 'button' : 'input'"
          :id="`${componentId}-checkbox-${button.key}`"
          type="checkbox"
          :checked="checked(button.key)"
          :disabled="disabled || button.disabled"
          class="checkbox"
          @input="selectCheckbox(button.key)">
        </component>
        <div :class="['checker border validation', state]"></div>
      </div>
      <label
        :for="`${componentId}-checkbox-${button.key}`"
        class="label">
        {{ button.label }}
      </label>
    </div>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'FieldCheckboxMulti',

  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: Array,
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

  methods: {
    checked (key) {
      return this.value.includes(key)
    },
    selectCheckbox (key) {
      const arr = this.value.slice()
      const index = arr.findIndex(obj => obj === key)
      if (index !== -1) {
        arr.splice(index, 1)
      } else {
        arr.push(key)
      }
      this.$emit('updateValue', arr)
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

@keyframes checkbox-check {
  0% {
    width: 0;
    height: 0;
    border-color: white;
    transform: translate3d(0, 0, 0) rotate(45deg);
  }
  33% {
    width: 4px;
    height: 0;
    transform: translate3d(0, 0, 0) rotate(45deg);
  }
  100% {
    width: 4px;
    height: 10px;
    border-color: white;
    transform: translate3d(0, -10px, 0) rotate(45deg);
  }
}

// ///////////////////////////////////////////////////////////////////// General
.field-checkbox-multi {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.checkbox-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 50%;
  margin-bottom: 1rem;
  padding-right: 2rem;
  &.disabled {
    .checkbox,
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

.checkbox {
  position: relative;
  width: $dimension;
  height: $dimension;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
  &:checked {
    + .checker {
      animation: shrink-bounce 200ms cubic-bezier(0.4, 0, 0.23, 1);
      border-color: $focusBorderColor;
      background-color: $focusBorderColor;
      &:before {
        animation: checkbox-check 125ms 250ms cubic-bezier(0.4, 0, 0.23, 1) forwards;
      }
    }
  }
  &:focus {
    + .checker {
      @include focusBoxShadow;
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
  pointer-events: none;
  z-index: 5;
  transition: border-color 250ms, background-color 250ms;
  &:before {
    content: '';
    position: absolute;
    top: 7px;
    left: 2px;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
    transform: rotate(45deg);
    transform-origin: 0% 100%;
  }
}

.label {
  flex: 1;
  padding-left: 1rem;
  cursor: pointer;
}
</style>
