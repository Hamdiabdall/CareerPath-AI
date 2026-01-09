# Requirements Document

## Introduction

CareerPath AI est une plateforme de recrutement hybride (Frontend/Backend) intégrant une intelligence artificielle locale via Ollama et le modèle Llama 3.2. L'objectif est de garantir la confidentialité des données et d'éviter les coûts d'API externes tout en offrant des fonctionnalités avancées de matching candidat-offre et de génération de contenu.

La plateforme supporte trois types d'utilisateurs : candidats, recruteurs et administrateurs, chacun avec des fonctionnalités spécifiques.

## Glossary

- **Ollama**: Moteur d'IA local permettant d'exécuter des modèles LLM sans dépendance cloud
- **Llama 3.2**: Modèle de langage utilisé pour la génération de texte et l'analyse
- **JWT**: JSON Web Token, mécanisme d'authentification stateless
- **Candidat**: Utilisateur cherchant un emploi
- **Recruteur**: Utilisateur représentant une entreprise et publiant des offres
- **Administrateur**: Utilisateur gérant la plateforme (skills, modération)
- **Application**: Candidature soumise par un candidat pour une offre
- **JobOffer**: Offre d'emploi publiée par un recruteur
- **Skill**: Compétence technique ou professionnelle
- **MatchScore**: Score de compatibilité (0-100) calculé par l'IA
- **Wishlist**: Liste de favoris d'offres d'emploi pour un candidat
- **CoverLetter**: Lettre de motivation accompagnant une candidature
- **OTP**: One-Time Password, code de vérification à usage unique envoyé par email
- **Email Verification**: Processus de validation de l'adresse email via code OTP

## Requirements

### Requirement 1: Authentification et Gestion des Utilisateurs

**User Story:** As a user, I want to register and authenticate on the platform, so that I can access role-specific features securely.

#### Acceptance Criteria

1. WHEN a user submits valid registration data (email, password, role) THEN the System SHALL create a new user account with hashed password and isVerified set to false, and send an OTP code to the provided email
2. WHEN a user submits valid login credentials for a verified account THEN the System SHALL verify the password hash and return a JWT token valid for 24 hours
3. WHEN a user submits valid login credentials for an unverified account THEN the System SHALL reject the login and return an error message indicating email verification required
4. WHEN a user submits an email that already exists during registration THEN the System SHALL reject the request and return an error message indicating duplicate email
5. WHEN a request is made to a protected endpoint without a valid JWT token THEN the System SHALL reject the request with a 401 Unauthorized status
6. WHEN a user with role 'candidate' attempts to access recruiter-only endpoints THEN the System SHALL reject the request with a 403 Forbidden status

### Requirement 1b: Vérification Email par OTP

**User Story:** As a new user, I want to verify my email address with a code, so that my account is activated and secure.

#### Acceptance Criteria

1. WHEN the System sends an OTP code THEN the System SHALL generate a 6-digit numeric code with 10-minute expiration and store it hashed in the database
2. WHEN a user submits a valid OTP code within the expiration time THEN the System SHALL set isVerified to true and return a JWT token
3. WHEN a user submits an invalid or expired OTP code THEN the System SHALL reject the verification and return an error message
4. WHEN a user requests OTP resend THEN the System SHALL invalidate any existing OTP, generate a new code, and send it to the user's email
5. WHEN serializing OTP for storage THEN the System SHALL hash the OTP code before saving to the database
6. WHEN parsing OTP verification request THEN the System SHALL validate the code format (6 digits) before checking against stored hash

### Requirement 2: Gestion du Profil Candidat

**User Story:** As a candidate, I want to manage my professional profile, so that recruiters can evaluate my qualifications.

#### Acceptance Criteria

1. WHEN a candidate submits profile data (firstName, lastName, bio, phone, portfolioLink) THEN the System SHALL create or update the CandidateProfile linked to the user
2. WHEN a candidate uploads a PDF CV file THEN the System SHALL store the file, extract text content, and save both the file path and extracted text
3. WHEN a candidate requests their profile THEN the System SHALL return the complete CandidateProfile with associated user data
4. WHEN a candidate uploads a non-PDF file as CV THEN the System SHALL reject the upload and return an error specifying PDF format requirement
5. WHEN parsing CV text from PDF THEN the System SHALL extract readable text content preserving paragraph structure

### Requirement 3: Gestion des Entreprises

**User Story:** As a recruiter, I want to create and manage my company profile, so that candidates can learn about my organization.

#### Acceptance Criteria

1. WHEN a recruiter submits company data (name, description, logo, website, location) THEN the System SHALL create a Company document linked to the recruiter user
2. WHEN a recruiter updates their company information THEN the System SHALL modify only the specified fields and preserve other data
3. WHEN a recruiter requests their company details THEN the System SHALL return the complete Company document with owner information
4. WHEN a user without recruiter role attempts to create a company THEN the System SHALL reject the request with a 403 Forbidden status

### Requirement 4: Gestion des Offres d'Emploi

**User Story:** As a recruiter, I want to create and manage job offers, so that I can attract qualified candidates.

#### Acceptance Criteria

1. WHEN a recruiter submits job offer data (title, description, salary, contractType, deadline, skills) THEN the System SHALL create a JobOffer document linked to the recruiter's company
2. WHEN a recruiter updates a job offer THEN the System SHALL modify only the specified fields and preserve other data
3. WHEN a recruiter deletes a job offer THEN the System SHALL remove the JobOffer document and all associated Applications
4. WHEN any user requests job offers with skill filter THEN the System SHALL return only JobOffers containing the specified skill IDs
5. WHEN a job offer deadline has passed THEN the System SHALL mark the offer as expired and exclude it from candidate search results

