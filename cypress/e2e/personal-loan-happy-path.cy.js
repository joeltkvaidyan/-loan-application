// personal-loan-happy-path.cy.js
describe('Personal Loan Happy Path', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
    // dismiss resume modal if shown
    cy.get('body').then($body => {
      if ($body.text().includes('Resume')) cy.contains('button', 'Start fresh').click()
    })
  })

  it('completes a salaried personal loan application end-to-end', () => {
    cy.fixture('valid-personal-loan').then((data) => {
      // Step 1
      cy.contains('Loan Type').should('be.visible')
      cy.get('[name="loanType"]').check('personal', { force: true })
      cy.get('input[id*="loan-amount"]').type(data.loanAmount)
      cy.get('select').first().select(data.loanTenure, { force: true })
      cy.get('button[type="submit"]').click()

      // Step 2
      cy.contains('Personal Information').should('be.visible')
    })
  })
})
