# Implementation Plan

- [x] 1. Configuration du projet et infrastructure de base
  - [x] 1.1 Initialiser le projet backend Node.js/Express
    - Créer package.json avec dépendances (express, mongoose, bcryptjs, jsonwebtoken, multer, pdf-parse, axios, nodemailer)
    - Configurer ESLint et Prettier
    - Créer structure de dossiers (src/config, middleware, models, controllers, services, routes, utils)
    - _Requirements: Architecture Backend_

  - [x] 1.2 Configurer la connexion MongoDB
    - Créer src/config/database.js avec gestion de connexion Mongoose
    - Ajouter gestion des erreurs de connexion
    - _Requirements: Base de données MongoDB_

  - [x] 1.3 Configurer le service email (SMTP)
    - Créer src/config/email.js avec configuration nodemailer
    - Supporter SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS via variables d'environnement
    - _Requirements: 1b.1_

  - [x] 1.4 Configurer le client Ollama
    - Créer src/config/ollama.js avec URL et timeout (30s)
    - Implémenter fonction de vérification de disponibilité
    - Ajouter support USE_MOCK_AI via variable d'environnement
    - _Requirements: 11.3, 11.4_

  - [x] 1.5 Créer les utilitaires de base
    - Créer src/utils/errors.js avec classes d'erreurs personnalisées
    - Créer src/utils/validators.js avec fonctions de validation
    - Créer src/utils/otpUtils.js avec génération et hachage OTP (6 chiffres, bcrypt)
    - _Requirements: Error Handling, 1b.1, 1b.5_

- [x] 2. Modèles Mongoose
  - [x] 2.1 Créer le modèle User
    - Implémenter schema avec email, password (hashé), role, isVerified, otp (code hashé + expiresAt), wishlist, createdAt
    - Ajouter méthode de comparaison de mot de passe
    - Ajouter hook pre-save pour hachage bcrypt
    - _Requirements: 1.1, 1.2, 1b.1, 1b.5_

  - [x] 2.2 Créer le modèle CandidateProfile
    - Implémenter schema avec user (ref), firstName, lastName, bio, phone, portfolioLink, cvUrl, cvText
    - Ajouter index unique sur user
    - _Requirements: 2.1, 2.2_

  - [x] 2.3 Créer le modèle Company
    - Implémenter schema avec name, description, logo, website, location, owner (ref)
    - _Requirements: 3.1_

  - [x] 2.4 Créer le modèle JobOffer
    - Implémenter schema avec title, description, salary, contractType, deadline, company (ref), skills (ref array), createdAt
    - _Requirements: 4.1_

  - [x] 2.5 Créer le modèle Application
    - Implémenter schema avec job (ref), candidate (ref), status, coverLetter, aiGeneratedContent, matchScore, matchJustification, appliedAt
    - Ajouter index composé unique sur {job, candidate}
    - _Requirements: 6.1_

  - [x] 2.6 Créer le modèle Skill
    - Implémenter schema avec name (unique)
    - _Requirements: 9.1_


- [x] 3. Middleware d'authentification et autorisation
  - [x] 3.1 Créer le middleware d'authentification JWT
    - Implémenter vérification du token dans header Authorization
    - Décoder et attacher l'utilisateur à req.user
    - Retourner 401 si token invalide ou manquant
    - _Requirements: 1.4_

  - [x] 3.2 Écrire test de propriété pour l'autorisation
    - **Property 2: Authorization Enforcement**
    - **Validates: Requirements 1.4, 1.5**

  - [x] 3.3 Créer le middleware de contrôle des rôles
    - Implémenter roleGuard(allowedRoles) retournant middleware
    - Retourner 403 si rôle utilisateur non autorisé
    - _Requirements: 1.5_

