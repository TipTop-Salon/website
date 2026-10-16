import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Link as LinkIcon,
  X,
  RefreshCw,
  HardDrive,
  Layers,
  ArrowRight
} from 'lucide-react';
import { compressAndResizeImage, CompressionResult } from '../../lib/imageCompression';
import { uploadToSupabaseStorage, getSupabaseClient } from '../../lib/supabase';
import {
  CDN_IMAGES,
  SALON_IMAGE_PRESETS,
  getImageUrl,
  handleImageError,
  detectImageSource
} from '../../lib/imageHelper';
import { useSalon } from '../../context/SalonContext';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  folder?: 'services' | 'packages' | 'gallery' | 'general';
  itemTitle?: string;
  category?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = 'Image & Cover Asset',
  helperText = 'Upload custom photo (auto-compressed for mobile) or pick a luxury preset',
  folder = 'services',
  itemTitle = 'treatment',
  category
}) => {
  const { supabaseUrl, supabaseKey, supabaseConnected } = useSalon();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(value || '');

  const sourceInfo = detectImageSource(value);
  const displayUrl = getImageUrl(value);

  // Clean filename generator
  const getSemanticFileName = (ext: string = 'webp') => {
    const cleanTitle = (itemTitle || 'atelier')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
    return `${cleanTitle}-${Date.now()}.${ext}`;
  };

  const processAndUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    setUploadError(null);
    setUploadSuccessMsg(null);
    setIsCompressing(true);

    try {
      // 1. Client-Side Image Shrinking & Compression (Max 1200x1200px, WebP quality 0.82)
      // This shrinks huge 4-10MB camera pictures down to 80-250KB before upload!
      const compressed = await compressAndResizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        mimeType: 'image/webp'
      });

      setCompressionStats(compressed);
      setIsCompressing(false);

      // Instant preview with compressed data URL while uploading
      onChange(compressed.dataUrl);

      // 2. Upload to Supabase S3 / Storage bucket 'salon-media'
      const client = getSupabaseClient(supabaseUrl, supabaseKey);

      if (client && supabaseConnected) {
        setIsUploading(true);
        const fileName = getSemanticFileName('webp');

        const uploadRes = await uploadToSupabaseStorage(
          client,
          compressed.blob,
          fileName,
          'salon-media',
          folder
        );

        setIsUploading(false);

        if (uploadRes.success && uploadRes.publicUrl) {
          onChange(uploadRes.publicUrl);
          setUploadSuccessMsg(`Saved to Supabase S3 (${folder}/${fileName}) with 1-year immutable caching!`);
        } else {
          // If storage bucket isn't provisioned or upload error, keep the optimized data URL and alert
          setUploadError(`Storage notice: ${uploadRes.error || 'Upload failed'}. Kept optimized image locally.`);
        }
      } else {
        setUploadSuccessMsg('Optimized image saved locally. Connect Supabase to store permanently in S3 bucket.');
      }
    } catch (err: any) {
      setIsCompressing(false);
      setIsUploading(false);
      setUploadError(err.message || 'Image processing failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleSelectPreset = (presetUrl: string) => {
    onChange(presetUrl);
    setCompressionStats(null);
    setUploadError(null);
    setUploadSuccessMsg('Selected luxury salon atelier photography preset.');
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      onChange(customUrlInput.trim());
      setUploadSuccessMsg('Custom URL applied.');
    }
  };

  const handleReset = () => {
    onChange('');
    setCustomUrlInput('');
    setCompressionStats(null);
    setUploadError(null);
    setUploadSuccessMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 bg-[#FAF8FC] p-4 rounded-xl border border-[#ECE4F2]">
      {/* Header & Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1221] flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#7B2D97]" />
            {label}
          </label>
          {helperText && <p className="text-[11px] text-[#6B6175] mt-0.5">{helperText}</p>}
        </div>

        {/* Provenance badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {sourceInfo.type === 'supabase' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Supabase S3 Bucket
            </span>
          )}
          {sourceInfo.type === 'cdn' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <HardDrive className="w-3 h-3 text-blue-500" />
              Cloud CDN
            </span>
          )}
          {sourceInfo.type === 'local_relative' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Local Path (Upload to S3 for Mobile)
            </span>
          )}
          {sourceInfo.type === 'data' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <Zap className="w-3 h-3 text-purple-600" />
              Optimized Memory
            </span>
          )}
        </div>
      </div>

      {/* Main Preview & Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
        {/* Left: Live Visual Preview Thumbnail */}
        <div className="md:col-span-5 relative group rounded-lg overflow-hidden border border-[#D9D6E2] bg-[#1C1221]/5 aspect-video sm:aspect-[4/3] flex items-center justify-center shadow-inner">
          {value ? (
            <>
              <img
                src={displayUrl}
                alt={itemTitle}
                onError={handleImageError}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <div className="text-white text-[10px] flex items-center justify-between w-full">
                  <span className="font-mono truncate max-w-[150px]">{displayUrl}</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1 rounded bg-red-600/80 hover:bg-red-600 text-white cursor-pointer ml-1"
                    title="Remove Image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-[#8A7E93]">
              <ImageIcon className="w-8 h-8 mx-auto text-[#B3A6BC] mb-1.5 opacity-60" />
              <p className="text-xs font-medium">No image assigned</p>
              <p className="text-[10px] text-[#A69AA8]">Default luxury category visual will be displayed</p>
            </div>
          )}

          {/* Shrinking / Uploading overlay */}
          {(isCompressing || isUploading) && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
              <RefreshCw className="w-6 h-6 text-[#7B2D97] animate-spin mb-2" />
              <p className="text-xs font-semibold text-[#1C1221]">
                {isCompressing ? 'Shrinking & Compressing...' : 'Uploading to Supabase S3...'}
              </p>
              <p className="text-[10px] text-[#6B6175] mt-0.5">
                {isCompressing ? 'Converting to modern WebP (max 1200px)' : `Saving to salon-media/${folder}`}
              </p>
            </div>
          )}
        </div>

        {/* Right: Controls & Tabs */}
        <div className="md:col-span-7 space-y-2.5">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E5DEEC]">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-[#7B2D97] text-white shadow-xs'
                  : 'text-[#6B6175] hover:text-[#1C1221] hover:bg-[#FAF8FC]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload & Shrink
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'preset'
                  ? 'bg-[#7B2D97] text-white shadow-xs'
                  : 'text-[#6B6175] hover:text-[#1C1221] hover:bg-[#FAF8FC]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
              Luxury Presets
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                setCustomUrlInput(value || '');
              }}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-[#7B2D97] text-white shadow-xs'
                  : 'text-[#6B6175] hover:text-[#1C1221] hover:bg-[#FAF8FC]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Direct URL
            </button>
          </div>

          {/* TAB 1: UPLOAD & SHRINK */}
          {activeTab === 'upload' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id={`file-input-${folder}-${itemTitle}`}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#7B2D97] bg-[#7B2D97]/5'
                    : 'border-[#D9D6E2] hover:border-[#7B2D97] bg-white hover:bg-[#FAF8FC]'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-[#FAF0F8] flex items-center justify-center text-[#7B2D97]">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-semibold text-[#1C1221]">
                    Click to select or drag photo here
                  </div>
                  <div className="text-[10px] text-[#8A7E93]">
                    Auto-shrunk to 1200px & converted to high-speed WebP before S3 upload
                  </div>
                </div>
              </div>

              {/* Compression stats feedback banner */}
              {compressionStats && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="font-semibold">Shrunk {compressionStats.compressionRatio}%:</strong>{' '}
                      {compressionStats.formattedOriginalSize} → {compressionStats.formattedCompressedSize} ({compressionStats.width}×{compressionStats.height}px)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono">
                    {compressionStats.durationMs}ms
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LUXURY PRESETS */}
          {activeTab === 'preset' && (
            <div className="space-y-2">
              <p className="text-[11px] text-[#6B6175]">
                Select from verified high-resolution atelier photography:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {SALON_IMAGE_PRESETS.map((preset) => {
                  const isSelected = value === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`group relative rounded-md overflow-hidden aspect-video border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#7B2D97] ring-2 ring-[#7B2D97]/30 scale-[0.98]'
                          : 'border-[#E5DEEC] hover:border-[#7B2D97]'
                      }`}
                      title={preset.title}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end p-1">
                        <span className="text-[9px] font-medium text-white truncate drop-shadow">
                          {preset.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-[#7B2D97] text-white p-0.5 rounded-full shadow">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://... (Supabase, S3, or CDN URL)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 bg-white border border-[#D9D6E2] rounded px-3 py-1.5 text-xs text-[#1C1221] focus:ring-1 focus:ring-[#7B2D97] focus:border-[#7B2D97]"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1.5 bg-[#7B2D97] hover:bg-[#641F7D] text-white text-xs font-medium rounded shadow-xs cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-[#8A7E93]">
                Must be an absolute HTTPS URL so mobile clients can load the image.
              </p>
            </div>
          )}

          {/* Status and Error Messages */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          {uploadSuccessMsg && (
            <div className="bg-[#F6EFF9] border border-[#ECD9F2] rounded p-2 text-xs text-[#7B2D97] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7B2D97] shrink-0" />
              <span className="truncate">{uploadSuccessMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
