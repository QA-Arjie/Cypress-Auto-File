describe('Faveotest', () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const ticketSubject = `Test Ticket Only-${timestamp}`;
  let createdTicketSubject;
  const testResults = [];
  let testStartTime;


  // Test Case #1: Login
it('TC01 Login', () => {
  cy.visit("https://internal.ticket.mylabsid.com/home");
  cy.get("#client_login").click();
  cy.get("#login_form_user_name").type(Cypress.env("user_name"));
  cy.get("#login_form_password").type(Cypress.env("password"), { log: false });
  cy.get("#default-login-button").click();
  //cy.wait(2000);
  //cy.get('.text').should('contain', 'You are here :');
  cy.get('#navbarDropdownProfile').should('be.visible')

  cy.getCookies().then((cookies) => {
      const cookiesJSON = JSON.stringify(cookies);
      cy.writeFile('fixtures/cookies.json', cookiesJSON);
    });
});

});