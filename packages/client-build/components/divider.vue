<template>
  <div class="divider flex items-center gap-4 mt-20 before:bg-gray-300 after:bg-gray-300">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.divider {
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
  }
}
</style>
