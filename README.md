# CareerPath AI

Plateforme de recrutement intelligente utilisant l'IA pour connecter candidats et recruteurs en Tunisie.

## Fonctionnalités

### Candidats
- Création de profil avec photo et CV
- Recherche d'offres d'emploi avec filtres
- Génération de lettres de motivation par IA
- Gestion des candidatures
- Liste de favoris (wishlist)

### Recruteurs
- Gestion d'entreprise avec logo
- Publication d'offres d'emploi
- Réception et gestion des candidatures
- Analyse IA des profils candidats (score de compatibilité)

### Administrateurs
- Gestion des utilisateurs
- Gestion des compétences
- Modération de la plateforme

## Technologies

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (OTP par email)
- Ollama/Llama 3.2 (IA)
- Multer (upload fichiers)

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- Axios
- React Router v6

## Installation

### Prérequis
- Node.js 18+
- MongoDB
- Ollama (optionnel, pour l'IA)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Configuration

### Variables d'environnement (backend/.env)

```env
PORT=3006
MONGODB_URI=mongodb://localhost:27017/careerpath-ai
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Ollama AI
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
USE_MOCK_AI=false
```

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@careerpath.tn | root123* |
| Candidat | hamdi.abdallah@polytechnicien.tn | Test123! |
| Recruteur | lce2iot@gmail.com | Test123! |

## Structure du projet

```
CareerPath AI/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (DB, Ollama)
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── middleware/     # Auth, upload, validation
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes Express
│   │   ├── services/       # Logique métier
│   │   └── utils/          # Utilitaires
│   ├── uploads/            # Fichiers uploadés
│   └── tests/              # Tests
├── frontend/
│   ├── public/             # Assets statiques
│   └── src/
│       ├── components/     # Composants réutilisables
│       ├── pages/          # Pages de l'application
│       ├── services/       # API calls
│       └── store/          # State management
└── API_DOCUMENTATION.md    # Documentation API
```

## API

Voir [api.md](./api.md) pour la documentation complète.

## Démarrage rapide

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:3006
- Frontend: http://localhost:5174

## Auteur

Hamdi Abdallah - Polytechnique Sousse
