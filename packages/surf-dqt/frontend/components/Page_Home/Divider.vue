<template>
  <div class="divider">

    <h1 class="client-label">
      {{ label }}
    </h1>

    <div class="text">
      {{ text }}
    </div>

  </div>
</template>

<script>
// ====================================================================== Export
export default {
  name: 'Divider',

  props: {
    label: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.divider {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid $borderColor;
  padding: 2rem;
  @include small {
    display: none;
  }
}

.client-label {
  font-size: 1rem;
}

.text {
  width: 25rem;
  text-align: right;
}
</style>
