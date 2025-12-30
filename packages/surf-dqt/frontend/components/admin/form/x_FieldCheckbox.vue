<template>
  <div class="field-checkbox">

    <input
      :id="`checkbox-${modelKey}`"
      :checked="value"
      :name="`checkbox-${modelKey}`"
      type="checkbox"
      class="checkbox"
      @input="$emit('updateValue', $event.target.checked)" />

    <div :class="['checker border validation', state]"></div>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'FieldCheckbox',

  props: {
    value: {
      type: Boolean,
      required: true
    },
    modelKey: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
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
.field-checkbox {
  position: relative;
  margin-right: 0.75rem;
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
</style>
