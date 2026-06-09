import React, { useRef, useState, useEffect } from 'react';

export default function SignatureCanvas({ value, onChange, label = 'E-Signature', error, required }) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setBlurred(false);
    setDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onChange && onChange(dataUrl);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange && onChange(null);
  };

  return (
    <div className="w-full">
      <p className="field-label">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div
        className={`relative border-2 rounded-lg overflow-hidden ${error ? 'border-red-400' : 'border-gray-300'}`}
        onMouseLeave={() => setBlurred(true)}
        onMouseEnter={() => setBlurred(false)}
      >
        <canvas
          ref={canvasRef}
          width={560}
          height={160}
          className="w-full touch-none bg-white cursor-crosshair"
          style={{ height: '120px' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          aria-label="Signature drawing area"
          role="img"
        />
        {blurred && hasSignature && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-500">Signature captured</span>
          </div>
        )}
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm text-gray-400">Sign here using mouse or touch</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-1">
        {error && <p role="alert" aria-live="polite" className="error-msg">{error}</p>}
        <button
          type="button"
          onClick={clear}
          className="text-xs text-gray-500 hover:text-red-500 ml-auto"
        >
          Clear signature
        </button>
      </div>
    </div>
  );
}