### Requirement 5: Recherche et Wishlist

**User Story:** As a candidate, I want to search job offers and save favorites, so that I can organize my job search efficiently.

#### Acceptance Criteria

1. WHEN a candidate searches jobs with query parameters (skill, contractType, location) THEN the System SHALL return matching JobOffers sorted by creation date descending
2. WHEN a candidate adds a job to wishlist THEN the System SHALL append the JobOffer ID to the user's wishlist array without duplicates
3. WHEN a candidate removes a job from wishlist THEN the System SHALL remove the JobOffer ID from the user's wishlist array
4. WHEN a candidate requests their wishlist THEN the System SHALL return populated JobOffer documents with company information

### Requirement 6: Candidatures

**User Story:** As a candidate, I want to apply to job offers, so that I can be considered for positions.

#### Acceptance Criteria

1. WHEN a candidate submits an application (jobId, coverLetter) THEN the System SHALL create an Application document with status 'pending' and current timestamp
2. WHEN a candidate attempts to apply to the same job twice THEN the System SHALL reject the request and return an error indicating existing application
3. WHEN a recruiter updates application status (accepted, rejected, interview) THEN the System SHALL modify the status field and preserve application history
4. WHEN a candidate requests their applications THEN the System SHALL return Application documents with populated JobOffer and Company data

### Requirement 7: Génération de Lettre de Motivation par IA

**User Story:** As a candidate, I want AI to generate a cover letter draft, so that I can save time and improve my application quality.

#### Acceptance Criteria

1. WHEN a candidate requests cover letter generation for a specific job THEN the System SHALL send candidate profile and job data to Ollama API and return generated text within 30 seconds
2. WHEN Ollama API is unavailable THEN the System SHALL return a fallback mock response when USE_MOCK_AI is enabled, or an error message otherwise
3. WHEN the AI generates a cover letter THEN the System SHALL limit output to 250 words maximum and maintain professional tone
4. WHEN a candidate saves an AI-generated cover letter THEN the System SHALL store the content in the Application.aiGeneratedContent field
5. WHEN serializing AI request data for Ollama THEN the System SHALL format the prompt as valid JSON with system and user message separation
6. WHEN parsing AI response from Ollama THEN the System SHALL extract the generated text content and handle malformed responses gracefully

### Requirement 8: Analyse de Compatibilité par IA

**User Story:** As a recruiter, I want AI to analyze candidate-job compatibility, so that I can prioritize the most suitable candidates.

#### Acceptance Criteria

1. WHEN a recruiter requests match analysis for an application THEN the System SHALL send candidate and job data to Ollama API and return a score (0-100) with justification
2. WHEN Ollama returns a valid JSON response THEN the System SHALL parse the score and justification fields and update the Application document
3. WHEN Ollama returns malformed or non-JSON response THEN the System SHALL retry once with stricter prompt, then return an error if still invalid
4. WHEN a match analysis is completed THEN the System SHALL store matchScore and matchJustification in the Application document for future retrieval
5. WHEN serializing match analysis request for Ollama THEN the System SHALL format candidate skills, bio, and job requirements as structured JSON prompt
6. WHEN parsing match analysis response from Ollama THEN the System SHALL validate JSON structure contains numeric score and string justification

### Requirement 9: Gestion des Compétences (Admin)

**User Story:** As an administrator, I want to manage the skills catalog, so that job offers and profiles use consistent terminology.

#### Acceptance Criteria

1. WHEN an admin creates a new skill THEN the System SHALL add a Skill document with unique name
2. WHEN an admin attempts to create a duplicate skill name THEN the System SHALL reject the request and return an error indicating duplicate
3. WHEN an admin deletes a skill THEN the System SHALL remove the Skill document and remove its ID from all JobOffer.skills arrays
4. WHEN any user requests the skills list THEN the System SHALL return all Skill documents sorted alphabetically by name

### Requirement 10: Modération (Admin)

**User Story:** As an administrator, I want to moderate users and job offers, so that I can maintain platform quality and compliance.

#### Acceptance Criteria

1. WHEN an admin requests all users THEN the System SHALL return User documents with role and creation date, excluding password hashes
2. WHEN an admin deletes a recruiter user THEN the System SHALL remove the User document, associated Company, all JobOffers of that company, and all Applications on those offers
3. WHEN an admin deletes a candidate user THEN the System SHALL remove the User document, associated CandidateProfile, and all Applications submitted by that candidate
4. WHEN an admin deletes a job offer THEN the System SHALL remove the JobOffer document and all associated Applications
5. WHEN applications are deleted due to job offer or recruiter deletion THEN the System SHALL send notification emails to affected candidates indicating "Offre supprimée"
6. WHEN a non-admin user attempts moderation actions THEN the System SHALL reject the request with a 403 Forbidden status

### Requirement 11: Gestion des États de Chargement IA

**User Story:** As a user, I want clear feedback during AI operations, so that I understand the system status and can wait appropriately.

#### Acceptance Criteria

1. WHILE an AI request is processing THEN the System SHALL return a loading state indicator to the frontend within 500ms of request initiation
2. WHEN an AI request exceeds 30 seconds THEN the System SHALL timeout the request and return an error message suggesting retry
3. WHEN Ollama service is not running THEN the System SHALL detect unavailability within 5 seconds and return a clear error message indicating "Service IA indisponible"
4. WHEN USE_MOCK_AI environment variable is true THEN the System SHALL bypass Ollama calls and return predefined mock responses immediately
