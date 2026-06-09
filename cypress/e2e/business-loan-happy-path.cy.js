// business-loan-happy-path.cy.js
describe('Business Loan Happy Path (#3 P0)', () => {
  it('selects business loan type and shows business employment options', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($b => { if ($b.text().includes('Resume')) cy.contains('Start fresh').click() })
    cy.get('[name="loanType"]').check('business', { force: true })
    cy.get('[name="loanType"]:checked').should('have.value', 'business')
    cy.contains('₹50,000 – ₹50,00,000').should('be.visible')
  })
})
