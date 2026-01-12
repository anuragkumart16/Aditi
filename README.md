Aditi AI - Next Layer
A modern AI chat application built with Next.js, Prisma, and PostgreSQL.

Getting Started
Follow these steps to set up and run the project locally.

Prerequisites
Node.js (v20 or newer recommended)
PostgreSQL database (local or cloud-hosted)
GitHub Account (for OAuth setup)
Installation
Install dependencies:

npm install
Environment Configuration: Create a .env file in the root directory and add the following required variables:

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aditi_ai?schema=public"

# AI Backend
INTERNAL_API_KEY="i_am_iron_man"

# GitHub OAuth (for Authentication)
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"
NEXTAUTH_SECRET="your_nextauth_random_secret"
Database Setup: Push the schema to your database:

npx prisma db push
# or
npx prisma migrate dev
Run the Application:

npm run dev
The app will run on http://localhost:4000.

Architecture Decisions
Tech Stack
Framework: Next.js 15+ (App Router) for server-side rendering and API routes.
Styling: Tailwind CSS for a modern, responsive user interface.
Database: PostgreSQL managed via Prisma ORM for robust data modeling and type safety.
Schema Design
The database schema (prisma/schema.prisma) is designed to support persistent chat history:

User: Stores user identity (via OAuth) and metadata.
Chat: Represents a conversation session, linked to a User. Caches the title (generated from the first message).
Message: Unique message entries linked to a Chat. Stores role (user vs assistant) and content.
Streaming Approach
To ensure a responsive user experience, the application uses a custom streaming implementation:

Proxy Endpoint: The /api/chat route acts as a secure middleware. It authenticates requests and forwards them to our custom Hugging Face inference backend.
Dual Processing: The route uses ReadableStream to forward tokens immediately to the frontend for real-time display. Simultaneously, it buffers the full response in memory to save it to the database once the generation is complete. This ensures that history is preserved without delaying the UI.
Project Stats
Time taken to complete: 6 hours
