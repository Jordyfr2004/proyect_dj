"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Scroll listener para capturar scrollY
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer para elementos que aparecen al scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const cards = document.querySelectorAll("[data-reveal]");
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => observerRef.current?.disconnect();
  }, []);

  // Reproducir música una sola vez al interactuar
  useEffect(() => {
    if (musicStarted) return;

    const playMusic = () => {
      if (!musicStarted && audioRef.current) {
        audioRef.current.play().catch(() => {});
        setMusicStarted(true);
      }
    };

    window.addEventListener("click", playMusic);
    window.addEventListener("scroll", playMusic);

    return () => {
      window.removeEventListener("click", playMusic);
      window.removeEventListener("scroll", playMusic);
    };
  }, [musicStarted]);

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-black text-zinc-200 scroll-smooth relative overflow-x-hidden">
      {/* Elemento de audio invisible */}
      <audio ref={audioRef} onEnded={() => {}} preload="auto">
        <source src="/Romeo Santos, El Chaval de la Bachata - Canalla (Official Video).mp3" type="audio/mpeg" />
      </audio>

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-screen w-full overflow-hidden"
      >
        {/* Imagen de fondo tipo DJ */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=1080&fit=crop")',
          }}
        >
          {/* Gradiente oscuro superpuesto */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
        </div>

        {/* Contenido superpuesto */}
        <div className="relative z-10 h-full min-h-screen flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white animate-fadeIn drop-shadow-lg mb-4">
            DJ CONTROL HUB
          </h1>

          <p className="mt-4 sm:mt-6 max-w-3xl text-base sm:text-lg md:text-xl text-zinc-200 leading-relaxed animate-fadeIn delay-200">
            Plataforma profesional para DJs que dominan la noche.
            Control total. Comunidad real. Sonido sin límites.
            <br className="hidden md:block" />
            
          </p>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 animate-fadeIn delay-300">
            <a
              href="/auth/login"
              className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg rounded-full bg-red-900 hover:bg-red-800 transition-all duration-300 shadow-lg shadow-red-900/60 hover:scale-105 font-semibold"
            >
              Empezar
            </a>

            <a
              href="#community"
              className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg rounded-full border-2 border-zinc-200 hover:border-red-500 hover:text-red-400 transition-all duration-300 hover:scale-105 font-semibold"
            >
              Comunidad
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden bg-black"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 text-zinc-100 relative z-10 animate-fadeIn">
          Lo que puedes hacer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl relative z-10 w-full">

          {/* Descargar Música */}
          <div 
            id="card-1"
            data-reveal
            className="group relative h-[500px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-900/50 transition-all duration-500 hover:scale-105 cursor-pointer"
            style={{
              opacity: visibleCards.has("card-1") ? 1 : 0,
              transform: visibleCards.has("card-1") 
                ? `scale(1)` 
                : `scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&h=600&fit=crop")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h3 className="text-3xl font-bold text-white mb-3">
                DESCARGAR MÚSICA
              </h3>
              <p className="text-zinc-300 text-base">
                Accede a miles de canciones para descargar y usar en tus sets. Música de calidad profesional para todos los géneros.
              </p>
            </div>
          </div>

          {/* Playlists de otros DJs */}
          <div 
            id="card-2"
            data-reveal
            className="group relative h-[500px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-900/50 transition-all duration-500 hover:scale-105 cursor-pointer"
            style={{
              opacity: visibleCards.has("card-2") ? 1 : 0,
              transform: visibleCards.has("card-2") 
                ? `scale(1)` 
                : `scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s",
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h3 className="text-3xl font-bold text-white mb-3">
                PLAYLISTS DE DJs
              </h3>
              <p className="text-zinc-300 text-base">
                Descubre y accede a playlists curadas por otros DJs profesionales. Inspírate con sus mejores selecciones.
              </p>
            </div>
          </div>

          {/* Venta de Remixes */}
          <div 
            id="card-3"
            data-reveal
            className="group relative h-[500px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-900/50 transition-all duration-500 hover:scale-105 cursor-pointer"
            style={{
              opacity: visibleCards.has("card-3") ? 1 : 0,
              transform: visibleCards.has("card-3") 
                ? `scale(1)` 
                : `scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s",
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h3 className="text-3xl font-bold text-white mb-3">
                VENTA DE REMIXES
              </h3>
              <p className="text-zinc-300 text-base">
                Compra y vende remixes entre colegas
              </p>
            </div>
          </div>

        </div>

        {/* Grid secundario para las 2 últimas tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-7xl relative z-10 w-full mt-8">

          {/* DJ EDITS + TOOLS */}
          <div 
            id="card-4"
            data-reveal
            className="group relative h-80 rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-900/50 transition-all duration-500 hover:scale-105 cursor-pointer"
            style={{
              opacity: visibleCards.has("card-4") ? 1 : 0,
              transform: visibleCards.has("card-4") 
                ? `scale(1)` 
                : `scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s",
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1501612780353-7e5c60a586d5?w=800&h=600&fit=crop")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h3 className="text-3xl font-bold text-white mb-3">
                SETS EDITS
              </h3>
              <p className="text-zinc-300 text-base">
                SET Edits personalizados que incluyen versiones Intro, Clean, Transición y mucho más.
              </p>
            </div>
          </div>

          {/* Aplicaciones Digitales */}
          <div 
            id="card-5"
            data-reveal
            className="group relative h-80 rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-900/50 transition-all duration-500 hover:scale-105 cursor-pointer"
            style={{
              opacity: visibleCards.has("card-5") ? 1 : 0,
              transform: visibleCards.has("card-5") 
                ? `scale(1)` 
                : `scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s",
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-20">
              <h3 className="text-4xl font-bold text-white mb-3 leading-relaxed">
                <span className="block">MÚSICA AL</span>
                <span className="block pl-10">ALCANCE DE</span>
                <span className="block pl-26">TUS MANOS</span>
              </h3>
            </div>
          </div>

        </div>
      </section>

      {/* Animaciones globales */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(60px);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes bass-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.6;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Card hover glow */
        div[data-reveal]:hover {
          box-shadow: 0 0 30px rgba(127, 29, 29, 0.5) !important;
        }

        /* Animate pulse */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .animate-bass-pulse {
          animation: bass-pulse 0.6s ease-in-out infinite;
        }

        /* Perspective para 3D */
        div[data-reveal] {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

/* ICONOS SVG */

function MixerIcon() {
  return (
    <svg className="w-10 h-10 text-red-700 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg className="w-10 h-10 text-red-700 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 12c2-6 4 6 6 0s4 6 6 0 4 6 6 0" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg className="w-10 h-10 text-red-700 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M8 12h8" />
    </svg>
  );
}

