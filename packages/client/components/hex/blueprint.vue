<template>
  <div class="blueprint-data">

    <div class="vertex-numbers">
      <div
        v-for="(vertexNumber) in vertexNumbers"
        :key="'vertex-' + vertexNumber"
        class="vertex-number">
        <span>{{ vertexNumber }}</span>
      </div>
    </div>

    <div class="side-numbers">
      <div
        v-for="(sideNumber) in sideNumbers"
        :key="'side-' + sideNumber"
        class="side-number">
        <span>{{ sideNumber }}</span>
      </div>
    </div>

    <div class="hex-name">
      {{ name }}
    </div>

  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
}>()

const sideNumbers = ref<number[]>([4, 5, 6, 1, 2, 3])
const vertexNumbers = ref<number[]>([1, 2, 3, 4, 5, 6])
</script>

<style lang="scss" scoped>
.blueprint-data {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hex-name {
  position: absolute;
  bottom: 33%;
  left: 0;
  width: 100%;
  color: var(--color-dark);
  font-family: var(--font-mono);
  font-size: toRem(12);
  font-weight: 500;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 0 toRem(32);
  background-color: var(--color-light);
  border-radius: 0.25rem;
  white-space: nowrap;
}

.vertex-number,
.side-number {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  color: var(--color-dark);
  font-family: var(--font-mono);
  span {
    display: inline-block;
  }
}

.vertex-number {
  font-size: toRem(12);
  &:nth-child(1) {
    transform: translate(-50%, -50%) rotate(31deg);
    span {
      transform: rotate(-31deg);
    }
  }
  &:nth-child(2) {
    transform: translate(-50%, -50%) rotate(89deg);
    span {
      transform: rotate(-89deg);
    }
  }
  &:nth-child(3) {
    transform: translate(-50%, -50%) rotate(149deg);
    span {
      transform: rotate(-149deg);
    }
  }
  &:nth-child(4) {
    transform: translate(-50%, -50%) rotate(210deg);
    span {
      transform: rotate(-210deg);
    }
  }
  &:nth-child(5) {
    transform: translate(-50%, -50%) rotate(269deg);
    span {
      transform: rotate(-269deg);
    }
  }
  &:nth-child(6) {
    transform: translate(-50%, -50%) rotate(329deg);
    span {
      transform: rotate(-329deg);
    }
  }
}

.side-number {
  font-size: toRem(14);
  font-weight: bold;
  padding: 0 toRem(16);
  &:nth-child(1) { transform: translate(-50%, -50%) rotate(0deg); }
  &:nth-child(2) { transform: translate(-50%, -50%) rotate(60deg);
    span {
      transform: rotate(-60deg);
    }
  }
  &:nth-child(3) { transform: translate(-50%, -50%) rotate(120deg);
    span {
      transform: rotate(-120deg);
    }
  }
  &:nth-child(4) { transform: translate(-50%, -50%) rotate(180deg);
    span {
      transform: rotate(-180deg);
    }
  }
  &:nth-child(5) { transform: translate(-50%, -50%) rotate(240deg);
    span {
      transform: rotate(-240deg);
    }
  }
  &:nth-child(6) { transform: translate(-50%, -50%) rotate(300deg);
    span {
      transform: rotate(-300deg);
    }
  }
}
</style>
