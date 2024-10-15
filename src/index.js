import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast';
import ScrollToTop from "./components/ScrollToTop";

// https://github.com/himanshu8443/Study-Notion-master
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <ScrollToTop/>
       <Toaster/>
        <App />
      </BrowserRouter>
    </Provider>
  // </React.StrictMode>
);


