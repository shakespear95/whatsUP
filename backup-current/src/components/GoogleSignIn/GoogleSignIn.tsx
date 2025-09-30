import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './GoogleSignIn.css';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: Element, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  buttonText?: string;
  buttonSize?: 'large' | 'medium' | 'small';
  buttonTheme?: 'outline' | 'filled_blue' | 'filled_black';
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  buttonText = 'Sign in with Google',
  buttonSize = 'large',
  buttonTheme = 'outline'
}) => {
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google Sign-In button
        const buttonElement = document.getElementById('google-signin-button');
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: buttonTheme,
            size: buttonSize,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      }
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [buttonSize, buttonTheme]);

  const handleGoogleResponse = async (response: any) => {
    try {
      if (response.credential) {
        const success = await loginWithGoogle(response.credential);
        if (success) {
          onSuccess?.();
        } else {
          onError?.('Google sign-in failed');
        }
      } else {
        onError?.('No credential received from Google');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError?.('Google sign-in failed');
    }
  };

  return (
    <div className="google-signin-container">
      <div id="google-signin-button" className="google-signin-button">
        {/* Google button will be rendered here */}
      </div>
    </div>
  );
};

export default GoogleSignIn;