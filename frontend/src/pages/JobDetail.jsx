import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, Briefcase, Building2, Globe, 
  Heart, Send, Sparkles, ArrowLeft, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, applicationsAPI, wishlistAPI, aiAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const [jobRes, wishlistRes, appsRes] = await Promise.all([
        jobsAPI.getById(id),
        wishlistAPI.get().catch(() => ({ data: { data: { wishlist: [] } } })),
        applicationsAPI.getAll().catch(() => ({ data: { data: { applications: [] } } })),
      ]);
      setJob(jobRes.data.data.job);
      setIsWishlisted(wishlistRes.data.data.wishlist?.some(j => j._id === id));
      setHasApplied(appsRes.data.data.applications?.some(a => a.job?._id === id));
    } catch (error) {
      toast.error('Erreur lors du chargement');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(id);
        setIsWishlisted(false);
        toast.success('Retire des favoris');
      } else {
        await wishlistAPI.add(id);
        setIsWishlisted(true);
        toast.success('Ajoute aux favoris');
      }
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const generateCoverLetter = async () => {
    setGenerating(true);
    try {
      const response = await aiAPI.generateCoverLetter(id);
      setCoverLetter(response.data.data.coverLetter);
      toast.success('Lettre generee avec succes');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de generation');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast.error('Veuillez ajouter une lettre de motivation');
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.create({ jobId: id, coverLetter });
      toast.success('Candidature envoyee');
      setHasApplied(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setApplying(false);
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

  if (!job) return null;

  return (
    <Layout>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-secondary-600 hover:text-secondary-900 mb-6 transition-smooth"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour aux offres
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  {job.company?.logo ? (
                    <img 
                      src={`http://localhost:3006/${job.company.logo}`} 
                      alt={job.company.name}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900">{job.title}</h1>
                  <p className="text-lg text-secondary-600 mt-1">{job.company?.name}</p>
                </div>
              </div>
              {user?.role === 'candidate' && (
                <button
                  onClick={toggleWishlist}
                  className={`p-3 rounded-xl transition-smooth ${
                    isWishlisted 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-secondary-100 text-secondary-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-6 text-secondary-600">
              <span className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-secondary-400" />
                {job.company?.location || 'Tunisie'}
              </span>
              <span className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-secondary-400" />
                {job.contractType}
              </span>
              <span className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-secondary-400" />
                Publie le {new Date(job.createdAt).toLocaleDateString('fr-FR')}
              </span>
              {job.deadline && (
                <span className="flex items-center text-amber-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  Date limite: {new Date(job.deadline).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>

            {job.salary && (
              <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                <span className="text-lg font-semibold text-primary-700">{job.salary}</span>
              </div>
            )}
          </Card>

          {/* Description */}
          <Card>
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Description du poste</h2>
            <div className="prose prose-secondary max-w-none">
              <p className="text-secondary-600 whitespace-pre-line">{job.description}</p>
            </div>
          </Card>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Competences requises</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill._id} variant="primary" size="lg">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Apply Section - Candidate Only */}
          {user?.role === 'candidate' && (
            <Card>
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Postuler</h2>
              
              {hasApplied ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900">Candidature envoyee</h3>
                  <p className="text-secondary-500 mt-2">
                    Vous avez deja postule a cette offre
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-secondary-700">
                        Lettre de motivation
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateCoverLetter}
                        isLoading={generating}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generer avec IA
                      </Button>
                    </div>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={8}
                      placeholder="Ecrivez votre lettre de motivation ou utilisez l'IA pour en generer une..."
                      className="w-full rounded-xl border border-secondary-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-smooth"
                    />
                  </div>
                  <Button
                    onClick={handleApply}
                    isLoading={applying}
                    className="w-full"
                    size="lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer ma candidature
                  </Button>
                </>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">A propos de l'entreprise</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{job.company?.name}</p>
                  <p className="text-sm text-secondary-500">{job.company?.location}</p>
                </div>
              </div>
              {job.company?.description && (
                <p className="text-secondary-600 text-sm">{job.company.description}</p>
              )}
              {job.company?.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Visiter le site web
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
