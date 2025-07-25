import { SignJWT } from 'jose'

/**
 * Generate a JWT token for internal authentication against Supabase
 * @param jwtSecret - The JWT secret key
 * @param jwtIssuer - The JWT issuer
 * @param jwtSubject - The JWT subject
 * @returns Promise<string> - The generated JWT token
 */
export async function generateInternalJWT(
  jwtSecret: string,
  jwtIssuer: string,
  jwtSubject: string
): Promise<string> {
  const secret = new TextEncoder().encode(jwtSecret)

  const jwt = await new SignJWT({ role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(jwtIssuer)
    .setSubject(jwtSubject)
    .setExpirationTime('1h')
    .sign(secret)

  return jwt
}
