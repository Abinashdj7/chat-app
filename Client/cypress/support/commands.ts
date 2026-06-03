export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginByLocalStorage(user: object): Chainable
    }
  }
}

Cypress.Commands.add('loginByLocalStorage', (user: object) => {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      win.localStorage.setItem('userInfo', JSON.stringify(user))
    },
  })
})
