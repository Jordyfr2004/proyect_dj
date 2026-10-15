"use client";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Link from "next/link";
import styles from "./page.module.css";

function Waveform() {
  return <div className={styles.waveform} aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ height: `${18 + (i * 37 + 13) % 78}%`, animationDelay: `${i % 9 * -.16}s` } as CSSProperties} />)}</div>;
}
const features = [
  { number: "01", title: "Encuentra tu próximo track.", text: "Explora música y descubre nuevos sonidos para darle identidad a tu próxima sesión.", tag: "EXPLORA", href: "/platform/explorar", action: "Explorar música" },
  { number: "02", title: "Tu selección. Tu firma.", text: "Comparte tus sets y edits. Dale un lugar a las mezclas que llevan tu estilo.", tag: "COMPARTE", href: "/platform/mis-sets", action: "Compartir mis sets" },
  { number: "03", title: "Conecta en otra frecuencia.", text: "Descubre otros DJs, visita sus perfiles y encuentra inspiración en la comunidad.", tag: "CONECTA", href: "/platform/personas", action: "Conocer la comunidad" },
];
export default function Home() {
  const [paused, setPaused] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  function resetTilt() { scene.current?.style.setProperty("--rx", "0deg"); scene.current?.style.setProperty("--ry", "0deg"); }
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    scene.current?.style.setProperty("--ry", `${((event.clientX - bounds.left) / bounds.width - .5) * 16}deg`);
    scene.current?.style.setProperty("--rx", `${-((event.clientY - bounds.top) / bounds.height - .5) * 12}deg`);
  }
  return <div className={`${styles.landing} ${paused ? styles.paused : ""}`}>
    <a href="#main" className={styles.skip}>Saltar al contenido</a>
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Zona Mix, inicio"><span className={styles.brandIcon} aria-hidden="true">▥</span>ZONA<span>MIX</span><sup>®</sup></Link>
      <nav aria-label="Navegación principal"><a href="#features">La experiencia</a><a href="#community">Comunidad</a></nav>
      <Link href="/auth/login" className={styles.login}>Iniciar sesión <span aria-hidden="true">↗</span></Link>
    </header>
    <main id="main">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> EL PUNTO DE ENCUENTRO DE LOS DJs</p>
          <h1 id="hero-title">Tu sonido.<br />Tu zona.<br /><em>Sin límites.</em></h1>
          <p className={styles.intro}>La próxima gran mezcla empieza aquí. Descubre música, comparte tus sets y conecta con quienes viven al mismo ritmo que tú.</p>
          <div className={styles.actions}><Link href="/auth/register" className={styles.primary}>Entra en la zona <span aria-hidden="true">↗</span></Link><a href="#features" className={styles.secondary}>Descubre la experiencia <span aria-hidden="true">↓</span></a></div>
          <p className={styles.heroNote}>◎ &nbsp; HECHO PARA DJs. MOVIDO POR LA MÚSICA.</p>
        </div>
        <div className={styles.visual} onPointerMove={tilt} onPointerLeave={resetTilt}>
          <div className={styles.orbit} aria-hidden="true" /><span className={styles.visualLabel}>THE SOUND OF YOUR NEXT SET</span>
          <div ref={scene} className={styles.scene} aria-hidden="true">
            <div className={styles.deck}>
              <div className={styles.deckTop}><span>ZM / ANALOG SERIES</span><span className={styles.led} /></div>
              <div className={styles.record}><div className={styles.recordLabel}><span>ZONA MIX</span><strong>ZM</strong><small>SIDE A · 33⅓ RPM</small></div><div className={styles.spindle} /></div>
              <div className={styles.tonearm}><i /></div>
              <div className={styles.deckBottom}><span className={styles.power}>●</span><span>DIRECT DRIVE<br /><b>FEEL THE FREQUENCY</b></span><span className={styles.deckDots}>▪ ▪ ▪</span></div>
            </div>
            <div className={styles.floatingTag}><span className={styles.led} /> EN TU FRECUENCIA <span>↗</span></div>
            <div className={styles.soundCard}><span>EL RITMO NO SE DETIENE</span><b>Tu próximo gran set.</b><Waveform /></div>
          </div>
          <div className={styles.visualBottom}><span>VOL. 001 / ZONA MIX</span><button type="button" aria-pressed={paused} onClick={() => { resetTilt(); setPaused(!paused); }}>{paused ? "▶ Activar animaciones" : "Ⅱ Pausar animaciones"}</button></div>
        </div>
      </section>
      <div className={styles.genreStrip} aria-label="Todos los estilos, una misma zona"><span>HOUSE</span><i>✳</i><span>REGGAETÓN</span><i>✳</i><span>TECHNO</span><i>✳</i><span>LATIN</span><i>✳</i><span>OPEN FORMAT</span></div>
      <section id="features" className={styles.features} aria-labelledby="features-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>EL SIGUIENTE NIVEL DE TU SESIÓN</p><h2 id="features-title">Más que música.<br /><span>Todo un movimiento.</span></h2></div><p>De ese primer track a la última mezcla.<br />Haz espacio para lo que viene.</p></div>
        <div className={styles.featureGrid}>{features.map(feature => <Link href={feature.href} key={feature.number} className={styles.feature}><div className={styles.featureTop}><span>{feature.number} / {feature.tag}</span><span aria-hidden="true">↗</span></div><div className={styles.featureArt} aria-hidden="true">{feature.number === "01" ? <><div className={styles.miniRecord} /><div className={styles.miniSleeve}>FIND<br />YOUR<br /><em>SOUND.</em></div></> : feature.number === "02" ? <div className={styles.mixArt}><span>YOUR NEXT SESSION</span><Waveform /><span>INTRO / EDIT / MIX</span></div> : <div className={styles.networkArt}><span>DJ</span><span>ZM</span><span>DJ</span><i /><i /></div>}</div><h3>{feature.title}</h3><p>{feature.text}</p><span className={styles.featureAction}>{feature.action} <span aria-hidden="true">↗</span></span></Link>)}</div>
      </section>
      <section id="community" className={styles.community} aria-labelledby="community-title"><div className={styles.communityArt} aria-hidden="true"><div /><div /><div /><span>ZM</span></div><div className={styles.communityCopy}><p className={styles.eyebrow}>DIFERENTES ESTILOS. LA MISMA PASIÓN.</p><h2 id="community-title">La música conecta.<br /><em>Tú pones el ritmo.</em></h2><p>Hay un mundo de sonidos al otro lado de tu cabina. Comparte lo que creas, descubre a otros DJs y encuentra tu lugar en Zona Mix.</p><Link href="/auth/register" className={styles.primary}>Únete a la comunidad <span aria-hidden="true">↗</span></Link></div></section>
    </main>
    <footer className={styles.footer}><Link href="/" className={styles.brand}>ZONA<span>MIX</span><sup>®</sup></Link><p>Tu sonido merece su propia zona.</p><a href="#main">Volver arriba ↑</a></footer>
  </div>;
}
