// auto-save-resume.cy.js
describe('Auto-Save & Resume (#12 P0)', () => {
  it('shows resume modal after reload if draft exists', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.get('body').then($b => { if ($b.text().includes('Resume')) cy.contains('Start fresh').click() })

    // Fill step 1 and trigger manual save via waiting for autosave timer
    // Inject draft directly for speed
    cy.window().then(win => {
      win.localStorage.setItem('lendswift_draft', btoa(JSON.stringify({
        step1: { loanType: 'personal', loanAmount: 300000 },
        savedAt: Date.now()
      })))
    })

    cy.reload()
    cy.contains('Resume Application?').should('be.visible')
    cy.contains('Resume where I left off').click()
    cy.contains('Resume Application?').should('not.exist')
  })

  it('start fresh clears draft', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.window().then(win => {
      win.localStorage.setItem('lendswift_draft', btoa(JSON.stringify({
        step1: { loanType: 'personal' },
        savedAt: Date.now()
      })))
    })
    cy.reload()
    cy.contains('Start fresh').click()
    cy.contains('Loan Type').should('be.visible')
    cy.window().its('localStorage').invoke('getItem', 'lendswift_draft').should('be.null')
  })
})
