<template>
  <div class="field-input-multi">

    <div class="controls">

      <div class="input-container">
        <div v-if="disabled" :class="['input border validation', { disabled }]">
          {{ placeholder }}
        </div>
        <input
          v-else
          v-model="input"
          type="text"
          :placeholder="placeholder"
          :class="['input border validation', state]"
          @keyup="handleEnterKey" />
        <div v-if="typeof charValidation === 'number'" class="char-validation">
          {{ charValidation }}
        </div>
      </div>

      <Button
        type="C"
        text="Add"
        :disabled="disabled || input === '' || typeof charValidation !== 'boolean'"
        @clicked="handleClick('add')" />

    </div>

    <div v-if="items" class="items">
      <Button
        v-for="(item, index) in items"
        :key="index"
        type="D"
        class="item"
        :text="item"
        :disabled="disabled"
        @clicked="handleClick('remove', item)">
        <IconCloseThick fill="#0D90FF" />
      </Button>
    </div>

  </div>
</template>

<script>
// ===================================================================== Imports
import Button from '@/modules/Core/Components/Button'

import IconCloseThick from '@/modules/Core/Components/Icons/CloseThick'

// =================================================================== Functions
const preValidate = (instance, input, pre, next) => {
  if (typeof pre === 'string') {
    const regex = new RegExp(pre)
    if (regex.test(input)) { // value contains restricted characters
      const stripped = input.replace(regex, '')
      instance.input = stripped
      if (next) { return next(stripped) }
    }
  }
  if (next) { return next(input) }
}

const addItem = (instance, input) => {
  const arr = instance.value.slice()
  const value = input.trim()
  if (value === '') {
    instance.$Toaster.addToast({
      type: 'toast',
      category: 'caution',
      message: 'Value cannot be blank'
    })
  } else if (!arr.includes(value)) {
    arr.push(value)
    instance.$emit('updateValue', arr)
    instance.input = ''
  } else {
    instance.$Toaster.addToast({
      type: 'toast',
      category: 'caution',
      message: 'This item has already been added'
    })
  }
}

// ====================================================================== Export
export default {
  name: 'FieldInputMulti',

  components: {
    Button,
    IconCloseThick
  },

  props: {
    placeholder: {
      type: String,
      required: false,
      default: 'Enter a value'
    },
    value: {
      type: Array,
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
      type: [Object, Boolean],
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      input: ''
    }
  },

  computed: {
    items () {
      const value = this.value
      return value.length > 0 ? value : false
    },
    charValidation () {
      const chars = this.chars
      if (chars) {
        const max = chars.max
        const len = this.input.length
        if (len > max) { return len }
        return false
      }
      return false
    }
  },

  watch: {
    input (input) {
      preValidate(this, input, this.pre)
    }
  },

  methods: {
    handleClick (action, item) {
      if (!this.disabled) {
        if (action === 'add') {
          addItem(this, this.input)
        } else if (action === 'remove') {
          const arr = this.value.slice()
          const index = arr.indexOf(item)
          if (index !== -1) {
            arr.splice(index, 1)
            this.$emit('updateValue', arr)
          }
        }
      }
    },
    handleEnterKey (e) {
      if (!this.disabled) {
        const key = e.key || e.keyCode
        if (key === 'Enter' || key === 13) {
          addItem(this, this.input)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$error: red;

@if variable-exists(formStateError) { $error: $formStateError; }

// //////////////////////////////////////////////////////////////////// Controls
.controls {
  display: flex;
  flex-direction: row;
}

.input-container {
  flex: 1;
  margin-right: 1rem;
}

.input {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.875rem;
}

// /////////////////////////////////////////////////////////////////////// Items
.items {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

::v-deep .item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  &:not([disabled]):hover {
    color: $error;
    border-color: $error;
    .close-thick-svg-path {
      transition: 250ms;
      fill: $error;
    }
  }
}

::v-deep .close-thick-svg-icon {
  width: 0.5rem;
  margin-left: 0.5rem;
  .close-thick-svg-path {
    transition: 250ms;
  }
}
</style>
