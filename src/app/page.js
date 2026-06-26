import DashboardLayout from '@/components/DashboardLayout';

export default function Home() {
  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-8">
        <h1 style={{ fontSize: '2rem' }}>Panel Principal</h1>
      </header>

      <div className="card glass">
        <h3 style={{ marginBottom: '1rem' }}>Bienvenido al Sistema de Agenda</h3>
        <p className="text-muted">Seleccione una opción en el menú lateral para comenzar. Desde aquí podrá ver un resumen general pronto.</p>
      </div>
    </DashboardLayout>
  );
}
