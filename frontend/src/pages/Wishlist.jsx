import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Clock, Building2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { wishlistAPI } from '../services/api';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlist(response.data.data.wishlist || []);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (jobId) => {
    try {
      await wishlistAPI.remove(jobId);
      setWishlist(wishlist.filter(job => job._id !== jobId));
      toast.success('Retire des favoris');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Mes Favoris</h1>
        <p className="text-secondary-500 mt-2">
          Les offres que vous avez sauvegardees
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wishlist.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card hover className="relative">
                <button
                  onClick={() => removeFromWishlist(job._id)}
                  className="absolute top-4 right-4 p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-smooth"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

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
                    <div className="flex-1 min-w-0 pr-10">
                      <h3 className="font-semibold text-lg text-secondary-900 truncate">
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

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-100">
                    <div className="flex items-center space-x-2">
                      <Badge variant="primary">{job.contractType}</Badge>
                      {job.skills?.slice(0, 2).map((skill) => (
                        <Badge key={skill._id} variant="default">{skill.name}</Badge>
                      ))}
                    </div>
                    {job.salary && (
                      <span className="font-semibold text-primary-600">{job.salary}</span>
                    )}
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Heart className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">Aucun favori</h3>
          <p className="text-secondary-500 mt-2">
            Vous n'avez pas encore sauvegarde d'offres
          </p>
          <Link to="/jobs">
            <button className="mt-4 text-primary-600 font-medium hover:text-primary-700">
              Parcourir les offres
            </button>
          </Link>
        </Card>
      )}
    </Layout>
  );
};

export default Wishlist;
