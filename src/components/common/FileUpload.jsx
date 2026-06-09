import React, { useRef, useState } from 'react';
import { useFormStore } from '../../store/formStore';

function compressImage(file, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // Max 1920px dimension
      const maxDim = 1920;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (!blob) { resolve(file); return; }
        if (blob.size > file.size * 0.9) {
          // Try lower quality
          canvas.toBlob(b2 => resolve(b2 || blob), 'image/jpeg', 0.3);
        } else {
          resolve(blob);
        }
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function FileUpload({ field, label, accept, maxSizeMB = 5, required, hint }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const inputRef = useRef();
  const { uploads, setUpload, removeUpload } = useFormStore();
  const file = uploads[field];

  const handleFile = async (raw) => {
    setError('');
    if (!raw) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    const isImage = raw.type.startsWith('image/');
    const isPDF = raw.type === 'application/pdf';

    const allowed = accept.split(',').map(s => s.trim());
    const ext = '.' + raw.name.split('.').pop().toLowerCase();
    if (!allowed.some(a => a === raw.type || a === ext)) {
      setError(`Only ${accept} files are allowed`);
      return;
    }

    setProcessing(true);
    setStatus('Processing…');

    let finalFile = raw;
    if (isImage && raw.size > 1024 * 1024) {
      setStatus('Compressing image…');
      const compressed = await compressImage(raw);
      finalFile = new File([compressed], raw.name, { type: 'image/jpeg' });
    }

    if (finalFile.size > maxBytes) {
      setError(`File too large. Max ${maxSizeMB}MB allowed.`);
      setProcessing(false);
      setStatus('');
      return;
    }

    setUpload(field, { name: finalFile.name, size: finalFile.size, type: finalFile.type, file: finalFile });
    setProcessing(false);
    setStatus('');
    const liveRegion = document.getElementById('upload-live-region');
    if (liveRegion) liveRegion.textContent = `${label} uploaded successfully`;
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full">
      <p className="field-label">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}

      {!file ? (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          aria-label={`Upload ${label}`}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors min-h-[80px] flex flex-col items-center justify-center gap-1
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <span className="text-2xl">📎</span>
          <p className="text-sm text-gray-600">
            {processing ? status : 'Drop file here or click to browse'}
          </p>
          <p className="text-xs text-gray-400">{accept} · Max {maxSizeMB}MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-600 text-lg">✓</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => removeUpload(field)}
            className="text-gray-400 hover:text-red-500 text-sm px-2 py-1 min-h-[44px]"
            aria-label={`Remove ${label}`}
          >✕</button>
        </div>
      )}
      {error && <p role="alert" aria-live="polite" className="error-msg">{error}</p>}
    </div>
  );
}
