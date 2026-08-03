// Mirrors backend_nestjs/src/auth/module-permissions.ts — keep the module/action
// lists in sync with that file if either side changes.
export const PERMISSION_MODULES = ['exams', 'courses', 'students', 'chat'];
export const PERMISSION_ACTIONS = ['view', 'add', 'edit', 'delete'];

/**
 * Only ever restricts `teacher` accounts — admins always pass, and every other
 * role (student, etc.) is unaffected since this permission system doesn't apply
 * to them at all. Matches the backend's ModulePermissionsGuard exactly so the UI
 * never shows something the API would then 403 on, or vice versa.
 */
export function hasModulePermission(user, module, action) {
    if (!user) return false;
    if (user.role !== 'teacher') return true;
    return user.modulePermissions?.[module]?.[action] === true;
}
