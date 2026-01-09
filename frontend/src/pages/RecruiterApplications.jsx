import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, Clock, User, CheckCircle, XCircle, 
  MessageSquare, Download, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsAPI, aiAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

const statusConfig = {
  pending: { label: 'En attente', variant: 'warning', icon: Clock },
  interview: { label: 'Entretien', variant: 'info', icon: MessageSquare },
  accepted: { label: 'Accepte', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Refuse', variant: 'danger', icon: XCircle },
};

const RecruiterApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

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

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatus(appId);
    try {
      await applicationsAPI.updateStatus(appId, newStatus);
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
      toast.success('Statut mis a jour');
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAnalyze = async (appId) => {
    setAnalyzing(appId);
    try {
      const response = await aiAPI.analyzeMatch(appId);
      const { matchScore, justification } = response.data.data;
      setApplications(applications.map(app => 
        app._id === appId 
          ? { ...app, matchScore, matchJustification: justification } 
          : app
      ));
      toast.success('Analyse terminee');
    } catch (error) {
      toast.error('Erreur d\'analyse');
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Candidatures</h1>
        <p className="text-secondary-500 mt-2">
          Gerez les candidatures recues
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
                        {app.candidate?.profile?.photo ? (
                          <img 
                            src={`http://localhost:3006/${app.candidate.profile.photo}`} 
                            alt={app.candidate.profile.fullName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-secondary-900">
                          {app.candidate?.profile?.fullName || app.candidate?.email}
                        </h3>
                        <p className="text-secondary-600">{app.candidate?.email}</p>
                        <Link 
                          to={`/jobs/${app.job?._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm mt-1 inline-block"
                        >
                          {app.job?.title}
                        </Link>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(app.appliedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={status.variant} size="lg">
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.label}
                      </Badge>
                      {app.matchScore !== undefined && (
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

                  {/* Cover Letter */}
                  {app.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-secondary-100">
                      <p className="text-sm text-secondary-500 mb-2">Lettre de motivation:</p>
                      <p className="text-secondary-600 text-sm line-clamp-3">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {app.matchJustification && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-xl">
                      <p className="text-sm text-primary-700">
                        <span className="font-medium">Analyse IA: </span>
                        {app.matchJustification}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-secondary-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {app.candidate?.profile?.cvUrl && (
                        <a
                          href={`http://localhost:3006/${app.candidate.profile.cvUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 text-sm text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-smooth"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          CV
                        </a>
                      )}
                      {!app.matchScore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnalyze(app._id)}
                          isLoading={analyzing === app._id}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyser
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        disabled={updatingStatus === app._id}
                        className="text-sm rounded-lg border border-secondary-300 px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-smooth"
                      >
                        <option value="pending">En attente</option>
                        <option value="interview">Entretien</option>
                        <option value="accepted">Accepte</option>
                        <option value="rejected">Refuse</option>
                      </select>
                    </div>
                  </div>
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
            Vous n'avez pas encore recu de candidatures
          </p>
        </Card>
      )}
    </Layout>
  );
};

export default RecruiterApplications;
