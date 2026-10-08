"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, ArrowRight, Gift, Heart, Play, RefreshCw, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { birthday, type StickerMoment, type VideoMemory } from "@/content/birthday";

const WishCakeScene = dynamic(() => import("./RoseScene"), {
  ssr: false,
  loading: () => <div className="keepsake-fallback" aria-hidden="true"><Heart /></div>,
});

function GiftOpening({ onComplete }: { onComplete: () => void }) {
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const pullX = useMotionValue(0);
  const ribbonScale = useTransform(pullX, [0, 135], [1, 0.25]);
  const ribbonOpacity = useTransform(pullX, [0, 110], [1, 0.18]);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const unwrap = useCallback(() => {
    if (opening) return;
    setOpening(true);
    timerRef.current = window.setTimeout(onComplete, reduced ? 180 : 1050);
  }, [onComplete, opening, reduced]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    if (diff > 35) {
      unwrap();
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  return (
    <motion.section
      className="gift-gate"
      aria-label="Open your birthday gift"
      animate={opening ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: reduced ? 0.1 : 0.38, delay: reduced ? 0 : 0.66 }}
    >
      <motion.div className="gift-paper gift-paper-left" animate={opening ? { x: "-104%", rotate: -4 } : { x: 0, rotate: 0 }} transition={{ duration: reduced ? 0.1 : 0.9, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div className="gift-paper gift-paper-right" animate={opening ? { x: "104%", rotate: 4 } : { x: 0, rotate: 0 }} transition={{ duration: reduced ? 0.1 : 0.9, ease: [0.76, 0, 0.24, 1] }} />

      <motion.div className="gift-center" animate={opening ? { opacity: 0, y: -45, scale: 1.08 } : { opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduced ? 0.1 : 0.55 }}>
        <motion.div className="gift-tag" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, rotate: -10, scale: 0.88 }} animate={{ opacity: 1, y: 0, rotate: -4, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="gift-tag-image">
            <Image
              src="/media/stickers/spidey-flowers.jpg"
              alt="Spider-Man offering pink flowers"
              fill
              priority
              loading="eager"
              unoptimized
              sizes="(max-width: 600px) 58vw, 280px"
            />
          </div>
          <span>A little something for</span>
          <strong>{birthday.name}</strong>
        </motion.div>

        <div
          className="gift-ribbon-track"
          onClick={unwrap}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.span className="gift-ribbon-line" style={{ scaleX: ribbonScale, opacity: ribbonOpacity }} />
          <motion.button
            className="gift-ribbon-pull"
            type="button"
            drag="x"
            dragConstraints={{ left: 0, right: 135 }}
            dragElastic={0.08}
            dragMomentum={false}
            dragSnapToOrigin
            style={{ x: pullX }}
            whileDrag={{ scale: 1.08 }}
            onClick={(e) => {
              e.stopPropagation();
              unwrap();
            }}
            onDrag={(_, info) => {
              if (info.offset.x > 35 || pullX.get() > 35) unwrap();
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 30 || pullX.get() > 30 || info.velocity.x > 80) unwrap();
            }}
            aria-label="Drag or tap the ribbon to open your gift"
          >
            <Gift size={18} />
          </motion.button>
          <span className="gift-pull-copy">pull or tap ribbon</span>
          <ArrowRight className="gift-pull-arrow" size={18} />
        </div>

        <button className="gift-open-button" type="button" onClick={unwrap}>
          <Sparkles size={17} />
          <span>Tap to open your gift</span>
        </button>
      </motion.div>
    </motion.section>
  );
}

function SoundButton() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const userMutedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const fadeAnimationRef = useRef<number | null>(null);

  const targetVolume = birthday.audioVolume ?? 0.18;
  const startTime = birthday.audioStartTime ?? 25;
  const hasAudio = Boolean(birthday.audioSrc);

  const cancelFade = useCallback(() => {
    if (fadeAnimationRef.current !== null) {
      cancelAnimationFrame(fadeAnimationRef.current);
      fadeAnimationRef.current = null;
    }
  }, []);

  const fadeTo = useCallback(
    (target: number, durationMs: number, onComplete?: () => void) => {
      const audio = audioRef.current;
      if (!audio) return;
      cancelFade();

      const start = audio.volume;
      const delta = target - start;
      if (Math.abs(delta) < 0.005) {
        audio.volume = target;
        onComplete?.();
        return;
      }

      const startTimestamp = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTimestamp;
        const progress = Math.min(1, elapsed / durationMs);
        const current = Math.max(0, Math.min(1, start + delta * progress));
        audio.volume = current;

        if (progress < 1) {
          fadeAnimationRef.current = requestAnimationFrame(step);
        } else {
          audio.volume = target;
          fadeAnimationRef.current = null;
          onComplete?.();
        }
      };

      fadeAnimationRef.current = requestAnimationFrame(step);
    },
    [cancelFade]
  );

  const fadeIn = useCallback(
    (customTarget?: number) => {
      const audio = audioRef.current;
      if (!audio || !hasAudio) return;

      const finalTarget = customTarget ?? targetVolume;

      if (!hasStartedRef.current || audio.currentTime < startTime - 0.5) {
        try {
          audio.currentTime = startTime;
        } catch {
          // ignore until ready
        }
        hasStartedRef.current = true;
      }

      audio.muted = false;
      if (audio.paused) {
        audio.volume = 0;
        audio
          .play()
          .then(() => {
            setIsMuted(false);
            fadeTo(finalTarget, 1600);
          })
          .catch(() => {
            // Autoplay blocked by browser policy; awaits user gesture
          });
      } else {
        setIsMuted(false);
        fadeTo(finalTarget, 1600);
      }
    },
    [hasAudio, targetVolume, startTime, fadeTo]
  );

  const fadeOut = useCallback(
    (pauseAfter = true) => {
      const audio = audioRef.current;
      if (!audio) return;
      setIsMuted(true);
      fadeTo(0, 1000, () => {
        if (pauseAfter) {
          audio.pause();
        }
      });
    },
    [fadeTo]
  );

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;

    if (isMuted || audio.paused || audio.volume <= 0.01) {
      userMutedRef.current = false;
      fadeIn();
    } else {
      userMutedRef.current = true;
      fadeOut(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;

    audio.volume = 0;

    const handleLoadedMetadata = () => {
      if (audio.currentTime < startTime - 0.5) {
        try {
          audio.currentTime = startTime;
        } catch {
          // ignore
        }
      }
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Initial attempt to play
    if (!userMutedRef.current) {
      fadeIn();
    }

    // First interaction fallback (e.g. unwrap gesture or click)
    const onFirstInteraction = () => {
      if (!userMutedRef.current && (audio.paused || audio.volume < 0.01)) {
        fadeIn();
      }
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };

    window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
    window.addEventListener("keydown", onFirstInteraction, { passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { passive: true });

    return () => {
      cancelFade();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };
  }, [hasAudio, startTime, fadeIn, cancelFade]);

  if (!hasAudio) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={birthday.audioSrc}
        loop
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.currentTime < startTime - 0.5) {
            try {
              audioRef.current.currentTime = startTime;
            } catch {
              // ignore
            }
          }
        }}
      />
      <motion.button
        className={`icon-button sound-button ${!isMuted ? "is-playing" : ""}`}
        type="button"
        onClick={toggleMute}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isMuted ? "Play song with low volume" : "Mute song (fade out)"}
        title={isMuted ? "Play song (fade in)" : "Mute song (fade out)"}
      >
        {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
      </motion.button>
    </>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.22 }} transition={{ duration: reduced ? 0.25 : 0.85, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.h2 className={className} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }} variants={{ visible: { transition: { staggerChildren: reduced ? 0 : 0.055 } } }} aria-label={text}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          variants={{
            hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(9px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduced ? 0.2 : 0.62 } },
          }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </motion.h2>
  );
}

