/**
 * Normalize azimuth to a day/night cycle where:
 * - 0° = Rise time
 * - 180° = Set time
 * - 180°-360° = Night/down time
 * @param currentTime - Current time
 * @param riseTime - Time of rise (sunrise, moonrise, etc.)
 * @param setTime - Time of set (sunset, moonset, etc.)
 * @returns Normalized azimuth (0° = Rise, 180° = Set, 180°-360° = Night)
 */
export const normalizeAzimuthToDayCycle = (
  currentTime: Date,
  riseTime: string,
  setTime: string
): number => {
  const rise = new Date(riseTime)
  const set = new Date(setTime)
  
  // If current time is between rise and set (up/visible time)
  if (currentTime >= rise && currentTime <= set) {
    const totalUpDuration = set.getTime() - rise.getTime()
    const elapsed = currentTime.getTime() - rise.getTime()
    const progress = elapsed / totalUpDuration
    
    // Map 0-1 progress to 0°-180° (rise to set)
    return progress * 180
  }
  
  // Down/night time calculation
  const nextRise = new Date(rise)
  nextRise.setDate(nextRise.getDate() + 1)
  
  let totalDownDuration: number
  let elapsed: number
  
  if (currentTime > set) {
    // Evening/night (after set, before midnight)
    totalDownDuration = nextRise.getTime() - set.getTime()
    elapsed = currentTime.getTime() - set.getTime()
  } else {
    // Early morning (after midnight, before rise)
    const previousSet = new Date(set)
    previousSet.setDate(previousSet.getDate() - 1)
    totalDownDuration = rise.getTime() - previousSet.getTime()
    elapsed = currentTime.getTime() - previousSet.getTime()
  }
  
  const downProgress = elapsed / totalDownDuration
  
  // Map down progress to 180°-360° (set to rise)
  const result = 180 + (downProgress * 180)
  
  // Ensure result is within 0-360 range (handles edge cases with timezone differences)
  return result % 360
}

/**
 * Helper function to determine if it's day or night based on the azimuth
 * @param azimuth - Normalized azimuth value
 * @returns 'day' if azimuth is between 0° and 180°, 'night' otherwise
 */
export const getSunMoonStatus = (azimuth: number): 'day' | 'night' => {
  return azimuth >= 0 && azimuth < 180 ? 'day' : 'night'
}
