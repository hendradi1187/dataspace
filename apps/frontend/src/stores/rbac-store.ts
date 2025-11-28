import { create } from 'zustand';

export type Permission =
  | 'view:data'
  | 'edit:data'
  | 'delete:data'
  | 'manage:users'
  | 'manage:roles'
  | 'view:audit'
  | 'export:data'
  | 'import:data'
  | 'manage:policies'
  | 'view:health';

export type RoleName = 'admin' | 'manager' | 'analyst' | 'viewer' | 'guest';

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  permissions: Permission[];
  isCustom: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  roles: RoleName[];
  status: 'active' | 'inactive' | 'suspended';
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

interface RBACState {
  users: User[];
  roles: Role[];
  currentUser?: User;
  currentUserPermissions: Permission[];

  // User management
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;

  // Role management
  addRole: (role: Omit<Role, 'id' | 'createdAt'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  getRoles: () => Role[];
  getRoleByName: (name: RoleName) => Role | undefined;

  // Permissions
  setCurrentUser: (user: User) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getPermissionsForRole: (roleName: RoleName) => Permission[];
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'admin',
    description: 'Full system access',
    permissions: [
      'view:data',
      'edit:data',
      'delete:data',
      'manage:users',
      'manage:roles',
      'view:audit',
      'export:data',
      'import:data',
      'manage:policies',
      'view:health',
    ],
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-manager',
    name: 'manager',
    description: 'Team and data management',
    permissions: ['view:data', 'edit:data', 'delete:data', 'view:audit', 'export:data', 'import:data'],
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-analyst',
    name: 'analyst',
    description: 'Data analysis and reporting',
    permissions: ['view:data', 'edit:data', 'export:data', 'view:audit'],
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-viewer',
    name: 'viewer',
    description: 'Read-only access',
    permissions: ['view:data'],
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'role-guest',
    name: 'guest',
    description: 'Limited guest access',
    permissions: [],
    isCustom: false,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@dataspace.com',
    role: 'admin',
    roles: ['admin'],
    status: 'active',
    department: 'Administration',
    createdAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'user-2',
    name: 'Jane Manager',
    email: 'jane@dataspace.com',
    role: 'manager',
    roles: ['manager'],
    status: 'active',
    department: 'Operations',
    createdAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'user-3',
    name: 'Bob Analyst',
    email: 'bob@dataspace.com',
    role: 'analyst',
    roles: ['analyst'],
    status: 'active',
    department: 'Analytics',
    createdAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'user-4',
    name: 'Alice Viewer',
    email: 'alice@dataspace.com',
    role: 'viewer',
    roles: ['viewer'],
    status: 'active',
    department: 'Marketing',
    createdAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
];

export const useRBACStore = create<RBACState>((set, get) => ({
  users: DEFAULT_USERS,
  roles: DEFAULT_ROLES,
  currentUserPermissions: [],

  // User management
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      users: [...state.users, newUser],
    }));
  },

  updateUser: (id: string, updates: Partial<User>) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser,
    }));
  },

  deleteUser: (id: string) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
  },

  getUsers: () => {
    return get().users;
  },

  getUserById: (id: string) => {
    return get().users.find((u) => u.id === id);
  },

  // Role management
  addRole: (role: Omit<Role, 'id' | 'createdAt'>) => {
    const newRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      roles: [...state.roles, newRole],
    }));
  },

  updateRole: (id: string, updates: Partial<Role>) => {
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },

  deleteRole: (id: string) => {
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id || r.isCustom),
    }));
  },

  getRoles: () => {
    return get().roles;
  },

  getRoleByName: (name: RoleName) => {
    return get().roles.find((r) => r.name === name);
  },

  // Permissions
  setCurrentUser: (user: User) => {
    const roleData = get().getRoleByName(user.role);
    set({
      currentUser: user,
      currentUserPermissions: roleData?.permissions || [],
    });
  },

  hasPermission: (permission: Permission) => {
    return get().currentUserPermissions.includes(permission);
  },

  hasAnyPermission: (permissions: Permission[]) => {
    const userPerms = get().currentUserPermissions;
    return permissions.some((p) => userPerms.includes(p));
  },

  hasAllPermissions: (permissions: Permission[]) => {
    const userPerms = get().currentUserPermissions;
    return permissions.every((p) => userPerms.includes(p));
  },

  getPermissionsForRole: (roleName: RoleName) => {
    const role = get().getRoleByName(roleName);
    return role?.permissions || [];
  },
}));
