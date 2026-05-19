describe('Chat Page', () => {
  beforeEach(() => {
    cy.fixture('user').then((user) => {
      cy.intercept('GET', '**/api/chats', { fixture: 'chats' }).as('fetchChats')
      cy.intercept('GET', '**/api/posts', { body: [] })
      cy.visit('/chats', {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('userInfo', JSON.stringify(user))
        },
      })
      cy.wait('@fetchChats')
    })
  })

  it('renders the chat list after login', () => {
    cy.contains('Alice').should('be.visible')
    cy.contains('Dev Team').should('be.visible')
  })

  it('shows the latest message preview in the chat list', () => {
    cy.contains('Hey there!').should('be.visible')
  })

  it('opens the search drawer when Search is clicked', () => {
    cy.contains('button', 'Search').click()
    cy.contains('Search users').should('be.visible')
    cy.get('input[placeholder="Search by name or email"]').should('be.visible')
  })

  it('shows user results after a search', () => {
    const searchResults = [
      { _id: 'u99', name: 'Charlie', email: 'charlie@chatapp.dev', pic: null },
    ]
    cy.intercept('GET', '**/api/users?search=charlie', { body: searchResults }).as('search')

    cy.contains('button', 'Search').click()
    cy.get('input[placeholder="Search by name or email"]').type('charlie')
    cy.contains('button', 'Go').click()

    cy.wait('@search')
    cy.contains('Charlie').should('be.visible')
  })

  it('shows a warning when searching with an empty input', () => {
    cy.contains('button', 'Search').click()
    cy.contains('button', 'Go').click()
    cy.contains(/please enter something/i).should('be.visible')
  })

  it('logs out and returns to the auth page', () => {
    cy.contains('button', 'Log out').click()
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    cy.wrap(null).then(() => {
      expect(localStorage.getItem('userInfo')).to.be.null
    })
  })
})
