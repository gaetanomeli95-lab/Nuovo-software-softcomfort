import { useEffect, useState } from 'react';

function browserOnlineState() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(browserOnlineState);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}
