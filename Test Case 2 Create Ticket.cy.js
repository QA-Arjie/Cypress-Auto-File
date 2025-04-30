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

// Test Case #2: Ticket Creation
it("TC02 Ticket Creation", () => {
    startTime = performance.now();
    cy.log('Running test 2');

    // Login
    cy.visit("https://internal.ticket.mylabsid.com/home");
    cy.get("#client_login").click(); // Using ID
    cy.get("#login_form_user_name").type(Cypress.env("user_name"));
    cy.get("#login_form_password").type(Cypress.env("password"), { log: false });
    cy.get("#default-login-button").click();
    cy.get(".text").contains("You are here :");

    // Homepage
    cy.get('#navbarDropdownProfile').trigger('mouseover'); // Hover
    cy.get('#client_dashboard').click({ force: true });
    //cy.wait(3000);
    cy.get(':nth-child(4) > #nav_child > .nav-icon').should('be.visible')

    // Ticket Creation using Canned Response
    cy.get("#nav_child").click();
    cy.wait(1000);
    cy.get(".displayMenu > :nth-child(1) > .nav-link").click();
    cy.get('.card-header').should('be.visible')
    cy.get('#vs2__combobox > .vs__selected-options > #dynamic-select').click();
    cy.get('#vs2__option-2 > .d-center').click();
    cy.wait(1000);
    cy.get("#subject").type(ticketSubject);
    cy.get('#form-submit > .fa').click();
    cy.title().should('eq', 'MyRepublic | Faveo');
    //cy.wait(10000);
    cy.get('.card-title > .fas').should('be.visible');

    // Store the ticket subject for later use in TC03
    createdTicketSubject = ticketSubject;

    logTestResult('Ticket Creation', startTime);
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

});