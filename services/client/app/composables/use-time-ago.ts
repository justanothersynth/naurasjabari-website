import { formatDistanceToNow } from 'date-fns'

export function useTimeAgo(date: Ref<Date | string | undefined>) {
  const now = ref(new Date())
  const timeAgo = ref('')
  
  let interval: NodeJS.Timeout

  const updateTimeAgo = () => {
    if (date.value) {
      timeAgo.value = formatDistanceToNow(new Date(date.value), { addSuffix: true })
    } else {
      timeAgo.value = ''
    }
  }

  const startTimer = () => {
    if (interval) clearInterval(interval)
    updateTimeAgo()
    interval = setInterval(() => {
      now.value = new Date()
      updateTimeAgo()
    }, 1000)
  }

  const stopTimer = () => {
    if (interval) {
      clearInterval(interval)
    }
  }

  watch(date, (newDate) => {
    if (newDate) {
      startTimer()
    } else {
      stopTimer()
    }
  }, { immediate: true })

  onUnmounted(() => {
    stopTimer()
  })

  return readonly(timeAgo)
}
