import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Theme appearance="light" accentColor="green" grayColor="gray" radius="medium">
      <App />
      <Toaster position="top-right" />
    </Theme>
  </BrowserRouter>,
)