- [x] 4. Service et contrôleur d'authentification avec OTP
  - [x] 4.1 Implémenter emailService
    - Fonction sendOTP(email, otpCode) envoyant email avec code de vérification
    - Template email professionnel avec code 6 chiffres
    - _Requirements: 1b.1_

  - [x] 4.2 Implémenter authService
    - Fonction register(email, password, role) créant user non vérifié, générant OTP, envoyant email
    - Fonction verifyOTP(email, otpCode) vérifiant code et expiration, activant compte, retournant JWT
    - Fonction resendOTP(email) invalidant ancien OTP, générant nouveau, envoyant email
    - Fonction login(email, password) vérifiant isVerified=true avant authentification
    - Fonction verifyToken(token) décodant et validant JWT
    - _Requirements: 1.1, 1.2, 1.3, 1b.1, 1b.2, 1b.3, 1b.4_

  - [x] 4.3 Écrire test de propriété pour l'authentification round-trip avec OTP
    - **Property 1: Authentication Round-Trip with OTP**
    - **Validates: Requirements 1.1, 1.2, 1b.2**

  - [x] 4.4 Écrire test de propriété pour expiration OTP
    - **Property 1b: OTP Expiration Enforcement**
    - **Validates: Requirements 1b.1, 1b.3**

  - [x] 4.5 Écrire test de propriété pour sécurité hash OTP
    - **Property 1c: OTP Hash Security**
    - **Validates: Requirements 1b.5, 1b.6**

  - [x] 4.6 Implémenter authController
    - POST /register créant user et envoyant OTP
    - POST /verify-otp vérifiant code et activant compte
    - POST /resend-otp renvoyant nouveau code
    - POST /login vérifiant credentials (compte vérifié uniquement)
    - Gestion erreurs: email dupliqué (409), OTP invalide/expiré (400), compte non vérifié (401)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1b.2, 1b.3, 1b.4, 1b.6_

  - [x] 4.7 Créer les routes d'authentification
    - Configurer router Express pour /api/auth
    - Routes: POST /register, POST /verify-otp, POST /resend-otp, POST /login
    - _Requirements: 1.1, 1.2, 1b.2, 1b.4_

- [x] 5. Checkpoint - Vérifier que tous les tests passent
  - Ensure all tests pass, ask the user if questions arise.


- [x] 6. Service et contrôleur de profil candidat
  - [x] 6.1 Créer l'utilitaire de parsing PDF
    - Implémenter src/utils/pdfParser.js utilisant pdf-parse
    - Extraire texte en préservant structure paragraphes
    - Gérer erreurs de fichiers non-PDF
    - _Requirements: 2.2, 2.5_

  - [x] 6.2 Écrire test de propriété pour extraction PDF
    - **Property 4: PDF Text Extraction Round-Trip**
    - **Validates: Requirements 2.2, 2.5**

  - [x] 6.3 Configurer middleware upload multer
    - Créer src/middleware/upload.js pour fichiers PDF
    - Limiter à fichiers .pdf uniquement
    - Stocker dans dossier uploads/
    - _Requirements: 2.2, 2.4_

  - [x] 6.4 Implémenter profileService
    - Fonction getProfile(userId) retournant profil complet
    - Fonction updateProfile(userId, data) avec mise à jour partielle
    - Fonction uploadCV(userId, file) stockant fichier et extrayant texte
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 6.5 Écrire test de propriété pour intégrité des données profil
    - **Property 3: Profile Data Integrity**
    - **Validates: Requirements 2.1, 3.2, 4.2**

  - [x] 6.6 Implémenter profileController
    - GET /profile retournant profil candidat
    - PUT /profile mettant à jour profil
    - POST /profile/cv uploadant CV PDF
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 6.7 Créer les routes de profil
    - Configurer router Express pour /api/profile
    - Appliquer middleware auth et roleGuard('candidate')
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Service et contrôleur d'entreprise
  - [x] 7.1 Implémenter companyService
    - Fonction createCompany(ownerId, data) créant entreprise
    - Fonction updateCompany(companyId, ownerId, data) avec vérification propriétaire
    - Fonction getCompany(companyId) retournant détails
    - Fonction getCompaniesByOwner(ownerId) listant entreprises du recruteur
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 7.2 Implémenter companyController
    - GET /companies listant entreprises
    - POST /companies créant entreprise
    - PUT /companies/:id mettant à jour
    - GET /companies/:id retournant détails
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 7.3 Créer les routes d'entreprise
    - Configurer router Express pour /api/companies
    - Appliquer middleware auth et roleGuard('recruiter') pour création/modification
    - _Requirements: 3.1, 3.2, 3.3, 3.4_


