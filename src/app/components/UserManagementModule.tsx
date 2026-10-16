import { useEffect, useRef, useState } from 'react';
import { User, Plus, Edit, Trash2, Shield, X, Save, Users, Activity, Archive, Search, Lock, Unlock } from 'lucide-react';
import { AutoGrowTextarea } from './ui/textarea';

interface UserData {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Locked';
  createdDate: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

const AVAILABLE_ROLES = ['Admin', 'Encoder', 'Validator', 'Inspector'] as const;

const getNextEmployeeId = (userList: UserData[]) => {
  const ids = userList
    .map(user => Number.parseInt(user.employeeId.replace(/\D+/g, ''), 10))
    .filter(value => Number.isFinite(value));

  const nextNumber = ids.length ? Math.max(...ids) + 1 : 1;
  return `EMP-${String(nextNumber).padStart(4, '0')}`;
};

export function UserManagementModule() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'activity' | 'archived'>('accounts');
  const [activeUserFormTab, setActiveUserFormTab] = useState<'account' | 'access'>('account');
  const userFormScrollRef = useRef<HTMLDivElement>(null);
  const userAccountSectionRef = useRef<HTMLElement>(null);
  const userAccessSectionRef = useRef<HTMLElement>(null);
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      employeeId: 'EMP-0001',
      name: 'Admin User',
      email: 'admin@municipal.gov',
      username: 'admin',
      role: 'Head Engineer',
      status: 'Active',
      createdDate: '2026-01-15',
    },
    {
      id: '2',
      employeeId: 'EMP-0002',
      name: 'John Encoder',
      email: 'john.encoder@municipal.gov',
      username: 'encoder',
      role: 'Staff - Encoder',
      status: 'Active',
      createdDate: '2026-02-10',
    },
    {
      id: '3',
      employeeId: 'EMP-0003',
      name: 'Peter Inspector',
      email: 'peter.inspector@municipal.gov',
      username: 'inspector',
      role: 'Staff - Inspector',
      status: 'Active',
      createdDate: '2026-03-05',
    },
    {
      id: '4',
      employeeId: 'EMP-0004',
      name: 'Maria Validator',
      email: 'maria.validator@municipal.gov',
      username: 'validator',
      role: 'Staff - Validator',
      status: 'Active',
      createdDate: '2026-03-20',
    },
  ]);

  const [archivedUsers, setArchivedUsers] = useState<UserData[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      user: 'admin',
      action: 'User Created',
      timestamp: '2026-08-30 10:30:00',
      details: 'Created user John Encoder',
    },
    {
      id: '2',
      user: 'admin',
      action: 'Role Updated',
      timestamp: '2026-08-30 09:15:00',
      details: 'Changed Peter Inspector role to Inspector',
    },
    {
      id: '3',
      user: 'admin',
      action: 'User Activated',
      timestamp: '2026-08-29 14:45:00',
      details: 'Activated Maria Validator account',
    },
    {
      id: '4',
      user: 'admin',
      action: 'System Configuration',
      timestamp: '2026-08-29 11:20:00',
      details: 'Updated system settings',
    },
  ]);

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const generatedEmployeeId = getNextEmployeeId(users);
  const moveToUserFormTab = (tab: 'account' | 'access') => {
    const sectionRef = tab === 'account' ? userAccountSectionRef : userAccessSectionRef;
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveUserFormTab(tab);
  };
  const updateActiveUserFormTab = () => {
    const scrollTop = userFormScrollRef.current?.getBoundingClientRect().top ?? 0;
    const accessTop = userAccessSectionRef.current?.getBoundingClientRect().top ?? Infinity;
    setActiveUserFormTab(accessTop <= scrollTop + 110 ? 'access' : 'account');
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'Admin',
    status: 'Active' as UserData['status'],
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [lockedUsers, setLockedUsers] = useState<Record<string, number>>({});
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'confirmation' | 'message' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'message',
    title: '',
    message: '',
  });

  useEffect(() => {
    fetch('/api/auth/status')
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || 'Unable to load local user accounts.');
        if (!Array.isArray(payload.users)) throw new Error('Local user account data is invalid.');
        setUsers(payload.users.map((user: {
          userId: string;
          name: string;
          email: string;
          username: string;
          role: string;
          status: 'Active' | 'Inactive';
        }, index: number) => ({
          id: user.userId,
          employeeId: `EMP-${String(index + 1).padStart(4, '0')}`,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          createdDate: new Date().toISOString().split('T')[0],
        })));
      })
      .catch((error: unknown) => {
        console.error('Failed to load local user accounts.', error);
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Accounts Unavailable',
          message: error instanceof Error ? error.message : 'Unable to load local user accounts.',
        });
      });
  }, []);

  const refreshLockStatus = async () => {
    try {
      const res = await fetch('/api/auth/lock-status');
      const payload = await res.json();
      setLockedUsers(payload?.locked ?? {});
    } catch {
      setLockedUsers({});
    }
  };

  useEffect(() => {
    refreshLockStatus();

    const interval = window.setInterval(() => {
      refreshLockStatus();
    }, 1000);

    const handleFocus = () => refreshLockStatus();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab]);

  const roleColors: Record<string, string> = {
    'Head Engineer': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    'Staff - Encoder': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    'Staff - Inspector': 'bg-[#38bdf8]/10 text-[#38bdf8]',
    'Staff - Validator': 'bg-[#7dd3fc]/10 text-[#7dd3fc]',
    Admin: 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    Encoder: 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    Inspector: 'bg-[#38bdf8]/10 text-[#38bdf8]',
    Validator: 'bg-[#7dd3fc]/10 text-[#7dd3fc]',
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.username) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields',
      });
      return;
    }

    const newUser: UserData = {
      id: Date.now().toString(),
      employeeId: generatedEmployeeId,
      name: formData.name,
      email: formData.email,
      username: formData.username,
      role: formData.role,
      status: formData.status,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setUsers([...users, newUser]);
    setFormData({ name: '', email: '', username: '', role: 'Encoder', status: 'Active' });
    setShowAddForm(false);
  };

  const handleEditUser = (user: UserData) => {
    setActiveUserFormTab('account');
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    });
    setShowAddForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;

    setUsers(users.map(user =>
      user.id === editingUser.id
        ? {
          ...user,
          name: formData.name,
          email: formData.email,
          username: formData.username,
          role: formData.role,
          status: formData.status,
        }
        : user
    ));

    setEditingUser(null);
    setFormData({ name: '', email: '', username: '', role: 'Encoder', status: 'Active' });
    setShowAddForm(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to archive this user?')) {
      const userToArchive = users.find(user => user.id === id);
      if (userToArchive) {
        setArchivedUsers([...archivedUsers, userToArchive]);
        setUsers(users.filter(user => user.id !== id));
        setActivityLogs([...activityLogs, {
          id: Date.now().toString(),
          user: 'admin',
          action: 'User Archived',
          timestamp: new Date().toLocaleString(),
          details: `Archived user ${userToArchive.name}`,
        }]);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const activeAdmins = users.filter(u => u.status === 'Active' && u.role === 'Head Engineer');
    if (user.status === 'Active' && user.role === 'Head Engineer' && activeAdmins.length <= 1) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Cannot Deactivate',
        message: 'Cannot deactivate the last active Head Engineer.',
      });
      return;
    }

    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const prevUsers = users;

    setUsers(users.map(u =>
      u.id === id ? { ...u, status: newStatus } : u
    ));

    try {
      const res = await fetch('/api/auth/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, status: newStatus }),
      });

      if (!res.ok) {
        setUsers(prevUsers);
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update status. Please try again.',
        });
        return;
      }
    } catch {
      setUsers(prevUsers);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update status. Please try again.',
      });
      return;
    }

    setActivityLogs([...activityLogs, {
      id: Date.now().toString(),
      user: 'admin',
      action: newStatus === 'Active' ? 'User Activated' : 'User Deactivated',
      timestamp: new Date().toLocaleString(),
      details: `${newStatus === 'Active' ? 'Activated' : 'Deactivated'} user ${user.name}`,
    }]);
  };

  const handleUnlock = async (user: UserData) => {
    setDialog({
      isOpen: true,
      type: 'confirmation',
      title: 'Confirm Unlock',
      message: `Are you sure you want to unlock ${user.name}?`,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/auth/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username }),
          });

          const payload = await res.json();

          if (!res.ok) {
            setDialog({
              isOpen: true,
              type: 'error',
              title: 'Unlock Failed',
              message: payload?.message || 'Failed to unlock account.',
            });
            return;
          }

          const next = { ...lockedUsers };
          delete next[user.username.toLowerCase()];
          setLockedUsers(next);
          await refreshLockStatus();

          setDialog({
            isOpen: true,
            type: 'message',
            title: 'Success',
            message: payload?.message || 'Account unlocked.',
          });

          setActivityLogs([...activityLogs, {
            id: Date.now().toString(),
            user: 'admin',
            action: 'Account Unlocked',
            timestamp: new Date().toLocaleString(),
            details: `Unlocked account for ${user.name}`,
          }]);
        } catch {
          setDialog({
            isOpen: true,
            type: 'error',
            title: 'Unlock Failed',
            message: 'Failed to unlock account. Please try again.',
          });
        }
      },
      onCancel: () => {
        setDialog({ isOpen: false, type: 'message', title: '', message: '' });
      },
    });
  };

  const handleRestoreUser = (id: string) => {
    const userToRestore = archivedUsers.find(user => user.id === id);
    if (userToRestore) {
      setUsers([...users, userToRestore]);
      setArchivedUsers(archivedUsers.filter(user => user.id !== id));
      setActivityLogs([...activityLogs, {
        id: Date.now().toString(),
        user: 'admin',
        action: 'User Restored',
        timestamp: new Date().toLocaleString(),
        details: `Restored user ${userToRestore.name}`,
      }]);
    }
  };

  const handleDeleteArchivedUser = (id: string) => {
    const archivedUser = archivedUsers.find(user => user.id === id);
    if (!archivedUser) return;

    setDialog({
      isOpen: true,
      type: 'confirmation',
      title: 'Delete Archived User',
      message: `Are you sure you want to permanently delete ${archivedUser.name}? This action cannot be undone.`,
      onConfirm: () => {
        setArchivedUsers(prev => prev.filter(user => user.id !== id));
        setActivityLogs(prev => [...prev, {
          id: Date.now().toString(),
          user: 'admin',
          action: 'User Deleted Permanently',
          timestamp: new Date().toLocaleString(),
          details: `Permanently deleted archived user ${archivedUser.name}`,
        }]);
        setDialog({ isOpen: false, type: 'message', title: '', message: '' });
      },
      onCancel: () => {
        setDialog({ isOpen: false, type: 'message', title: '', message: '' });
      },
    });
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all password fields.',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/unlock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Update Failed',
          message: payload?.message || 'Failed to update master password.',
        });
        return;
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setDialog({
        isOpen: true,
        type: 'message',
        title: 'Success',
        message: payload?.message || 'Master password updated successfully.',
      });
    } catch {
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update master password. Please try again.',
      });
    }
  };

  const handleClose = () => {
    setShowAddForm(false);
    setShowPasswordForm(false);
    setActiveUserFormTab('account');
    setEditingUser(null);
    setFormData({ name: '', email: '', username: '', role: 'Encoder', status: 'Active' });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const filteredUsers = users.filter((user) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;

    const searchable = [
      user.employeeId,
      user.name,
      user.email,
      user.username,
      user.role,
      user.status,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(term);
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-blue-700">System Management</h1>
        </div>
        {activeTab === 'accounts' && (
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditingUser(null); setActiveUserFormTab('account'); setShowAddForm(true); }} className="bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:bg-[#0284c7] transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New User
            </button>
            <button onClick={() => setShowPasswordForm(true)} className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Change Master Password
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow-lg border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'accounts'
                ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            Accounts
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-5 h-5" />
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'archived'
                ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Archive className="w-5 h-5" />
            Archived ({archivedUsers.length})
          </button>
        </div>
      </div>

      {/* Statistics */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-3xl font-bold text-[#0ea5e9]">{users.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-3xl font-bold text-[#0ea5e9]">{users.filter(u => u.status === 'Active').length}</p>
            <p className="text-sm text-gray-600 mt-1">Active Users</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-3xl font-bold text-[#0ea5e9]">{users.filter(u => u.role === 'Head Engineer').length}</p>
            <p className="text-sm text-gray-600 mt-1">Head Engineers</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-3xl font-bold text-[#0ea5e9]">{users.filter(u => u.status === 'Inactive').length}</p>
            <p className="text-sm text-gray-600 mt-1">Inactive Users</p>
          </div>
        </div>
      )}

      {/* Users List */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 gap-3">
            <h2 className="text-xl font-bold text-[#0ea5e9]">All Users</h2>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <AutoGrowTextarea
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee ID, name, email, username, role, or status..."
                rows={2}
                className="w-64 resize-y pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{user.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-[#0ea5e9]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === 'Active' ? 'Click to deactivate' : 'Click to activate'}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          user.status === 'Active' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.status}
                      </button>
                      {lockedUsers[user.username.toLowerCase()] && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-500">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {lockedUsers[user.username.toLowerCase()] && user.role !== 'Admin' && (
                        <button
                          onClick={() => handleUnlock(user)}
                          title="Unlock this account"
                          className="text-green-500 hover:text-green-700 p-1"
                          aria-label={`Unlock ${user.name}`}
                        >
                          <Unlock className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleEditUser(user)} className="text-[#0ea5e9] hover:text-[#0284c7] p-1">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#0ea5e9] mb-4">Activity Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-[#0ea5e9]">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.timestamp}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Archived Users Tab */}
      {activeTab === 'archived' && (
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#0ea5e9] mb-4">Archived Users ({archivedUsers.length})</h2>
          {archivedUsers.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No archived users</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {archivedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-[#0ea5e9]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.createdDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleRestoreUser(user.id)} className="text-green-500 hover:text-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors">
                            Restore
                          </button>
                          <button onClick={() => handleDeleteArchivedUser(user.id)} className="text-red-500 hover:text-red-700 p-1" aria-label={`Delete ${user.name}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[840px] h-[min(560px,calc(100vh-48px))] overflow-hidden border border-slate-200 flex flex-col">
            <div className="flex shrink-0 items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-600 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white leading-none">
                  {editingUser ? 'Edit User Account' : 'Create User Account'}
                </h2>
                <p className="mt-1 text-sm text-blue-100">Municipal Engineering Office · User Management</p>
              </div>
              <button onClick={handleClose} className="text-white/90 hover:text-white transition-colors" aria-label="Close form">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex shrink-0 gap-2 border-b bg-slate-50 px-4 py-2" aria-label="User form sections">
              <button
                type="button"
                onClick={() => moveToUserFormTab('account')}
                aria-current={activeUserFormTab === 'account' ? 'step' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  activeUserFormTab === 'account' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                1. Account Info
              </button>
              <button
                type="button"
                onClick={() => moveToUserFormTab('access')}
                aria-current={activeUserFormTab === 'access' ? 'step' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  activeUserFormTab === 'access' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                2. Access &amp; Status
              </button>
            </nav>

            <div ref={userFormScrollRef} onScroll={updateActiveUserFormTab} className="form-modal-fields min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <section ref={userAccountSectionRef} className="scroll-mt-4 space-y-4 border-b pb-6">
              <div>
                <label className="block text-base font-medium text-slate-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  value={editingUser ? editingUser.employeeId : generatedEmployeeId}
                  readOnly
                  className="w-full h-10 px-4 border border-slate-300 rounded-md bg-slate-100 text-slate-700 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-slate-700 mb-2">Name</label>
                <AutoGrowTextarea
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  rows={2}
                  className="w-full min-h-10 resize-y px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-base font-medium text-slate-700 mb-2">Email</label>
                <AutoGrowTextarea
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  rows={2}
                  className="w-full min-h-10 resize-y px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  placeholder=""
                />
              </div>
              </section>
              <section ref={userAccessSectionRef} className="scroll-mt-4 space-y-4 pt-5">
              <div>
                <label className="block text-base font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full h-10 px-4 border border-slate-300 rounded-md bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-base font-medium text-slate-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserData['role'] })}
                  className="w-full h-10 px-4 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                >
                  <option value="">Select Role</option>
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as UserData['status'] })}
                  className="w-full h-10 px-4 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Locked">Locked</option>
                </select>
              </div>
              </section>
            </div>

            <div className="flex gap-3 border-t px-5 py-4 bg-white">
              <button
                onClick={handleClose}
                className="flex-1 h-11 border border-slate-300 bg-white text-slate-700 text-base font-medium rounded-md hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleSaveEdit : handleAddUser}
                className="flex-1 h-11 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingUser ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[840px] h-[min(560px,calc(100vh-48px))] overflow-hidden border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-600">
              <h2 className="text-[1.05rem] font-bold tracking-tight text-white leading-none">
                Change Master Password
              </h2>
              <button onClick={handleClose} className="text-white/90 hover:text-white transition-colors" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="form-modal-fields min-h-0 flex-1 overflow-y-auto px-5 py-4 bg-white space-y-3">
              <div>
                <label className="block text-[0.98rem] font-medium text-slate-700 mb-1.5">Current Master Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-[0.98rem] font-medium text-slate-700 mb-1.5">New Master Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-[0.98rem] font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="flex gap-3 px-4 pb-4 pt-1 bg-white">
              <button
                onClick={handlePasswordUpdate}
                className="flex-1 h-12 bg-[#1a1d3f] text-white text-base font-semibold rounded-md hover:bg-[#111633] transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Update Password
              </button>
              <button
                onClick={handleClose}
                className="flex-1 h-12 bg-slate-300 text-slate-700 text-base font-semibold rounded-md hover:bg-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Modal */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
            <div className="mb-4">
              <h2 className={`text-xl font-bold ${
                dialog.type === 'error' ? 'text-red-600' :
                dialog.type === 'confirmation' ? 'text-[#0ea5e9]' :
                'text-green-600'
              }`}>
                {dialog.title}
              </h2>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 text-base leading-relaxed">
                {dialog.message}
              </p>
            </div>

            <div className={`flex ${dialog.type === 'confirmation' ? 'gap-3' : 'justify-end gap-3'}`}>
              {dialog.type === 'confirmation' && (
                <>
                  <button
                    onClick={() => {
                      dialog.onConfirm?.();
                      setDialog({ ...dialog, isOpen: false });
                    }}
                    className="flex-1 bg-[#0ea5e9] text-white px-4 py-2 rounded-lg hover:bg-[#0284c7] transition-colors font-medium"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      dialog.onCancel?.();
                      setDialog({ ...dialog, isOpen: false });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
              {dialog.type !== 'confirmation' && (
                <button
                  onClick={() => setDialog({ ...dialog, isOpen: false })}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    dialog.type === 'error'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
