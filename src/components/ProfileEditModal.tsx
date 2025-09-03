'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';

interface Profile {
  id?: string;
  user_id: string;
  name: string;
  age?: number;
  date_of_birth?: string;
  profession?: string;
  household_id?: string;
  profile_photo_url?: string;
  google_avatar_url?: string;
}

interface ProfileEditModalProps {
  profile: Profile;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfileEditModal({ profile, onClose, onSuccess }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    date_of_birth: profile.date_of_birth || '',
    profession: profile.profession || '',
    useGoogleAvatar: !!profile.google_avatar_url,
    profilePhoto: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleInputChange = (field: string, value: string | string[] | File | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      handleInputChange('profilePhoto', file);
      handleInputChange('useGoogleAvatar', false);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePhoto = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${userId}/${fileName}`;

            const { error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, formData.profilePhoto as File);

      if (error) {
        console.error('Storage upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new photo if provided
      let profilePhotoUrl = profile.profile_photo_url;
      if (formData.profilePhoto) {
        const uploadedUrl = await uploadProfilePhoto(formData.profilePhoto, profile.user_id);
        if (uploadedUrl) {
          profilePhotoUrl = uploadedUrl;
        }
      }

      // Prepare update data
      const updateData: {
        name: string;
        date_of_birth: string | null;
        profession: string | null;
        updated_at: string;
        avatar_url?: string | null;
        profile_photo_url?: string | null;
        google_avatar_url?: string | null;
        dietary_preferences?: string[];
      } = {
        name: formData.name,
        date_of_birth: formData.date_of_birth || null,
        profession: formData.profession || null,
        updated_at: new Date().toISOString()
      };

      // Handle photo URLs
      if (formData.profilePhoto && profilePhotoUrl) {
        updateData.profile_photo_url = profilePhotoUrl;
      }

      if (formData.useGoogleAvatar) {
        // Get Google avatar from user metadata if available
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.avatar_url) {
          updateData.google_avatar_url = user.user_metadata.avatar_url;
        }
      } else if (!formData.profilePhoto) {
        // Clear Google avatar if not using it and no new photo
        updateData.google_avatar_url = null;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', profile.user_id);

      if (error) {
        throw error;
      }

      alert('Profile updated successfully!');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPhotoUrl = () => {
    if (photoPreview) return photoPreview;
    if (formData.useGoogleAvatar && profile.google_avatar_url) return profile.google_avatar_url;
    if (profile.profile_photo_url) return profile.profile_photo_url;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
              <div className="space-y-4">
                {/* Photo Preview */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {getCurrentPhotoUrl() ? (
                      <Image
                        src={getCurrentPhotoUrl()!}
                        alt="Profile preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-2xl">👤</div>
                    )}
                  </div>
                </div>
                
                {/* Photo Options */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    📱 Upload New Photo
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('useGoogleAvatar', !formData.useGoogleAvatar);
                      if (!formData.useGoogleAvatar) {
                        handleInputChange('profilePhoto', null);
                        setPhotoPreview(null);
                      }
                    }}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      formData.useGoogleAvatar 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formData.useGoogleAvatar ? '✅' : '🔗'} Use Google Avatar
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formData.date_of_birth && (
                <p className="text-sm text-blue-600 mt-1">
                  Age: {calculateAge(formData.date_of_birth)} years old
                </p>
              )}
            </div>

            {/* Profession */}
            <div>
              <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                Profession
              </label>
              <input
                id="profession"
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What do you do for work?"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
