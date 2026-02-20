<template>
  <div class="tile-surf-dqt cover">
    
    <div class="ring-selector-buttons">
      <button
        v-for="(count, index) in ringCount"
        :key="`count-${count}`"
        :class="['ring-selector-button', { selected: index === selectedRingCount - 1 }]"
        @click="setSelectedRingCount(index + 1)">
        {{ count }}
      </button>
    </div>

    <button
      :class="['count', 'max-count-5', { selected: buttonClicked }]"
      @mouseenter="handleHover(true)"
      @mouseleave="handleHover(false)"
      @click="handleClick(true)">

      <span>25</span>
      
      <span v-for="index in selectedRingCount" :key="`ring-${index}`" class="button-ring" />

    </button>

    <div
      :class="['hover-indicator', { visible: buttonHovered }, { clicked: buttonClicked }]">
      {{ getIndicatorText(buttonHovered, buttonClicked) }}
    </div>

    <button
      :class="['reset-button', { 'button-ring-clicked': buttonClicked }]"
      @click="handleClick(false)">
      <Icon name="iconoir:refresh-double" class="reset-button-icon" />
    </button>

  </div>
</template>

<script setup lang="ts">
const ringCount = ref(5)
const selectedRingCount = ref(ringCount.value)

const buttonClicked = ref(false)
const buttonHovered = ref(false)

const getIndicatorText = (isHovered: boolean, isClicked: boolean) => {
  if (isClicked) return 'active'
  if (isHovered) return 'hover'
  return ''
}

const handleHover = (isHovered: boolean) => {
  if (!buttonClicked.value) {
    buttonHovered.value = isHovered
  }
}

const handleClick = (isClicked: boolean) => {
  if (!isClicked) {
    buttonHovered.value = false
  }
  buttonClicked.value = isClicked
}

const setSelectedRingCount = (count: number) => selectedRingCount.value = count
</script>

<style lang="scss" scoped>
$countDimension: 2.5rem;

$internationalKleinBlue: #0030AC;
$hawkesBlue: #a9aff2;
$electricViolet: #7148fa;

.tile-surf-dqt {
  padding-top: toRem(37);
  background-color: var(--color-gray-100);
}

.card-1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &:hover {
    .ring-selector-buttons {
      transition: 250ms ease-in;
      opacity: 1;
    }
  }
}

.count {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  font-family: monospace;
  font-size: toRem(11);
  font-weight: 700;
  width: $countDimension;
  height: $countDimension;
  background-color: $hawkesBlue;
  transition: 250ms ease-out;
  &:hover {
    transition: 250ms ease-in;
    background-color: $electricViolet;
    color: white;
    .button-ring {
      transition: 150ms ease-in;
      border-color: $electricViolet;
      @for $i from 2 through 6 {
        &:nth-child(#{$i}) {
          transition-delay: ($i - 1) * 50ms;
        }
      }
    }
  }
  &.max-count-5 {
    .button-ring {
      &:nth-child(2),
      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5),
      &:nth-child(6) {
        display: block;
      }
    }
  }
  &.selected {
    background-color: $internationalKleinBlue;
    color: white;
    .button-ring {
      transition: 500ms 0ms ease-out !important;
      transform: scale(0);
    }
  }
}

.button-ring {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid $hawkesBlue;
  border-radius: 50%;
  z-index: -1;
  transition: 250ms ease-out;
  @for $i from 2 through 6 {
    &:nth-child(#{$i}) {
      top: calc((#{$countDimension} - (#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)})) / 2);
      left: calc((#{$countDimension} - (#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)})) / 2);
      width: calc(#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)});
      height: calc(#{$countDimension} + #{$countDimension * (($i - 1) * 0.25)});
    }
  }
}

.ring-selector-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: toRem(4);
  font-family: monospace;
  font-size: 10px;
  line-height: 1;
  transition: 250ms ease-out;
}

.ring-selector-button {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  opacity: 0.5;
  transition: 150ms ease-out;
  &:hover:not(.selected) {
    transition: 150ms ease-in;
    opacity: 0.75;
    transform: scale(1.3);
  }
  &.selected {
    background-color: var(--color-gray-900);
    color: white;
    opacity: 1;
    cursor: default;
  }
}

.hover-indicator {
  position: absolute;
  bottom: 51px;
  left: 18px;
  font-family: monospace;
  font-size: 12px;
  color: var(--color-gray-500);
  opacity: 0;
  transform: translate(4px, -4px);
  transition: 250ms ease-out;
  &.visible,
  &.clicked {
    transition: 50ms ease-in;
    opacity: 1;
    transform: translate(0, 0);
  }
}

.reset-button {
  position: absolute;
  bottom: 51px;
  right: 18px;
  opacity: 0;
  transform: translate(-4px, -4px);
  pointer-events: none;
  transition: 250ms ease-out;
  &:hover {
    transition: 150ms ease-in;
    transform: scale(1.1);
    .reset-button-icon {
      transition: 150ms ease-in;
      transform: scale(1.1) rotate(150deg);
    }
  }
  &:active {
    .reset-button-icon {
      transition: 50ms ease-in;
      transform: scale(0.9) rotate(150deg);
    }
  }
  &.button-ring-clicked {
    transition: 50ms ease-in;
    opacity: 1;
    pointer-events: all;
    transform: translate(0, 0);
  }
}

.reset-button-icon {
  display: block;
  width: 14px;
  height: 14px;
  transition: 250ms ease-out;
}
</style>