- [x] 8. Service et contrôleur d'offres d'emploi
  - [x] 8.1 Implémenter jobService
    - Fonction createJob(companyId, data) créant offre
    - Fonction updateJob(jobId, recruiterId, data) avec vérification propriétaire
    - Fonction deleteJob(jobId, recruiterId) supprimant offre et candidatures associées
    - Fonction searchJobs(filters) avec filtrage skill/contractType/location et exclusion deadline passée
    - Fonction getJobById(jobId) retournant détails avec company et skills populés
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.2 Écrire test de propriété pour filtrage par skill
    - **Property 6: Skill Filter Correctness**
    - **Validates: Requirements 4.4**

  - [x] 8.3 Écrire test de propriété pour exclusion deadline
    - **Property 7: Deadline Exclusion**
    - **Validates: Requirements 4.5**

  - [x] 8.4 Écrire test de propriété pour tri des résultats
    - **Property 8: Search Results Ordering**
    - **Validates: Requirements 5.1**

  - [x] 8.5 Implémenter jobController
    - GET /jobs avec query params pour recherche
    - POST /jobs créant offre
    - PUT /jobs/:id mettant à jour
    - DELETE /jobs/:id supprimant
    - GET /jobs/:id retournant détails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1_

  - [x] 8.6 Créer les routes d'offres
    - Configurer router Express pour /api/jobs
    - Appliquer middleware auth et roleGuard('recruiter') pour création/modification/suppression
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Service et contrôleur de wishlist
  - [x] 9.1 Implémenter wishlistService
    - Fonction addToWishlist(userId, jobId) ajoutant sans doublon via $addToSet
    - Fonction removeFromWishlist(userId, jobId) retirant via $pull
    - Fonction getWishlist(userId) retournant jobs populés avec company
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 9.2 Écrire test de propriété pour idempotence wishlist
    - **Property 9: Wishlist Idempotence**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 9.3 Implémenter wishlistController
    - GET /wishlist retournant favoris
    - POST /wishlist/:jobId ajoutant
    - DELETE /wishlist/:jobId retirant
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 9.4 Créer les routes de wishlist
    - Configurer router Express pour /api/wishlist
    - Appliquer middleware auth et roleGuard('candidate')
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 10. Checkpoint - Vérifier que tous les tests passent
  - Ensure all tests pass, ask the user if questions arise.


- [x] 11. Service et contrôleur de candidatures
  - [x] 11.1 Implémenter applicationService
    - Fonction createApplication(candidateId, jobId, coverLetter) créant candidature avec status 'pending'
    - Fonction updateStatus(applicationId, recruiterId, status) vérifiant que recruteur possède l'offre
    - Fonction getApplicationsByCandidate(candidateId) retournant candidatures avec job et company populés
    - Fonction getApplicationsByJob(jobId, recruiterId) vérifiant propriétaire et retournant candidatures
    - Fonction saveAIContent(applicationId, content) sauvegardant brouillon IA
    - Fonction updateMatchScore(applicationId, score, justification) mettant à jour score IA
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.4, 8.4_

  - [x] 11.2 Écrire test de propriété pour préservation statut
    - **Property 10: Application Status Preservation**
    - **Validates: Requirements 6.3**

  - [x] 11.3 Implémenter applicationController
    - GET /applications listant candidatures (filtrées par rôle)
    - POST /applications soumettant candidature
    - PUT /applications/:id/status mettant à jour statut
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 11.4 Créer les routes de candidatures
    - Configurer router Express pour /api/applications
    - Appliquer middleware auth
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 12. Service IA (Ollama)
  - [x] 12.1 Implémenter aiService - génération lettre de motivation
    - Fonction generateCoverLetter(candidate, job) construisant prompt et appelant Ollama
    - System prompt pour expert recrutement, max 250 mots
    - User prompt avec données candidat et offre
    - Gestion timeout 30s et fallback mock
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 12.2 Écrire test de propriété pour limite mots lettre
    - **Property 11: AI Cover Letter Word Limit**
    - **Validates: Requirements 7.3**

  - [x] 12.3 Écrire test de propriété pour sérialisation requête Ollama
    - **Property 12: Ollama Request Serialization**
    - **Validates: Requirements 7.5, 8.5**

  - [x] 12.4 Implémenter aiService - analyse de compatibilité
    - Fonction analyzeMatch(candidate, job) construisant prompt JSON strict
    - System prompt forçant format JSON {score, justification}
    - Parsing et validation réponse JSON
    - Retry avec prompt plus strict si réponse invalide
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

  - [x] 12.5 Écrire test de propriété pour bornes score match
    - **Property 13: Match Score Bounds**
    - **Validates: Requirements 8.1, 8.6**

  - [x] 12.6 Écrire test de propriété pour mode mock IA
    - **Property 16: Mock AI Determinism**
    - **Validates: Requirements 11.4**

  - [x] 12.7 Implémenter aiController
    - POST /ai/generate-cover-letter générant lettre
    - POST /ai/analyze-match analysant compatibilité
    - Gestion erreurs AI_UNAVAILABLE, AI_TIMEOUT, AI_PARSE_ERROR
    - _Requirements: 7.1, 7.2, 7.6, 8.1, 8.2, 8.3, 11.2, 11.3_

  - [x] 12.8 Créer les routes IA
    - Configurer router Express pour /api/ai
    - Appliquer middleware auth et roleGuard approprié
    - _Requirements: 7.1, 8.1_

