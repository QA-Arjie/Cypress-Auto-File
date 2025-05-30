// Run the Login script first

describe('Faveo Regression Test', () => {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
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
  
    // Test case 1: Create new Ticket
    it('TC01: Create Ticket', () => {
        cy.visit('https://internal.ticket.mylabsid.com/panel/newticket')
          cy.get('.card-title').should('be.visible')
          // Form
          //cy.get('#vs1__combobox > .vs__selected-options > #dynamic-select').type('Test Form for Auto');
          //cy.wait(2000)
          //cy.get('#vs1__option-0 > .d-center').click();
          cy.get('#Requester > .col-md-2 > .v-popper--has-tooltip').should('be.visible')
          cy.wait(1000);
          // Requester
          cy.get('#requester').type('Arjie Testing Test').should('have.value', 'Arjie Testing Test')
          cy.wait(1000)
          cy.get('#vs3__option-0 > .d-center').click()
          //Subject
          cy.get("#subject").type(ticketSubject);
          // Assigned
          cy.get('#assigned_id').type('Arjie Viguilla').should('have.value', 'Arjie Viguilla')
          cy.wait(1000)
          cy.get('#vs4__option-0 > .d-center').click();
          // Status
          cy.get('#status_id').click();
          cy.get('#vs6__option-0 > .d-center').click();
          // Priority
          cy.get('#priority_id').click();
          cy.get('#vs13__option-2 > .d-center').click();
          // Department
          cy.get('#department_id').click();
          cy.get('#vs15__option-3 > .d-center').click();
          // Type
          cy.get('#type_id').click();
          cy.get('#vs16__option-6 > .d-center').click()
          // Description
          cy.get('iframe').then(($iframe) => {
            const body = $iframe.contents().find('body'); 
            cy.wrap(body).type('Test ticket only, please ignore');
          });
          // Submit ticket //
          cy.get('#form-submit > .fa').click()
          // Assert // Verify ticket is created
          //cy.get('#alert-message > div > span').should('be.visible')
          cy.get('[style="border-top: 3px solid rgb(0, 166, 90);"] > :nth-child(1)').should('be.visible')

          // Ticket Activity
          cy.get('.card-header > .nav > :nth-child(2) > .nav-link').click()

          // Assertion for Workflow
          cy.get('.timeline-item').should('contain', 'Workflow for Automation')
          
          // Store the ticket subject for later use in other Test Cases
          createdTicketSubject = ticketSubject;
        
    });

    // Test Case 2: Search and Reply to Created ticket
    it('TC02: Reply to Ticket', () => {
        cy.visit('https://internal.ticket.mylabsid.com/panel/dashboard')
        cy.get('div > .fas').click()
        cy.get('.input-group > .form-control').clear()
        cy.get('.input-group > .form-control').type(`${createdTicketSubject}{enter}`).should('have.value', createdTicketSubject); // Assertion to verify the input value
        cy.wait(1000)
        cy.get('.input-group-append > :nth-child(1) > .fas').click()
        //Assert
        cy.get('div.dropdown-item').should('be.visible')
        // Click ticket result
        cy.get('#first_thread_title > :nth-child(2)').click()
        // Assertion, verify if requester and assignee is correct.
        // Requester
        cy.get(':nth-child(7) > .row > .inbox-info > .inline-block > :nth-child(1) > .user_name > .emphasize')
        .contains('Arjie Testing Test')
        .should('be.visible')
        // Assigned
        cy.get(':nth-child(10) > .row > .inbox-info > .inline-block > :nth-child(1) > .user_name > .emphasize')
        .contains('Arjie Viguilla')
        .should('be.visible')
        // Click Reply button
        cy.get('.timeline-actions-span > :nth-child(5)').click()
        cy.wait(2000);
        // Type in the iframe
        cy.get('#focus_editor_ifr').then($iframe => {
        const body = $iframe.contents().find('body');
        cy.wrap(body).type('Test reply');
        });
        // Submit Reply
        cy.get('.card-footer > .btn').click()
        // Assert
        cy.get('#alert-message > div > span').should('be.visible')

        // Assert for Listener
        cy.get('.card-header > .nav > :nth-child(2) > .nav-link').click()
        cy.get('.timeline-item').should('contain', 'Listener for Automation')


    })

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