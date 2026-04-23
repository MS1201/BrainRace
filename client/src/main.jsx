console.log('main.jsx: started');
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('main.jsx: rendering App');
const rootElement = document.getElementById('root');
if (!rootElement) {
    console.error('root element not found!');
} else {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
    console.log('main.jsx: render call complete');
}
