'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Calendar, Users, Home, MapPin, Bell, User } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(5));
      const unsub = onSnapshot(q, (snapshot) => {
        const notifs = [];
        snapshot.forEach(doc => {
          notifs.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(notifs);
      });
      return () => unsub();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div style={{ borderTopColor: 'transparent' }} className="w-8 h-8 border-4 border-primary rounded-full animate-spin"></div>
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { name: 'Inicio', path: '/', icon: <Home size={20} /> },
    { name: 'Agenda', path: '/agenda', icon: <Calendar size={20} /> },
  ];

  if (userData?.rol === 'parroco') {
    navItems.push({ name: 'Usuarios', path: '/usuarios', icon: <Users size={20} /> });
    navItems.push({ name: 'Capillas', path: '/capillas', icon: <MapPin size={20} /> });
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'hsl(var(--canvas))' }}>
      {/* Desktop Sidebar */}
      <aside className="glass mobile-hidden" style={{ width: '280px', borderRight: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid hsl(var(--border))' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px', color: 'hsl(var(--text-main))' }}>Santo Domingo</h2>
          <p className="text-muted" style={{ fontSize: '13px', fontWeight: '500' }}>Agenda Parroquial</p>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button 
                className={`btn flex items-center justify-start gap-2 ${pathname === item.path ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {item.icon} {item.name}
              </button>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{userData?.nombre || 'Usuario'}</p>
            <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{userData?.rol || 'Sin rol'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary flex items-center justify-center gap-2" 
            style={{ width: '100%', color: 'hsl(var(--danger))' }}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ height: '60px', minHeight: '60px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', backgroundColor: 'hsl(var(--canvas))', zIndex: 10 }}>
          
          {/* Mobile App Title (Hidden on Desktop) */}
          <div className="md:hidden">
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-main))' }}>Santo Domingo</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <button 
                className="btn" 
                style={{ padding: '0.5rem', borderRadius: '50%' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} className="text-muted hover:text-primary transition-colors" />
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: 'hsl(var(--danger))', borderRadius: '50%' }}></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="card glass animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: '280px', zIndex: 100, padding: '1rem', marginTop: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Notificaciones</h4>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted">No hay notificaciones.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {notifications.map(n => (
                        <li key={n.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                          <p className="text-sm" style={{ fontWeight: '500' }}>{n.title}</p>
                          <p className="text-xs text-muted">{n.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Logout Button (Hidden on Desktop) */}
            <button 
              className="btn md:hidden" 
              onClick={handleLogout}
              style={{ padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--danger))' }}
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {/* Added bottom padding on mobile to account for the bottom nav bar */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', paddingBottom: '80px' }} className="md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav className="md:hidden" style={{ 
        position: 'fixed', 
        bottom: 0, left: 0, right: 0, 
        height: '65px', 
        backgroundColor: 'hsl(var(--canvas))', 
        borderTop: '1px solid hsl(var(--border))', 
        display: 'flex', 
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--slate))',
              textDecoration: 'none'
            }}>
              <div style={{ padding: '4px 12px', borderRadius: '16px', backgroundColor: isActive ? 'hsl(var(--tint-lavender))' : 'transparent', marginBottom: '2px', transition: 'all 0.2s ease' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '500' }}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
