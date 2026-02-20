import { describe, it, expect } from 'bun:test'
import { injectPromptVariables } from './inject-prompt-variables'

describe('injectPromptVariables', () => {
  it('should replace single variable in prompt', () => {
    const prompt = 'Hello {{name}}, welcome!'
    const variables = { name: 'John' }
    const result = injectPromptVariables(prompt, variables)
    expect(result).toBe('Hello {{John}}, welcome!')
  })

  it('should replace multiple variables in prompt', () => {
    const prompt = 'Hello {{name}}, your order {{orderId}} is ready.'
    const variables = {
      name: 'Alice',
      orderId: '12345'
    }
    const result = injectPromptVariables(prompt, variables)
    expect(result).toBe('Hello {{Alice}}, your order {{12345}} is ready.')
  })

  it('should handle empty variables object', () => {
    const prompt = 'Hello {{name}}, welcome!'
    const variables = {}
    const result = injectPromptVariables(prompt, variables)
    expect(result).toBe('Hello {{name}}, welcome!')
  })
})
