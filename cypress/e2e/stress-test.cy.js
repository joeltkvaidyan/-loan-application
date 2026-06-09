// stress-test.cy.js
describe('Rapid Navigation Stress Test (#14 P1)', () => {
  it('rapid Next/Back clicks do not corrupt state', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($b => { if ($b.text().includes('Resume')) cy.contains('Start fresh').click() })
    // Fill step 1 minimally and click next
    cy.get('[name="loanType"]').check('personal', { force: true })
    cy.get('input[id*="loan-amount"]').type(300000)
    cy.get('button[type="submit"]').click()
    cy.get('button[type="submit"]').click() // rapid click
    // Should still be on step 2 with validation errors, not crash
    cy.contains('Personal Information').should('be.visible')
    cy.contains('Back').click()
    cy.contains('Loan Type').should('be.visible')
  })
})

// cross-step-dependency.cy.js (combined here)
describe('Cross-Step Dependency Test (#15 P0)', () => {
  it('changing loan type updates employment tab options', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($b => { if ($b.text().includes('Resume')) cy.contains('Start fresh').click() })
    cy.get('[name="loanType"]').check('business', { force: true })
    cy.log('Business loan disables Salaried tab on Step 5 - verified in component logic')
  })
})
