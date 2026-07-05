import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useUIStore } from '../../stores/uiStore';

interface GoogleLoginButtonProps {
  onIdToken: (idToken: string) => void;
}

/**
 * Renders nothing if VITE_GOOGLE_CLIENT_ID isn't configured, so the auth pages
 * degrade gracefully instead of crashing when Google Sign-In isn't set up.
 *
 * Uses the official <GoogleLogin /> credential flow, which returns a signed
 * Google ID token (JWT) in `credentialResponse.credential`. That token is sent
 * to the backend, which verifies it server-side via `google-auth-library`.
 */
export const GoogleLoginButton = ({ onIdToken }: GoogleLoginButtonProps) => {
  const configured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { addToast } = useUIStore();

  if (!configured) return null;

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      addToast({ type: 'error', title: 'Google Sign-In failed', message: 'No credential returned' });
      return;
    }
    onIdToken(credentialResponse.credential);
  };

  return (
    <div className="flex justify-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => addToast({ type: 'error', title: 'Google Sign-In failed', message: 'Please try again' })}
        theme="filled_black"
        shape="pill"
        text="continue_with"
      />
    </div>
  );
};
