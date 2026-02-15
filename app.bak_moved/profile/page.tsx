'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { apiClient } from '../../lib/api';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      fetchProfile();
    }
  }, [isLoading, user]);

  const fetchProfile = async () => {
    try {
      const data = await apiClient.get('/users/me');
      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || ''
      });
    } catch (error: any) {
      setError(error.message || 'Error fetching profile');
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await apiClient.put('/users/me', {
        first_name: formData.first_name,
        last_name: formData.last_name
      });

      setProfile(data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Error updating profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e75480] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard should handle this
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-[#e75480] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center">Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 p-6 rounded-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-600 text-white rounded">
              {success}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="mb-4">
                <label htmlFor="first_name" className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="last_name" className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#e75480] focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-[#e75480] hover:bg-[#d03d6c] text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    // Reset form to original values
                    setFormData({
                      first_name: profile?.first_name || '',
                      last_name: profile?.last_name || ''
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-300">Email</h3>
                <p className="text-white">{profile?.email || user?.email}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-300">First Name</h3>
                <p className="text-white">{profile?.first_name || 'Not set'}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-300">Last Name</h3>
                <p className="text-white">{profile?.last_name || 'Not set'}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-300">Member Since</h3>
                <p className="text-white">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="bg-[#e75480] hover:bg-[#d03d6c] text-white px-4 py-2 rounded-md"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}