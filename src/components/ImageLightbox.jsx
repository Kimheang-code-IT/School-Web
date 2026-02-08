import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Full-screen image viewer with zoom and pan.
 * Use from Shop/Courses: pass isOpen, onClose, imageUrl, title.
 */
const ImageLightbox = ({ isOpen, onClose, imageUrl, title = '' }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoading, setImageLoading] = useState(true);
  const containerRef = useRef(null);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetZoom();
      setImageLoading(true);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, imageUrl, resetZoom]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleWheel = (e) => {
    if (!isOpen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => Math.min(4, Math.max(0.5, s + delta)));
  };

  const handleZoomIn = () => setScale((s) => Math.min(4, s + 0.35));
  const handleZoomOut = () => setScale((s) => Math.max(0.5, s - 0.35));

  const onMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top bar: title + close + zoom controls */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/50 text-white">
        <h3 className="text-sm sm:text-base font-medium truncate max-w-[50%]">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetZoom}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Zoom out"
            aria-label="Zoom out"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Zoom in"
            aria-label="Zoom in"
            disabled={scale >= 4}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors ml-2"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Image area: scrollable and wheel zoom */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-4"
        onWheel={handleWheel}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-150"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              pointerEvents: scale > 1 ? 'none' : 'auto'
            }}
            draggable={false}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            onClick={(e) => scale <= 1 && e.target === e.currentTarget && onClose()}
          />
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
