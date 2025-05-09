import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, LayoutDashboard, Calendar, Users, BarChart3, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'Movies',
      path: '/admin/movies',
      icon: <Film size={20} />,
    },
    {
      name: 'Screenings',
      path: '/admin/screenings',
      icon: <Calendar size={20} />,
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: <Users size={20} />,
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: <BarChart3 size={20} />,
    },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full bg-secondary-900 text-white transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'
        } shadow-xl`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-800">
          <Link to="/admin" className="flex items-center">
            <Film className="h-8 w-8 text-primary-500" />
            <span className={`ml-2 font-bold transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
              CineMax Admin
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded-md hover:bg-secondary-800 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-md transition-all ${
                    isActive(item.path)
                      ? 'bg-primary-700 text-white'
                      : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden md:block'}`}>
                    {item.name}
                  </span>
                  {!isOpen && (
                    <div className="absolute left-full ml-6 py-1 px-2 bg-secondary-800 rounded text-sm font-medium text-white opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-75 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-2">
          <div className="px-2 py-4 border-t border-secondary-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-md text-secondary-300 hover:bg-secondary-800 hover:text-white transition-all"
            >
              <LogOut size={20} />
              <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden md:block'}`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Toggle button for medium screens */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-40 hidden md:flex items-center justify-center p-2 bg-secondary-800 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all"
      >
        <ChevronRight size={20} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
    </>
  );
};

export default AdminSidebar;