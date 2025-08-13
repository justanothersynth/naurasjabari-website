<template>
  <div class="me">

    <div class="avatar">
      <img class="avatar-img" />
      <div class="spinner inner">
        <span
          v-for="(item, index) in innerRing"
          :key="index"
          :style="{
            transform: `translateX(calc(30px - 2px)) rotateZ(-${360 / innerRing * item}deg)`,
            animationDelay: `${Math.floor(Math.random() * 30)}s`
          }"
          class="peg inner" />
      </div>
      <div class="spinner outer">
        <span
          v-for="(item, index) in outerRing"
          :key="index"
          :style="{
            transform: `translateX(calc(30px - 2px)) rotateZ(-${360 / outerRing * item}deg)`,
            animationDelay: `${Math.floor(Math.random() * 30)}s`
          }"
          class="peg outer" />
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
const innerRing = 50
const outerRing = 45
</script>

<style lang="scss" scoped>
@keyframes innerRingRotate {
  100% { transform: rotate(-360deg); }
}

@keyframes outerRingRotate {
  100% { transform: rotate(360deg); }
}

@keyframes spark1 {
  0% { opacity: 0.5 }
  100% { opacity: 1; transform: scaleY(2) translateY(-25%); background-color: #cba135; }
}

@keyframes spark2 {
  0% { transform: scale(1) translateY(0); }
  100% { transform: scaleY(4) translateY(-50%); background-color: #cba135; }
}

.avatar {
  position: relative;
  width: toRem(60);
  height: toRem(60);
  padding: toRem(1);
  border: 2px solid var(--color-amber-300);
  border-radius: 50%;
}

.avatar-img {
  width: 100%;
  height: 100%;
  background-image: url('/images/nauras-profile.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 50%;
}

.spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
  &.inner {
    animation: innerRingRotate forwards infinite linear 60s;
  }
  &.outer {
    animation: outerRingRotate forwards infinite linear 45s;
  }
}

.peg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: left;
  &:before {
    content: '';
    position: absolute;
    background-color: black;
  }
  &.inner {
    &:before {
      bottom: calc(100% + 4px);
      left: -1.5px;
      width: 1.5px;
      height: 10px;
      opacity: 0.5;
      animation: spark1 forwards infinite linear alternate 10s;
      animation-delay: inherit;
      border-radius: 2px;
    }
  }
  &.outer {
    &:before {
      bottom: calc(100% + 16px);
      left: -1px;
      width: 1px;
      height: 6px;
      opacity: 0.3;
      animation: spark2 forwards infinite linear alternate 10s;
      animation-delay: inherit;
      border-radius: 1px;
    }
  }
}
</style>
