import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { usersService } from '@/services/users-service';
import { useNotificationStore } from '@stores/notification-store';
import { DataTable } from '@components/DataTable';
import { Button } from '@components/Button';
import type { User } from '@types';

export const UserManagement = () => {
  const { addNotification } = useNotificationStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);

  // Load users from API
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersService.list({ pageSize: 100 });
      setUsers(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const roleList = await usersService.getRoles();
      setRoles(roleList);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    department: '',
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        status: 'active',
        department: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingUser) {
        await usersService.update(editingUser.id, formData);
        addNotification({
          type: 'success',
          title: 'User Updated',
          message: `User ${formData.name} updated successfully`,
        });
      } else {
        await usersService.create(formData);
        addNotification({
          type: 'success',
          title: 'User Created',
          message: `User ${formData.name} created successfully`,
        });
      }
      loadUsers();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save user',
      });
    }

    setIsModalOpen(false);
    setFormData({});
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await usersService.delete(userId);
        addNotification({
          type: 'success',
          title: 'User Deleted',
          message: `User ${userName} deleted successfully`,
        });
        loadUsers();
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to delete user',
        });
      }
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleData = roles.find((r) => r.name === role);
    return roleData?.description || role;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-900 border-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'suspended':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-neutral-100 text-neutral-900 border-neutral-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-600 mt-2">Manage users and assign roles</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary-600 text-white">
          <Plus size={16} />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{user.name}</p>
                      <p className="text-sm text-neutral-500">{user.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-primary-600" />
                      <span className="text-sm font-medium">{getRoleDisplay(user.role)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">{user.department || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="User name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role || 'viewer'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="Department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                {editingUser ? 'Update' : 'Create'} User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{users.length}</p>
        </div>
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Active Users</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {users.filter((u) => u.status === 'active').length}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">Admins</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </div>
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Suspended</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {users.filter((u) => u.status === 'suspended').length}
          </p>
        </div>
      </div>
    </div>
  );
};
