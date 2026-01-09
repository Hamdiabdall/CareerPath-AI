import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Connexion reussie');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Echec de connexion');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden bg-white shadow-lg flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="CareerPath AI" 
                className="w-16 h-16 object-cover scale-125"
              />
            </div>
            <h1 className="text-3xl font-bold text-secondary-900">Bon retour</h1>
            <p className="text-secondary-500 mt-2">Connectez-vous a votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              icon={Lock}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Se connecter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="text-center mt-6 text-secondary-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
              Inscrivez-vous
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Gradient */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-white max-w-lg"
        >
          <h2 className="text-4xl font-bold mb-4">
            Trouvez votre emploi ideal avec l'IA
          </h2>
          <p className="text-lg text-secondary-300">
            CareerPath AI utilise l'intelligence artificielle pour vous connecter 
            aux meilleures opportunites professionnelles en Tunisie.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
