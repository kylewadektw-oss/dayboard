"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Credential {
  id?: string;
  user_id: string;
  household_id?: string;
  title: string;
  website?: string;
  username?: string;
  password?: string;
  notes?: string;
  category: 'personal' | 'household' | 'work' | 'financial' | 'social' | 'other';
  is_shared: boolean;
  created_at?: string;
  updated_at?: string;
}

function CredentialsContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/signin');
          return;
        }

        setUser(user);

        // Get user's credentials
        const { data: credentialData, error: credentialError } = await supabase
          .from('credentials')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (credentialError) {
          console.error('Credentials fetch error:', credentialError);
        } else {
          setCredentials(credentialData || []);
        }
      } catch (error) {
        console.error('Data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSaveCredential = async (formData: FormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const credentialData: Credential = {
        user_id: user.id,
        title: formData.get('title')?.toString() || '',
        website: formData.get('website')?.toString() || '',
        username: formData.get('username')?.toString() || '',
        password: formData.get('password')?.toString() || '',
        notes: formData.get('notes')?.toString() || '',
        category: formData.get('category')?.toString() as Credential['category'] || 'other',
        is_shared: formData.get('is_shared') === 'on',
      };

      let result;
      if (editingCredential) {
        // Update existing credential
        result = await supabase
          .from('credentials')
          .update(credentialData)
          .eq('id', editingCredential.id)
          .select()
          .single();
      } else {
        // Create new credential
        result = await supabase
          .from('credentials')
          .insert(credentialData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Credential save error:', result.error);
        alert('Error saving credential. Please try again.');
      } else {
        // Update local state
        if (editingCredential) {
          setCredentials(prev => prev.map(cred => 
            cred.id === editingCredential.id ? result.data : cred
          ));
        } else {
          setCredentials(prev => [result.data, ...prev]);
        }
        setShowAddModal(false);
        setEditingCredential(null);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCredential = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;

    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', credentialId);

      if (error) {
        console.error('Delete error:', error);
        alert('Error deleting credential. Please try again.');
      } else {
        setCredentials(prev => prev.filter(cred => cred.id !== credentialId));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copied to clipboard!`);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || cred.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return '👤';
      case 'household': return '🏠';
      case 'work': return '💼';
      case 'financial': return '💳';
      case 'social': return '📱';
      default: return '🔐';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-100 text-blue-800';
      case 'household': return 'bg-green-100 text-green-800';
      case 'work': return 'bg-purple-100 text-purple-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Loading your credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">🔐 Credentials Manager</h1>
            <p className="text-blue-700">Securely manage your passwords and login information</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Credential
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="all">All Categories</option>
                <option value="personal">👤 Personal</option>
                <option value="household">🏠 Household</option>
                <option value="work">💼 Work</option>
                <option value="financial">💳 Financial</option>
                <option value="social">📱 Social</option>
                <option value="other">🔐 Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCredentials.map((credential) => (
            <div key={credential.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(credential.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{credential.title}</h3>
                    {credential.website && (
                      <a 
                        href={credential.website.startsWith('http') ? credential.website : `https://${credential.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {credential.website}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingCredential(credential);
                      setShowAddModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCredential(credential.id!)}
                    className="text-blue-400 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(credential.category)}`}>
                  {credential.category}
                  {credential.is_shared && ' • Shared'}
                </div>

                {credential.username && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Username:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-black">{credential.username}</code>
                      <button
                        onClick={() => copyToClipboard(credential.username!, 'Username')}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}

                {credential.password && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Password:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-black">
                        {showPasswords[credential.id!] ? credential.password : '••••••••'}
                      </code>
                      <button
                        onClick={() => togglePasswordVisibility(credential.id!)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        {showPasswords[credential.id!] ? '🙈' : '👁️'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(credential.password!, 'Password')}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}

                {credential.notes && (
                  <div>
                    <span className="text-sm text-blue-700">Notes:</span>
                    <p className="text-sm text-blue-800 mt-1 bg-gray-50 p-2 rounded">{credential.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCredentials.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">No credentials found</h3>
            <p className="text-blue-700 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first credential to get started'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Your First Credential
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                {editingCredential ? '✏️ Edit Credential' : '🔐 Add New Credential'}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveCredential(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Title *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={editingCredential?.title || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="e.g., Gmail, Netflix, Bank Login"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Website</label>
                  <input
                    name="website"
                    type="text"
                    defaultValue={editingCredential?.website || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="e.g., gmail.com, netflix.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Username/Email</label>
                  <input
                    name="username"
                    type="text"
                    defaultValue={editingCredential?.username || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Username or email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    defaultValue={editingCredential?.password || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingCredential?.category || 'other'}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="personal">👤 Personal</option>
                    <option value="household">🏠 Household</option>
                    <option value="work">💼 Work</option>
                    <option value="financial">💳 Financial</option>
                    <option value="social">📱 Social</option>
                    <option value="other">🔐 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingCredential?.notes || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Additional notes or security questions..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    name="is_shared"
                    type="checkbox"
                    id="is_shared"
                    defaultChecked={editingCredential?.is_shared || false}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="is_shared" className="ml-2 text-sm text-blue-800">
                    Share with household members
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingCredential ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCredential(null);
                    }}
                    className="bg-gray-200 text-blue-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CredentialsPage() {
  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <CredentialsContent />
    </ProtectedRoute>
  );
}
