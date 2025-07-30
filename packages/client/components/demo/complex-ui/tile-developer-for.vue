<template>
  <div class="developer-for-tile cover bg-dark text-pale">

    <div class="heading">
      developing software for
    </div>

    <div class="duration">
      
      <template v-for="(item, i) in timeDigits" :key="i">

        <div v-if="item.type === 'break'" class="break" />

        <div v-else class="display">
          <div class="window">
            <div
              v-for="(digit, j) in item.digits"
              :key="`item-${i}-digit-${digit}-index-${j}`"
              class="digit"
              :class="{ 'flashing': item.key && flashingDigits[item.key] && flashingDigits[item.key][j] }">
              {{ digit }}
            </div>
          </div>
          <div class="label" :class="{ 'font-bold': item.bold }">
            {{ item.label }}{{ getPlurality(item.value) }}
          </div>
        </div>

      </template>

    </div>

  </div>
</template>

<script setup lang="ts">
import { intervalToDuration, type Duration } from 'date-fns'

const previousCountdown = ref<Duration>({})
const countdown = ref<Duration>({})

// Track which digits should flash
const flashingDigits = ref<Record<string, boolean[]>>({})

const timeDigits = computed(() => [
  {
    type: 'display',
    key: 'years',
    digits: toDigitArray(countdown.value.years),
    label: 'year',
    value: countdown.value.years,
    bold: true
  },
  {
    type: 'display',
    key: 'months',
    digits: toDigitArray(countdown.value.months, true),
    label: 'month',
    value: countdown.value.months,
    bold: false
  },
  {
    type: 'display',
    key: 'days',
    digits: toDigitArray(countdown.value.days, true),
    label: 'day',
    value: countdown.value.days,
    bold: false
  },
  {
    type: 'break'
  },
  {
    type: 'display',
    key: 'hours',
    digits: toDigitArray(countdown.value.hours, true),
    label: 'hour',
    value: countdown.value.hours,
    bold: false
  },
  {
    type: 'display',
    key: 'minutes',
    digits: toDigitArray(countdown.value.minutes, true),
    label: 'minute',
    value: countdown.value.minutes,
    bold: false
  },
  {
    type: 'display',
    key: 'seconds',
    digits: toDigitArray(countdown.value.seconds, true),
    label: 'second',
    value: countdown.value.seconds,
    bold: false
  }
])

/**
 * Generates the countdown duration
 */
const generateCountdown = () => {
  const duration = intervalToDuration({
    start: new Date(2015, 4, 1, 12, 0, 0),
    end: new Date()
  })
  previousCountdown.value = countdown.value
  countdown.value = duration

  // Compare previousCountdown and countdown, identify changed digits
  const changedKeys: string[] = []
  const allKeys = timeDigits.value // Get all available keys from timeDigits, return ex: ['years', 'months', 'days', 'hours', 'minutes', 'seconds']
    .filter(item => item.type === 'display' && item.key)
    .map(item => item.key as keyof Duration)
  
  for (const key of allKeys) {
    if (countdown.value[key] !== previousCountdown.value[key]) {
      changedKeys.push(key)

      // Compare individual digits to see which ones changed
      const oldDigits = key === 'years'
        ? toDigitArray(previousCountdown.value[key], false)
        : toDigitArray(previousCountdown.value[key], true)
      const newDigits = key === 'years'
        ? toDigitArray(countdown.value[key], false)
        : toDigitArray(countdown.value[key], true)
      
      // Mark changed digits for flashing
      const digitFlashStates = newDigits.map((digit, index) => digit !== oldDigits[index])
      flashingDigits.value[key] = digitFlashStates
    }
  }

  // Clear flash state after animation
  setTimeout(() => {
    flashingDigits.value = {}
  }, 500)
}

/**
 * Returns the plural form of a word if the number is not 1
 * @param time - The number to check
 * @returns The plural form of the word if the number is not 1, otherwise an empty string
 */
const getPlurality = (time: number | undefined) => time === 1 ? '' : 's'

/**
 * Converts a number to an array of individual digits
 * @param value - The number to convert to digits
 * @param padZero - Whether to pad single digits with a leading zero
 * @returns Array of individual digit numbers
 */
 const toDigitArray = (value: number | undefined, padZero = false): number[] => {
  if (!value && value !== 0) return [0, 0]
  
  let stringValue = value.toString()
  if (padZero && value < 10) {
    stringValue = '0' + stringValue
  }
  
  return stringValue.split('').map(Number)
}

onMounted(() => {
  generateCountdown()
  setInterval(() => generateCountdown(), 1000)
})
</script>

<style lang="scss" scoped>
.developer-for-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: toRem(32) toRem(16);
  padding-top: toRem(22);
  background-color: var(--color-gray-100);
}

.heading {
  font-size: toRem(12);
  font-weight: 600;
  text-align: center;
}

.duration {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: toRem(12);
  gap: toRem(8);
  font-size: toRem(12);
  font-family: var(--font-mono);
}

.break {
  flex-basis: 100%;
  height: 0;
  margin-top: toRem(6);
}

.display {
  position: relative;
}

.window {
  display: flex;
  border: 1px solid var(--color-gray-400);
  border-radius: toRem(4);
  overflow: hidden;
}

@keyframes flash {
  0% { background-color: transparent; color: var(--color-gray-900); }
  50% { background-color: var(--color-gray-900); color: var(--color-gray-100); }
  100% { background-color: transparent; color: var(--color-gray-900); }
}

.digit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: toRem(20);
  height: toRem(20);
  line-height: 1;
  &.flashing {
    animation: flash 0.5s ease-in-out;
  }
  &:not(:last-child) {
    border-right: 1px solid var(--color-gray-400);
  }
}

.label {
  position: absolute;
  top: calc(100% + toRem(0));
  left: 50%;
  transform: translateX(-50%);
  font-size: toRem(10);
  text-align: center;
}
</style>
