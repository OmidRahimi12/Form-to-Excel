import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { Header } from './Header';
import { PageContainer } from './PageContainer';
import { Sidebar } from './Sidebar';
import { PwaRuntimeNotice } from '../../features/pwa/components/PwaRuntimeNotice';

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return <div className="app-shell"><Sidebar open={menuOpen} onNavigate={closeMenu} /><div className="app-main"><PwaRuntimeNotice /><Header onMenuClick={() => setMenuOpen(true)} /><PageContainer><Outlet /></PageContainer></div><BottomNavigation /></div>;
}
