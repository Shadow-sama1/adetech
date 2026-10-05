"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const blurDataURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'%3E%3Crect width='8' height='6' fill='%23f3e9dd'/%3E%3C/svg%3E";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const image = images[active] ?? images[0];
  useEffect(() => {
    if (!zoomOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setZoomOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [zoomOpen]);
  return <>
    <div className="product-gallery"><button type="button" className="gallery-main" onClick={() => setZoomOpen(true)} aria-label="Zoom product image"><Image src={image} alt={name} fill priority sizes="(max-width: 760px) 100vw, 55vw" placeholder="blur" blurDataURL={blurDataURL} /><span className="zoom-hint">Click to zoom</span></button><div className="gallery-thumbs">{images.map((src, index) => <button type="button" className={index === active ? "is-active" : ""} key={src} onClick={() => setActive(index)} aria-label={`View image ${index + 1} of ${images.length}`} aria-pressed={index === active}><Image src={src} alt="" fill sizes="76px" /></button>)}</div></div>
    {zoomOpen && <div className="image-zoom-overlay" role="dialog" aria-modal="true" aria-label={`${name} image`} onClick={() => setZoomOpen(false)}><button className="zoom-close" type="button" aria-label="Close image" onClick={() => setZoomOpen(false)}><X size={22} /></button><Image src={image} alt={name} fill sizes="100vw" priority placeholder="blur" blurDataURL={blurDataURL} /></div>}
  </>;
}
