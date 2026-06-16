"use client";

import { useEffect, useState, useRef } from "react";
import { X, ZoomIn, Sun, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (croppedImageBase64: string) => void;
}

export function ImageEditorDialog({
  isOpen,
  onClose,
  imageSrc,
  onSave,
}: ImageEditorDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setBrightness(100);
      setContrast(100);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Simple boundary checking (optional, but keep it smooth)
    setOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    setOffset({ x: newX, y: newY });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const size = 300; // Output avatar size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Clear background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        // Apply filters (brightness & contrast)
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

        // Calculate aspect ratios
        const imgRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;
        
        if (imgRatio > 1) {
          // Landscape
          drawWidth = size * imgRatio;
        } else {
          // Portrait
          drawHeight = size / imgRatio;
        }

        // Draw zoomed & panned image centered on canvas
        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.scale(zoom, zoom);
        
        // Offset mapping from screen UI to canvas scale
        // In the UI, the container is 250px, so we scale coordinates accordingly
        const uiScale = size / 250;
        const mappedX = (offset.x * uiScale) / zoom;
        const mappedY = (offset.y * uiScale) / zoom;

        ctx.drawImage(
          img,
          -drawWidth / 2 + mappedX,
          -drawHeight / 2 + mappedY,
          drawWidth,
          drawHeight
        );
        ctx.restore();
        
        // Export base64
        const result = canvas.toDataURL("image/jpeg", 0.85);
        onSave(result);
      }
    } catch (err) {
      console.error("Cropping failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
      <div className="bg-background border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h3 className="font-bold text-lg text-foreground">Edit Profile Picture</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor Area */}
        <div className="p-6 flex flex-col items-center gap-6 overflow-y-auto max-h-[75vh]">
          {/* Crop Box Viewport */}
          <div
            ref={containerRef}
            className="relative w-64 h-64 rounded-xl border border-muted bg-neutral-900 overflow-hidden cursor-move flex items-center justify-center select-none touch-none shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Visual Circular Crop Guide */}
            <div className="absolute inset-0 border-[20px] border-black/60 z-10 pointer-events-none rounded-xl">
              <div className="w-full h-full rounded-full border border-dashed border-white/50 bg-transparent" />
            </div>

            {/* Dynamic Interactive Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transition: isDragging ? "none" : "transform 0.15s ease-out, filter 0.15s ease-out",
              }}
              className="max-w-none max-h-none pointer-events-none select-none w-full object-contain"
            />
          </div>

          {/* Controls */}
          <div className="w-full space-y-4">
            {/* Zoom Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ZoomIn className="h-3.5 w-3.5" /> Scale / Zoom</span>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{zoom.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Brightness Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" /> Brightness</span>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{brightness}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                step="1"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Contrast Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Contrast</span>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{contrast}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                step="1"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 shrink-0 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/95 min-w-[80px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving
              </>
            ) : (
              "Apply Crop"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
