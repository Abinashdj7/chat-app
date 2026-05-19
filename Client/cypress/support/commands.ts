Cypress.Commands.add('loginByLocalStorage', (user: object) => {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      win.localStorage.setItem('userInfo', JSON.stringify(user))
    },
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginByLocalStorage(user: object): Chainable<void>
    }
  }
}
