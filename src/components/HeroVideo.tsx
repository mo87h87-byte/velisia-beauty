"use client";

export default function HeroVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <video
      src={src}
      autoPlay
      muted
      playsInline
      controls
      className={`rounded-3xl object-cover shadow-[0_25px_45px_-10px_rgba(0,0,0,0.5)] ring-4 ring-white/20 ${className ?? ""}`}
    />
  );
}
