# RVWD Backend API

**AI-Powered Voice Feedback Platform Backend**

RVWD transforms voice feedback into structured, actionable insights. Form owners create open-ended feedback forms with custom extraction parameters, respondents speak naturally, and AI extracts structured data automatically.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Form Owners   │    │   Respondents   │    │   Dashboard     │
│                 │    │                 │    │                 │
│ Create Forms    │    │ Voice Feedback  │    │ View Analytics  │
│ Define Schema   │    │ Submit Text     │    │ Export Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  RVWD Backend   │
                    │                 │
                    │ • Forms API     │
                    │ • Responses API │
                    │ • AI Processing │
                    │ • Analytics     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │                 │
                    │ • Users         │
                    │ • Forms         │
                    │ • Responses     │
                    └─────────────────┘
```

## 🛠️ Tech Stack

- **Framework**: Nest.js (Node.js/TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI GPT-4o-mini (planned)
- **Validation**: class-validator, class-transformer
- **Development**: Hot reload, TypeScript strict mode

## 📋 Prerequisites

- Node.js 20.0+ (currently running v20.0.0)
- npm 9.7.2+
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/nischalon10/rvwd.git
cd rvwd/backend

# Install dependencies
npm install

# Install Prisma CLI globally (optional)
npm install -g prisma
```

### 2. Database Setup

```bash
# Initialize Prisma (already done, but for reference)
npx prisma init

# Start Prisma development database
npx prisma dev

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 3. Start Development Server

```bash
# Start the backend server with hot reload
npm run start:dev

# Server will start on http://localhost:3000
```

### 4. Verify Setup

```bash
# Test basic connectivity
curl http://localhost:3000
# Expected: Hello World!

# Test database health
curl http://localhost:3000/health
# Expected: {"status":"ok","database":"connected","timestamp":"..."}
```

## 📊 Database Schema

### Core Models

#### User (Form Owners)
```typescript
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  forms     Form[]   // One-to-many relationship
}
```

#### Form (Feedback Forms)
```typescript
model Form {
  id                String    @id @default(cuid())
  title             String
  description       String?
  question          String    // The open-ended question
  extractionSchema  Json      // AI extraction parameters
  uiHints          String[]  // User guidance hints
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  ownerId           String
  owner             User      @relation(fields: [ownerId], references: [id])
  responses         Response[] // One-to-many relationship
}
```

#### Response (Voice Feedback Submissions)
```typescript
model Response {
  id            String   @id @default(cuid())
  transcript    String   // Transcribed voice text
  extractedData Json     // AI-extracted structured data
  metadata      Json?    // Audio duration, browser info, etc.
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())
  formId        String
  form          Form     @relation(fields: [formId], references: [id])
}
```

## 🔌 API Endpoints

### Forms API (`/forms`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/forms` | Create new form | `CreateFormDto` |
| `GET` | `/forms` | Get all forms | Query: `?ownerId=xxx` |
| `GET` | `/forms/:id` | Get specific form | - |
| `PATCH` | `/forms/:id` | Update form | `UpdateFormDto` |
| `DELETE` | `/forms/:id` | Delete form | - |
| `GET` | `/forms/owner/:ownerId` | Get forms by owner | - |

#### CreateFormDto Example
```json
{
  "title": "Product Feedback Survey",
  "description": "Tell us about your experience",
  "question": "How was your experience using our product?",
  "extractionSchema": {
    "usabilityScore": {"type": "number", "min": 1, "max": 10},
    "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
    "features": {"type": "array", "items": {"type": "string"}},
    "suggestions": {"type": "string"}
  },
  "uiHints": ["Rate usability 1-10", "Mention specific features"],
  "ownerId": "user-id-here"
}
```

### Responses API (`/responses`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/responses/submit` | Submit voice feedback | `CreateResponseDto` |
| `GET` | `/responses` | Get all responses | Query: `?formId=xxx` |
| `GET` | `/responses/:id` | Get specific response | - |
| `GET` | `/responses/form/:formId` | Get responses by form | - |

#### CreateResponseDto Example
```json
{
  "formId": "form-id-here",
  "transcript": "I love this product! Usability is 9/10. Great search feature. Needs dark mode.",
  "metadata": {
    "audioDuration": 15.2,
    "browser": "Chrome",
    "timestamp": "2025-08-25T23:52:00Z"
  }
}
```

### Health & Utility (`/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Hello World test |
| `GET` | `/health` | Database connectivity |
| `POST` | `/users` | Create test user (temporary) |

## 🧪 Testing Examples

### Create a Test User
```bash
curl -X POST http://localhost:3000/users 
  -H "Content-Type: application/json" 
  -d '{
    "email": "developer@example.com",
    "name": "Dev User"
  }'
```

### Create a Feedback Form
```bash
curl -X POST http://localhost:3000/forms 
  -H "Content-Type: application/json" 
  -d '{
    "title": "App Usability Study",
    "description": "Help us improve our app",
    "question": "What are your thoughts on our app usability and features?",
    "extractionSchema": {
      "usabilityScore": {"type": "number", "min": 1, "max": 10},
      "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
      "painPoints": {"type": "array", "items": {"type": "string"}},
      "suggestions": {"type": "string"}
    },
    "uiHints": ["Rate usability 1-10", "Mention pain points", "Share suggestions"],
    "ownerId": "USER_ID_FROM_PREVIOUS_STEP"
  }'
```

