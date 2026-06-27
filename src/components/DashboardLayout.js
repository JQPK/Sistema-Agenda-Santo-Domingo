'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Calendar, Users, Home, MapPin, Bell, X } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  collection, query, orderBy, limit, onSnapshot,
  deleteDoc, doc, getDocs
} from 'firebase/firestore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_NOTIFICATIONS = 2;

export default function DashboardLayout({ children }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // Track unread count separately so dot persists until user opens panel
  const [unreadCount, setUnreadCount] = useState(0);
  const prevNotifsRef = useRef([]);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen in real time, only the 2 most recent
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(MAX_NOTIFICATIONS)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const incoming = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // If there are more than MAX in Firestore, delete the oldest ones
      // (enforces the "max 2" rule server-side for next sessions too)
      try {
        const allSnap = await getDocs(
          query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
        );
        if (allSnap.size > MAX_NOTIFICATIONS) {
          const toDelete = allSnap.docs.slice(MAX_NOTIFICATIONS);
          await Promise.all(toDelete.map(d => deleteDoc(doc(db, 'notifications', d.id))));
        }
      } catch (_) { /* silently ignore cleanup errors */ }

      // Detect genuinely new notifications (not seen before)
      const prevIds = prevNotifsRef.current.map(n => n.id);
      const newOnes = incoming.filter(n => !prevIds.includes(n.id));
      if (newOnes.length > 0) {
        setUnreadCount(c => c + newOnes.length);
      }

      prevNotifsRef.current = incoming;
      setNotifications(incoming);
    });

    return () => unsub();
  }, [user]);

  const handleOpenNotifications = () => {
    setShowNotifications(v => !v);
    setUnreadCount(0); // mark as read when opening
  };

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #e5e3df', borderTopColor: '#5645d4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: '#787671' }}>Cargando...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { name: 'Inicio',   path: '/',          icon: <Home size={20} /> },
    { name: 'Agenda',   path: '/agenda',    icon: <Calendar size={20} /> },
  ];
  if (userData?.rol === 'parroco') {
    navItems.push({ name: 'Usuarios',  path: '/usuarios',  icon: <Users size={20} /> });
    navItems.push({ name: 'Capillas',  path: '/capillas',  icon: <MapPin size={20} /> });
  }

  const NotificationPanel = () => (
    <AnimatePresence>
      {showNotifications && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: '300px', zIndex: 200,
            backgroundColor: '#ffffff',
            border: '1px solid #e5e3df',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(15,15,15,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e3df', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', letterSpacing: '-0.1px' }}>Notificaciones</span>
            <span style={{ fontSize: '11px', color: '#a4a097' }}>{notifications.length}/{MAX_NOTIFICATIONS}</span>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#a4a097', fontSize: '13px' }}>
              Sin notificaciones recientes
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notifications.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < notifications.length - 1 ? '1px solid #f0ede9' : 'none',
                    display: 'flex', gap: '10px', alignItems: 'flex-start'
                  }}
                >
                  {/* Dot indicator */}
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#5645d4', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a', margin: 0, lineHeight: 1.4 }}>{n.title}</p>
                    <p style={{ fontSize: '12px', color: '#787671', margin: '3px 0 0', lineHeight: 1.4 }}>{n.message}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'hsl(var(--canvas))' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="glass mobile-hidden" style={{ width: '260px', borderRight: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid hsl(var(--border))' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '3px', color: 'hsl(var(--text-main))', letterSpacing: '-0.4px' }}>Santo Domingo</h2>
          <p style={{ fontSize: '12px', fontWeight: '500', color: 'hsl(var(--slate))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agenda Parroquial</p>
        </div>

        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '8px',
                  backgroundColor: isActive ? 'hsl(var(--tint-lavender))' : 'transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--slate))',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}>
                  {item.icon} {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '12px 12px 20px', borderTop: '1px solid hsl(var(--border))' }}>
          <div style={{ padding: '8px 12px 12px' }}>
            <p style={{ fontWeight: '600', fontSize: '13px', color: 'hsl(var(--text-main))', margin: 0 }}>{userData?.nombre || 'Usuario'}</p>
            <p style={{ fontSize: '11px', color: 'hsl(var(--slate))', textTransform: 'capitalize', margin: '2px 0 0' }}>{userData?.rol || 'Sin rol'}</p>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '9px', borderRadius: '8px',
            backgroundColor: '#fff0f0', border: '1px solid #fcc',
            color: '#e03131', fontSize: '13px', fontWeight: '500',
            cursor: 'pointer', transition: 'all 0.15s ease'
          }}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <div style={{
          height: '56px', minHeight: '56px',
          borderBottom: '1px solid hsl(var(--border))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          backgroundColor: 'hsl(var(--canvas))',
          zIndex: 30,
        }}>
          {/* Mobile title */}
          <div className="md:hidden">
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: 'hsl(var(--text-main))', letterSpacing: '-0.3px' }}>Santo Domingo</h2>
          </div>
          {/* Desktop spacer */}
          <div className="mobile-hidden" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Bell button */}
            <div style={{ position: 'relative' }} ref={panelRef}>
              <button
                onClick={handleOpenNotifications}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: showNotifications ? 'hsl(var(--surface))' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease', position: 'relative'
                }}
              >
                <Bell size={18} color={showNotifications ? 'hsl(var(--primary))' : 'hsl(var(--slate))'} />

                {/* Red dot - appears when unreadCount > 0 */}
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                      style={{
                        position: 'absolute', top: '5px', right: '5px',
                        width: '9px', height: '9px',
                        backgroundColor: '#e03131',
                        borderRadius: '50%',
                        border: '2px solid #ffffff',
                      }}
                    />
                  )}
                </AnimatePresence>
              </button>

              <NotificationPanel />
            </div>

            {/* Mobile logout */}
            <button
              className="md:hidden"
              onClick={handleLogout}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1px solid #fcc', backgroundColor: '#fff0f0',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={16} color="#e03131" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ flex: 1, padding: '20px', overflowY: 'auto', paddingBottom: '90px' }}
          className="md:p-8"
        >
          {children}
        </motion.div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '65px',
        backgroundColor: 'hsl(var(--canvas))',
        borderTop: '1px solid hsl(var(--border))',
        display: 'flex',
        zIndex: 50,
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--slate))',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}>
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                style={{
                  padding: '4px 14px', borderRadius: '16px',
                  backgroundColor: isActive ? 'hsl(var(--tint-lavender))' : 'transparent',
                  marginBottom: '2px', transition: 'background-color 0.2s ease'
                }}
              >
                {item.icon}
              </motion.div>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '500', letterSpacing: '0.01em' }}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
