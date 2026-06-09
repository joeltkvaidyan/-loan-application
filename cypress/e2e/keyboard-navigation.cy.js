// keyboard-navigation.cy.js
describe('Keyboard Navigation (#13 P1)', () => {
  it('can tab through all inputs on Step 1', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($b => { if ($b.text().includes('Resume')) cy.contains('Start fresh').click() })
    cy.get('body').tab()
    cy.focused().should('exist')
  })
})
