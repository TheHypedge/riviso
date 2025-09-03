// Role-based access control system
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin', 
  MANAGER = 'manager',
  USER = 'user'
}

export interface RolePermissions {
  canManageUsers: boolean
  canManageRoles: boolean
  canViewAnalytics: boolean
  canManageAudits: boolean
  canAccessAdminPanel: boolean
  canManageBilling: boolean
  canViewAllAudits: boolean
  canExportData: boolean
  auditLimit: number
  canCreateUnlimitedAudits: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    canManageUsers: true,
    canManageRoles: true,
    canViewAnalytics: true,
    canManageAudits: true,
    canAccessAdminPanel: true,
    canManageBilling: true,
    canViewAllAudits: true,
    canExportData: true,
    auditLimit: -1, // Unlimited
    canCreateUnlimitedAudits: true
  },
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageRoles: false,
    canViewAnalytics: true,
    canManageAudits: true,
    canAccessAdminPanel: true,
    canManageBilling: true,
    canViewAllAudits: true,
    canExportData: true,
    auditLimit: 1000,
    canCreateUnlimitedAudits: false
  },
  [UserRole.MANAGER]: {
    canManageUsers: false,
    canManageRoles: false,
    canViewAnalytics: true,
    canManageAudits: true,
    canAccessAdminPanel: false,
    canManageBilling: false,
    canViewAllAudits: false,
    canExportData: true,
    auditLimit: 100,
    canCreateUnlimitedAudits: false
  },
  [UserRole.USER]: {
    canManageUsers: false,
    canManageRoles: false,
    canViewAnalytics: false,
    canManageAudits: false,
    canAccessAdminPanel: false,
    canManageBilling: false,
    canViewAllAudits: false,
    canExportData: false,
    auditLimit: 5,
    canCreateUnlimitedAudits: false
  }
}

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.MANAGER]: 'Manager', 
  [UserRole.USER]: 'User'
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Full system access with unlimited privileges',
  [UserRole.ADMIN]: 'Administrative access to manage users and system',
  [UserRole.MANAGER]: 'Team management with analytics and audit oversight',
  [UserRole.USER]: 'Standard user with basic audit capabilities'
}

// Helper functions
export const getUserPermissions = (role: UserRole): RolePermissions => {
  return ROLE_PERMISSIONS[role]
}

export const hasPermission = (userRole: UserRole, permission: keyof RolePermissions): boolean => {
  const value = ROLE_PERMISSIONS[userRole][permission]
  return typeof value === 'boolean' ? value : Boolean(value)
}

export const canAccessFeature = (userRole: UserRole, feature: string): boolean => {
  const permissions = getUserPermissions(userRole)
  
  switch (feature) {
    case 'user_management':
      return permissions.canManageUsers
    case 'role_management':
      return permissions.canManageRoles
    case 'analytics':
      return permissions.canViewAnalytics
    case 'audit_management':
      return permissions.canManageAudits
    case 'admin_panel':
      return permissions.canAccessAdminPanel
    case 'billing':
      return permissions.canManageBilling
    case 'view_all_audits':
      return permissions.canViewAllAudits
    case 'export_data':
      return permissions.canExportData
    default:
      return false
  }
}
