import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useGameStore } from './stores/gameStore';

export default function App() {
  const connect = useGameStore((s) => s.connect);
  const refresh = useGameStore((s) => s.refresh);
  const location = useLocation();

  useEffect(() => {
    connect();
    void refresh();
  }, [connect, refresh]);

  // OBS 透明背景：/obs?transparent=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transparent = location.pathname.startsWith('/obs') && params.get('transparent') === '1';
    document.documentElement.classList.toggle('obs-transparent', transparent);
  }, [location]);

  return <Outlet />;
}
