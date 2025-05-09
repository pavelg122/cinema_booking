import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <Film className="h-24 w-24 text-primary-500 mb-6" />
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">404 - Page Not Found</h1>
      <p className="text-xl text-secondary-300 mb-8 max-w-md">
        Oops! The page you're looking for seems to have gone missing.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/" className="btn btn-primary flex items-center">
          <Home className="h-5 w-5 mr-2" />
          Return Home
        </Link>
        <Link to="/movies" className="btn btn-outline flex items-center">
          Browse Movies
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;