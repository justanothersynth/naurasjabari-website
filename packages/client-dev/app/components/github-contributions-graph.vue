<template>
  <section class="mt-20">

    <div class="flex flex-wrap gap-1 mb-6 justify-center container">
      <button
        v-for="year in years"
        :key="year"
        class="text-xs rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors duration-150"
        :class="{ 'bg-gray-100': year === selectedYear }"
        @click="selectedYear = year">
        {{ year }}
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center gap-3 py-16 border border-gray-200 rounded-3xl">
      <LoaderSpinner :duration="1" />
      <span class="text-sm text-gray-500 font-medium">Loading contribution chart</span>
    </div>

    <!-- Error State -->
    <div
      v-else-if="hasError"
      class="flex items-center justify-center py-16 text-sm text-gray-500 font-medium border border-gray-200 rounded-3xl">
      Something went wrong fetching the contribution chart, please refresh this page or try again later
    </div>

    <div v-else-if="selectedYearData" class="year-section flex flex-col container">
      
      <div class="scroll-wrapper relative">
        <!-- Left gradient overlay -->
        <div
          class="scroll-gradient scroll-gradient-left"
          :class="{ 'opacity-0': isScrolledLeft }" />
        
        <!-- Right gradient overlay -->
        <div
          class="scroll-gradient scroll-gradient-right"
          :class="{ 'opacity-0': isScrolledRight }" />
        
        <div
          ref="scrollContainerRef"
          class="scroll-container"
          @scroll="handleScroll">
          <div class="grid-container">
            <!-- Month labels -->
            <div class="month-labels">
              <div
                v-for="(monthData, monthName) in monthPositions"
                :key="monthName"
                class="month-label"
                :style="{ gridColumnStart: monthData.position + 1 }">
                {{ monthName }}
              </div>
            </div>
            
            <!-- Day labels -->
            <div class="day-labels">
              <div v-for="(label, index) in dayLabels" :key="index" class="day-label">
                {{ label }}
              </div>
            </div>
            
            <!-- Contributions grid -->
            <div class="calendar">
              <div v-for="week in getWeeksForYear(selectedYearData.calendar)" :key="week.weekIndex" class="week-column">
                <div
                  v-for="(day, dayIndex) in week.days"
                  :key="dayIndex"
                  :class="getContributionClass(day)"
                  class="day"
                  @mouseenter="day?.tooltip && $tooltip.show(day.tooltip)"
                  @mouseleave="$tooltip.hide" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center mt-4 mini:mt-6 mini:flex-row-reverse mini:justify-between">

        <div class="flex items-center gap-2 text-sm text-gray-600 mini:ml-auto mini:mr-2">
          <span>Less</span>
          <div class="flex gap-1">
            <div
              v-for="color in legendColors"
              :key="color"
              :class="['w-3 h-3 rounded-sm', color]" />
          </div>
          <span>More</span>
        </div>

        <div class="font-medium mt-2 mini:mt-0">
          {{ selectedYearData.count }} contributions in {{ selectedYear }}
        </div>

      </div>

    </div>
    
    <div class="text-sm text-gray-400 mt-6 mini:mt-8 text-center container">
      Note: large portions of my work (ex: project management, teaching, devops) cannot be reflected through github contributions
    </div>
    
  </section>
</template>

<script lang="ts" setup>
type ContributionDay = {
  date: string
  level: number
  tooltip: string
}

type YearCalendar = {
  [dayOfWeek: string]: ContributionDay[]
}

type MonthPosition = {
  [monthName: string]: number
}

type YearData = {
  count: number
  calendar: YearCalendar
  monthPosition: MonthPosition
}

type ContributionsData = {
  [year: string]: YearData
}

type WeekData = {
  weekIndex: number
  days: (ContributionDay | null)[]
}

const { $tooltip } = useNuxtApp()

const contributionsData = ref<ContributionsData | null>(null)
const selectedYear = ref<number>(new Date().getFullYear())
const isLoading = ref(true)
const hasError = ref(false)

const scrollContainerRef = ref<HTMLElement | null>(null)
const isScrolledLeft = ref(true)
const isScrolledRight = ref(false)

const { width: windowWidth } = useWindowSize()

/**
 * Handles scroll events on the container to update gradient visibility
 */
const handleScroll = () => {
  if (!scrollContainerRef.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.value
  const scrollThreshold = 5
  
  isScrolledLeft.value = scrollLeft <= scrollThreshold
  isScrolledRight.value = scrollLeft + clientWidth >= scrollWidth - scrollThreshold
}

/**
 * Throttled resize handler to update gradient visibility
 */
const handleResize = useThrottleFn(() => {
  checkScrollState()
}, 150)

/**
 * Checks initial scroll state when data loads
 */
const checkScrollState = () => {
  nextTick(() => {
    handleScroll()
  })
}

// Watch window width to handle resize
watch(windowWidth, handleResize)

/**
 * Dynamically generates an array of years from 2015 to current year + 1
 */
const years = computed(() => {
  const currentYear = new Date().getFullYear()
  const startYear = 2015
  const endYear = currentYear // Include next year for future data
  
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => (startYear + index)
  )
})

/**
 * Legend colors for the contribution levels
 */
const legendColors = [
  'bg-gray-100',
  'bg-green-100',
  'bg-green-300',
  'bg-green-500',
  'bg-green-700'
]

