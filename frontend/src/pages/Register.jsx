import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caracteres');
      return;
    }

    try {
      await register(email, password, role);
      toast.success('Inscription reussie. Verifiez votre email.');
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Echec de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-white max-w-lg"
        >
          <h2 className="text-4xl font-bold mb-4">
            Rejoignez CareerPath AI
          </h2>
          <p className="text-lg text-secondary-300">
            Que vous soyez candidat ou recruteur, notre plateforme 
            intelligente vous aide a atteindre vos objectifs professionnels.
          </p>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
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
            <h1 className="text-3xl font-bold text-secondary-900">Creer un compte</h1>
            <p className="text-secondary-500 mt-2">Commencez votre parcours professionnel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-700">
                Je suis
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-smooth ${
                    role === 'candidate'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <User size={20} />
                  <span className="font-medium">Candidat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-xl border-2 transition-smooth ${
                    role === 'recruiter'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <Building2 size={20} />
                  <span className="font-medium">Recruteur</span>
                </button>
              </div>
            </div>

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
              placeholder="Minimum 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              icon={Lock}
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              S'inscrire
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="text-center mt-6 text-secondary-600">
            Deja un compte ?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
              Connectez-vous
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
