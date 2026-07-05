import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
}

/**
 * Verifies a Google ID token (obtained on the frontend via @react-oauth/google)
 * and returns the decoded profile. Throws if the token is invalid or the
 * audience doesn't match our GOOGLE_CLIENT_ID.
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleProfile> => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Invalid Google token payload');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture,
    emailVerified: !!payload.email_verified,
  };
};
