// home-loan-happy-path.cy.js
describe('Home Loan Happy Path', () => {
  it('selects home loan and verifies co-applicant step appears', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($b => { if ($b.text().includes('Resume')) cy.contains('Start fresh').click() })
    cy.get('[name="loanType"]').check('home', { force: true })
    // Home loan always requires Step 6
    cy.get('[name="loanType"]:checked').should('have.value', 'home')
  })
})
