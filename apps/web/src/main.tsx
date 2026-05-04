import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#f5a623',
          colorBgBase: '#0d0d0d',
          colorTextBase: '#f0f0f0',
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: 6,
          fontSize: 15,
        },
        components: {
          Button: {
            colorPrimary: '#f5a623',
            algorithm: true,
          },
          Card: {
            colorBgContainer: '#161616',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
