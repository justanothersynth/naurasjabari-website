<template>
  <div class="divider flex items-center gap-4 mt-20">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.divider {
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1.25rem;
    background-color: var(--color-highlighter);
  }
}
</style>
