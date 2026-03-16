import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ onFileSelect, currentPreview }) {
  const [preview, setPreview] = useState(currentPreview || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
        id="image-upload-input"
      />

      {preview ? (
        <div className="relative rounded-xl overflow-hidden animate-scale-in"
          style={{ border: '1px solid var(--border)' }}>
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
            id="remove-image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="relative rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
          style={{
            background: dragActive ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-input)',
            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
          }}
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => {
            if (!dragActive) e.currentTarget.style.borderColor = 'var(--border)';
          }}
          id="image-drop-zone"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99, 102, 241, 0.12)' }}>
              <Upload className="w-6 h-6" style={{ color: 'var(--primary-light)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Drop an image here, or <span style={{ color: 'var(--primary-light)' }}>browse</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                JPEG, PNG, WebP or GIF • Max 5MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
