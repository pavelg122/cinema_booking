import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="bg-secondary-900 border-b border-secondary-800 h-16 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md text-secondary-400 hover:text-white hover:bg-secondary-800 focus:outline-none"
        >
          <Menu size={20} />
        </button>
        <div className="ml-4 md:ml-0">
          <h1 className="text-white text-lg font-semibold">Admin Dashboard</h1>
          <p className="text-secondary-400 text-xs">
            Welcome back, {user?.name}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="p-2 rounded-full text-secondary-400 hover:text-white hover:bg-secondary-800 focus:outline-none">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div>
        
        <Link to="/" className="hidden sm:block px-3 py-1 rounded-md bg-secondary-800 text-secondary-300 hover:bg-secondary-700 hover:text-white text-sm transition-colors">
          View Website
        </Link>
        
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white cursor-pointer">
            {user?.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;