<template>

  <div class="spinner"></div>

</template>

<script>
// ====================================================================== Export
export default {
  name: 'Spinner'
}
</script>

<style lang="scss" scoped>
@keyframes spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// ///////////////////////////////////////////////////////////////////// General
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(to right, white 10%, rgba(255, 255, 255, 0) 42%);
  position: relative;
  animation: spinner 0.6s infinite linear;
  transform: translateZ(0);
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
  }
  &:before {
    width: 50%;
    height: 50%;
    border-radius: 100% 0 0 0;
  }
  &:after {
    background-color: $mineShaft;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    margin: auto;
    bottom: 0;
    right: 0;
    transition: background-color 150ms ease-in;
  }
}
</style>
