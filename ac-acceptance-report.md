Acceptance Criteria Mapping - Helpdesk Ticket Maintenance System 2026

Summary: maps each acceptance criterion (from `acs.json`) to the server endpoints and client UI components that implement it.

AC-01: Authentication & Authorization
- Server: `server/src/middleware/auth.ts` (`requireAuth`, `requireRole`) — JWT read from `cookies.accessToken` and decoded.
- Client: `client/src/auth/AuthProvider.tsx` uses `/auth/me`, `/auth/login`, `/auth/seed` and stores role in context.

AC-02: L1 Create Ticket
- Server: `server/src/controllers/tickets.ts` (`createTicket`) persists Ticket entity with title, description, category, expectedCompletion, priority.
- Server entity: `server/src/entities/Ticket.ts` fields `title`, `description`, `category`, `expectedCompletion`, `priority`.
- Client: `client/src/components/CreateTicket.tsx` form and `client/src/schemas.ts` validation via `createTicketSchema`.

AC-03: L1 Status Updates & Escalate to L2
- Server: `server/src/controllers/tickets.ts` (`updateStatus`, `escalate`) enforce status changes and append logs.
- Client: `client/src/components/TicketDetail.tsx` shows L1 controls to mark Attending/Completed and escalate to L2.

AC-04: L2 View Escalated + Assign Critical
- Server: `server/src/controllers/tickets.ts` (`assignCritical`) and `Ticket.critical` enum in `server/src/entities/Ticket.ts` (C1/C2/C3/None).
- Client: `client/src/components/TicketDetail.tsx` shows Critical selector for L2.

AC-05: L2 Add Actions, Logs, Escalate to L3
- Server: `server/src/controllers/tickets.ts` (`addLog`, `escalate`) append log entries and enforce role rules.
- Client: `client/src/components/TicketDetail.tsx` provides Add Log and escalate-to-L3 UI for L2.

AC-06: L3 Handle Escalated Critical (C1-C2) and Close
- Server: `server/src/controllers/tickets.ts` (`addResolution`) requires `escalation==='L3'` and `critical` in `['C1','C2']` then sets `status='Completed'`.
- Client: `client/src/components/TicketDetail.tsx` shows resolution UI only when ticket is escalated to L3 and critical is C1/C2.

AC-07: UI: Ticket List Filters and Detail Logs
- Client: `client/src/components/TicketList.tsx` provides filters for `status`, `priority`, `escalation` and queries `/tickets` with params.
- Client: `client/src/components/TicketDetail.tsx` renders `Logs` with timestamp, by, and note.
