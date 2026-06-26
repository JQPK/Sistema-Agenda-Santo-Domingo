'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, UserPlus, Shield } from 'lucide-react';

export default function UsuariosPage() {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [uid, setUid] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('secretario');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!uid || !nombre || !email) return;

    try {
      // In a real app, user must be created in Auth first. 
      // For this MVP, we manage roles in Firestore. The Parroco would ask the user to register, 
      // or use a Firebase Function to create the auth account. 
      // Here we simulate the Firestore assignment.
      await setDoc(doc(db, 'users', uid), {
        nombre,
        email,
        rol,
        estado: 'Activo',
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setUid(''); setNombre(''); setEmail(''); setRol('secretario');
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
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
        <div className="card glass">
          <h2 className="text-xl text-red-600 flex items-center gap-2"><Shield /> Acceso Denegado</h2>
          <p className="mt-2 text-muted">Solo el párroco tiene permisos para administrar usuarios.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '2rem' }}>Gestión de Usuarios</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} /> Nuevo Usuario
        </button>
      </header>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="text-xl font-bold mb-4">Agregar Usuario / Asignar Rol</h2>
            <form onSubmit={handleSaveUser}>
              <div className="input-group">
                <label>UID (Firebase Auth ID)</label>
                <input className="input" value={uid} onChange={e => setUid(e.target.value)} placeholder="Ej. Yx3k9..." required />
                <span className="text-xs text-muted">El usuario debe crear su cuenta primero, luego ingresa su UID aquí para asignarle el rol.</span>
              </div>
              <div className="input-group">
                <label>Nombre Completo</label>
                <input className="input" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Rol</label>
                <select className="input" value={rol} onChange={e => setRol(e.target.value)}>
                  <option value="parroco">Párroco</option>
                  <option value="secretario">Secretario</option>
                  <option value="sacristan">Sacristán</option>
                  <option value="limpieza">Limpieza</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card glass">
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Rol</th>
                <th style={{ padding: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <td style={{ padding: '1rem' }}>{u.nombre}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '1rem', 
                      backgroundColor: u.rol === 'parroco' ? '#dbeafe' : u.rol === 'secretario' ? '#fef3c7' : '#f3f4f6',
                      color: u.rol === 'parroco' ? '#1e40af' : u.rol === 'secretario' ? '#92400e' : '#374151',
                      fontSize: '0.875rem'
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {userData.uid !== u.id && (
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteUser(u.id)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No hay usuarios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
