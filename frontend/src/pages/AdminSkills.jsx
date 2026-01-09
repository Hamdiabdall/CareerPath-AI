import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Plus, Trash2, Search, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { skillsAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await skillsAPI.getAll();
      setSkills(response.data.data.skills || []);
    } catch (error) {
      console.error('Failed to load skills:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    setCreating(true);
    try {
      const response = await skillsAPI.create({ name: newSkill.trim() });
      setSkills([...skills, response.data.data.skill]);
      setNewSkill('');
      toast.success('Competence ajoutee');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (skillId, name) => {
    if (!confirm(`Supprimer la competence "${name}" ?`)) return;
    
    setDeleting(skillId);
    try {
      await skillsAPI.delete(skillId);
      setSkills(skills.filter(s => s._id !== skillId));
      toast.success('Competence supprimee');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setDeleting(null);
    }
  };

  const filteredSkills = skills.filter(skill => {
    if (!search) return true;
    return skill.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Gestion des Competences</h1>
        <p className="text-secondary-500 mt-2">
          Gerez les competences disponibles pour les offres
        </p>
      </div>

      {/* Add Skill Form */}
      <Card className="mb-6">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <Input
              label="Nouvelle competence"
              icon={Tag}
              placeholder="Ex: React, Python, Docker..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={creating} disabled={!newSkill.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </form>
      </Card>

      {/* Search */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <Input
            icon={Search}
            placeholder="Rechercher une competence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <p className="text-secondary-500">
            {skills.length} competence(s) au total
          </p>
        </div>
      </Card>

      {/* Skills List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredSkills.length > 0 ? (
        <Card>
          <div className="flex flex-wrap gap-3">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="group flex items-center space-x-2 px-4 py-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-smooth"
              >
                <span className="font-medium text-secondary-700">{skill.name}</span>
                <button
                  onClick={() => handleDelete(skill._id, skill.name)}
                  disabled={deleting === skill._id}
                  className="opacity-0 group-hover:opacity-100 p-1 text-secondary-400 hover:text-red-600 rounded transition-smooth disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <Settings className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">Aucune competence</h3>
          <p className="text-secondary-500 mt-2">
            Ajoutez des competences pour les offres d'emploi
          </p>
        </Card>
      )}
    </Layout>
  );
};

export default AdminSkills;
