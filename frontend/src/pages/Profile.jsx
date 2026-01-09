import { useEffect, useState, useRef } from 'react';
import { 
  User, Phone, Link as LinkIcon, FileText, 
  Camera, Save, Upload 
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { profileAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Profile = () => {
  const { user, profile, fetchProfile, updateProfile, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    portfolioLink: '',
  });
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef(null);
  const cvInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await fetchProfile();
      if (profileData) {
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          bio: profileData.bio || '',
          phone: profileData.phone || '',
          portfolioLink: profileData.portfolioLink || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Profil mis a jour');
    } catch (error) {
      toast.error('Erreur lors de la mise a jour');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez selectionner une image');
      return;
    }

    setUploading(true);
    try {
      await profileAPI.uploadPhoto(file);
      await fetchProfile();
      toast.success('Photo mise a jour');
    } catch (error) {
      toast.error('Erreur lors du telechargement');
    } finally {
      setUploading(false);
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Veuillez selectionner un fichier PDF');
      return;
    }

    setUploading(true);
    try {
      await profileAPI.uploadCV(file);
      await fetchProfile();
      toast.success('CV mis a jour');
    } catch (error) {
      toast.error('Erreur lors du telechargement');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Mon Profil</h1>
          <p className="text-secondary-500 mt-2">
            Gerez vos informations personnelles
          </p>
        </div>

        <div className="space-y-6">
          {/* Photo Section */}
          <Card>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
                  {profile?.photo ? (
                    <img
                      src={`http://localhost:3006/${profile.photo}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary-600" />
                  )}
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-smooth"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">
                  {profile?.fullName || 'Votre nom'}
                </h3>
                <p className="text-secondary-500">{user?.email}</p>
                <p className="text-sm text-secondary-400 mt-1 capitalize">{user?.role}</p>
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">
              Informations personnelles
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Prenom"
                  name="firstName"
                  icon={User}
                  placeholder="Votre prenom"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Nom"
                  name="lastName"
                  icon={User}
                  placeholder="Votre nom"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Telephone"
                name="phone"
                icon={Phone}
                placeholder="+216 XX XXX XXX"
                value={formData.phone}
                onChange={handleChange}
              />

              <Input
                label="Portfolio / LinkedIn"
                name="portfolioLink"
                icon={LinkIcon}
                placeholder="https://..."
                value={formData.portfolioLink}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-secondary-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-smooth"
                />
              </div>

              <Button type="submit" isLoading={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </form>
          </Card>

          {/* CV Section */}
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">
              Curriculum Vitae
            </h2>
            
            {profile?.cvUrl ? (
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">CV.pdf</p>
                    <p className="text-sm text-secondary-500">Document PDF</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`http://localhost:3006/${profile.cvUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-smooth"
                  >
                    Voir
                  </a>
                  <button
                    onClick={() => cvInputRef.current?.click()}
                    className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-smooth"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => cvInputRef.current?.click()}
                className="border-2 border-dashed border-secondary-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-smooth"
              >
                <Upload className="w-10 h-10 text-secondary-400 mx-auto mb-3" />
                <p className="font-medium text-secondary-700">
                  Cliquez pour telecharger votre CV
                </p>
                <p className="text-sm text-secondary-500 mt-1">
                  Format PDF uniquement (max 5MB)
                </p>
              </div>
            )}
            
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf"
              onChange={handleCVUpload}
              className="hidden"
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
