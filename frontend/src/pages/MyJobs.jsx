import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, Plus, Edit, Trash2, Users, 
  Clock, MapPin, Building2, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI, companiesAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, companyRes] = await Promise.all([
        jobsAPI.getAll(),
        companiesAPI.getMy().catch(() => null),
      ]);
      
      // API returns companies array, get the first one
      const companies = companyRes?.data?.data?.companies || [];
      const comp = companies[0];
      setCompany(comp);
      
      // Filter jobs by company
      const allJobs = jobsRes.data.data.jobs || [];
      const myJobs = comp ? allJobs.filter(j => j.company?._id === comp._id) : [];
      setJobs(myJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Supprimer cette offre ?')) return;
    
    setDeleting(jobId);
    try {
      await jobsAPI.delete(jobId);
      setJobs(jobs.filter(j => j._id !== jobId));
      toast.success('Offre supprimee');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
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
    return (
      <Layout>
        <Card className="text-center py-12">
          <Building2 className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">Aucune entreprise</h3>
          <p className="text-secondary-500 mt-2">
            Vous devez d'abord creer votre entreprise
          </p>
          <Link to="/company">
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Creer mon entreprise
            </Button>
          </Link>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Mes Offres</h1>
          <p className="text-secondary-500 mt-2">
            Gerez vos offres d'emploi
          </p>
        </div>
        <Link to="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle offre
          </Button>
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg text-secondary-900">
                        {job.title}
                      </h3>
                      <Badge variant="primary">{job.contractType}</Badge>
                      {job.status === 'closed' && (
                        <Badge variant="danger">Fermee</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {company.location || 'Tunisie'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.applicationsCount || 0} candidatures
                      </span>
                    </div>
                    {job.skills?.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        {job.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill._id} variant="default" size="sm">
                            {skill.name}
                          </Badge>
                        ))}
                        {job.skills.length > 4 && (
                          <Badge variant="default" size="sm">
                            +{job.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/jobs/${job._id}`}>
                      <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-smooth">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
                    <Link to={`/jobs/${job._id}/edit`}>
                      <button className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-smooth">
                        <Edit className="w-5 h-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      disabled={deleting === job._id}
                      className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">Aucune offre</h3>
          <p className="text-secondary-500 mt-2">
            Vous n'avez pas encore publie d'offres
          </p>
          <Link to="/jobs/new">
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Publier une offre
            </Button>
          </Link>
        </Card>
      )}
    </Layout>
  );
};

export default MyJobs;
