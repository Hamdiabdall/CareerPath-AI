import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, Building2, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { applicationsAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';

const statusConfig = {
  pending: { label: 'En attente', variant: 'warning', icon: Clock },
  interview: { label: 'Entretien', variant: 'info', icon: MessageSquare },
  accepted: { label: 'Accepte', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Refuse', variant: 'danger', icon: XCircle },
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await applicationsAPI.getAll();
      setApplications(response.data.data.applications || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Mes Candidatures</h1>
        <p className="text-secondary-500 mt-2">
          Suivez l'etat de vos candidatures
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app, index) => {
            const status = statusConfig[app.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        {app.job?.company?.logo ? (
                          <img 
                            src={`http://localhost:3006/${app.job.company.logo}`} 
                            alt={app.job.company.name}
                            className="w-10 h-10 object-contain rounded-lg"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <Link 
                          to={`/jobs/${app.job?._id}`}
                          className="font-semibold text-lg text-secondary-900 hover:text-primary-600 transition-smooth"
                        >
                          {app.job?.title}
                        </Link>
                        <p className="text-secondary-600 mt-1">{app.job?.company?.name}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Postule le {new Date(app.appliedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={status.variant} size="lg">
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.label}
                      </Badge>
                      {app.matchScore && (
                        <div className="text-sm">
                          <span className="text-secondary-500">Score: </span>
                          <span className={`font-semibold ${
                            app.matchScore >= 70 ? 'text-green-600' :
                            app.matchScore >= 40 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {app.matchScore}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-secondary-100">
                      <p className="text-sm text-secondary-500 mb-2">Lettre de motivation:</p>
                      <p className="text-secondary-600 text-sm line-clamp-3">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {app.matchJustification && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-xl">
                      <p className="text-sm text-primary-700">
                        <span className="font-medium">Analyse IA: </span>
                        {app.matchJustification}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">Aucune candidature</h3>
          <p className="text-secondary-500 mt-2">
            Vous n'avez pas encore postule a une offre
          </p>
          <Link to="/jobs">
            <button className="mt-4 text-primary-600 font-medium hover:text-primary-700">
              Voir les offres disponibles
            </button>
          </Link>
        </Card>
      )}
    </Layout>
  );
};

export default Applications;
