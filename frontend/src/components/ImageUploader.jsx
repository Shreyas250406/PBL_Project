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
          style={{ border: '1px solid #e5e7eb' }}>
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            id="remove-image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="relative rounded-xl p-12 text-center cursor-pointer transition-all duration-200"
          style={{
            background: dragActive ? '#f9fafb' : '#fafafa',
            border: `2px dashed ${dragActive ? '#111827' : '#d1d5db'}`,
          }}
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={(e) => {
            if (!dragActive) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fafafa'; }
          }}
          id="image-drop-zone"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#f3f4f6' }}>
              <Upload className="w-6 h-6" style={{ color: '#6b7280' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>
                Drop an image here, or <span style={{ color: '#111827', fontWeight: 600 }}>browse</span>
              </p>
              <p className="text-xs mt-1.5" style={{ color: '#9ca3af' }}>
                JPEG, PNG, WebP or GIF • Max 5MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
