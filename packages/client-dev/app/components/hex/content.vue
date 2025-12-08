<template>
  <div class="hex-content">

    <div class="inner-content">
      <div class="grid container mx-auto px-4 max-w-content">
        <slot />
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
.content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
}
</style>
