describe('Posts Page', () => {
  beforeEach(() => {
    cy.fixture('user').then((user) => {
      cy.intercept('GET', '**/api/chats', { body: [] })
      cy.intercept('GET', '**/api/posts', { fixture: 'posts' }).as('fetchPosts')
      cy.visit('/chats', {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('userInfo', JSON.stringify(user))
        },
      })
      cy.contains('button', 'Posts').click()
      cy.wait('@fetchPosts')
    })
  })

  it('switches to the posts feed when Posts is clicked', () => {
    cy.contains('button', 'Chats').should('be.visible')
    cy.contains('Hello World').should('be.visible')
    cy.contains('Building a Chat App').should('be.visible')
  })

  it('renders post titles and descriptions', () => {
    cy.contains('My first post on this platform!').should('be.visible')
    cy.contains('Here is what I learned building a real-time chat application').should('be.visible')
  })

  it('renders the create post form', () => {
    cy.get('textarea[placeholder="Title"]').should('be.visible')
    cy.get('textarea[placeholder="Description"]').should('be.visible')
    cy.contains('button', 'Create Post').should('be.visible')
  })

  it('shows a warning when creating a post without title or description', () => {
    cy.contains('button', 'Create Post').click()
    cy.contains(/title or description/i).should('be.visible')
  })

  it('switches back to chat view when Chats is clicked', () => {
    cy.contains('button', 'Chats').click()
    cy.contains('button', 'Posts').should('be.visible')
  })
})
