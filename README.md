# Sharda Offset Platform

Phase 2 customer website for a premium local printing-business platform.

## Stack
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL foundation
- Lucide icons

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

Phase 2 does not require PostgreSQL or API credentials to preview the customer-facing design because sample/service content is currently development data.

## Contact details configured
- Address: 5, Priti Complex, Santram Road, Opp. Riddhi Laboratory, Nadiad, Gujarat
- Phone: +91 9825405898 / +91 8866600582
- Email: shardaoffset@gmail.com
- Hours: 9:00 AM – 7:30 PM
- WhatsApp: +91 9825405898

## Routes
- `/` homepage
- `/services/[slug]` service pages
- `/samples` searchable/filterable portfolio
- `/samples/[slug]` sample detail pages
- `/about` about page
- `/contact` enquiry/contact UI

## Phase 2 scope
- Responsive customer website
- Services discovery
- Portfolio/sample discovery
- Search and category filtering
- Sample detail/request-similar flow
- WhatsApp and phone CTAs
- Contact information and enquiry UI
- FAQ
- Responsive mobile navigation
- PostgreSQL/Prisma domain foundation

The contact form is intentionally presentation-only until the enquiry-system phase, so it does not pretend to persist data yet.

## Phase 3 — PostgreSQL + Prisma

Phase 3 adds the persistent data layer without implementing the admin/auth system yet.

### Requirements
- Node.js 20+
- PostgreSQL 14+

### Setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your PostgreSQL database.
3. Install dependencies: `npm install`
4. Generate Prisma Client: `npm run db:generate`
5. Create/update the database schema: `npm run db:push`
6. Seed development data: `npm run db:seed`
7. Start the website: `npm run dev`

### Database commands
- `npm run db:generate` — generate Prisma Client
- `npm run db:push` — sync schema to a development database
- `npm run db:migrate` — create a tracked Prisma migration
- `npm run db:seed` — seed services, categories, samples and FAQs

### Phase 3 API endpoints
- `GET /api/services`
- `GET /api/services/:slug`
- `GET /api/samples`
- `GET /api/samples/:slug`
- `POST /api/enquiries`

The customer UI remains intentionally conservative until the database is configured. Admin authentication, sample CRUD, analytics dashboards and the AI chatbot are subsequent phases.
