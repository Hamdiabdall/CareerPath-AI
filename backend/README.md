# CareerPath AI - Backend

Plateforme de recrutement avec IA locale (Ollama/Llama 3.2)

## Stack Technique

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **AI**: Ollama (Llama 3.2)
- **Auth**: JWT + bcrypt
- **Email**: Nodemailer (SMTP)
- **Tests**: Jest + fast-check (PBT)

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` basé sur `.env.example` :

```bash
cp .env.example .env
```

## Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

## Tests

```bash
# Tous les tests
npm test

# Tests de propriétés uniquement
npm run test:properties

# Mode watch
npm run test:watch
```

## Structure

```
src/
├── config/       # Configuration (DB, Ollama, Email)
├── middleware/   # Auth, roleGuard, upload
├── models/       # Mongoose schemas
├── controllers/  # Route handlers
├── services/     # Business logic
├── routes/       # API routes
└── utils/        # Helpers (PDF, OTP, errors)
```
