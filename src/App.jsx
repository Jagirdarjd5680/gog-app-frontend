import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useSettings } from './context/SettingsContext';
import AppRoutes from './AppRoutes';

function App() {
  const { settings } = useSettings();

  const googleClientId = settings?.integrations?.googleClientId;
  const recaptchaKey = settings?.integrations?.recaptchaKey;

  const renderApp = () => (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AppRoutes />
    </>
  );

  let content = renderApp();

  if (recaptchaKey) {
    content = (
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
        {content}
      </GoogleReCaptchaProvider>
    );
  }

  if (googleClientId) {
    content = (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}

export default App;
