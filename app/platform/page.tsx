'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { getPopularUsers } from '@/service/user.service';
import TrackCard from '@/components/layout/TrackCard';
import UploadTrackModal from '@/components/layout/UploadTrackModal';
import styles from './library.module.css';

type Profile = { id: string; display_name: string | null; avatar_url: string | null };
type Track = { id: string; title: string; audio_url: string; cover_url?: string; duration?: number; content_type?: string; genre?: string; is_downloadable?: boolean; profiles?: { display_name?: string; avatar_url?: string } | null };
const paths: Record<string, string> = { home: 'M3 10 12 3l9 7v10H3Z M9 20v-7h6v7', music: 'M9 18V5l11-2v13 M9 18c0 4-7 4-7 0s7-4 7 0 M20 16c0 4-7 4-7 0s7-4 7 0', explore: 'm16 8-3 5-5 3 3-5Z M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M18 8h4 M20 6v4 M19 15a4 4 0 0 1 3 4v2', download: 'M12 3v12m-5-5 5 5 5-5 M4 16v5h16v-5', settings: 'M4 7h16 M4 17h16 M8 4v6 M16 14v6', search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', grid: 'M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z', list: 'M8 5h13 M8 12h13 M8 19h13 M3 5h1 M3 12h1 M3 19h1', plus: 'M12 5v14 M5 12h14', menu: 'M4 6h16 M4 12h16 M4 18h16' };
function Icon({ name }: { name: string }) { return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>; }
const navigation = [{ icon: 'home', text: 'Inicio', href: '/platform' }, { icon: 'music', text: 'Mis sets', href: '/platform/mis-sets' }, { icon: 'explore', text: 'Explorar', href: '/platform/explorar' }, { icon: 'users', text: 'Comunidad', href: '/platform/personas' }, { icon: 'download', text: 'Descargas', href: '/platform/descargas' }, { icon: 'settings', text: 'Configuración', href: '/platform/settings' }];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function PlatformPage() {
  const { user, loading, logoutLoading, logout, error: authError } = useAuth();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [genre, setGenre] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [people, setPeople] = useState<Profile[]>([]);
  const [peopleStatus, setPeopleStatus] = useState('loading');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState('loading');
  const profileMenu = useRef<HTMLDivElement>(null);
  const loadTracks = useCallback(async () => {
    setStatus('loading');
    try {
      const { data, error } = await supabase.from('tracks').select('*, profiles:user_id(display_name, avatar_url)').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      setTracks((data || []) as Track[]); setStatus('ready');
    } catch { setStatus('error'); }
  }, []);
  useEffect(() => { if (user?.id) void loadTracks(); }, [user?.id, loadTracks]);
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    getPopularUsers().then(data => { if (active) { setPeople(data); setPeopleStatus('ready'); } }).catch(() => { if (active) setPeopleStatus('error'); });
    supabase.from('profiles').select('id, display_name, avatar_url').eq('id', user.id).single().then(({ data }) => { if (active) setProfile(data); });
    return () => { active = false; };
  }, [user?.id]);
  useEffect(() => {
    function close(event: PointerEvent) { if (!profileMenu.current?.contains(event.target as Node)) setProfileOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') { setProfileOpen(false); setSidebarOpen(false); } }
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);
  const types = Array.from(new Set(tracks.map(track => track.content_type).filter((value): value is string => Boolean(value)))).sort();
  const genres = Array.from(new Set(tracks.map(track => track.genre).filter((value): value is string => Boolean(value)))).sort();
  const results = tracks.filter(track => (!type || track.content_type === type) && (!genre || track.genre === genre) && normalize(`${track.title} ${track.profiles?.display_name || ''} ${track.genre || ''}`).includes(normalize(query.trim())));
  function clearFilters() { setQuery(''); setType(''); setGenre(''); }
  if (loading) return <div className={styles.loading} role="status">Preparando tu zona…</div>;
  if (!user) return null;
  return <div className={styles.library}>
    <header className={styles.header}>
      <button type="button" className={styles.menuToggle} aria-label="Abrir navegación" aria-expanded={sidebarOpen} aria-controls="library-navigation" onClick={() => setSidebarOpen(!sidebarOpen)}><Icon name="menu" /></button>
      <Link href="/platform" className={styles.brand}>ZONA<span>MIX</span><sup>®</sup></Link>
      <label className={styles.search}><Icon name="search" /><input type="search" aria-label="Buscar tracks, DJs o géneros" placeholder="Busca un track, un DJ, un nuevo sonido…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <button type="button" className={styles.upload} onClick={() => setUploadOpen(true)}><Icon name="plus" /><span>Subir track</span></button>
      <div ref={profileMenu} className={styles.profileMenu}><button type="button" className={styles.avatar} aria-label="Abrir menú de perfil" aria-expanded={profileOpen} aria-controls="profile-options" onClick={() => setProfileOpen(!profileOpen)}>{profile?.avatar_url ? <Image src={profile.avatar_url} alt="" width={36} height={36} /> : (profile?.display_name || 'DJ').slice(0, 2).toUpperCase()}</button>{profileOpen && <div id="profile-options" className={styles.dropdown}><strong>{profile?.display_name || 'Mi cuenta'}</strong><Link href="/platform/profile">Ver mi perfil</Link><Link href="/platform/settings">Configuración</Link><button type="button" onClick={logout} disabled={logoutLoading}>{logoutLoading ? 'Cerrando sesión…' : 'Cerrar sesión'}</button></div>}</div>
    </header>
    {sidebarOpen && <button className={styles.backdrop} aria-label="Cerrar navegación" onClick={() => setSidebarOpen(false)} />}
    <aside id="library-navigation" className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}><p className={styles.navLabel}>TU ESPACIO</p><nav aria-label="Navegación de la plataforma">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={item.href === '/platform' ? 'page' : undefined} className={item.href === '/platform' ? styles.activeLink : ''}><Icon name={item.icon} />{item.text}</Link>)}</nav><div className={styles.sidebarNote}><span>HECHO PARA DJs</span><p>Tu sonido.<br />Tu siguiente nivel.</p><Link href="/platform/personas">Encuentra tu comunidad ↗</Link></div><p className={styles.copyright}>Zona Mix © 2026</p></aside>
    <main className={styles.main}>
      {authError && <p role="alert" className="mb-4 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{authError}</p>}
      <div className={styles.welcome}><div><p className={styles.eyebrow}>TU SONIDO. TU ZONA.</p><h1>Encuentra tu próximo <em>gran mix.</em></h1><p>Descubre nuevos sonidos y dale tu firma a la próxima sesión.</p></div><span className={styles.welcomeArt} aria-hidden="true">◎</span></div>
      <section aria-labelledby="library-title"><div className={styles.sectionHeading}><div><h2 id="library-title">Biblioteca</h2><p>Lo último de la comunidad, listo para tu próxima mezcla.</p></div><Link href="/platform/explorar">Explorar todo ↗</Link></div>
        <div className={styles.toolbar}><div className={styles.typeFilters} aria-label="Filtrar por tipo"><button type="button" className={!type ? styles.selected : ''} aria-pressed={!type} onClick={() => setType('')}>Todos</button>{types.map(value => <button type="button" key={value} className={type === value ? styles.selected : ''} aria-pressed={type === value} onClick={() => setType(value)}>{value}</button>)}</div><div className={styles.viewControls}><select aria-label="Filtrar por género" value={genre} onChange={event => setGenre(event.target.value)}><option value="">Todos los géneros</option>{genres.map(value => <option key={value}>{value}</option>)}</select><div className={styles.viewToggle}><button type="button" aria-label="Vista de cuadrícula" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><Icon name="grid" /></button><button type="button" aria-label="Vista de lista" aria-pressed={view === 'list'} onClick={() => setView('list')}><Icon name="list" /></button></div></div></div>
        <div className={styles.resultSummary} aria-live="polite"><span>{status === 'ready' ? `${results.length} ${results.length === 1 ? 'track disponible' : 'tracks disponibles'}` : status === 'loading' ? 'Buscando sonidos…' : 'Biblioteca no disponible'}</span>{(query || type || genre) && <button type="button" onClick={clearFilters}>Limpiar filtros ×</button>}</div>
        {status === 'loading' ? <div className={styles.grid} aria-label="Cargando biblioteca" aria-busy="true">{[1, 2, 3, 4].map(item => <div key={item} className={styles.skeleton} />)}</div> : status === 'error' ? <div className={styles.empty} role="alert"><h3>No pudimos cargar la biblioteca</h3><p>Comprueba tu conexión y vuelve a intentarlo.</p><button onClick={loadTracks}>Reintentar</button></div> : results.length ? <div className={view === 'grid' ? styles.grid : styles.list}>{results.map(track => <TrackCard key={track.id} {...track} artist={track.profiles?.display_name || 'DJ Anónimo'} userId={user.id} view={view} />)}</div> : <div className={styles.empty}><Icon name="music" /><h3>{tracks.length ? 'No encontramos ese sonido' : 'Tu comunidad empieza a sonar aquí'}</h3><p>{tracks.length ? 'Prueba otro nombre, artista o género.' : 'Comparte el primer track y abre la sesión.'}</p><button onClick={tracks.length ? clearFilters : () => setUploadOpen(true)}>{tracks.length ? 'Ver todos los tracks' : 'Subir mi primer track'}</button></div>}
      </section>
      <section className={styles.community} aria-labelledby="community-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>CONECTA EN TU FRECUENCIA</p><h2 id="community-title">Detrás de cada mezcla, un DJ.</h2></div><Link href="/platform/personas">Ver comunidad ↗</Link></div><div className={styles.people}>{peopleStatus === 'loading' ? <p role="status">Cargando comunidad…</p> : peopleStatus === 'error' ? <p>No pudimos cargar los perfiles. <Link href="/platform/personas">Ir a comunidad</Link></p> : people.length ? people.map(person => <Link key={person.id} href={`/platform/profile/${person.id}`} className={styles.person}>{person.avatar_url ? <Image src={person.avatar_url} alt="" width={52} height={52} /> : <span className={styles.personInitials}>{(person.display_name || 'DJ').slice(0, 2).toUpperCase()}</span>}<div><strong>{person.display_name || 'DJ Anónimo'}</strong><span>Miembro de Zona Mix</span></div><span aria-hidden="true">↗</span></Link>) : <p>Los perfiles de la comunidad aparecerán aquí.</p>}</div></section>
    </main>
    <UploadTrackModal userId={user.id} isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onTrackUploaded={() => { setUploadOpen(false); void loadTracks(); }} />
    {logoutLoading && <div className={styles.logoutOverlay} role="status">Cerrando sesión…</div>}
  </div>;
}
