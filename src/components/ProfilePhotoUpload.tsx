"use client";

import { useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface ProfilePhotoUploadProps {
  user: User;
  currentAvatarUrl?: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export default function ProfilePhotoUpload({ user, currentAvatarUrl, onAvatarUpdate }: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload file to Supabase Storage
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create unique filename with user ID prefix for RLS policy
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size, fileType: file.type });

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Provide more specific error messages
        if (error.message.includes('row-level security')) {
          alert('Storage permission error. Please ensure the storage bucket is set up correctly.');
        } else if (error.message.includes('not found')) {
          alert('Storage bucket not found. Please run the storage setup script.');
        } else {
          alert(`Upload error: ${error.message}`);
        }
        return;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        alert('Error updating profile. Please try again.');
        return;
      }

      onAvatarUpdate(publicUrl);
      setShowOptions(false);
      alert('Profile photo updated successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Use Google avatar (from user metadata)
  const useGoogleAvatar = async () => {
    try {
      setUploading(true);
      
      // Get Google avatar URL from user metadata
      const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      
      if (!googleAvatarUrl) {
        alert('No Google avatar found. Please upload a photo instead.');
        return;
      }

      // Update profile with Google avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: googleAvatarUrl })
        .eq('user_id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        alert('Error updating profile. Please try again.');
        return;
      }

      onAvatarUpdate(googleAvatarUrl);
      setShowOptions(false);
      alert('Google avatar set successfully!');

    } catch (error) {
      console.error('Google avatar error:', error);
      alert('Error setting Google avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Remove current avatar
  const removeAvatar = async () => {
    try {
      setUploading(true);

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        alert('Error removing avatar. Please try again.');
        return;
      }

      onAvatarUpdate('');
      setShowOptions(false);

    } catch (error) {
      console.error('Remove avatar error:', error);
      alert('Error removing avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Current Avatar */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-2xl font-bold text-blue-600">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Upload button overlay */}
        <button
          onClick={() => setShowOptions(true)}
          disabled={uploading}
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Profile Photo</h3>
            
            <div className="space-y-3">
              {/* Upload from device */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload from Device
              </button>

              {/* Use Google avatar */}
              {user.user_metadata?.avatar_url && (
                <button
                  onClick={useGoogleAvatar}
                  disabled={uploading}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Use Google Avatar
                </button>
              )}

              {/* Remove current photo */}
              {currentAvatarUrl && (
                <button
                  onClick={removeAvatar}
                  disabled={uploading}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Photo
                </button>
              )}

              {/* Cancel */}
              <button
                onClick={() => setShowOptions(false)}
                disabled={uploading}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
