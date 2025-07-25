/**
 * Utility function to condense a json-schema by removing json-schema-specific keys
 * and keeping only property names and descriptions.
 */

interface JsonSchemaProperty {
  description?: string
  properties?: Record<string, JsonSchemaProperty>
  items?: JsonSchemaProperty
  definitions?: Record<string, JsonSchemaProperty>
  $ref?: string
  [key: string]: unknown
}

interface CondensedSchema {
  description?: string
  [key: string]: unknown
}

/**
 * json-schema keys that should be removed during condensation
 */
const JSON_SCHEMA_KEYS = new Set([
  '$schema',
  'title',
  'type',
  'properties',
  'required',
  // 'const',
  // 'enum',
  'format',
  'minimum',
  'maximum',
  'items',
  'additionalProperties',
  'definitions',
  '$ref',
  'oneOf',
  'anyOf',
  'allOf',
  'not',
  'if',
  'then',
  'else',
  'pattern',
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'uniqueItems',
  'multipleOf',
  'exclusiveMinimum',
  'exclusiveMaximum'
])

/**
 * Resolves a $ref reference within the schema
 */
function resolveRef(ref: string, rootSchema: JsonSchemaProperty): JsonSchemaProperty | null {
  if (!ref.startsWith('#/')) return null
  
  const path = ref.substring(2).split('/')
  let current = rootSchema as Record<string, unknown>
  
  for (const segment of path) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment] as Record<string, unknown>
    } else {
      return null
    }
  }
  
  return current as JsonSchemaProperty
}

/**
 * Recursively condenses a json-schema property
 */
function condenseProperty(
  property: JsonSchemaProperty,
  rootSchema: JsonSchemaProperty
): CondensedSchema {
  const result: CondensedSchema = {}
  
  // Handle $ref references
  if (property.$ref) {
    const resolved = resolveRef(property.$ref, rootSchema)
    if (resolved) {
      return condenseProperty(resolved, rootSchema)
    }
  }
  
  // Add description if it exists
  if (property.description) {
    result.description = property.description
  }
  
  // Process properties if they exist
  if (property.properties) {
    for (const [key, value] of Object.entries(property.properties)) {
      result[key] = condenseProperty(value, rootSchema)
    }
  }
  
  // Handle array items
  if (property.items) {
    // For arrays, we'll create a special _items property to show the structure
    result._items = condenseProperty(property.items, rootSchema)
  }
  
  // Add any other keys that aren't json-schema specific
  for (const [key, value] of Object.entries(property)) {
    if (!JSON_SCHEMA_KEYS.has(key) && key !== 'description') {
      result[key] = value
    }
  }
  
  return result
}

/**
 * Condenses a json-schema by removing json-schema-specific keys
 * and keeping only property names and descriptions.
 *
 * @param schema The json-schema to condense
 * @returns A condensed object with only property names and descriptions
 */
export function condenseSchema(schema: JsonSchemaProperty): CondensedSchema {
  return condenseProperty(schema, schema)
}
