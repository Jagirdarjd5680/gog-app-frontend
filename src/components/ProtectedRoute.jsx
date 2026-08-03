import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasModulePermission } from '../utils/permissions';

/**
 * `requiredPermission={{ module: 'exams', action: 'view' }}` sends a teacher
 * without that grant straight back to the dashboard, silently (no error page) —
 * this only ever affects teachers; admins and other roles are unaffected
 * (see hasModulePermission).
 */
const ProtectedRoute = ({ children, allowedRoles = [], requiredPermission }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (requiredPermission && !hasModulePermission(user, requiredPermission.module, requiredPermission.action)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