/**
 * Day labels for the calendar (alternating pattern with Monday, Wednesday, Friday)
 */
const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

/**
 * Fetches the GitHub contributions data from the API
 */
const fetchContributionsData = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const response = await fetch('/api/data/github-contrib-total.json')
    if (response.ok) {
      contributionsData.value = await response.json()
    } else {
      hasError.value = true
    }
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

/**
 * Returns the data for the currently selected year
 */
const selectedYearData = computed(() => {
  if (!contributionsData.value) return null
  return contributionsData.value[selectedYear.value.toString()] || null
})

/**
 * Returns the month positions for the selected year with proper formatting
 */
const monthPositions = computed(() => {
  if (!selectedYearData.value?.monthPosition) return {}
  
  // Define the correct month order
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const positions: { [key: string]: { position: number } } = {}
  
  // Only include months that exist in the data and sort them chronologically
  monthOrder.forEach(month => {
    if (selectedYearData.value?.monthPosition?.[month] !== undefined) {
      positions[month] = { position: selectedYearData.value.monthPosition[month] }
    }
  })
  
  return positions
})

/**
 * Converts the calendar data into a weekly grid format
 */
const getWeeksForYear = (calendar: YearCalendar): WeekData[] => {
  if (!calendar) return []
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeks: WeekData[] = []
  
  // Get the maximum number of weeks (usually 53)
  const maxWeeks = Math.max(
    ...days.map(day => calendar[day]?.length || 0)
  )
  
  for (let weekIndex = 0; weekIndex < maxWeeks; weekIndex++) {
    const weekDays = days.map(day => {
      const dayData = calendar[day]?.[weekIndex]
      return dayData || null
    })
    
    weeks.push({
      weekIndex,
      days: weekDays
    })
  }
  
  return weeks
}

/**
 * Returns the appropriate CSS class based on contribution level
 */
const getContributionClass = (day: ContributionDay | null): string => {
  if (!day || day.level === undefined) {
    return 'no-day'
  }
  return `level-${day.level}`
}

// Fetch data on component mount
onMounted(() => {
  fetchContributionsData()
})

// Check scroll state when data changes
watch(selectedYearData, () => {
  checkScrollState()
})
</script>

<style lang="scss" scoped>
$cellGap: 3px;
$cellDimension: 13px;
$cellSpacing: 3px;
$mobileBreakpoint: 61.5rem; // 56rem (max-w-4xl) / 0.91 (container width %)

.scroll-wrapper {
  position: relative;
}

.scroll-container {
  @media (max-width: $mobileBreakpoint) {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.scroll-gradient {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3rem;
  z-index: 10;
  pointer-events: none;
  transition: opacity 200ms ease-out;
  @media (max-width: $mobileBreakpoint) {
    display: block;
  }
}

.scroll-gradient-left {
  left: 0;
  background: linear-gradient(to right, var(--color-root) 30%, transparent 100%);
}

.scroll-gradient-right {
  right: 0;
  background: linear-gradient(to left, var(--color-root) 30%, transparent 100%);
}

.grid-container {
  display: grid;
  grid-template-areas: 'months months' 'days calendar';
  grid-template-columns: auto 1fr;
  gap: 8px;
}

.month-labels {
  grid-area: months;
  display: grid;
  grid-template-columns: repeat(53, $cellDimension);
  gap: $cellGap;
  margin-left: 44px; /* Align with calendar */
  margin-bottom: 8px;
  position: relative;
}

.month-label {
  width: $cellDimension;
  height: $cellDimension;
  color: #656d76;
  text-align: left;
  white-space: nowrap;
  font-size: 12px;
}

.day-labels {
  grid-area: days;
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  gap: $cellGap;
  padding-right: 8px;
  font-size: 12px;
}

.day-label {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 2px;
  color: #656d76;
  height: $cellDimension;
  text-align: right;
}

.calendar {
  grid-area: calendar;
  display: flex;
}

.week-column {
  display: flex;
  flex-direction: column;
}

.day {
  position: relative;
  width: $cellDimension + $cellSpacing;
  height: $cellDimension + $cellSpacing;
  transition: 150ms ease-out;
  &:hover {
    &.level-0 {
      &:before {
        filter: brightness(0.9);
      }
    }
    &.level-1,
    &.level-2 {
      &:before {
        filter: brightness(1.1);
      }
    }
    &.level-3 {
      &:before {
        filter: brightness(1.2);
      }
    }
    &.level-4 {
      &:before {
        filter: brightness(1.4);
      }
    }
    &:before {
      transition: 150ms ease-in;
    }
  }
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: $cellDimension;
    height: $cellDimension;
    border-radius: 5px;
    transform: translate(-50%, -50%);
    transition: 150ms ease-out;
  }
}

.level-0 {
  &:before {
    background-color: #ebedf0;
  }
}

.level-1 {
  &:before {
    background-color: #9be9a8;
  }
}

.level-2 {
  &:before {
    background-color: #40c463;
  }
}

.level-3 {
  &:before {
    background-color: #30a14e;
  }
}

.level-4 {
  &:before {
    background-color: #216e39;
  }
}

.day {
  &:hover {
    transition: 150ms ease-in;
    transform: scale(1.3);
  }
}
</style>
