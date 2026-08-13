<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Specific Rules

### Core Technologies
- **Framework**: Next.js 16.2.9 with React 19.2.4 (breaking changes from training data)
- **Database**: PostgreSQL with Prisma ORM v7.8.0
- **Authentication**: JWT-based with custom implementation using jose library v6.2.3
- **UI Framework**: Material-UI (MUI) v9.1.1 with Next.js integration (@mui/material-nextjs)
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode enabled with path aliases (@/*)

### AI Integration
- **Provider**: Groq SDK v1.3.0
- **Model**: openai/gpt-oss-120b for AI grading and question generation
- **Features**: 
  - AI-powered question generation (multiple choice and descriptive)
  - AI-based answer grading for descriptive questions
  - Prompt templates in `lib/prompt-template.ts`
  - Code block extraction for JSON parsing in `lib/ai-grade.ts`

### Authentication & Authorization
- **Session Management**: Use `getUserByPayload` from `lib/auth/session.ts` for user lookup
- **Role System**: Three roles - admin, editor, user
- **Role Functions**: 
  - `canManageUsers()` from `lib/auth/roles.ts` for user management
  - `canEditQuestions()` from `lib/auth/roles.ts` for question editing
- **Middleware**: Route protection in `middleware.ts` with role-based access control
- **Password**: bcryptjs v3.0.3 for password hashing in `lib/auth/password.ts`

### Validation
- **Centralized Validation**: All validation logic in `lib/validation.ts`
- **Functions**:
  - `validateQuestionText()` - 50-300 characters recommended, no consecutive punctuation
  - `validateChoices()` - 4 unique choices, answer 1-4
  - `validateExplanation()` - non-empty explanation required
  - `validateDifficulty()` - 1-5 range
  - `validateChapterMapping()` - exam/chapter combination validation
  - `validateQuestion()` - comprehensive question validation

### Database Schema
- **Exam**: Exams with chapters and question issues
- **ExamChapter**: Chapters within exams containing questions
- **Question**: Questions with type, choices, answer, explanation, difficulty
- **UserAnswer**: User answers with correctness tracking
- **UserMark**: User marks/bookmarks for questions
- **User**: Users with roles, failed attempts, lock status
- **RejectedQuestion**: Rejected questions to avoid duplication
- **QuestionIssue**: Issue tracking for questions with status management

### File Structure Conventions
- **Lib**: Utility functions and business logic in `lib/`
- **Auth**: Authentication logic in `lib/auth/`
- **Components**: Client components in `app/_components/`
- **Admin Pages**: Admin functionality in `app/admin/`
- **Qualification Pages**: Learning pages in `app/qualifications/[qualificationId]/`

### Configuration
- **Environment**: `DATABASE_URL` in next.config.ts for server-side access
- **Server Actions**: Body size limit set to 10mb in next.config.ts
- **Prisma**: Auto-generation on postinstall and build
- **TypeScript**: Path alias `@/*` maps to project root

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build with Prisma generation
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
