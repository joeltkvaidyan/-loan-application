// cypress/support/commands.js
// Custom commands for filling each step

Cypress.Commands.add('fillStep1', (data) => {
  cy.get('[name="loanType"]').check(data.loanType, { force: true })
  cy.get('input[id*="loan-amount"]').clear().type(data.loanAmount)
  cy.get('select[id*="loan-tenure"]').select(data.loanTenure)
  cy.get('select[id*="loan-purpose"]').select(data.loanPurpose)
})

Cypress.Commands.add('fillStep2', (data) => {
  cy.get('input[id*="full-name"]').clear().type(data.fullName)
  cy.get('input[type="date"]').type(data.dateOfBirth)
  cy.get('[name="gender"]').check(data.gender, { force: true })
  cy.get('select[id*="marital"]').select(data.maritalStatus)
  cy.get('input[id*="father"]').clear().type(data.fatherName)
  cy.get('input[id*="mother"]').clear().type(data.motherName)
  cy.get('input[type="email"]').clear().type(data.email)
  cy.get('input[type="tel"]').clear().type(data.mobile)
})

Cypress.Commands.add('fillStep3', (data) => {
  cy.get('input[id*="pan"]').click().clear().type(data.pan)
  cy.get('input[id*="aadhaar"]').click().clear().type(data.aadhaar)
  cy.get('input[type="checkbox"]').first().check({ force: true })
})

Cypress.Commands.add('fillStep4', (data) => {
  cy.get('input[id*="address-line"]').clear().type(data.addressLine1)
  cy.get('input[id*="pin-code"]').clear().type(data.pinCode)
  cy.get('select[id*="residence"]').select(data.residenceType)
  cy.get('input[id*="years-at"]').clear().type(data.yearsAtAddress)
})

Cypress.Commands.add('fillStep5', (data) => {
  cy.contains('button', data.employmentType === 'salaried' ? 'Salaried' : data.employmentType === 'self_employed' ? 'Self-Employed' : 'Business Owner').click()
  if (data.employmentType === 'salaried') {
    cy.get('input[id*="company"]').clear().type(data.companyName)
    cy.get('input[id*="monthly"]').clear().type(data.monthlyIncome)
    cy.get('input[id*="years-in"]').clear().type(data.yearsInJob)
  }
})

Cypress.Commands.add('fillStep6', (data) => {
  cy.get('input[id*="co-applicant-full"]').clear().type(data.coApplicantName)
  cy.get('select[id*="relationship"]').select(data.coRelationship)
  cy.get('input[id*="co-applicant-pan"]').clear().type(data.pan || 'ABCCD1234F')
  cy.get('input[id*="co-applicant-monthly"]').clear().type(50000)
  cy.get('input[type="checkbox"]').last().check({ force: true })
})

Cypress.Commands.add('fillStep7', () => {
  // Steps with optional docs - just proceed
  cy.contains('button', 'Continue').click()
})

Cypress.Commands.add('fillStep8', () => {
  cy.get('input[type="checkbox"]').each(($el) => {
    cy.wrap($el).check({ force: true })
  })
})

Cypress.Commands.add('clickNext', () => {
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('clickBack', () => {
  cy.contains('button', '← Back').click()
})
