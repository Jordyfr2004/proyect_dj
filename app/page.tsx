"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const sections = ["hero", "features", "community"];
  const [currentSection, setCurrentSection] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [scrollY, setScrollY] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Scroll listener para actualizar sección actual y capturar scrollY
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      setScrollY(window.scrollY);

      sections.forEach((id, index) => {
        const section = document.getElementById(id);
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setCurrentSection(index);
          }
        }
      });
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

  const scrollToNext = () => {
    if (currentSection < sections.length - 1) {
      const nextSection = document.getElementById(
        sections[currentSection + 1]
      );
      nextSection?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-black text-zinc-200 scroll-smooth relative overflow-x-hidden">
      {/* Elemento de audio invisible */}
      <audio ref={audioRef} onEnded={() => {}} preload="auto">
        <source src="/Romeo Santos, El Chaval de la Bachata - Canalla (Official Video).mp3" type="audio/mpeg" />
      </audio>

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(120,0,0,0.25),_transparent_70%)]" />

        {/* Orbe flotante con glow y efecto de bajos */}
        <div className="absolute -top-40 -right-40 sm:-top-20 sm:-right-20 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-red-900/30 rounded-full blur-3xl animate-bass-pulse" />
        <div className="absolute -bottom-20 -left-20 sm:-bottom-10 sm:-left-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-red-900/20 rounded-full blur-3xl animate-bass-pulse" style={{animationDelay: "0.5s"}} />

        <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-500 bg-clip-text text-transparent animate-fadeIn drop-shadow-lg">
          DJ CONTROL HUB
        </h1>

        <p className="relative mt-4 sm:mt-6 max-w-xl text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed animate-fadeIn delay-200">
          Plataforma profesional para DJs que dominan la noche.
          Control total. Comunidad real. Sonido sin límites.
        </p>

        <div className="relative mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fadeIn delay-300">
          <a
            href="#features"
            className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full bg-red-900 hover:bg-red-800 transition-all duration-300 shadow-lg shadow-red-900/40 hover:scale-105"
          >
            Descubrir
          </a>

          <a
            href="#community"
            className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full border border-zinc-700 hover:border-red-800 hover:text-red-500 transition-all duration-300 hover:scale-105"
          >
            Comunidad
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-zinc-950 relative overflow-hidden"
      >
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255,0,0,.05) 25%, rgba(255,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(255,0,0,.05) 75%, rgba(255,0,0,.05) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(255,0,0,.05) 25%, rgba(255,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(255,0,0,.05) 75%, rgba(255,0,0,.05) 76%, transparent 77%, transparent)`,
            backgroundSize: "60px 60px",
            transform: `translateY(${Math.max(0, scrollY - 800) * 0.05}px)`,
          }}
        />

        {/* Glow effect con bajos */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full blur-3xl animate-bass-pulse"
          style={{
            background: `radial-gradient(circle, rgba(127,29,29,${Math.min(0.4, (scrollY - 800) / 2000)}) 0%, transparent 70%)`,
          }}
        />

        <h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-zinc-100 relative z-10 animate-fadeIn"
          style={{
            transform: `translateY(${Math.max(0, scrollY - 800) * 0.1}px) scale(${Math.min(1.1, 0.9 + (scrollY - 800) / 3000)})`,
            opacity: Math.min(1, Math.max(0, (scrollY - 600) / 400)),
          }}
        >
          Potencia Profesional
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-5xl relative z-10 px-2 sm:px-0">

          <div 
            id="card-1"
            data-reveal
            className="p-5 sm:p-6 md:p-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-all duration-500 shadow-lg shadow-black/40 hover:-translate-y-2 border border-zinc-800"
            style={{
              opacity: visibleCards.has("card-1") ? 1 : 0,
              transform: visibleCards.has("card-1") 
                ? `translateX(0) rotateY(0deg) scale(1)` 
                : `translateX(-80px) rotateY(25deg) scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div style={{
              transform: `rotateZ(${Math.max(0, scrollY - 900) * 0.5}deg)`,
            }}>
              <MixerIcon />
            </div>
            <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-zinc-100">
              Gestión de Sets
            </h3>
            <p className="mt-2 sm:mt-3 text-zinc-400 text-xs sm:text-sm">
              Organiza, programa y analiza tus sesiones con precisión técnica.
            </p>
          </div>

          <div 
            id="card-2"
            data-reveal
            className="p-5 sm:p-6 md:p-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-all duration-500 shadow-lg shadow-black/40 hover:-translate-y-2 border border-zinc-800"
            style={{
              opacity: visibleCards.has("card-2") ? 1 : 0,
              transform: visibleCards.has("card-2") 
                ? `translateY(0) scale(1)` 
                : `translateY(80px) scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
            }}
          >
            <div style={{
              transform: `rotateZ(${Math.max(0, (scrollY - 900) * 0.5 + 30)}deg)`,
            }}>
              <WaveIcon />
            </div>
            <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-zinc-100">
              Análisis de Audio
            </h3>
            <p className="mt-2 sm:mt-3 text-zinc-400 text-xs sm:text-sm">
              Visualiza energía, BPM y estructura en tiempo real.
            </p>
          </div>

          <div 
            id="card-3"
            data-reveal
            className="p-5 sm:p-6 md:p-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-all duration-500 shadow-lg shadow-black/40 hover:-translate-y-2 border border-zinc-800"
            style={{
              opacity: visibleCards.has("card-3") ? 1 : 0,
              transform: visibleCards.has("card-3") 
                ? `translateX(0) rotateY(0deg) scale(1)` 
                : `translateX(80px) rotateY(-25deg) scale(0.8)`,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s",
            }}
          >
            <div style={{
              transform: `rotateZ(${Math.max(0, (scrollY - 900) * 0.5 + 60)}deg)`,
            }}>
              <NetworkIcon />
            </div>
            <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-zinc-100">
              Red de DJs
            </h3>
            <p className="mt-2 sm:mt-3 text-zinc-400 text-xs sm:text-sm">
              Conecta con artistas y promotores de la escena global.
            </p>
          </div>

        </div>
      </section>

      {/* COMMUNITY */}
      <section
        id="community"
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      >
        {/* Gradient Orbs con efecto de bajos */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full blur-3xl animate-bass-pulse"
          style={{
            background: `radial-gradient(circle, rgba(127,29,29,${Math.min(0.5, (scrollY - 1600) / 1500)}) 0%, transparent 70%)`,
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-40 sm:w-64 md:w-80 h-40 sm:h-64 md:h-80 rounded-full blur-3xl animate-bass-pulse"
          style={{
            background: `radial-gradient(circle, rgba(139,0,0,${Math.min(0.4, (scrollY - 1800) / 2000)}) 0%, transparent 70%)`,
            animationDelay: "0.3s",
          }}
        />

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-zinc-100 relative z-10 animate-fadeIn"
          style={{
            transform: `translateY(${Math.max(0, scrollY - 1600) * 0.08}px) scale(${Math.min(1.15, 0.85 + (scrollY - 1600) / 2500)})`,
            opacity: Math.min(1, Math.max(0, (scrollY - 1400) / 400)),
          }}
        >
          La Noche Te Espera
        </h2>

        <p 
          className="max-w-2xl text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed relative z-10 animate-fadeIn delay-200"
          style={{
            transform: `translateY(${Math.max(0, scrollY - 1700) * 0.06}px)`,
            opacity: Math.min(1, Math.max(0, (scrollY - 1500) / 400)),
          }}
        >
          Únete a la plataforma que redefine la cultura DJ.
          Tecnología sólida, estética oscura y comunidad auténtica.
        </p>

        <div className="mt-8 sm:mt-10 relative z-10">
          <a 
            href="/auth/login"
            className="px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base rounded-full bg-red-900 hover:bg-red-800 text-zinc-100 transition-all duration-300 shadow-lg shadow-red-900/40 hover:scale-105 inline-block text-center"
          >
            Empezar
          </a>
        </div>
      </section>

      {/* FLECHA FLOTANTE */}
      {currentSection < sections.length - 1 && (
        <button
          onClick={scrollToNext}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-full bg-red-900 hover:bg-red-800 shadow-lg shadow-red-900/40 transition-all duration-300 animate-bounce z-50"
        >
          <svg
            className="w-6 h-6 text-zinc-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

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

