import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Calendar, DollarSign, 
  ArrowLeft, Save, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, skillsAPI, companiesAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const contractTypes = ['CDI', 'CDD', 'Freelance', 'Stage'];

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contractType: 'CDI',
    salary: '',
    deadline: '',
    skills: [],
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [skillsRes, companyRes] = await Promise.all([
        skillsAPI.getAll(),
        companiesAPI.getMy(),
      ]);
      
      setSkills(skillsRes.data.data.skills || []);
      // API returns companies array, get the first one
      const companies = companyRes.data.data.companies || [];
      const comp = companies[0];
      setCompany(comp);

      if (!comp) {
        toast.error('Vous devez d\'abord creer une entreprise');
        navigate('/company');
        return;
      }

      if (isEdit) {
        const jobRes = await jobsAPI.getById(id);
        const job = jobRes.data.data.job;
        setFormData({
          title: job.title || '',
          description: job.description || '',
          contractType: job.contractType || 'CDI',
          salary: job.salary || '',
          deadline: job.deadline ? job.deadline.split('T')[0] : '',
          skills: job.skills?.map(s => s._id) || [],
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skillId) => {
    if (formData.skills.includes(skillId)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter(id => id !== skillId),
      });
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillId],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('La description est requise');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        companyId: company._id,
      };

      if (isEdit) {
        await jobsAPI.update(id, data);
        toast.success('Offre mise a jour');
      } else {
        await jobsAPI.create(data);
        toast.success('Offre creee');
      }
      navigate('/my-jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-secondary-600 hover:text-secondary-900 mb-6 transition-smooth"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">
            {isEdit ? 'Modifier l\'offre' : 'Nouvelle offre'}
          </h1>
          <p className="text-secondary-500 mt-2">
            {isEdit ? 'Modifiez les details de votre offre' : 'Publiez une nouvelle offre d\'emploi'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Titre du poste"
              name="title"
              icon={Briefcase}
              placeholder="Ex: Developpeur Full Stack"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={6}
                placeholder="Decrivez le poste, les responsabilites, les qualifications requises..."
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-secondary-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-smooth"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Type de contrat
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-secondary-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-smooth"
                >
                  {contractTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Salaire (optionnel)"
                name="salary"
                icon={DollarSign}
                placeholder="Ex: 2000-3000 TND"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Date limite (optionnel)"
              name="deadline"
              type="date"
              icon={Calendar}
              value={formData.deadline}
              onChange={handleChange}
            />

            {/* Skills Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Competences requises
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const isSelected = formData.skills.includes(skill._id);
                  return (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => toggleSkill(skill._id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                      }`}
                    >
                      {skill.name}
                      {isSelected && <X className="w-4 h-4 ml-2 inline" />}
                    </button>
                  );
                })}
              </div>
              {formData.skills.length > 0 && (
                <p className="text-sm text-secondary-500 mt-2">
                  {formData.skills.length} competence(s) selectionnee(s)
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button type="submit" isLoading={saving}>
                {isEdit ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Publier l'offre
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default JobForm;
