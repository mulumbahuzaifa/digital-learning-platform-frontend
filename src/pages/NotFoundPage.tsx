import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-medium text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          {isAuthenticated ? (
            <Link
              to={
                user?.role === 'admin'
                  ? '/admin'
                  : user?.role === 'teacher'
                  ? '/teacher'
                  : '/student'
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}