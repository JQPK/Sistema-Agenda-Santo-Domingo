'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { Plus, Trash2, UserPlus, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const rolColors = {
  parroco:   { bg: '#e6e0f5', color: '#5645d4' },
  secretario:{ bg: '#fef7d6', color: '#dd5b00' },
  sacristan: { bg: '#d9f3e1', color: '#1aae39' },
  limpieza:  { bg: '#f6f5f4', color: '#787671' },
};

export default function UsuariosPage() {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('secretario');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!uid || !nombre || !email) return;
    try {
      await setDoc(doc(db, 'users', uid), { nombre, email, rol, estado: 'Activo', createdAt: serverTimestamp() });
      // Notificación automática
      await addDoc(collection(db, 'notifications'), {
        title: `Nuevo usuario registrado`,
        message: `${nombre} (${email}) — Rol: ${rol}`,
        type: 'usuario',
        refId: uid,
        createdAt: serverTimestamp(),
        read: false,
      });
      setIsModalOpen(false);
      setUid(''); setNombre(''); setEmail(''); setRol('secretario');
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar el acceso a este usuario?')) {
      await deleteDoc(doc(db, 'users', id));
      fetchUsers();
    }
  };

  if (userData?.rol !== 'parroco') {
    return (
      <DashboardLayout>
        <div style={{ backgroundColor: '#fff0f0', border: '1px solid #fcc', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Shield size={24} color="#e03131" />
          <div>
            <p style={{ fontWeight: '600', color: '#e03131', margin: 0 }}>Acceso Denegado</p>
            <p style={{ color: '#787671', fontSize: '13px', margin: 0, marginTop: '4px' }}>Solo el párroco puede administrar usuarios.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Administración</p>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', margin: 0, letterSpacing: '-0.3px' }}>Usuarios</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ fontSize: '13px', padding: '9px 14px', flexShrink: 0 }}>
          <UserPlus size={15} /> Nuevo
        </button>
      </div>

      {/* Users list as cards (mobile-friendly) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#a4a097' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#a4a097', border: '1px dashed #e5e3df', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>Sin usuarios registrados</p>
            </div>
          )}
          {users.map(u => {
            const rc = rolColors[u.rol] || rolColors.limpieza;
            return (
              <div key={u.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e3df', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Avatar */}
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: rc.color }}>
                    {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nombre}</p>
                  <p style={{ fontSize: '12px', color: '#787671', margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                </div>
                {/* Role badge */}
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '9999px', backgroundColor: rc.bg, color: rc.color, flexShrink: 0, textTransform: 'capitalize' }}>
                  {u.rol}
                </span>
                {/* Delete */}
                {userData.uid !== u.id && (
                  <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #fcc', backgroundColor: 'transparent', cursor: 'pointer', color: '#e03131', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
          >
            <motion.form 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onSubmit={handleSaveUser} 
              style={{ backgroundColor: '#ffffff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '480px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header fijo */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e3df', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a1a', margin: 0, letterSpacing: '-0.2px' }}>Agregar usuario</p>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e5e3df', cursor: 'pointer', background: '#f6f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              {/* Zona scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                {[
                  { label: 'UID (Firebase Auth ID)', val: uid, set: setUid, placeholder: 'Ej. Yx3k9...', hint: 'El usuario crea su cuenta primero, luego ingresa su UID.' },
                  { label: 'Nombre Completo', val: nombre, set: setNombre, placeholder: 'Juan García' },
                  { label: 'Email', val: email, set: setEmail, placeholder: 'usuario@iglesia.com', type: 'email' }
                ].map(f => (
                  <div className="input-group" key={f.label}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
                    <input className="input" type={f.type || 'text'} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} required />
                    {f.hint && <span style={{ fontSize: '11px', color: '#a4a097', marginTop: '4px', display: 'block' }}>{f.hint}</span>}
                  </div>
                ))}
                <div className="input-group">
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#787671', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rol</label>
                  <select className="input" value={rol} onChange={e => setRol(e.target.value)}>
                    <option value="parroco">Párroco</option>
                    <option value="secretario">Secretario</option>
                    <option value="sacristan">Sacristán</option>
                    <option value="limpieza">Limpieza</option>
                  </select>
                </div>
              </div>
              {/* Botones siempre visibles */}
              <div style={{ padding: '14px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', borderTop: '1px solid #e5e3df', display: 'flex', gap: '10px', flexShrink: 0, backgroundColor: '#ffffff' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
