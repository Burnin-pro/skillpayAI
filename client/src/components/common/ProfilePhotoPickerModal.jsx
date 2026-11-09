import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Check, Camera, Image, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { apiClient } from '../../services/apiClient';

export const AVATAR_PRESETS = [
  {
    id: 'p1',
    name: 'Muthupandi (Senior Full-Stack)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=faces'
  },
  {
    id: 'p2',
    name: 'Sarah (UI/UX Designer)',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&h=250&fit=crop&crop=faces'
  },
  {
    id: 'p3',
    name: 'Elena (Smart Escrow Architect)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&h=250&fit=crop&crop=faces'
  },
  {
    id: 'p4',
    name: 'Alex (Frontend Developer)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&fit=crop&crop=faces'
  },
  {
    id: 'p5',
    name: 'Priya (Full-Stack Engineer)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&h=250&fit=crop&crop=faces'
  },
  {
    id: 'p6',
    name: 'Marcus (Cloud & DevOps Lead)',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&h=250&fit=crop&crop=faces'
  },
  {
    id: 'p7',
    name: 'Muthuram (Fintech Developer)',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&h=250&fit=crop&crop=faces'
  },
  {
    id: 'p8',
    name: 'David (Enterprise Client)',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&h=250&fit=crop&crop=faces'
  }
];

export function ProfilePhotoPickerModal({ isOpen, onClose, onPhotoSelected }) {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload'
  const currentPhoto = user?.photoURL || user?.avatar || localStorage.getItem('skillpay_user_photo_' + (user?.uid || user?.id)) || localStorage.getItem('skillpay_user_photo_global') || AVATAR_PRESETS[0].url;
  const [selectedPhoto, setSelectedPhoto] = useState(currentPhoto);
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB. Please choose a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setSelectedPhoto(dataUrl);
        addToast('Photo loaded into preview. Click "Save Profile Photo" to apply.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setSelectedPhoto(customUrl.trim());
    setCustomUrl('');
    addToast('Custom image URL preview ready.', 'info');
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      // 1. Immediately persist synchronously in local storage for 100% instant render across tabs and reload
      const uid = user?.uid || user?.id || 'current_user';
      localStorage.setItem('skillpay_user_photo_' + uid, selectedPhoto);
      localStorage.setItem('skillpay_user_photo_global', selectedPhoto);
      
      // Update local storage user object
      try {
        const storedUser = JSON.parse(localStorage.getItem('skillpay_user') || '{}');
        const updatedUser = { ...storedUser, photoURL: selectedPhoto, avatar: selectedPhoto };
        localStorage.setItem('skillpay_user', JSON.stringify(updatedUser));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }

      // 2. Update React AuthContext immediately
      if (setUser) {
        setUser(prev => ({
          ...prev,
          photoURL: selectedPhoto,
          avatar: selectedPhoto
        }));
      }

      // 3. Persist to backend
      try {
        await apiClient.put('/auth/me', { photoURL: selectedPhoto, avatar: selectedPhoto });
      } catch (err) {
        console.debug('Backend update warning, local persistent cache saved:', err?.message);
      }

      // 4. Callback to parent component if provided
      if (onPhotoSelected) {
        onPhotoSelected(selectedPhoto);
      }

      addToast('Profile picture saved successfully!', 'success');
      onClose();
    } catch (err) {
      console.error('Failed to update photo:', err);
      addToast('Could not save profile picture. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 pt-20 sm:pt-24 pb-8">
      <div 
        className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col my-auto max-h-[calc(100vh-6rem)] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Choose Profile Picture
              </h3>
              <p className="text-[11px] text-slate-500">
                Pick a verified preset or upload your custom avatar
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview & Tabs Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img 
                src={selectedPhoto} 
                alt="Selected Profile Preview" 
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-accent/30 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white shadow-xs" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Live Preview</span>
              <span className="text-[11px] text-slate-500">Synchronized on dashboard & navbar</span>
            </div>
          </div>

          {/* Clean Segmented Tab Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'presets'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload / URL
            </button>
          </div>
        </div>

        {/* Content Body - with smooth internal scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 max-h-[50vh]">
          {activeTab === 'presets' ? (
            /* Presets Grid */
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Click any preset to select:
              </span>
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPhoto(preset.url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square group transition-all cursor-pointer ${
                        isSelected 
                          ? 'ring-3 ring-accent shadow-md scale-102' 
                          : 'opacity-75 hover:opacity-100 hover:scale-105 border border-slate-200'
                      }`}
                      title={preset.name}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-accent/25 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Upload & URL Tab */
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Upload image file:
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-accent hover:bg-blue-50/30 text-slate-700 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Choose file from your device</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, or WebP up to 5MB</span>
                </button>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Or paste image link:
                </span>
                <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="sm" className="text-xs py-1.5 px-3">
                    Load
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-xs text-slate-600"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            size="sm" 
            onClick={handleSave}
            disabled={isUploading}
            className="text-xs font-bold px-4 shadow-sm"
          >
            {isUploading ? 'Saving...' : 'Save Profile Photo'}
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
