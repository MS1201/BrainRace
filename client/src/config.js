const API_BASE = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' ? '' : `http://${window.location.hostname}:3001`);

export default API_BASE;
