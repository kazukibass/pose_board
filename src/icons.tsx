type IconProps = { name: 'play' | 'pause' | 'previous' | 'next' | 'first' | 'last' | 'duplicate' | 'plus' | 'trash' | 'undo' | 'redo' | 'menu' | 'close' }

export function Icon({ name }: IconProps) {
  const paths = {
    play: <path d="M8 5v14l11-7z" />,
    pause: <><path d="M7 5h4v14H7z" /><path d="M14 5h4v14h-4z" /></>,
    previous: <path d="m16 6-8 6 8 6z" />,
    next: <path d="m8 6 8 6-8 6z" />,
    first: <><path d="M5 5h2v14H5z" /><path d="m19 6-9 6 9 6z" /></>,
    last: <><path d="M17 5h2v14h-2z" /><path d="m5 6 9 6-9 6z" /></>,
    duplicate: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" /></>,
    undo: <path d="M9 7 4 12l5 5M5 12h8a6 6 0 0 1 6 6" />,
    redo: <path d="m15 7 5 5-5 5m4-5h-8a6 6 0 0 0-6 6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}
