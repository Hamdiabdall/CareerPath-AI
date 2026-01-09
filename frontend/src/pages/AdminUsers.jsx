import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Trash2, Search, User, Building2, Shield,
  Mail, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Badge from '../components/Badge';

const roleConfig = {
  candidate: { label: 'Candidat', variant: 'primary', icon: User },
  recruiter: { label: 'Recruteur', variant: 'success', icon: Building2 },
  admin: { label: 'Admin', variant: 'danger', icon: Shield },
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, email) => {
    if (!confirm(`Supprimer l'utilisateur ${email} ? Cette action est irreversible.`)) return;
    
    setDeleting(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('Utilisateur supprime');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!search) return true;
    const s = search.toLowerCase();
    return user.email.toLowerCase().includes(s) || 
           user.role.toLowerCase().includes(s);
  });

  const stats = {
    total: users.length,
    candidates: users.filter(u => u.role === 'candidate').length,
    recruiters: users.filter(u => u.role === 'recruiter').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Gestion des Utilisateurs</h1>
        <p className="text-secondary-500 mt-2">
          Administrez les comptes utilisateurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
          <p className="text-sm text-secondary-500">Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">{stats.candidates}</p>
          <p className="text-sm text-secondary-500">Candidats</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.recruiters}</p>
          <p className="text-sm text-secondary-500">Recruteurs</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
          <p className="text-sm text-secondary-500">Admins</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          icon={Search}
          placeholder="Rechercher par email ou role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map((user, index) => {
            const role = roleConfig[user.role] || roleConfig.candidate;
            const RoleIcon = role.icon;

            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-red-100' :
                        user.role === 'recruiter' ? 'bg-green-100' : 'bg-primary-100'
                      }`}>
                        <RoleIcon className={`w-6 h-6 ${
                          user.role === 'admin' ? 'text-red-600' :
                          user.role === 'recruiter' ? 'text-green-600' : 'text-primary-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-secondary-900">{user.email}</p>
                          <Badge variant={role.variant} size="sm">{role.label}</Badge>
                          {!user.isVerified && (
                            <Badge variant="warning" size="sm">Non verifie</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-secondary-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user._id, user.email)}
                        disabled={deleting === user._id}
                        className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">Aucun utilisateur</h3>
        </Card>
      )}
    </Layout>
  );
};

export default AdminUsers;
