import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Heart,
  FileText,
  Building2,
  Users,
  Clock,
  ArrowRight,
  Settings,
  Shield,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { jobsAPI, applicationsAPI, wishlistAPI, companiesAPI, skillsAPI } from '../services/api';
import api from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Card className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-secondary-900">{value}</p>
        <p className="text-sm text-secondary-500">{label}</p>
      </div>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const { user, profile, fetchProfile } = useAuthStore();
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    wishlist: 0,
    companies: 0,
    users: 0,
    skills: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.role === 'candidate') {
          await fetchProfile();
          const [jobsRes, appsRes, wishlistRes] = await Promise.all([
            jobsAPI.getAll({ limit: 5 }),
            applicationsAPI.getAll(),
            wishlistAPI.get(),
          ]);
          setStats({
            jobs: jobsRes.data.data.pagination?.total || jobsRes.data.data.jobs?.length || 0,
            applications: appsRes.data.data.applications?.length || 0,
            wishlist: wishlistRes.data.data.wishlist?.length || 0,
          });
          setRecentJobs(jobsRes.data.data.jobs || []);
        } else if (user?.role === 'recruiter') {
          const [companyRes, jobsRes, appsRes] = await Promise.all([
            companiesAPI.getMy().catch(() => null),
            jobsAPI.getAll({ limit: 5 }),
            applicationsAPI.getAll().catch(() => ({ data: { data: { applications: [] } } })),
          ]);

          // API returns companies array, get the first one
          const companies = companyRes?.data?.data?.companies || [];
          const company = companies[0];
          const allJobs = jobsRes.data.data.jobs || [];
          const myJobs = company ? allJobs.filter((j) => j.company?._id === company._id) : [];

          setStats({
            companies: company ? 1 : 0,
            jobs: myJobs.length,
            applications: appsRes.data.data.applications?.length || 0,
          });
          setRecentJobs(myJobs.slice(0, 5));
        } else if (user?.role === 'admin') {
          const [usersRes, jobsRes, skillsRes] = await Promise.all([
            api.get('/admin/users'),
            jobsAPI.getAll({ limit: 5 }),
            skillsAPI.getAll(),
          ]);

          const allUsers = usersRes.data.data.users || [];
          setStats({
            users: allUsers.length,
            jobs: jobsRes.data.data.jobs?.length || 0,
            skills: skillsRes.data.data.skills?.length || 0,
            candidates: allUsers.filter((u) => u.role === 'candidate').length,
            recruiters: allUsers.filter((u) => u.role === 'recruiter').length,
          });
          setRecentJobs(jobsRes.data.data.jobs || []);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, fetchProfile]);

  const candidateStats = [
    { icon: Briefcase, label: 'Offres disponibles', value: stats.jobs, color: 'bg-primary-500' },
    { icon: FileText, label: 'Candidatures', value: stats.applications, color: 'bg-green-500' },
    { icon: Heart, label: 'Favoris', value: stats.wishlist, color: 'bg-red-500' },
  ];

  const recruiterStats = [
    { icon: Building2, label: 'Entreprises', value: stats.companies, color: 'bg-primary-500' },
    { icon: Briefcase, label: 'Offres publiees', value: stats.jobs, color: 'bg-green-500' },
    { icon: Users, label: 'Candidatures recues', value: stats.applications || 0, color: 'bg-amber-500' },
  ];

  const adminStats = [
    { icon: Users, label: 'Utilisateurs', value: stats.users || 0, color: 'bg-primary-500' },
    { icon: Briefcase, label: 'Offres totales', value: stats.jobs || 0, color: 'bg-green-500' },
    { icon: Settings, label: 'Competences', value: stats.skills || 0, color: 'bg-amber-500' },
  ];

  const displayStats =
    user?.role === 'admin' ? adminStats : user?.role === 'recruiter' ? recruiterStats : candidateStats;

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-hero rounded-3xl p-8 text-white"
        >
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {profile?.firstName || user?.email?.split('@')[0]}
          </h1>
          <p className="text-secondary-300">
            {user?.role === 'candidate'
              ? 'Decouvrez les meilleures opportunites pour votre carriere'
              : user?.role === 'admin'
                ? 'Administrez la plateforme CareerPath AI'
                : 'Gerez vos offres et trouvez les meilleurs talents'}
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {displayStats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Recent Jobs - Hide for admin */}
      {user?.role !== 'admin' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">
              {user?.role === 'recruiter' ? 'Vos offres recentes' : 'Offres recentes'}
            </h2>
            <Link
              to={user?.role === 'recruiter' ? '/my-jobs' : '/jobs'}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              Voir tout
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner" />
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="block p-4 rounded-xl border border-secondary-100 hover:border-primary-200 hover:bg-primary-50/50 transition-smooth"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-secondary-900">{job.title}</h3>
                      <p className="text-sm text-secondary-500 mt-1">
                        {job.company?.name} - {job.company?.location}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-secondary-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                      {job.contractType}
                    </span>
                    {job.salary && <span className="text-sm text-secondary-500">{job.salary}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary-500 py-8">Aucune offre disponible</p>
          )}
        </Card>
      )}

      {/* Admin Quick Links */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/users">
            <Card hover className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Gestion des Utilisateurs</h3>
                <p className="text-sm text-secondary-500">
                  {stats.candidates || 0} candidats, {stats.recruiters || 0} recruteurs
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-secondary-400 ml-auto" />
            </Card>
          </Link>
          <Link to="/admin/skills">
            <Card hover className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Gestion des Competences</h3>
                <p className="text-sm text-secondary-500">{stats.skills || 0} competences disponibles</p>
              </div>
              <ArrowRight className="w-5 h-5 text-secondary-400 ml-auto" />
            </Card>
          </Link>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
