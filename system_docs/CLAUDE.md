# TipTop Salon Management System
# Shared Development Instructions

## 1. System Overview

TipTop Salon Management System is a multi-application software
system composed of multiple independent Git repositories.

The repositories are separate projects, but they are considered
parts of one integrated system.

Current repositories:

- `windows` — C# .NET MAUI Windows Application
- `flutter` — Flutter Application
- `frontend` — Website Frontend
- `Tiptop-System-Docs` — Shared system documentation

The exact role of each application and the backend/API architecture
must be verified from the actual implementation. Do not make
assumptions about components that have not yet been implemented.

---

## 2. Multiple Developer Workflow

There are currently two developers working on the system.

### Windows Developer

Responsible primarily for:

- `windows`

### Flutter / Frontend Developer

Responsible primarily for:

- `flutter`
- `frontend`

Both developers must follow the shared architecture and
documentation contained in this repository.

---

## 3. Cross-Repository Awareness

Although each application has its own Git repository, they form
one integrated system.

When implementing a feature or fixing a problem, determine whether
the change can affect another repository.

Potential cross-repository dependencies include:

- API contracts
- Authentication
- Authorization
- Data models
- Request and response structures
- Validation rules
- Business rules
- Database requirements
- Error handling
- User workflows
- Shared configuration
- Integration behavior

Do not assume that a change is isolated to the current repository.

However, do not modify another repository unless the change is
required and explicitly permitted by the development workflow.

---

## 4. Source of Truth

When determining how the system currently works, prioritize:

1. Actual source code
2. Actual API implementation
3. Actual database schema
4. Approved architecture decisions
5. Shared documentation
6. Developer instructions

If documentation conflicts with the actual implementation,
identify the discrepancy rather than silently assuming one is correct.

Never invent APIs, database tables, business rules, or system
behavior that has not been verified.

---

## 5. Feature Investigation

Before implementing a significant feature:

1. Understand the requested functionality.
2. Locate the existing implementation.
3. Trace the relevant workflow.
4. Identify affected repositories.
5. Identify API and data dependencies.
6. Identify possible database changes.
7. Identify validation and business rules.
8. Determine whether other applications are affected.
9. Propose the required changes.
10. Implement only the necessary changes.
11. Test the affected functionality.
12. Update shared documentation when the architecture or behavior
    changes.

---

## 6. Cross-Application Flow

When applicable, trace features through the complete system flow.

For example:

User Interface
    ↓
Application Service / API Client
    ↓
Backend / API
    ↓
Business Logic
    ↓
Database
    ↓
Response
    ↓
User Interface

The actual architecture may differ.

Always follow the real implementation rather than assuming this
example is the final architecture.

---

## 7. API Contract Protection

API contracts are shared dependencies between applications.

Before changing an API:

- Identify all known consumers.
- Check request structures.
- Check response structures.
- Check field names and data types.
- Check required and optional fields.
- Check authentication requirements.
- Check validation behavior.
- Check error responses.
- Determine backward compatibility impact.

A breaking API change must be clearly identified before implementation.

---

## 8. Database Changes

Database changes must be treated as system-wide changes.

Before changing database structures:

- Identify affected applications.
- Identify affected API endpoints.
- Identify affected models and DTOs.
- Identify existing data.
- Consider migration requirements.
- Consider backward compatibility.

Do not make destructive database changes without explicit approval.

---

## 9. Documentation

Important system-level decisions must be documented in:

`Tiptop-System-Docs`

Documentation should remain synchronized with the actual
implementation.

Important documentation may include:

- Architecture
- API contracts
- Database structure
- Business rules
- End-to-end workflows
- Authentication
- Authorization
- Integration dependencies
- Technical decisions
- Known limitations

Do not create documentation for functionality that does not yet
exist unless it is clearly marked as planned.

---

## 10. Git Repository Rules

Each application is an independent Git repository.

Do not merge the repositories into one Git repository.

When working on a repository:

- Keep changes focused.
- Do not modify unrelated repositories.
- Do not overwrite another developer's work.
- Do not commit secrets or credentials.
- Use clear commit messages.
- Pull the latest changes before starting collaborative work when
  appropriate.
- Push completed changes so the other developer can synchronize.

---

## 11. Verification

Never claim that something was tested unless the test was actually
performed.

Clearly distinguish between:

- Verified
- Tested
- Not tested
- Unable to verify
- Assumption
- Planned

If another repository cannot be accessed, state that limitation.

---

## 12. Important Rule for Claude

The current repository is not necessarily the entire system.

When a task may affect another application, investigate the relevant
cross-repository dependency before implementing the change.

The goal is to maintain one coherent TipTop Salon Management System
across all repositories while allowing each repository to remain
independently developed and version controlled.