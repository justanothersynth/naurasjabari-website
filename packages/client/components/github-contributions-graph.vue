<template>
  <div class="github-contributions">

    <div class="contributions-grid overflow-x-auto">
      <div v-if="selectedYearData" class="year-section mb-8 flex flex-col">
        
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
          <div class="contributions-calendar">
            <div v-for="week in getWeeksForYear(selectedYearData.calendar)" :key="week.weekIndex" class="week-column">
              <div
                v-for="(day, dayIndex) in week.days"
                :key="dayIndex"
                :class="getContributionClass(day)"
                :title="day?.tooltip || ''"
                class="contribution-day" />
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">

          <div class="font-medium">
            {{ selectedYearData.count }} contributions in {{ selectedYear }}
          </div>

          <div class="flex items-center gap-2 text-sm text-gray-600 ml-auto mr-2">
            <span>Less</span>
            <div class="flex gap-1">
              <div
                v-for="color in legendColors"
                :key="color"
                :class="['w-3 h-3 rounded-sm border border-gray-200', color]" />
            </div>
            <span>More</span>
          </div>

        </div>

      </div>
    </div>
    
  </div>
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

const contributionsData = ref<ContributionsData | null>(null)
const selectedYear = ref<number>(2015)

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
  try {
    const response = await fetch('http://localhost:20040/data/github-contrib-total.json')
    if (response.ok) {
      contributionsData.value = await response.json()
    }
  } catch {
    // Silence is golden
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
</script>

<style lang="scss" scoped>
$cellGap: 3px;
$cellDimension: 13px;

.contributions-grid {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
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
  margin-left: 42px; /* Align with calendar */
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
  color: #656d76;
  height: $cellDimension;
  text-align: right;
}

.contributions-calendar {
  grid-area: calendar;
  display: flex;
  gap: $cellGap;
  overflow-x: auto;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: $cellGap;
}

.contribution-day {
  width: $cellDimension;
  height: $cellDimension;
  border-radius: 4px;
  border: 1px solid transparent;
}

.level-0 {
  background-color: #ebedf0;
  border-color: rgba(27, 31, 36, 0.06);
}

.level-1 {
  background-color: #9be9a8;
  border-color: rgba(27, 31, 36, 0.06);
}

.level-2 {
  background-color: #40c463;
  border-color: rgba(27, 31, 36, 0.06);
}

.level-3 {
  background-color: #30a14e;
  border-color: rgba(27, 31, 36, 0.06);
}

.level-4 {
  background-color: #216e39;
  border-color: rgba(27, 31, 36, 0.06);
}

.contribution-day:hover {
  border-color: rgba(27, 31, 36, 0.15);
}

@media (max-width: 768px) {
  .contributions-calendar {
    padding-bottom: 16px;
  }
  
  .grid-container {
    overflow-x: auto;
  }
}
</style>