function VideoCard({ item, index, onOpen }: { item: VideoMemory; index: number; onOpen: (item: VideoMemory) => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(cardRef, { amount: 0.55 });
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [0, 0, 0] : [70, 0, -70]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.92, 1, 0.96]);
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [index % 2 ? 2.5 : -2.5, index % 2 ? -1 : 1]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !reduced) {
      video.muted = true;
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [inView, reduced]);

  return (
    <motion.article
      ref={cardRef}
      className={`video-memory video-memory-${index + 1}`}
      style={{ y, scale, rotate }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: "inset(12% 12% 12% 12%)", filter: "blur(10px)" }}
      whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduced ? 0.25 : 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button className="video-memory-button" type="button" onClick={() => onOpen(item)} whileTap={{ scale: 0.985 }} aria-label={`Open ${item.title} video`}>
        <motion.div className="video-frame" layoutId={`video-${item.id}`}>
          <video ref={videoRef} muted loop playsInline preload="metadata" poster={item.poster} aria-hidden="true">
            <source src={item.src} type="video/mp4" />
          </video>
          <span className="video-shade" />
          <span className="video-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="video-play"><Play size={18} fill="currentColor" /></span>
          <span className="video-sound-hint"><Play size={14} fill="currentColor" /> tap to play</span>
        </motion.div>
        <span className="video-copy"><strong>{item.title}</strong><span>{item.caption}</span></span>
      </motion.button>
    </motion.article>
  );
}

