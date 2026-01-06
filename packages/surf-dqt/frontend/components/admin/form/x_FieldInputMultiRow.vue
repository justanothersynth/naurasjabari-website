<template>
  <div class="field-input-multi-row">

    <div v-if="rows" class="rows">
      <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="row">

        <div
          v-for="(rowValue, key) in row"
          :key="`${rowIndex}-${key}`"
          class="input-container">
          <input
            type="text"
            :class="['input border validation', validation && template[key][validation] ? state : '']"
            :placeholder="template[key].placeholder"
            :value="rowValue"
            @input="updateValue(rowIndex, key, $event.target.value)" />
          <div v-if="typeof chars === 'number'" class="char-validation">
            {{ chars }}
          </div>
        </div>

        <Button
          type="C"
          text="Remove"
          @clicked="removeEntry(rowIndex)" />

      </div>
    </div>

    <Button
      type="C"
      text="Add Entry"
      @clicked="addEntry" />

  </div>
</template>

<script>
// ===================================================================== Imports
import Button from '@/modules/Core/Components/Button'

// =================================================================== Functions
const preValidate = (instance, value, pre) => {
  if (typeof pre !== 'string') { return }
  const incoming = value.slice()
  const regex = new RegExp(pre)
  const len = value.length
  let failed = false
  if (len > 0) {
    for (let i = 0; i < len; i++) {
      const entry = incoming[i]
      Object.keys(incoming[i]).forEach((key) => {
        const item = entry[key]
        if (regex.test(item)) { // value contains restricted characters
          if (!failed) { failed = true }
          entry[key] = item.replace(regex, '')
        }
      })
    }
  }
  if (failed) {
    instance.$emit('updateValue', incoming)
  }
}

// ====================================================================== Export
export default {
  name: 'FieldInputMultiRow',

  components: {
    Button
  },

  props: {
    template: {
      type: Object,
      required: true
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
      type: [Number, Boolean],
      required: false,
      default: false
    },
    validation: {
      type: [String, Boolean],
      required: false,
      default: false
    }
  },

  computed: {
    rows () {
      const value = this.value
      if (value.length > 0) { return value }
      return false
    }
  },

  watch: {
    value (value) {
      preValidate(this, value, this.pre)
    }
  },

  methods: {
    addEntry () {
      const arr = this.value.slice()
      const template = this.template
      const entry = {}
      Object.keys(template).forEach((key) => {
        entry[key] = ''
      })
      arr.push(entry)
      this.$emit('updateValue', arr)
    },
    removeEntry (rowIndex) {
      const arr = this.rows.slice()
      arr.splice(rowIndex, 1)
      this.$emit('updateValue', arr)
    },
    updateValue (rowIndex, key, value) {
      const arr = this.rows.slice()
      arr[rowIndex][key] = value
      this.$emit('updateValue', arr)
    }
  }
}
</script>

<style lang="scss" scoped>
$height: 2.5rem;

// //////////////////////////////////////////////////////////////////////// Rows
.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1rem;
}

.input-container {
  flex: 1;
  &:not(:last-child) {
    margin-right: 1rem;
  }
}

.input {
  width: 100%;
  height: 2.5rem;
  padding: 0 0.875rem;
  transition: border-color 250ms;
}
</style>
