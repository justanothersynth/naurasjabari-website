/**
 * Replace variables in a prompt
 * @param prompt - The prompt to replace variables in
 * @param variables - The variables to use in the prompt
 * @returns The prompt with variables replaced
 */
export const injectPromptVariables = (
  prompt: string,
  variables: Record<string, string>
) => {
  Object.keys(variables).forEach((key) => {
    prompt = prompt.replaceAll(`{{${key}}}`, `{{${variables[key]}}}`)
  })
  return prompt
}
