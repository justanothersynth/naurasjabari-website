import chalk from 'chalk'
import boxen from 'boxen'

export type LogBoxType = 'success' | 'error' | 'info'

/**
 * Create a nicely formatted log box for console output
 * Used by cron jobs for consistent logging display
 * @param title - The title to display at the top of the box
 * @param content - The main content to display in the box
 * @param type - The type of box (success, error, info) which determines colors
 * @returns A formatted string ready for console output
 */
export function createLogBox(
  title: string,
  content: string,
  type: LogBoxType = 'info'
): string {
  const colors = {
    success: { border: 'green', title: 'green' },
    error: { border: 'red', title: 'red' },
    info: { border: 'gray', title: 'green' }
  }

  const colorScheme = colors[type]
  const titleColored =
    colorScheme.title === 'green'
      ? chalk.green(title)
      : colorScheme.title === 'red'
      ? chalk.red(title)
      : chalk.gray(title)

  return boxen(`${titleColored}\n\n${content}`, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: colorScheme.border as 'green' | 'red' | 'gray',
    width: 80
  })
}
