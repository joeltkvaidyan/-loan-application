# LendSwift — Multi-Step Loan Application Form

> Production-grade 8-step loan application form built for Zetheta Algorithms Front-End Developer internship project.

## Live Demo

[https://lendswift.vercel.app](https://lendswift.vercel.app)

## Setup & Run

```bash
git clone https://github.com/ZethetaIntern/loan-application
cd loan-application
npm install
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint (must be 0 errors)
npm run test:e2e   # Cypress E2E tests
```

## Architecture Decisions

- **Wizard + Step Registry** over single form (see ARCHITECTURE.md)
- **React Hook Form** over Formik — no keystroke re-renders on 50+ fields
- **Zod** over Yup — TypeScript-native, discriminatedUnion for employment
- **schemaFactory.js** — runtime schema assembly from full form state
- **Zustand** over React Context — minimal boilerplate, devtools support

## Test Coverage

- 15 Cypress E2E tests (3 happy paths + 12 edge cases)
- Lighthouse Accessibility: 94/100
- ESLint: 0 errors

## Known Limitations

- PIN code database contains 27 sample PINs (real implementation uses India Post API)
- Encryption key is hardcoded (production would use user-derived key)
