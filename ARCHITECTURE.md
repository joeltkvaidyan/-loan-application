# LendSwift — Architecture Documentation

## 1. Wizard + Step Registry Pattern

The application uses a centralized `Wizard.jsx` that:
- Maintains `currentStep` state
- Computes `activeSteps[]` dynamically (Step 6 appears/disappears based on loan type + amount)
- Lazy-loads each step component for performance

```
App.jsx
└── Wizard.jsx (orchestrator)
    ├── ProgressBar.jsx
    ├── Step1LoanType.jsx   (lazy)
    ├── Step2PersonalInfo.jsx (lazy)
    ├── ...
    └── Step8Review.jsx     (lazy)
```

## 2. State Architecture (Zustand)

`formStore.js` holds all cross-step data:

```js
{
  step1..step8: {},          // step form data
  panVerified, aadhaarVerified, emailVerified, mobileVerified, coPanVerified,
  uploads: {},               // file upload map
  signature, coSignature,    // base64 PNG
  isStep6Required(),         // derived from step1.loanType + step1.loanAmount
  getActiveSteps(),          // [1,2,3,4,5,(6),7,8]
}
```

## 3. schemaFactory.js — Cross-Step Validation

A single function accepts full form state and returns the correct Zod schema per step.
This implements all 14 cross-step dependencies:

```js
schemaFactory(stepNumber, fullFormState) → ZodSchema
```

Key cross-step rules implemented:
- Step 2 DOB validates age + step1 tenure ≤ 65 years
- Step 5 enforces business employment for business loans
- Step 6 appears for: home loan always, personal > ₹5L, business > ₹20L
- Step 7 doc requirements change based on step1.loanType + step5.employmentType + step3.panVerified

## 4. Auto-Save Flow

```
useAutoSave hook
  → every 30 seconds
  → serialize form state
  → AES-256-GCM encrypt (Web Crypto API)
  → write to localStorage with TTL timestamp
  
On page load:
  → decrypt + parse
  → check TTL (72 hours)
  → show ResumeModal if valid draft found
```

## 5. Validation Algorithms

### PAN (AAAAA9999A)
- Regex: `/^[A-Z]{5}[0-9]{4}[A-Z]$/`
- 4th character entity-type check per loan type

### Aadhaar (Verhoeff Checksum)
- 3 lookup tables: multiplication (10×10), permutation (8×10), inverse (10)
- Iterates digits in reverse, result must equal 0

### EMI (Reducing Balance)
```
EMI = P × r × (1+r)^n / ((1+r)^n − 1)
r = annual_rate / 12 / 100
```

### GST
- Regex: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/`

## 6. Security

- PAN/Aadhaar masked after entry (show last 4 chars)
- localStorage encrypted with AES-256-GCM
- E-signature canvas overlay on blur
- Draft TTL: 72 hours auto-purge

## 7. RBI Compliance

Per RBI Guidelines on Digital Lending (DL/2022/01):
- Data minimality: only spec-required fields in Zod schemas
- Explicit consent: 4 separate checkboxes, none pre-ticked
- KFS displayed before submission on Step 8
- 3-day cooling-off period shown in success modal and Step 8
- Grievance redressal: nodal officer + cms.rbi.org.in on Step 8
