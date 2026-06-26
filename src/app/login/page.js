'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError('Credenciales incorrectas o usuario no encontrado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) return null;

  return (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'hsl(var(--surface))' }}>
      
      <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', margin: '16px', display: 'flex', flexDirection: 'column', zIndex: 10, padding: '48px 32px' }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'hsl(var(--text-main))' }}>Santo Domingo</h1>
          <p className="text-muted" style={{ fontWeight: '500', fontSize: '14px' }}>Sistema de Agenda Parroquial</p>
        </div>

        {error && (
          <div className="mb-4" style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex-col">
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail style={{ position: 'absolute', left: '0.75rem', color: 'hsl(var(--text-muted))' }} size={18} />
              <input
                id="email"
                type="email"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="usuario@parroquia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock style={{ position: 'absolute', left: '0.75rem', color: 'hsl(var(--text-muted))' }} size={18} />
              <input
                id="password"
                type="password"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4" 
            disabled={isSubmitting}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