function VideoModal({ item, onClose }: { item: VideoMemory; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const playFromUserGesture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    try {
      await video.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // Pause all card videos to free mobile hardware decoder
    document.querySelectorAll(".video-memory video").forEach((v) => {
      (v as HTMLVideoElement).pause();
    });

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      void video.play().then(
        () => {
          if (active) setAutoplayBlocked(false);
        },
        () => {
          if (active && video.paused) setAutoplayBlocked(true);
        }
      );
    }

    return () => {
      active = false;
      video?.pause();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="media-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="media-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        initial={{ y: 35, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 25, scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="media-modal-close" type="button" onClick={onClose} aria-label="Close video" autoFocus>
          <X size={20} />
        </button>
        <div className="media-modal-video">
          <video
            ref={videoRef}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={item.poster}
            onPlay={() => setAutoplayBlocked(false)}
          >
            <source src={item.src} type="video/mp4" />
            Your browser does not support video playback.
          </video>
          {autoplayBlocked && (
            <button className="media-modal-play-fallback" type="button" onClick={playFromUserGesture} aria-label={`Play ${item.title}`}>
              <Play size={19} fill="currentColor" />
              <span>Tap to play</span>
            </button>
          )}
        </div>
        <div className="media-modal-copy">
          <span>one of my favorites</span>
          <h3>{item.title}</h3>
          <p>{item.caption}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function VideoStory() {
  const [selected, setSelected] = useState<VideoMemory | null>(null);

  const handleOpen = (item: VideoMemory) => {
    document.querySelectorAll(".video-memory video").forEach((v) => {
      (v as HTMLVideoElement).pause();
    });
    setSelected(item);
  };

  return (
    <section className="video-story" id="videos">
      <div className="video-story-heading">
        <span className="eyebrow">Moving pictures</span>
        <WordReveal text="Five tiny moments I wanted to keep." />
        <p>Pick one when you get close.</p>
      </div>
      <div className="video-memory-grid">
        {birthday.videos.map((item, index) => <VideoCard item={item} index={index} onOpen={handleOpen} key={item.id} />)}
      </div>
      <AnimatePresence mode="wait">{selected && <VideoModal item={selected} onClose={() => setSelected(null)} key={selected.id} />}</AnimatePresence>
    </section>
  );
}

function StickerLightbox({ item, onClose }: { item: StickerMoment; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div className="sticker-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="sticker-lightbox-card" role="dialog" aria-modal="true" aria-label={item.caption} layoutId={`sticker-${item.id}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close image" autoFocus><X size={20} /></button>
        <div className="sticker-lightbox-image"><Image src={item.src} alt={item.alt} fill sizes="(max-width: 640px) 86vw, 560px" /></div>
        <h3>{item.caption}</h3>
        <p>{item.note}</p>
      </motion.div>
    </motion.div>
  );
}

function StickerArchive() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<StickerMoment | null>(null);
  return (
    <section className="sticker-section">
      <Reveal className="sticker-heading">
        <span className="eyebrow">ye dekhhh...</span>
        <WordReveal text="A few images with a solid accuracy gimme ur comments later." />
        <p>Move them around. They are surprisingly well behaved.</p>
      </Reveal>
      <div className="sticker-desk" ref={constraintsRef}>
        {birthday.stickers.map((item, index) => (
          <motion.button
            className={`sticker-card sticker-card-${index + 1}`}
            type="button"
            key={item.id}
            layoutId={`sticker-${item.id}`}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.18}
            dragMomentum={false}
            initial={{ opacity: 0, y: 80, rotate: item.rotation * 2, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, rotate: item.rotation, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ rotate: 0, scale: 1.035, zIndex: 8 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 180, damping: 20, delay: index * 0.07 }}
            onClick={() => setSelected(item)}
            aria-label={`Open ${item.caption}`}
          >
            <span className="sticker-image"><Image src={item.src} alt={item.alt} fill sizes="(max-width: 720px) 68vw, 24vw" /></span>
            <span className="sticker-caption">{item.caption}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>{selected && <StickerLightbox item={selected} onClose={() => setSelected(null)} key={selected.id} />}</AnimatePresence>
    </section>
  );
}

function Letter() {
  const [open, setOpen] = useState(false);
  return (
    <section className="letter-section" id="letter">
      <Reveal className="section-heading letter-heading"><span className="eyebrow">One last thing</span><h2>A letter for you</h2></Reveal>
      <div className={`letter-wrap ${open ? "is-open" : ""}`}>
        <motion.button className="envelope" type="button" onClick={() => setOpen(true)} whileHover={{ y: -8, rotate: -1 }} whileTap={{ scale: 0.98 }} aria-expanded={open} aria-controls="birthday-letter" aria-label="Open your birthday letter">
          <span className="envelope-back" /><span className="letter-peek">for Horlicks</span><span className="envelope-front" /><span className="envelope-flap" /><span className="wax-seal"><Heart fill="currentColor" size={18} /></span>
        </motion.button>
        <AnimatePresence>
          {open && (
            <motion.article id="birthday-letter" className="letter-paper" initial={{ opacity: 0, y: 110, rotateX: -18, scale: 0.9 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
              {birthday.letter.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <p className="letter-signature">{birthday.signature}<span>{"\u2661"}</span></p>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Petals({ active }: { active: boolean }) {
  return (
    <div className="petal-field" aria-hidden="true">
      {active && Array.from({ length: 22 }, (_, index) => (
        <motion.span key={index} className="falling-petal" style={{ left: `${(index * 37) % 100}%` }} initial={{ y: -80, x: 0, rotate: 0, opacity: 0 }} animate={{ y: "110vh", x: index % 2 ? 54 : -44, rotate: 380 + index * 19, opacity: [0, 0.9, 0.72, 0] }} transition={{ duration: 5.2 + (index % 5), delay: (index % 7) * 0.15, ease: "linear" }} />
      ))}
    </div>
  );
}

function Finale({ onReplay }: { onReplay: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.5 });
  return (
    <section className="finale" ref={ref}>
      <Petals active={inView} />
      <Reveal className="finale-inner">
        <motion.span className="finale-mark" whileHover={{ rotate: 12, scale: 1.08 }}><Heart fill="currentColor" /></motion.span>
        <span className="eyebrow">Today and in future where i might not be w u</span>
        <h2>Happy birthday,<br /><em>{birthday.name}.</em></h2>
        <p>May this year love you as beautifully as you deserve. And hope u dont punch me in the face for being this late</p>
        <button className="replay-button" type="button" onClick={onReplay}><RefreshCw size={17} /><span>Open it again</span></button>
      </Reveal>
    </section>
  );
}

export function BirthdayExperienceV2() {
  const reduced = useReducedMotion();
  const [showOpening, setShowOpening] = useState(true);
  const [wishMade, setWishMade] = useState(false);
  const { scrollYProgress } = useScroll({ trackContentSize: true });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });
  const heroY = useTransform(scrollYProgress, [0, 0.16], [0, reduced ? 0 : 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.12]);
  const sceneY = useTransform(scrollYProgress, [0, 0.2], [0, reduced ? 0 : -125]);
  const sceneScale = useTransform(scrollYProgress, [0, 0.2], [1, reduced ? 1 : 0.86]);
  const sceneRotate = useTransform(scrollYProgress, [0, 0.2], [0, reduced ? 0 : 4]);

  const replayOpening = () => {
    setWishMade(false);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    window.setTimeout(() => setShowOpening(true), reduced ? 0 : 450);
  };

  return (
    <MotionConfig reducedMotion="user">
      <main>
        <SoundButton />
        <AnimatePresence>{showOpening && <GiftOpening onComplete={() => setShowOpening(false)} />}</AnimatePresence>
        <motion.div className="progress-line" style={{ scaleX: progress }} />

        <section className="hero" id="top">
          <div className="hero-glow" aria-hidden="true" />
          <motion.div
            className="hero-copy"
            style={{ y: heroY, opacity: heroOpacity }}
            initial="hidden"
            animate={showOpening ? "hidden" : "visible"}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: reduced ? 0 : 0.11, delayChildren: 0.12 } } }}
          >
            <motion.span className="eyebrow" variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>{birthday.heroLine}</motion.span>
            <motion.h1 variants={{ hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } } }}><span>For</span>{birthday.name}</motion.h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>{birthday.heroNote}</motion.p>
          </motion.div>
          <motion.div className="scene-wrap" style={{ y: sceneY, scale: sceneScale, rotate: sceneRotate }} initial={{ opacity: 0 }} animate={{ opacity: showOpening ? 0 : 1 }} transition={{ duration: 0.8, delay: showOpening ? 0 : 0.22 }}>
            <WishCakeScene reducedMotion={Boolean(reduced)} wished={wishMade} onWish={() => setWishMade(true)} />
            <span className="scene-ring ring-one" aria-hidden="true" /><span className="scene-ring ring-two" aria-hidden="true" />
            <motion.button
              className={`wish-chip ${wishMade ? "is-wished" : ""}`}
              type="button"
              onClick={() => setWishMade(true)}
              animate={wishMade ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.48 }}
              aria-live="polite"
            >
              <Sparkles size={16} />
              <span>{wishMade ? "Wish made" : "Make a wish"}</span>
            </motion.button>
          </motion.div>
          <motion.a className="scroll-cue" href="#videos" aria-label="Continue to the memories" initial={{ opacity: 0 }} animate={{ opacity: showOpening ? 0 : 1 }} transition={{ delay: 0.75 }}>
            <span>There is more below</span><ArrowDown size={17} />
          </motion.a>
        </section>

        <section className="intro-band">
          <Reveal><p>Some people arrive and make life louder.</p><WordReveal text="You made mine feel less lonely." /></Reveal>
        </section>

        <VideoStory />
        <StickerArchive />
        <Letter />
        <Finale onReplay={replayOpening} />
      </main>
    </MotionConfig>
  );
}
