let testResults = [];

describe('Faveotest', () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14); // Format: YYYYMMDDHHMMSS
  const ticketSubject = `Test Ticket Only-${timestamp}`; // Unique ticket subject
  let startTime;
  let createdTicketSubject; // Variable to store the ticket subject from TC02

  // Helper function to log test results
  const logTestResult = (testName, startTime) => {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2) + 'ms';  // Duration in ms
    const status = Cypress.mocha.getRunner().stats.failures === 0 ? 'passed' : 'failed';
    const errorMessage = status === 'failed' ? Cypress.mocha.getRunner().failures[0].err.message : '';

    testResults.push({
      testName: testName,
      suite: 'Faveotest',
      status: status,
      duration: duration,
      errorMessage: errorMessage,
      browser: 'chrome',
      timestamp: new Date().toISOString(),
    });

    // Log the results for debugging purposes
    console.log(`${testName} Duration: ${duration}, Status: ${status}`);
    if (status === 'failed') {
      console.log(`Error Message: ${errorMessage}`);
    }
  };

// Test Case #3: Search and Reply to Ticket
it("TC03 Search and Reply to Ticket", () => {
    startTime = performance.now();
    cy.log('Running test 4');

    // Login
    cy.visit("***************************");
    cy.get("#client_login").click(); // Using ID
    cy.get("#login_form_user_name").type(Cypress.env("user_name"));
    cy.get("#login_form_password").type(Cypress.env("password"), { log: false });
    cy.get("#default-login-button").click();

    // Search for the created ticket
    cy.get('div > .fas').click();
    cy.get('.form-inline > .input-group > .form-control').clear();  // Clear search field
    cy.get('.form-inline > .input-group > .form-control').type(`${createdTicketSubject}{enter}`);
    cy.wait(3000);
    cy.get('.input-group-append > :nth-child(1) > .fas').click();  // Click the search button
    cy.wait(3000);
    cy.get('#first_thread_title > :nth-child(2)').click();

    // Reply to ticket
    cy.get('.timeline-actions-span > :nth-child(5)')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    // Method 1: Using cy.iframe() with explicit wait and force
    cy.get('#focus_editor_ifr')
      .should('be.visible')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .clear()
      .type('Test ticket only, please ignore', { force: true });

      // Submit the reply with verification
      cy.get('.card-footer > .btn')
        .should('be.visible')
        .should('not.be.disabled')
        .click();
        cy.get('.content-header').should('be.visible')
        cy.wait(5000)

    logTestResult('Reply to Ticket', startTime);
  });

  after(() => {
    // Generate a unique filename based on timestamp
    const uniqueFileName = `cypress/results/test-results-${timestamp}.csv`;

    // Write the results to the newly generated CSV file
    let csvContent = 'Test Name, Suite, Status, Duration, Error Message, Browser, Timestamp\n';
    testResults.forEach(result => {
      const row = `${result.testName},${result.suite},${result.status},${result.duration},${result.errorMessage},${result.browser},${result.timestamp}`;
      csvContent += row + '\n';
    });

    // Write to the new CSV file
    cy.writeFile(uniqueFileName, csvContent);
  });

})
