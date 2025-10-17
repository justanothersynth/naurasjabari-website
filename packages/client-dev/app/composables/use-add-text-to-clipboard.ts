/**
 * Copies text to the clipboard using a temporary textarea element.
 * @param text - The text to be copied to the clipboard
 * @example
 * ```ts
 * useAddTextToClipboard('Text to copy')
 * ```
 */
export default (text: string): void => {
  const container = document.createElement('textarea')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.zIndex = '-1'
  container.style.opacity = '0'
  container.style.pointerEvents = 'none'
  container.innerHTML = text
  document.body.appendChild(container)
  container.select()
  document.execCommand('copy')
  document.body.removeChild(container)
}
