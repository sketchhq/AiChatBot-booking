# AiChatBot Booking Backend Plan

## Source
- Extracted from `/home/hari/workspace/CarePoint_Demo_Plan_v3/CarePoint_Demo_Plan_v3.docx`
- Focus: backend-first implementation for AiChatBot-booking repository

## Key backend priorities
1. NestJS 11 backend with PostgreSQL and TypeORM
2. Groq AI integration for symptom extraction, slot-filling, urgency scoring
3. Supabase/Postgres schema for clinics, doctors, patients, appointments, conversations
4. JWT auth, session handling, Redis conversation persistence
5. Booking API: create, check, cancel, reschedule, appointment status
6. Swagger docs under `/api/docs`
7. Emergency routing and urgency alert logic
8. Free-tier stack only: Groq, Supabase, Upstash Redis, Railway, Vercel

## Implementation Guidelines (Added)
- Work on `feature/implementation` branch
- Commit each logical functionality separately with clear commit messages
- Structure code neatly: separate long files into multiple components/modules
- Follow NestJS best practices: proper module structure, dependency injection, guards, pipes
- Document each functionality clearly with comments
- Test endpoints with curl/Postman as we build
- Keep all progress and findings in this memory file

## Immediate backend tasks
- Confirm backend repo local dev bootstraps cleanly
- Verify env config for local Postgres and JWT secret
- Wire Groq extraction in chatbot service
- Build slot-filling state machine with Redis persistence
- Create or verify 5 core tables in Supabase/Postgres
- Expose booking endpoints and test with Postman/curl
- Validate Swagger and API contract

## Current Progress
- Branch: `feature/implementation` created
- Memory file moved to backend repo
- Starting analysis of current backend structure

## Notes
- Backend first is a good approach: it provides a stable API surface for frontend integration.
- Frontend should connect once the core booking/chat endpoints and auth are stable.
- Keep the implementation free-tier and open-source friendly.

## Code Origin Notes
- Current codebase taken from Google vet appointment app for reference
- Modify for general hospital/clinic use (not just vets)
- App should be flexible for different hospital types/doctors/clients
- Rename files and adapt based on our requirements
