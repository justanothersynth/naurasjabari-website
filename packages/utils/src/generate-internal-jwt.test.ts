import { describe, it, expect } from 'vitest'
import { jwtVerify, decodeJwt } from 'jose'
import { generateInternalJWT } from './generate-internal-jwt'

describe('generateInternalJWT', () => {
  const mockSecret = 'test-secret-key-for-jwt-generation'
  const mockIssuer = 'test-issuer'
  const mockSubject = 'test-subject'

  it('should generate a valid JWT token', async () => {
    const token = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT has 3 parts: header.payload.signature
  })

  it('should create a token with the correct payload', async () => {
    const token = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    const decoded = decodeJwt(token)
    
    expect(decoded.role).toBe('authenticated')
    expect(decoded.iss).toBe(mockIssuer)
    expect(decoded.sub).toBe(mockSubject)
    expect(decoded.iat).toBeDefined()
    expect(decoded.exp).toBeDefined()
  })

  it('should create a token with correct header', async () => {
    const token = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    const parts = token.split('.')
    const header = JSON.parse(Buffer.from(parts[0] as string, 'base64url').toString())
    
    expect(header.alg).toBe('HS256')
    expect(header.typ).toBe('JWT')
  })

  it('should create a verifiable token', async () => {
    const token = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    const secret = new TextEncoder().encode(mockSecret)
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: mockIssuer
    })
    
    expect(payload.role).toBe('authenticated')
    expect(payload.iss).toBe(mockIssuer)
    expect(payload.sub).toBe(mockSubject)
  })

  it('should set expiration time to 1 hour', async () => {
    const token = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    const decoded = decodeJwt(token)
    
    expect(decoded.iat).toBeDefined()
    expect(decoded.exp).toBeDefined()
    
    const issuedAt = decoded.iat as number
    const expiresAt = decoded.exp as number
    
    // Should expire in approximately 1 hour (3600 seconds)
    const difference = expiresAt - issuedAt
    expect(difference).toBeGreaterThanOrEqual(3599)
    expect(difference).toBeLessThanOrEqual(3601)
  })

  it('should generate different tokens for different secrets', async () => {
    const token1 = await generateInternalJWT('secret1', mockIssuer, mockSubject)
    const token2 = await generateInternalJWT('secret2', mockIssuer, mockSubject)
    
    expect(token1).not.toBe(token2)
  })

  it('should generate different tokens for different issuers', async () => {
    const token1 = await generateInternalJWT(mockSecret, 'issuer1', mockSubject)
    const token2 = await generateInternalJWT(mockSecret, 'issuer2', mockSubject)
    
    expect(token1).not.toBe(token2)
    
    const decoded1 = decodeJwt(token1)
    const decoded2 = decodeJwt(token2)
    
    expect(decoded1.iss).toBe('issuer1')
    expect(decoded2.iss).toBe('issuer2')
  })

  it('should generate different tokens for different subjects', async () => {
    const token1 = await generateInternalJWT(mockSecret, mockIssuer, 'subject1')
    const token2 = await generateInternalJWT(mockSecret, mockIssuer, 'subject2')
    
    expect(token1).not.toBe(token2)
    
    const decoded1 = decodeJwt(token1)
    const decoded2 = decodeJwt(token2)
    
    expect(decoded1.sub).toBe('subject1')
    expect(decoded2.sub).toBe('subject2')
  })

  it('should generate tokens at different times with different iat', async () => {
    const token1 = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    
    // Wait a small amount of time
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const token2 = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    
    const decoded1 = decodeJwt(token1)
    const decoded2 = decodeJwt(token2)
    
    expect(decoded2.iat).toBeGreaterThanOrEqual(decoded1.iat as number)
  })

  it('should fail verification with wrong secret', async () => {
    const token = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    const wrongSecret = new TextEncoder().encode('wrong-secret')
    
    await expect(
      jwtVerify(token, wrongSecret, { issuer: mockIssuer })
    ).rejects.toThrow()
  })

  it('should fail verification with wrong issuer', async () => {
    const token = await generateInternalJWT(mockSecret, mockIssuer, mockSubject)
    const secret = new TextEncoder().encode(mockSecret)
    
    await expect(
      jwtVerify(token, secret, { issuer: 'wrong-issuer' })
    ).rejects.toThrow()
  })

  it('should handle very short secret', async () => {
    const shortSecret = 'abc'
    const token = await generateInternalJWT(shortSecret, mockIssuer, mockSubject)
    
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    
    const decoded = decodeJwt(token)
    expect(decoded.iss).toBe(mockIssuer)
    expect(decoded.sub).toBe(mockSubject)
  })

  it('should handle special characters in parameters', async () => {
    const specialSecret = 'secret!@#$%^&*()'
    const specialIssuer = 'issuer-with-special-chars-!@#'
    const specialSubject = 'subject_with_special@chars.com'
    
    const token = await generateInternalJWT(specialSecret, specialIssuer, specialSubject)
    const secret = new TextEncoder().encode(specialSecret)
    
    const { payload } = await jwtVerify(token, secret, {
      issuer: specialIssuer
    })
    
    expect(payload.iss).toBe(specialIssuer)
    expect(payload.sub).toBe(specialSubject)
  })
})
