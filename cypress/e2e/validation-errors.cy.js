// validation-errors.cy.js
describe('Step 1 Validation Errors', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($body => {
      if ($body.text().includes('Resume')) cy.contains('Start fresh').click()
    })
  })

  it('shows errors when submitting empty Step 1', () => {
    cy.get('button[type="submit"]').click()
    cy.get('[role="alert"]').should('have.length.gte', 1)
    cy.contains('Select a loan type').should('be.visible')
  })

  it('validates loan amount range for personal loan', () => {
    cy.get('[name="loanType"]').check('personal', { force: true })
    cy.get('input[id*="loan-amount"]').type(10)
    cy.get('button[type="submit"]').click()
    cy.get('[role="alert"]').should('exist')
  })
})

describe('Step 2 Validation Errors', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($body => {
      if ($body.text().includes('Resume')) cy.contains('Start fresh').click()
    })
    // fill step 1 first
    cy.get('[name="loanType"]').check('personal', { force: true })
    cy.get('input[id*="loan-amount"]').type(300000)
    cy.get('select').eq(0).select('36', { force: true })
    cy.get('select').eq(1).select('medical', { force: true })
    cy.get('button[type="submit"]').click()
  })

  it('shows age validation error for underage applicant', () => {
    cy.get('input[type="date"]').type('2010-01-01')
    cy.get('button[type="submit"]').click()
    cy.contains('Minimum age').should('be.visible')
  })

  it('shows mobile format error', () => {
    cy.get('input[type="tel"]').type('1234567890')
    cy.get('button[type="submit"]').click()
    cy.contains('valid 10-digit mobile').should('be.visible')
  })
})
