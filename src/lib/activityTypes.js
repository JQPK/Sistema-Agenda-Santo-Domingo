export const ACTIVITY_CATEGORIES = {
  'Misa': [
    'Renovacion de Votos', 'exequias', 'misa dominical', 'Novena', 'Vispera',
    'Misa de Fiesta (Dia Central)', 'Misa de difunto', 'Misa sin intención',
    'Misa Ordinaria', 'Misa comunitaria'
  ],
  'Sacramento': ['Bautizo', 'Matrimonio', 'Bautizo comunitario', 'Comunión', 'Confirmación'],
  'Liturgia': ['Liturgia'],
  'Reuniones': ['Reuniones'],
  'Charla': ['Bautizo', 'Confirmacion', 'Matrimonio', 'Formación']
};

export const COMMON_STATUSES = [
  'Pendiente de pago', 'falta cancelar S/.', 'cancelada', 
  'Anulada y no se devolvió nada', 'Anulada y Se devolvió S/.'
];

export const COMMON_LOCATIONS = ['Templo - central', 'Capilla', 'Otros'];

export const ACTIVITY_FIELDS_CONFIG = {
  'Renovacion de Votos': [
    { name: 'intencion', label: 'Intención', type: 'text', required: true },
    { name: 'esposo', label: 'Esposo (Nombre completo)', type: 'text', required: true },
    { name: 'esposa', label: 'Esposa (Nombre completo)', type: 'text', required: true },
    { name: 'quienesOfrecen', label: 'Quienes ofrecen la misa', type: 'text', required: false },
    { name: 'precio', label: 'Precio de la misa (S/.)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'exequias': [
    { name: 'intencion', label: 'Intención', type: 'text', required: true },
    { name: 'difuntos', label: 'Nombres de difuntos (separados por coma)', type: 'textarea', required: true },
    { name: 'ofrece', label: 'Ofrece', type: 'text', required: false },
    { name: 'intencion2_motivo', label: 'Motivo (Intención 2)', type: 'text', required: false },
    { name: 'intencion2_ofrece', label: 'Ofrece (Intención 2)', type: 'text', required: false },
    { name: 'precio', label: 'Precio de la misa (S/.)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'misa dominical': [
    { name: 'intencion', label: 'Intención', type: 'text', required: true },
    { name: 'motivo', label: 'Motivo', type: 'text', required: false },
    { name: 'ofrece', label: 'Ofrece', type: 'text', required: false },
    { name: 'intencion2_motivo', label: 'Motivo (Intención 2)', type: 'text', required: false },
    { name: 'intencion2_ofrece', label: 'Ofrece (Intención 2)', type: 'text', required: false },
    { name: 'precio', label: 'Precio de la misa (S/.)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  // Many others map to the same generic fields as misa dominical:
  'Novena': 'misa dominical',
  'Vispera': [
    { name: 'intencion', label: 'Intención', type: 'text', required: true },
    { name: 'motivo', label: 'Motivo', type: 'text', required: false },
    { name: 'ofrece', label: 'Ofrece', type: 'text', required: false },
    { name: 'intencion2_motivo', label: 'Motivo (Intención 2)', type: 'text', required: false },
    { name: 'intencion2_ofrece', label: 'Ofrece (Intención 2)', type: 'text', required: false },
    { name: 'precio', label: 'Precio de la misa (S/.)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'Misa de Fiesta (Dia Central)': 'misa dominical',
  'Misa de difunto': 'misa dominical',
  'Misa Ordinaria': 'misa dominical',
  'Misa sin intención': [
    { name: 'intencion', label: 'Intención', type: 'text', required: true },
    { name: 'motivo', label: 'Motivo', type: 'text', required: false },
    { name: 'ofrece', label: 'Ofrece', type: 'text', required: false },
    { name: 'intencion2_motivo', label: 'Motivo (Intención 2)', type: 'text', required: false },
    { name: 'intencion2_ofrece', label: 'Ofrece (Intención 2)', type: 'text', required: false },
    { name: 'precio', label: 'Precio de la misa (S/.)', type: 'number', defaultValue: 0, required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'Misa comunitaria': [
    { name: 'precio', label: 'Precio (S/.)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
  ],

  // Sacramentos
  'Bautizo': [
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'bautizado', label: 'Nombre del bautizado', type: 'text', required: true },
    { name: 'padre', label: 'Nombre completo del padre', type: 'text', required: false },
    { name: 'madre', label: 'Nombre completo de la madre', type: 'text', required: false },
    { name: 'padrino', label: 'Nombre completo del padrino', type: 'text', required: false },
    { name: 'madrina', label: 'Nombre completo de la madrina', type: 'text', required: false },
    { name: 'precio', label: 'Precio (S/.)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'Matrimonio': [
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'esposo', label: 'Nombre completo del esposo', type: 'text', required: true },
    { name: 'esposa', label: 'Nombre completo de la esposa', type: 'text', required: true },
    { name: 'padrinos', label: 'Nombre completo de los padrinos', type: 'textarea', required: false },
    { name: 'testigos', label: 'Nombre completo de los testigos', type: 'textarea', required: false },
    { name: 'precio', label: 'Precio (S/.)', type: 'number', required: true },
    { name: 'estado', label: 'Estado', type: 'select', options: COMMON_STATUSES, required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'Bautizo comunitario': [
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'precio', label: 'Precio por bautizado (S/.)', type: 'number', required: true },
  ],
  'Comunión': [
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'Confirmación': 'Comunión',

  // Liturgia
  'Liturgia': 'misa dominical',
  
  // Reuniones
  'Reuniones': [
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
  ],

  // Charlas
  'Charla Bautizo': [
    { name: 'lugar', label: 'Lugar', type: 'location', required: true },
    { name: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { name: 'cantidadNinos', label: 'Cantidad de niños por bautizar', type: 'number', required: true },
    { name: 'notas', label: 'Notas adicionales', type: 'textarea', required: false },
    { name: 'referencia', label: 'Número de referencia', type: 'text', required: false },
  ],
  'Charla Confirmacion': 'Comunión',
  'Charla Matrimonio': 'Comunión',
  'Charla Formación': 'Comunión',
};

// Helper function to resolve aliased fields
export const getFieldsForActivity = (type, category) => {
  let key = type;
  if (category === 'Charla') {
    key = `Charla ${type}`;
  }

  let fields = ACTIVITY_FIELDS_CONFIG[key] || [];
  if (typeof fields === 'string') {
    fields = ACTIVITY_FIELDS_CONFIG[fields];
  }
  return fields;
};
