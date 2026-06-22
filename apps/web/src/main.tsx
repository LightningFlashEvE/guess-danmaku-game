import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router-dom';
import './index.css';
import App from './App';
import ObsPage from './pages/ObsPage';
import AdminPage from './pages/AdminPage';
import WordsPage from './pages/WordsPage';
import DebugDanmakuPage from './pages/DebugDanmakuPage';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
      <h1 className="text-2xl font-bold">页面走丢了 🤔</h1>
      <div className="flex gap-3 text-sm text-brand">
        <Link className="hover:underline" to="/obs">OBS 展示页</Link>
        <Link className="hover:underline" to="/admin">主播控制台</Link>
        <Link className="hover:underline" to="/admin/words">词库管理</Link>
        <Link className="hover:underline" to="/debug/danmaku">调试弹幕</Link>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Navigate to="/obs" replace /> },
      { path: 'obs', element: <ObsPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'admin/words', element: <WordsPage /> },
      { path: 'debug/danmaku', element: <DebugDanmakuPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
