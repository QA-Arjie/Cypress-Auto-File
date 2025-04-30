// Run the Login script first

describe('Faveo Regression Test', () => {
    //const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    const ticketSubject = `Test Ticket Only-${timestamp}`;
    let createdTicketSubject;
    const testResults = [];
    let testStartTime;
  
    // Handle uncaught exceptions globally (for the entire test suite)
    Cypress.on('uncaught:exception', (err, runnable) => {
        // Returning false prevents Cypress from failing the test
        return false;
    });
  
    beforeEach(() => {
        // Read cookies from the file and set them
        cy.readFile('fixtures/cookies.json').then((cookies) => {
            cookies.forEach((cookie) => {
                cy.setCookie(cookie.name, cookie.value, {
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    expiry: cookie.expiry,
                });
            });
        });
  
        // Optionally reload the page after setting the cookies to apply them
        cy.reload(); 
  
        // Record start time before each test
        testStartTime = Date.now();
  
    });
  
    afterEach(function() {
      // Calculate test duration in seconds
      const duration = ((Date.now() - testStartTime) / 1000).toFixed(2);
  
      // Access test properties directly from mocha's context Update
      testResults.push({
        testName: this.currentTest.title,
        suite: 'Faveotest',
        status: this.currentTest.state || 'unknown',
        errorMessage: this.currentTest.err ? this.currentTest.err.message : '',
        timestamp: new Date().toISOString(),
        duration: duration
      });
  
      // Take screenshot
      cy.screenshot(`${timestamp}/${this.currentTest.title}`);
    });

    it('TC06: Create Ticket using Canned Response', () => {
        cy.visit('https://internal.ticket.mylabsid.com/panel/newticket')
          cy.get('.card-title').should('be.visible')
          // Canned Response
          cy.get('#vs2__combobox > .vs__selected-options > #dynamic-select').type('For Automation Dont Use').should('have.value', 'For Automation Dont Use')
          cy.wait(1000)
          cy.get('#vs2__option-1 > .d-center').click();
          // Assertion
          cy.get(':nth-child(1) > .row > :nth-child(1) > .btn').should('be.visible')
          // Requester
          cy.get('#requester').type('Arjie Testing Test').should('have.value', 'Arjie Testing Test')
          cy.wait(1000)
          cy.get('#vs19__option-0 > .d-center').click()
          // Subject
          cy.get("#subject").type(ticketSubject);
          // Assert
          cy.get('#custom_10095').should('be.visible').should('have.value', 'test@gmail.com')
          // Submit
          cy.get('#form-submit > .fa').click()
          // Assert // Verify ticket is created
          cy.get('#alert-message > div > span').should('be.visible')

          // Ticket Activity
          cy.get('.card-header > .nav > :nth-child(2) > .nav-link').click()

          // Assertion for Workflow
          cy.get('.timeline-item').should('contain', 'Workflow for Automation')
          // Assertion for Workflow Action
          cy.get('[href="/panel/tickets?show%5B%5D=inbox&departments%5B%5D=All&filter-by-url=1&category=all&tag-ids[]=1629"]').should('be.visible')
          cy.get(':nth-child(11) > .row > a.col-sm-6 > .v-popper--has-tooltip').contains('Normal').should('be.visible')
          cy.get(':nth-child(16) > .row > ul.col-sm-6 > li > a > .v-popper--has-tooltip').contains('value 2').should('be.visible')
          cy.get(':nth-child(18) > .row > a.col-sm-6 > .v-popper--has-tooltip').contains('value 2').should('be.visible')
        
    });

    after(() => {
        const csvContent = 'Test Name,Suite,Status,Error Message,Timestamp,Duration (seconds)\n' + 
          testResults.map(result => 
            `${result.testName},${result.suite},${result.status},${result.errorMessage || ''},${result.timestamp},${result.duration}`
          ).join('\n');
    
        cy.task('writeCSV', {
          filePath: `cypress/results/staging/internal-test-results-${timestamp}.csv`,
          csvContent: csvContent
        });
      });


    
    });