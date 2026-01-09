import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Briefcase, Clock, Heart, 
  Filter, ChevronDown, Building2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, wishlistAPI, skillsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';

const JobCard = ({ job, isWishlisted, onToggleWishlist }) => {
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="relative">
        {user?.role === 'candidate' && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(job._id);
            }}
            className={`absolute top-4 right-4 p-2 rounded-full transition-smooth ${
              isWishlisted 
                ? 'bg-red-100 text-red-500' 
                : 'bg-secondary-100 text-secondary-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        <Link to={`/jobs/${job._id}`}>
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
              {job.company?.logo ? (
                <img 
                  src={`http://localhost:3006/${job.company.logo}`} 
                  alt={job.company.name}
                  className="w-10 h-10 object-contain rounded-lg"
                />
              ) : (
                <Building2 className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-secondary-900 truncate pr-10">
                {job.title}
              </h3>
              <p className="text-secondary-600 mt-1">{job.company?.name}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.company?.location || 'Tunisie'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          <p className="text-secondary-600 mt-4 line-clamp-2">
            {job.description}
          </p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-100">
            <div className="flex items-center space-x-2">
              <Badge variant="primary">{job.contractType}</Badge>
              {job.skills?.slice(0, 2).map((skill) => (
                <Badge key={skill._id} variant="default">{skill.name}</Badge>
              ))}
              {job.skills?.length > 2 && (
                <Badge variant="default">+{job.skills.length - 2}</Badge>
              )}
            </div>
            {job.salary && (
              <span className="font-semibold text-primary-600">{job.salary}</span>
            )}
          </div>
        </Link>
      </Card>
    </motion.div>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    contractType: '',
    skill: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, wishlistRes, skillsRes] = await Promise.all([
        jobsAPI.getAll(),
        wishlistAPI.get().catch(() => ({ data: { data: { wishlist: [] } } })),
        skillsAPI.getAll(),
      ]);
      setJobs(jobsRes.data.data.jobs || []);
      setWishlist(wishlistRes.data.data.wishlist?.map(j => j._id) || []);
      setSkills(skillsRes.data.data.skills || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.contractType) params.contractType = filters.contractType;
      if (filters.skill) params.skill = filters.skill;
      const response = await jobsAPI.getAll(params);
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (jobId) => {
    try {
      if (wishlist.includes(jobId)) {
        await wishlistAPI.remove(jobId);
        setWishlist(wishlist.filter(id => id !== jobId));
        toast.success('Retire des favoris');
      } else {
        await wishlistAPI.add(jobId);
        setWishlist([...wishlist, jobId]);
        toast.success('Ajoute aux favoris');
      }
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return job.title.toLowerCase().includes(search) ||
             job.company?.name?.toLowerCase().includes(search);
    }
    return true;
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Offres d'emploi</h1>
        <p className="text-secondary-500 mt-2">
          Decouvrez les meilleures opportunites en Tunisie
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher par titre ou entreprise..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <Button onClick={handleSearch}>
            Rechercher
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-secondary-100"
          >
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Type de contrat
              </label>
              <select
                value={filters.contractType}
                onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}
                className="w-full rounded-xl border border-secondary-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Tous</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Freelance">Freelance</option>
                <option value="Stage">Stage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Competence
              </label>
              <select
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                className="w-full rounded-xl border border-secondary-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Toutes</option>
                {skills.map((skill) => (
                  <option key={skill._id} value={skill._id}>{skill.name}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Jobs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isWishlisted={wishlist.includes(job._id)}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">Aucune offre trouvee</h3>
          <p className="text-secondary-500 mt-2">
            Essayez de modifier vos criteres de recherche
          </p>
        </Card>
      )}
    </Layout>
  );
};

export default Jobs;