### Submit Voice Feedback
```bash
curl -X POST http://localhost:3000/responses/submit 
  -H "Content-Type: application/json" 
  -d '{
    "formId": "FORM_ID_FROM_PREVIOUS_STEP",
    "transcript": "The app is quite good overall, I would rate usability an 8 out of 10. The navigation is intuitive but the loading times can be slow. I suggest adding a dark theme and improving performance.",
    "metadata": {
      "audioDuration": 12.5,
      "browser": "Safari",
      "timestamp": "2025-08-25T23:52:00Z"
    }
  }'
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── forms/                 # Forms management
│   │   ├── dto/
│   │   │   └── forms.dto.ts   # Data transfer objects
│   │   ├── forms.controller.ts # HTTP endpoints
│   │   ├── forms.service.ts   # Business logic
│   │   └── forms.module.ts    # Module definition
│   │
│   ├── responses/             # Response submission
│   │   ├── dto/
│   │   │   └── responses.dto.ts # Data transfer objects
│   │   ├── responses.controller.ts # HTTP endpoints
│   │   ├── responses.service.ts # Business logic
│   │   └── responses.module.ts # Module definition
│   │
│   ├── app.controller.ts      # Root endpoints
│   ├── app.service.ts         # App-level services
│   ├── app.module.ts          # Main app module
│   ├── prisma.service.ts      # Database service
│   └── main.ts                # Application entry point
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
│       └── 20250825231945_init/
│           └── migration.sql  # Initial schema
│
├── generated/
│   └── prisma/                # Generated Prisma client
│
├── package.json               # Dependencies & scripts
├── tsconfig.json             # TypeScript config
└── nest-cli.json             # Nest.js config
```

## 🔧 Development Workflow

### Database Changes
```bash
# 1. Modify prisma/schema.prisma
# 2. Generate and apply migration
npx prisma migrate dev --name descriptive-name

# 3. Regenerate Prisma client
npx prisma generate
```

### Code Generation
```bash
# Generate new module
npx nest generate module module-name

# Generate controller
npx nest generate controller module-name

# Generate service
npx nest generate service module-name
```

### Database Management
```bash
# View database in browser
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

## 🎯 Current Features

### ✅ Implemented
- **Forms CRUD**: Complete form management
- **Response Submission**: Voice feedback processing
- **Mock AI Processing**: Structured data extraction simulation
- **Database Integration**: Prisma ORM with PostgreSQL
- **Error Handling**: Proper HTTP status codes and messages
- **Request Enrichment**: IP address and user agent capture
- **Data Validation**: Type-safe DTOs and database constraints

### 🚧 In Development
- **Real AI Integration**: OpenAI GPT-4o-mini for actual extraction
- **Authentication**: User registration, login, JWT tokens
- **Analytics API**: Aggregated insights and reporting
- **Rate Limiting**: API throttling and abuse prevention

### 📋 Planned
- **File Upload**: Direct audio file processing
- **Webhooks**: Real-time notifications
- **Export API**: CSV, JSON data export
- **Admin Dashboard**: Form analytics and management

## 🐛 Common Issues & Solutions

### Database Connection Issues
```bash
# Check if Prisma dev server is running
npx prisma dev

# Restart Nest.js server
npm run start:dev
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run start:dev
```

### TypeScript Errors
```bash
# Regenerate Prisma client
npx prisma generate

# Clear build cache
rm -rf dist/ && npm run build
```

## 📊 Performance Monitoring

### Current Metrics
- **Response Processing**: ~30-50ms (mock processing)
- **Database Queries**: ~5-15ms (local development)
- **Form Creation**: ~20-40ms
- **Response Retrieval**: ~10-25ms

### Optimization Areas
- Add database indexing for frequently queried fields
- Implement caching for form schemas
- Add response pagination for large datasets
- Optimize AI processing pipeline

## 🔐 Security Considerations

### Current Security
- **Input Validation**: DTO-based validation
- **SQL Injection Protection**: Prisma ORM safe queries
- **CORS**: Configurable cross-origin requests

### Planned Security
- **Authentication**: JWT-based user sessions
- **Rate Limiting**: API request throttling
- **Input Sanitization**: XSS protection
- **API Keys**: Service-to-service authentication

## 🚀 Deployment Notes

### Environment Variables
```env
# Database
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."

# API (planned)
OPENAI_API_KEY="sk-..."
JWT_SECRET="your-secret-key"
```

### Production Checklist
- [ ] Set up production PostgreSQL database
- [ ] Configure environment variables
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CORS for frontend domain

## 📚 Additional Resources

- [Nest.js Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Update documentation if needed
4. Submit pull request with clear description

## 📞 Support

For questions or issues:
- Check existing GitHub issues
- Review API documentation above
- Test with provided curl examples
- Verify database connectivity with health endpoint

---

**Happy coding! 🚀**

*Last updated: August 25, 2025*
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
