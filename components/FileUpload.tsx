'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  accept?: string;
  label?: string;
  placeholderUrl?: string;
}

export function FileUpload({
  onUploadSuccess,
  accept = 'video/*,image/*,application/pdf',
  label = 'Upload Media Asset (Direct Browser Upload)',
  placeholderUrl = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(placeholderUrl);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Fetch Cloudinary signature from API
      const sigRes = await fetch('/api/upload/signature');
      const sigData = await sigRes.json();

      if (sigData.isConfigured && sigData.signature) {
        // Direct browser upload to Cloudinary (bypasses Vercel server payload limits!)
        const resourceType = file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('image/')
          ? 'image'
          : 'raw';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', String(sigData.timestamp));
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const resData = JSON.parse(xhr.responseText);
            const uploadedUrl = resData.secure_url || resData.url;
            setPreviewUrl(uploadedUrl);
            onUploadSuccess(uploadedUrl);
            setUploading(false);
          } else {
            const errData = JSON.parse(xhr.responseText);
            setError(errData.error?.message || 'Cloudinary upload failed');
            setUploading(false);
          }
        };

        xhr.onerror = () => {
          setError('Network error during direct Cloudinary upload.');
          setUploading(false);
        };

        xhr.send(formData);
      } else {
        // Fallback to local /api/upload
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setPreviewUrl(data.url);
        onUploadSuccess(data.url);
        setUploading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
      setUploading(false);
    }
  };

  return (
    <div style={{ margin: '12px 0' }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
          {label}
        </label>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px dashed #cbd5e1',
            borderRadius: 8,
            fontSize: 12,
            background: '#f8fafc',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        />

        {uploading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#6366f1' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Direct Uploading... {progress > 0 ? `${progress}%` : ''}</span>
          </div>
        )}
      </div>

      {progress > 0 && progress < 100 && uploading && (
        <div style={{ marginTop: 6, height: 4, width: '100%', background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#6366f1', transition: 'width 0.2s' }} />
        </div>
      )}

      {error && (
        <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {previewUrl && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={15} />
          <span>Uploaded Asset URL:</span>
          <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 4, fontSize: 11, color: '#0f172a', wordBreak: 'break-all' }}>
            {previewUrl}
          </code>
        </div>
      )}
    </div>
  );
}
