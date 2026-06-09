// kyc-pan-aadhaar-validation.cy.js
describe('Step 3 PAN/Aadhaar Validation (#6 P0)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($b => { if ($b.text().includes('Resume')) cy.contains('Start fresh').click() })
    // navigate to step 3 via localStorage injection
    cy.window().then(win => {
      // We just test validation directly; in real run navigate through steps
    })
  })

  it('shows PAN format error for invalid PAN', () => {
    // Fill steps 1 and 2 quickly
    cy.get('[name="loanType"]').check('personal', { force: true })
    cy.get('input[id*="loan-amount"]').type(300000)
    cy.get('select').eq(0).select('36', { force: true })
    cy.get('select').eq(1).select('medical', { force: true })
    cy.get('button[type="submit"]').click()
    // Step 2
    cy.get('input[id*="full-name"]').type('Test User')
    cy.get('input[type="date"]').type('1990-01-01')
    cy.get('[name="gender"]').check('male', { force: true })
    cy.get('select').first().select('single', { force: true })
    cy.get('input').eq(4).type('Father Name')
    cy.get('input').eq(5).type('Mother Name')
    cy.get('input[type="email"]').type('test@test.com')
    cy.get('input[type="tel"]').type('9876543210')
    cy.get('button[type="submit"]').click()
    // Step 3 - enter invalid PAN
    cy.contains('KYC').should('be.visible')
    cy.get('input[id*="pan"]').click().type('INVALID123')
    cy.get('input[id*="aadhaar"]').click().type('123456789012')
    cy.get('input[type="checkbox"]').first().check({ force: true })
    cy.get('button[type="submit"]').click()
    cy.contains('Invalid PAN').should('be.visible')
  })
})
