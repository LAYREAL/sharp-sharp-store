import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Maximize2 } from 'lucide-react';

export default function MediaLightboxModal() {
  const { activeLightboxMedia, setActiveLightboxMedia } = useStore();

  if (!activeLightboxMedia) return null;

  const isVideo = activeLightboxMedia.type === 'video' || (activeLightboxMedia.url && activeLightboxMedia.url.startsWith('data:video')) || (activeLightboxMedia.url && activeLightboxMedia.url.match(/\.(mp4|webm|ogg)$/i));

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 300, background: 'rgba(0, 0, 0, 0.92)' }}
      onClick={() => setActiveLightboxMedia(null)}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn-close"
          style={{
            position: 'absolute',
            top: '-40px',
            right: '0',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            zIndex: 10
          }}
          onClick={() => setActiveLightboxMedia(null)}
        >
          <X size={20} />
        </button>

        {isVideo ? (
          <video
            src={activeLightboxMedia.url}
            controls
            autoPlay
            style={{
              maxWidth: '85vw',
              maxHeight: '80vh',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              outline: 'none'
            }}
          />
        ) : (
          <img
            src={activeLightboxMedia.url}
            alt={activeLightboxMedia.title || "Product Full View"}
            style={{
              maxWidth: '85vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
          />
        )}

        {activeLightboxMedia.title && (
          <div style={{ marginTop: '0.75rem', color: '#fff', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>
            {activeLightboxMedia.title}
          </div>
        )}
      </div>
    </div>
  );
}
