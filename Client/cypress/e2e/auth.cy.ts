describe('Authentication', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('shows the signup form by default', () => {
    cy.get('input[placeholder="Enter your name"]').should('be.visible')
    cy.get('input[placeholder="Enter your email"]').should('be.visible')
    cy.contains('button', 'Sign Up').should('be.visible')
  })

  it('toggles to login form when Login is clicked', () => {
    cy.contains('button', 'Login').click()
    cy.get('input[placeholder="Enter your email"]').should('be.visible')
    cy.get('input[placeholder="Enter your password"]').should('be.visible')
    cy.contains('button', 'Login').should('be.visible')
  })

  it('shows a warning when signup is submitted with empty fields', () => {
    cy.contains('button', 'Sign Up').click()
    cy.contains(/fill up all fields/i).should('be.visible')
  })

  it('shows a warning when login is submitted with empty fields', () => {
    cy.contains('button', 'Login').click()
    cy.contains('button', 'Login').click()
    cy.contains(/fill up all the details/i).should('be.visible')
  })

  it('fills in guest credentials when the guest button is clicked', () => {
    cy.contains('button', 'Login').click()
    cy.contains('button', /guest credentials/i).click()
  })

  it('logs in successfully and redirects to /chats', () => {
    cy.fixture('user').then((user) => {
      cy.intercept('POST', '**/api/users/login', { body: user }).as('loginReq')
      cy.intercept('GET', '**/api/chats', { body: [] }).as('chats')
      cy.intercept('GET', '**/api/posts', { body: [] }).as('posts')

      cy.contains('button', 'Login').click()
      cy.get('input[placeholder="Enter your email"]').type('test@chatapp.dev')
      cy.get('input[placeholder="Enter your password"]').type('password123')
      cy.contains('button', 'Login').click()

      cy.wait('@loginReq')
      cy.url().should('include', '/chats')
    })
  })

  it('shows an error toast when credentials are invalid', () => {
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 401,
      body: { message: 'Invalid email or password' },
    }).as('loginReq')

    cy.contains('button', 'Login').click()
    cy.get('input[placeholder="Enter your email"]').type('bad@test.com')
    cy.get('input[placeholder="Enter your password"]').type('wrongpass')
    cy.contains('button', 'Login').click()

    cy.wait('@loginReq')
    cy.contains(/error/i).should('be.visible')
  })

  it('auto-redirects to /chats when already authenticated', () => {
    cy.fixture('user').then((user) => {
      cy.intercept('GET', '**/api/chats', { body: [] })
      cy.intercept('GET', '**/api/posts', { body: [] })
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('userInfo', JSON.stringify(user))
        },
      })
      cy.url().should('include', '/chats')
    })
  })
})
