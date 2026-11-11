import { useEffect, useState } from 'react';

interface ImageCardProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ImageCard({ src, alt, caption }: ImageCardProps) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomed]);

  const openZoom = () => setZoomed(true);
  const closeZoom = () => setZoomed(false);

  return (
    <>
      <figure className="image-card">
        <div className="image-frame">
          <img src={src} alt={alt} className="image-card__img" />
          <button
            type="button"
            className="zoom-button"
            aria-label="Zoom image"
            onClick={openZoom}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="7.5" y1="10" x2="12.5" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="7.5" x2="10" y2="12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {caption && <figcaption className="image-card__caption">{caption}</figcaption>}
      </figure>

      {zoomed && (
        <div className="lightbox-backdrop" onClick={closeZoom}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed image"
            className="lightbox"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox__close"
              aria-label="Close zoomed image"
              onClick={closeZoom}
            >
              ×
            </button>
            <img src={src} alt={`${alt} (zoomed)`} className="lightbox__img" />
          </div>
        </div>
      )}
    </>
  );
}
