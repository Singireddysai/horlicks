"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, Heart, Music2, RefreshCw, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { birthday, type Memory } from "@/content/birthday";

const RoseScene = dynamic(() => import("./RoseScene"), {
  ssr: false,
  loading: () => <div className="keepsake-fallback" aria-hidden="true"><Heart /></div>,
});

function OpeningSequence({ onComplete }: { onComplete: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(onComplete, reduced ? 350 : 2850);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete, reduced]);

  return (
    <motion.div
      className="opening-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduced ? 0.15 : 0.75, delay: reduced ? 0 : 0.15 } }}
      role="status"
      aria-label="Opening your birthday surprise"
    >
      <motion.div className="opening-curtain opening-curtain-left" exit={reduced ? { opacity: 0 } : { x: "-101%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div className="opening-curtain opening-curtain-right" exit={reduced ? { opacity: 0 } : { x: "101%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div className="opening-content" exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.35 }}>
        <motion.span
          className="opening-seal"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.35, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Heart fill="currentColor" />
        </motion.span>
        <motion.span className="opening-kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.55 }}>
          A birthday wish for
        </motion.span>
        <motion.strong initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}>
          {birthday.name}
        </motion.strong>
        <span className="opening-loader" aria-hidden="true">
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: reduced ? 0.2 : 1.7, ease: [0.65, 0, 0.35, 1] }} />
        </span>
      </motion.div>
      <button className="opening-skip" type="button" onClick={onComplete} aria-label="Skip opening animation" title="Skip opening animation">
        <X size={18} />
      </button>
    </motion.div>
  );
}

