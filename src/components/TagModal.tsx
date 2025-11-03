'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagUsers: (userIds: string[]) => void;
  completedDareId: string;
}

export function TagModal({ isOpen, onClose, onTagUsers, completedDareId }: TagModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setUsers([]);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users || []);
        } else {
          console.error('Error searching users:', data.error);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUserSelect = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleTagUsers = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      // Create tag engagements for each selected user
      const tagPromises = selectedUsers.map(user => 
        fetch('/api/dares/engagements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completed_dare_id: completedDareId,
            engagement_type: 'tag',
            content: user.id // Store the tagged user's ID in content
          })
        })
      );

      await Promise.all(tagPromises);
      
      // Call the parent callback with selected user IDs
      onTagUsers(selectedUsers.map(u => u.id));
      
      // Reset and close
      setSelectedUsers([]);
      setSearchQuery('');
      setUsers([]);
      onClose();
    } catch (error) {
      console.error('Error tagging users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    setUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Tag Someone</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users to tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected ({selectedUsers.length})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border"
                >
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{user.full_name}</span>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          ) : users.length === 0 && searchQuery.length >= 2 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No users found</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {users.map(user => {
                const isSelected = selectedUsers.find(u => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTagUsers}
            disabled={selectedUsers.length === 0 || loading}
            className="flex-1"
          >
            {loading ? 'Tagging...' : `Tag ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
