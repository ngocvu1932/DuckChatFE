import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './pages/App.tsx';
import './main.css';
import {Provider} from 'react-redux';
import store from './redux/store.ts';
import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import {appConfig} from './appConfig.ts';
import enLocale from './locales/locale_en.json';
import viLocale from './locales/locale_vi.json';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SocketProvider from './providers/socketProvider.tsx';
import GlobalOverlay from './providers/globalOverlay.tsx';
import {WebRTCProvider} from './providers/webRTCProvider.tsx';

if (!localStorage.getItem('appConfig')) {
  localStorage.setItem('appConfig', JSON.stringify(appConfig));
}

const lang = JSON.parse(localStorage.getItem('appConfig') ?? '{}').defaultLanguage ?? 'vi';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enLocale,
      },
      vi: {
        translation: viLocale,
      },
    },
    lng: lang,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  })
  .then();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <WebRTCProvider>
        <SocketProvider>
          <App />
          <GlobalOverlay />
        </SocketProvider>

        <ToastContainer />
      </WebRTCProvider>
    </Provider>
  </StrictMode>,
);
