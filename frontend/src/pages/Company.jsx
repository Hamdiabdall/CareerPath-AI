import { useEffect, useState, useRef } from 'react';
import { 
  Building2, MapPin, Globe, 
  Camera, Save, Plus 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { companiesAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Company = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    website: '',
  });
  const logoInputRef = useRef(null);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const response = await companiesAPI.getMy();
      // API returns companies array, get the first one
      const companies = response.data.data.companies || [];
      const comp = companies[0];
      if (comp) {
        setCompany(comp);
        setFormData({
          name: comp.name || '',
          description: comp.description || '',
          location: comp.location || '',
          website: comp.website || '',
        });
      } else {
        setIsNew(true);
      }
    } catch (error) {
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const response = await companiesAPI.create(formData);
        setCompany(response.data.data.company);
        setIsNew(false);
        toast.success('Entreprise creee');
      } else {
        const response = await companiesAPI.update(company._id, formData);
        setCompany(response.data.data.company);
        toast.success('Entreprise mise a jour');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez selectionner une image');
      return;
    }

    try {
      const response = await companiesAPI.uploadLogo(company._id, file);
      setCompany(response.data.data.company);
      toast.success('Logo mis a jour');
    } catch (error) {
      toast.error('Erreur lors du telechargement');
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">
            {isNew ? 'Creer mon entreprise' : 'Mon Entreprise'}
          </h1>
          <p className="text-secondary-500 mt-2">
            {isNew ? 'Configurez votre entreprise pour publier des offres' : 'Gerez les informations de votre entreprise'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Logo Section */}
          {!isNew && (
            <Card>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
                    {company?.logo ? (
                      <img
                        src={`http://localhost:3006/${company.logo}`}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-primary-600" />
                    )}
                  </div>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-smooth"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">
                    {company?.name || 'Nom de l\'entreprise'}
                  </h3>
                  <p className="text-secondary-500">{company?.location}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Company Form */}
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">
              Informations de l'entreprise
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nom de l'entreprise"
                name="name"
                icon={Building2}
                placeholder="Ex: VERMEG Tunisia"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Localisation"
                name="location"
                icon={MapPin}
                placeholder="Ex: Tunis, Tunisie"
                value={formData.location}
                onChange={handleChange}
              />

              <Input
                label="Site web"
                name="website"
                icon={Globe}
                placeholder="https://..."
                value={formData.website}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Decrivez votre entreprise..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-secondary-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-smooth"
                />
              </div>

              <Button type="submit" isLoading={saving}>
                {isNew ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Creer l'entreprise
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Company;
