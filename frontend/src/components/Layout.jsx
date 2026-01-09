import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Briefcase, Heart, FileText, User, Building2, 
  LogOut, Menu, X, Settings 
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const candidateLinks = [
    { to: '/dashboard', icon: Home, label: 'Tableau de bord' },
    { to: '/jobs', icon: Briefcase, label: 'Offres' },
    { to: '/wishlist', icon: Heart, label: 'Favoris' },
    { to: '/applications', icon: FileText, label: 'Candidatures' },
    { to: '/profile', icon: User, label: 'Profil' },
  ];

  const recruiterLinks = [
    { to: '/dashboard', icon: Home, label: 'Tableau de bord' },
    { to: '/company', icon: Building2, label: 'Entreprise' },
    { to: '/my-jobs', icon: Briefcase, label: 'Mes offres' },
    { to: '/recruiter/applications', icon: FileText, label: 'Candidatures' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: Home, label: 'Tableau de bord' },
    { to: '/admin/users', icon: User, label: 'Utilisateurs' },
    { to: '/admin/skills', icon: Settings, label: 'Competences' },
  ];

  const links = user?.role === 'admin' 
    ? adminLinks 
    : user?.role === 'recruiter' 
    ? recruiterLinks 
    : candidateLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="CareerPath AI" 
                  className="w-9 h-9 object-cover scale-125"
                />
              </div>
              <span className="text-xl font-semibold text-secondary-800 hidden sm:block">
                CareerPath AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
                    isActive(link.to)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <link.icon size={18} />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-secondary-800">{user?.email}</p>
                <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-secondary-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-smooth"
                title="Deconnexion"
              >
                <LogOut size={20} />
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-secondary-500 hover:bg-secondary-100 rounded-lg"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <nav className="px-4 py-3 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth ${
                    isActive(link.to)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