- [x] 13. Checkpoint - Vérifier que tous les tests passent
  - Ensure all tests pass, ask the user if questions arise.


- [x] 14. Service et contrôleur de compétences (Admin)
  - [x] 14.1 Implémenter skillService
    - Fonction createSkill(name) créant compétence unique
    - Fonction deleteSkill(skillId) supprimant et retirant de tous les JobOffer.skills
    - Fonction getAllSkills() retournant liste triée alphabétiquement
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 14.2 Écrire test de propriété pour tri alphabétique skills
    - **Property 14: Skills Alphabetical Ordering**
    - **Validates: Requirements 9.4**

  - [x] 14.3 Implémenter skillController
    - GET /skills listant compétences
    - POST /skills créant compétence
    - DELETE /skills/:id supprimant compétence
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 14.4 Créer les routes de compétences
    - Configurer router Express pour /api/skills
    - Appliquer middleware auth et roleGuard('admin') pour création/suppression
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 15. Service et contrôleur de modération (Admin)
  - [x] 15.1 Implémenter adminService
    - Fonction getAllUsers() retournant users sans password
    - Fonction deleteRecruiter(userId) supprimant: User → Company → JobOffers → Applications (avec notifications)
    - Fonction deleteCandidate(userId) supprimant: User → CandidateProfile → Applications
    - Fonction deleteJobOffer(jobId) supprimant offre et candidatures associées (avec notifications)
    - Fonction notifyAffectedCandidates(applicationIds) envoyant emails "Offre supprimée"
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 15.2 Écrire test de propriété pour exclusion password
    - **Property 15: Password Exclusion**
    - **Validates: Requirements 10.1**

  - [x] 15.3 Écrire test de propriété pour suppression cascade
    - **Property 5: Cascade Deletion Consistency**
    - **Validates: Requirements 4.3, 10.2, 10.3, 10.4**

  - [x] 15.4 Écrire test de propriété pour notifications suppression
    - **Property 5b: Deletion Notification**
    - **Validates: Requirements 10.5**

  - [x] 15.5 Implémenter adminController
    - GET /admin/users listant utilisateurs
    - DELETE /admin/users/:id supprimant utilisateur (cascade selon rôle)
    - DELETE /admin/jobs/:id supprimant offre (admin override)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 15.6 Créer les routes admin
    - Configurer router Express pour /api/admin
    - Appliquer middleware auth et roleGuard('admin')
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 16. Assemblage final et point d'entrée
  - [x] 16.1 Créer app.js principal
    - Configurer Express avec middleware (cors, json, urlencoded)
    - Monter tous les routers
    - Ajouter middleware de gestion d'erreurs global
    - _Requirements: Architecture_

  - [x] 16.2 Créer fichier de configuration environnement
    - Créer .env.example avec variables requises
    - Documenter MONGODB_URI, JWT_SECRET, OLLAMA_URL, USE_MOCK_AI
    - Documenter SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS pour emails
    - _Requirements: Configuration_

- [x] 17. Checkpoint final - Vérifier que tous les tests passent
  - Ensure all tests pass, ask the user if questions arise.
