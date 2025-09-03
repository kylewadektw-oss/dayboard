'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Dependent {
  id?: string;
  name: string;
  type: 'child' | 'pet' | 'other';
  date_of_birth?: string;
  age?: number;
  breed?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  photo_url?: string;
  notes?: string;
  dietary_restrictions?: string[];
  medical_notes?: string;
  school_grade?: string;
  favorite_activities?: string[];
  emergency_contact?: string;
  created_at?: string;
}

interface HouseholdDependentsManagerProps {
  householdId: string;
  onClose: () => void;
}

export default function HouseholdDependentsManager({ householdId, onClose }: HouseholdDependentsManagerProps) {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Dependent>({
    name: '',
    type: 'child',
    date_of_birth: '',
    breed: '',
    gender: 'unknown',
    notes: '',
    dietary_restrictions: [],
    medical_notes: '',
    school_grade: '',
    favorite_activities: [],
    emergency_contact: '',
  });

  useEffect(() => {
    fetchDependents();
  }, [householdId]);

  const fetchDependents = async () => {
    try {
      const { data, error } = await supabase
        .from('household_dependents')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching dependents:', error);
        return;
      }

      setDependents(data || []);
    } catch (error) {
      console.error('Error fetching dependents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Dependent, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field: 'dietary_restrictions' | 'favorite_activities', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, items);
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `dependent_${Date.now()}.${fileExt}`;
      const filePath = `dependent-photos/${householdId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (error) {
        console.error('Photo upload error:', error);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const photoUrl = await uploadPhoto(file);
    if (photoUrl) {
      handleInputChange('photo_url', photoUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dependentData = {
        ...formData,
        household_id: householdId,
      };

      if (editingDependent?.id) {
        // Update existing dependent
        const { error } = await supabase
          .from('household_dependents')
          .update(dependentData)
          .eq('id', editingDependent.id);

        if (error) throw error;
      } else {
        // Create new dependent
        const { error } = await supabase
          .from('household_dependents')
          .insert([dependentData]);

        if (error) throw error;
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        type: 'child',
        date_of_birth: '',
        breed: '',
        gender: 'unknown',
        notes: '',
        dietary_restrictions: [],
        medical_notes: '',
        school_grade: '',
        favorite_activities: [],
        emergency_contact: '',
      });
      setShowAddForm(false);
      setEditingDependent(null);
      await fetchDependents();

    } catch (error) {
      console.error('Error saving dependent:', error);
      alert('Failed to save dependent information');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dependent: Dependent) => {
    setFormData({
      ...dependent,
      dietary_restrictions: dependent.dietary_restrictions || [],
      favorite_activities: dependent.favorite_activities || [],
    });
    setEditingDependent(dependent);
    setShowAddForm(true);
  };

  const handleDelete = async (dependentId: string) => {
    if (!confirm('Are you sure you want to delete this household member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('household_dependents')
        .delete()
        .eq('id', dependentId);

      if (error) throw error;

      await fetchDependents();
    } catch (error) {
      console.error('Error deleting dependent:', error);
      alert('Failed to delete household member');
    }
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'child': return '👶';
      case 'pet': return '🐾';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading household members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">👨‍👩‍👧‍👦 Household Members</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Add New Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Add Family Member or Pet
        </button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingDependent ? 'Edit' : 'Add'} Household Member
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as 'child' | 'pet' | 'other')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="child">Child</option>
                  <option value="pet">Pet</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.date_of_birth && (
                  <p className="text-sm text-gray-600 mt-1">
                    Age: {calculateAge(formData.date_of_birth)} years old
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender || 'unknown'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="unknown">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.type === 'pet' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                  <input
                    type="text"
                    value={formData.breed || ''}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Golden Retriever, Tabby Cat"
                  />
                </div>
              )}

              {formData.type === 'child' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Grade</label>
                  <input
                    type="text"
                    value={formData.school_grade || ''}
                    onChange={(e) => handleInputChange('school_grade', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Kindergarten, 3rd Grade, High School"
                  />
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <div className="flex items-center space-x-4">
                {formData.photo_url && (
                  <img
                    src={formData.photo_url}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  📷 Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Additional Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
              <input
                type="text"
                value={formData.dietary_restrictions?.join(', ') || ''}
                onChange={(e) => handleArrayFieldChange('dietary_restrictions', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Peanut allergy, Vegetarian, Lactose intolerant"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Activities</label>
              <input
                type="text"
                value={formData.favorite_activities?.join(', ') || ''}
                onChange={(e) => handleArrayFieldChange('favorite_activities', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Soccer, Reading, Playing fetch, Art"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple activities with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
              <textarea
                value={formData.medical_notes || ''}
                onChange={(e) => handleInputChange('medical_notes', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Any important medical information, medications, etc."
              />
            </div>

            {formData.type === 'child' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergency_contact || ''}
                  onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name and phone number for emergencies"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Any additional notes or information"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingDependent(null);
                  setFormData({
                    name: '',
                    type: 'child',
                    date_of_birth: '',
                    breed: '',
                    gender: 'unknown',
                    notes: '',
                    dietary_restrictions: [],
                    medical_notes: '',
                    school_grade: '',
                    favorite_activities: [],
                    emergency_contact: '',
                  });
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingDependent ? 'Update' : 'Add')} Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dependents List */}
      <div className="space-y-4">
        {dependents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
            <p>No household members added yet</p>
            <p className="text-sm">Add children, pets, or other family members to help organize your household</p>
          </div>
        ) : (
          dependents.map((dependent) => (
            <div key={dependent.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {dependent.photo_url ? (
                    <img
                      src={dependent.photo_url}
                      alt={dependent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                      {getTypeIcon(dependent.type)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{dependent.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Type:</span> {dependent.type}
                        {dependent.breed && ` (${dependent.breed})`}
                      </p>
                      {dependent.age && (
                        <p><span className="font-medium">Age:</span> {dependent.age} years old</p>
                      )}
                      {dependent.school_grade && (
                        <p><span className="font-medium">Grade:</span> {dependent.school_grade}</p>
                      )}
                      {dependent.dietary_restrictions && dependent.dietary_restrictions.length > 0 && (
                        <p><span className="font-medium">Dietary:</span> {dependent.dietary_restrictions.join(', ')}</p>
                      )}
                      {dependent.favorite_activities && dependent.favorite_activities.length > 0 && (
                        <p><span className="font-medium">Activities:</span> {dependent.favorite_activities.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(dependent)}
                    className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(dependent.id!)}
                    className="flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
