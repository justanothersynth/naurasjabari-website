<template>
  <button class="raised-button">
    <div class="front">
      <slot />
    </div>
  </button>
</template>

<style scoped lang="scss">
.raised-button {
  text-wrap: nowrap;
  font-weight: 600;
  background-color: #C4C4C4;
  border-radius: toRem(6);
  border: none;
  padding: 0;
  cursor: pointer;
  transform: translateY(4px);
  transition: 50ms ease-out;
  &:focus:not(:focus-visible) {
    outline: none;
  }
  &:hover,
  &.active {
    transition: 50ms ease-in;
    transform: translateY(2px);
    .front {
      transition: 50ms ease-in;
      transform: translateY(-1px);
    }
  }
  .front {
    display: block;
    padding: toRem(6) toRem(16);
    border-radius: inherit;
    font-size: toRem(12);
    background-color: #EEEEEE;
    border: 1px solid #C4C4C4;
    transform: translateY(-4px);
    transition: 50ms ease-out;
  }
}
</style>