function SoundButton() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasAudio = Boolean(birthday.audioSrc);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (audio.paused) {
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      {hasAudio && <audio ref={audioRef} src={birthday.audioSrc} loop preload="none" />}
      <button className="icon-button sound-button" type="button" onClick={toggle} disabled={!hasAudio} aria-label={hasAudio ? (playing ? "Pause music" : "Play music") : "Song coming soon"} title={hasAudio ? (playing ? "Pause music" : "Play music") : "Song coming soon"}>
        {playing ? <Volume2 size={19} /> : hasAudio ? <VolumeX size={19} /> : <Music2 size={19} />}
      </button>
    </>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 38 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: reduced ? 0.25 : 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function MemoryVisual({ memory }: { memory: Memory }) {
  if (memory.image) {
    return (
      <Image
        src={memory.image}
        alt={memory.alt ?? memory.title}
        fill
        sizes="(max-width: 720px) 88vw, 44vw"
        className="memory-image"
      />
    );
  }

  return (
    <div className={`memory-placeholder tone-${memory.tone}`} aria-hidden="true">
      <span className="placeholder-orbit" />
      <span className="placeholder-heart"><Heart strokeWidth={1.15} /></span>
      <span className="placeholder-number">{memory.number}</span>
    </div>
  );
}

function MemoryRow({ memory, index }: { memory: Memory; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.12 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-26, 26]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [34, -34]);

  return (
    <motion.article
      ref={ref}
      className={`memory-row ${index % 2 ? "reverse" : ""}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0.25 : 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="memory-frame"
        initial={reduced ? { opacity: 0 } : { clipPath: index % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
        animate={inView ? (reduced ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0%)" }) : undefined}
        transition={{ duration: reduced ? 0.25 : 1.05, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.div className="memory-visual-layer" style={{ y: visualY }}>
          <MemoryVisual memory={memory} />
        </motion.div>
        <span className="frame-corner">{memory.number}</span>
      </motion.div>
      <motion.div className="memory-copy" style={{ y: copyY }}>
        <span>{memory.number} / 04</span>
        <h3>{memory.title}</h3>
        <p>{memory.caption}</p>
      </motion.div>
    </motion.article>
  );
}

function LoveRibbon() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0.25, 0.72], reduced ? ["-8%", "-8%"] : ["5%", "-32%"]);
  const phrases = ["your laugh", "your softness", "your magic", "your heart", "our little world"];

  return (
    <section className="love-ribbon" aria-label="Things I love about you">
      <motion.div className="love-ribbon-track" style={{ x }}>
        {[...phrases, ...phrases].map((phrase, index) => (
          <span key={`${phrase}-${index}`}>{phrase}<Heart fill="currentColor" /></span>
        ))}
      </motion.div>
    </section>
  );
}

function Letter() {
  const [open, setOpen] = useState(false);
  return (
    <section className="letter-section" id="letter">
      <Reveal className="section-heading letter-heading">
        <span className="eyebrow">One last thing</span>
        <h2>A letter for you</h2>
      </Reveal>
      <div className={`letter-wrap ${open ? "is-open" : ""}`}>
        <button className="envelope" type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="birthday-letter" aria-label="Open your birthday letter">
          <span className="envelope-back" />
          <span className="letter-peek">for Horlicks</span>
          <span className="envelope-front" />
          <span className="envelope-flap" />
          <span className="wax-seal"><Heart fill="currentColor" size={18} /></span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.article
              id="birthday-letter"
              className="letter-paper"
              initial={{ opacity: 0, y: 90, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
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
      {active && Array.from({ length: 18 }, (_, index) => (
        <motion.span
          key={index}
          className="falling-petal"
          style={{ left: `${(index * 37) % 100}%` }}
          initial={{ y: -80, x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: "110vh", x: index % 2 ? 48 : -38, rotate: 360 + index * 19, opacity: [0, 0.85, 0.75, 0] }}
          transition={{ duration: 5.5 + (index % 5), delay: (index % 7) * 0.18, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function Finale() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.55 });
  const [replay, setReplay] = useState(0);
  return (
    <section className="finale" ref={ref}>
      <Petals active={inView || replay > 0} key={replay} />
      <Reveal className="finale-inner">
        <span className="finale-mark"><Heart fill="currentColor" /></span>
        <span className="eyebrow">Today and in future where i might not be w u</span>
        <h2>Happy birthday,<br /><em>{birthday.name}.</em></h2>
        <p>May this year love you as beautifully as you deserve.</p>
        <button className="replay-button" type="button" onClick={() => setReplay((value) => value + 1)}>
          <RefreshCw size={17} />
          <span>One more time</span>
        </button>
      </Reveal>
    </section>
  );
}

export function BirthdayExperience() {
  const reduced = useReducedMotion();
  const [showOpening, setShowOpening] = useState(true);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, reduced ? 0 : 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0.15]);
  const sceneY = useTransform(scrollYProgress, [0, 0.2], [0, reduced ? 0 : -120]);
  const sceneScale = useTransform(scrollYProgress, [0, 0.2], [1, reduced ? 1 : 0.86]);
  const sceneRotate = useTransform(scrollYProgress, [0, 0.2], [0, reduced ? 0 : 4]);

  return (
    <MotionConfig reducedMotion="user">
      <main>
        <AnimatePresence>{showOpening && <OpeningSequence onComplete={() => setShowOpening(false)} />}</AnimatePresence>
        <motion.div className="progress-line" style={{ scaleX: progress }} />
        <SoundButton />

        <section className="hero" id="top">
          <div className="hero-glow" aria-hidden="true" />
          <motion.div className="hero-copy" style={{ y: heroY, opacity: heroOpacity }}>
            <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.8 }}>{birthday.heroLine}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              <span>For</span>
              {birthday.name}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.9 }}>{birthday.heroNote}</motion.p>
          </motion.div>
          <motion.div className="scene-wrap" style={{ y: sceneY, scale: sceneScale, rotate: sceneRotate }}>
            <RoseScene reducedMotion={Boolean(reduced)} />
            <span className="scene-ring ring-one" aria-hidden="true" />
            <span className="scene-ring ring-two" aria-hidden="true" />
          </motion.div>
          <a className="scroll-cue" href="#memories" aria-label="Continue to the memories">
            <span>Made with all my heart</span>
            <ArrowDown size={17} />
          </a>
        </section>

        <section className="intro-band">
          <Reveal>
            <p>Some people arrive and make life louder.</p>
            <h2>You made mine feel <em>less lonely.</em></h2>
          </Reveal>
        </section>

        <section className="memories" id="memories">
          <Reveal className="section-heading">
            <span className="eyebrow">Little pieces of us</span>
            <h2>The moments I keep returning to.</h2>
          </Reveal>
          <div className="memory-list">
            {birthday.memories.map((memory, index) => <MemoryRow memory={memory} index={index} key={memory.number} />)}
          </div>
        </section>

        <LoveRibbon />

        <section className="reasons">
          <Reveal className="section-heading reasons-heading">
            <span className="eyebrow">Just a few reasons</span>
            <h2>Things about you<br />I could never get tired of.</h2>
          </Reveal>
          <div className="reason-list">
            {birthday.reasons.map((reason, index) => (
              <motion.div
                className="reason-line"
                key={reason}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: index % 2 ? 42 : -42 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: reduced ? 0.2 : 0.62, delay: reduced ? 0 : index * 0.045, ease: [0.22, 1, 0.36, 1] }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{reason}</p>
                <Heart size={19} strokeWidth={1.35} />
              </motion.div>
            ))}
          </div>
        </section>

        <Letter />
        <Finale />
      </main>
    </MotionConfig>
  );
}
