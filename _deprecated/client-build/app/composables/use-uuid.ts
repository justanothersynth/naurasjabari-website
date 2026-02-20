// ///////////////////////////////////////////////////////////////////// Imports
// -----------------------------------------------------------------------------
import {
  NIL,
  parse,
  stringify,
  v1,
  v3,
  v4,
  v5,
  validate,
  version
} from 'uuid'

// ////////////////////////////////////////////////////////////////////// Export
// -----------------------------------------------------------------------------
/**
 * A convenience wrapper for generating universal unique identifiers using Uuid.
 * @returns An object containing all UUID utility functions
 * @example
 * ```ts
 * const { v4, validate } = useUuid()
 * const id = v4() // "123e4567-e89b-12d3-a456-426614174000"
 * const isValid = validate(id) // true
 * ```
 * Available methods:
 * - `NIL`: The nil UUID
 * - `parse`: Parse a UUID string into a Uint8Array
 * - `stringify`: Convert a Uint8Array to a UUID string
 * - `v1`: Generate a UUID using timestamp
 * - `v3`: Generate a UUID using MD5 hash
 * - `v4`: Generate a random UUID
 * - `v5`: Generate a UUID using SHA-1 hash
 * - `validate`: Validate a UUID string
 * - `version`: Get the version of a UUID
 * @see [Uuid Documentation](https://github.com/uuidjs/uuid)
 */
export default (): {
  NIL: string;
  parse: (uuid: string) => Uint8Array;
  stringify: (arr: Uint8Array) => string;
  v1: (options?: { node?: Uint8Array; clockseq?: number; msecs?: number; nsecs?: number }) => string;
  v3: (name: string | Uint8Array, namespace: string | Uint8Array) => string;
  v4: () => string;
  v5: (name: string | Uint8Array, namespace: string | Uint8Array) => string;
  validate: (uuid: string) => boolean;
  version: (uuid: string) => number;
} => {
  return {
    NIL,
    parse,
    stringify,
    v1,
    v3,
    v4,
    v5,
    validate,
    version
  }
}
