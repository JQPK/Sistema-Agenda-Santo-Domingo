export default function manifest() {
  return {
    name: 'Agenda Parroquial Santo Domingo',
    short_name: 'Agenda Parroquia',
    description: 'Sistema de agenda para la parroquia',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/globe.svg', // Temporal icon until real ones are generated/added
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/globe.svg', // Temporal icon
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
