import PantallaInicioYouTube, { type VideoItem } from './Buscador'

const items: VideoItem[] = [
  { id: 1, title: 'Mi video 1', thumbnail: '/uploads/thumb1.jpg', href: '/ver/1', meta: '12:34' },
  { id: 2, title: 'Mi video 2', thumbnail: '/uploads/thumb2.jpg', href: '/ver/2', meta: '8:05' },
  // ...
]

export default function Inicio() {
  return <PantallaInicioYouTube items={items} title="Inicio" placeholder="Buscar" />
}
