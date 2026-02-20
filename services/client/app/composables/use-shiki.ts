import { codeToHtml } from 'shiki'

/**
 * Composable for syntax highlighting using Shiki
 * @returns Object with highlight function
 */
export default function useShiki () {
  /**
   * Highlights code content with automatic language detection
   * @param content - The content to highlight
   * @returns Promise that resolves to highlighted HTML string
   */
  const highlight = async (content: string, lang: string = 'javascript'): Promise<string> => {
    if (!content) return ''
    
    // Try to detect if content is JSON
    let processedContent = content
    
    try {
      // Attempt to parse as JSON and format it
      const parsed = JSON.parse(content)
      processedContent = JSON.stringify(parsed, null, 2)
      lang = 'json'
    } catch {
      // If not JSON, check if it looks like other code formats
      if (content.includes('function ') || content.includes('const ') || content.includes('let ')) {
        lang = 'javascript'
      } else if (content.includes('def ') || content.includes('import ')) {
        lang = 'python'
      } else if (content.includes('<') && content.includes('>')) {
        lang = 'html'
      }
      processedContent = content
    }
    
    try {
      return await codeToHtml(processedContent, {
        lang,
        themes: {
          light: 'catppuccin-latte',
          dark: 'one-dark-pro'
        },
        defaultColor: 'light'
      })
    } catch {
      // Fallback to plain text if highlighting fails
      return `<pre class="shiki"><code>${processedContent}</code></pre>`
    }
  }
  
  return {
    highlight
  }
}
