describe('Faveo Regression Test', () => {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    const testResults = [];
    let testStartTime;

    // Handle uncaught exceptions globally (for the entire test suite)
    Cypress.on('uncaught:exception', (err, runnable) => {
        return false; // Prevents Cypress from failing the test
    });

    beforeEach(() => {
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

        cy.reload(); // Reload the page to apply cookies
        testStartTime = Date.now(); // Record start time before each test
    });

    afterEach(function() {
        const duration = ((Date.now() - testStartTime) / 1000).toFixed(2);

        testResults.push({
            testName: this.currentTest.title,
            suite: 'FaveoTest',
            status: this.currentTest.state || 'unknown',
            errorMessage: this.currentTest.err ? this.currentTest.err.message : '',
            timestamp: new Date().toISOString(),
            duration: duration
        });

        cy.screenshot(`${timestamp}/${this.currentTest.title}`);
    });

    // Number of Iteration
    const ticketData = [
        { requester: 'Test Customer', subject: `Test Ticket Only-${timestamp}-1` },
        { requester: 'Test Customer', subject: `Test Ticket Only-${timestamp}-2` },
        { requester: 'Test Customer', subject: `Test Ticket Only-${timestamp}-3` },
        { requester: 'Test Customer', subject: `Test Ticket Only-${timestamp}-4` },
        { requester: 'Test Customer', subject: `Test Ticket Only-${timestamp}-5` },
       // { requester: 'Arjie Testing Test', subject: `Test Ticket Only-${timestamp}-6` },
        //{ requester: 'Arjie Testing Test', subject: `Test Ticket Only-${timestamp}-7` },
        //{ requester: 'Arjie Testing Test', subject: `Test Ticket Only-${timestamp}-8` },
        //{ requester: 'Arjie Testing Test', subject: `Test Ticket Only-${timestamp}-9`}
    ];

    // Test case 1: Create Ticket (with iteration)
    ticketData.forEach(({ requester, subject }) => {
        it(`TC01: Create Ticket for ${subject}`, () => {
            cy.visit('***********************************');
            cy.get('.card-title').should('be.visible');

            // Populate Form
            cy.get('#Requester > .col-md-2 > .v-popper--has-tooltip').should('be.visible');
            cy.wait(1000);

            // Requester
            cy.get('#requester').type(requester).should('have.value', requester);``
            cy.wait(1000);
            cy.get('#vs3__option-0 > .d-center').click();

            // Subject
            cy.get("#subject").type(subject);

            // Assigned
            cy.get('#assigned_id').type('Arjie Viguilla').should('have.value', 'Arjie Viguilla');
            cy.wait(1000);
            cy.get('#vs4__option-0 > .d-center').click();

            // Status
            cy.get('#status_id').click();
            cy.get('#vs6__option-0 > .d-center').click();

            // Priority
            cy.get('#priority_id').click();
            cy.get('#vs12__option-2 > .d-center').click();

            // Department
           // cy.get('#department_id').click();
            //cy.get('#vs14__option-3 > .d-center').click();

            // Help Topic
            cy.get('#help_topic_id').type('NZ Finance');
            cy.get('#vs16__option-0 > .d-center').click();

            // Description
            cy.get('iframe').then(($iframe) => {
                const body = $iframe.contents().find('body');
                cy.wrap(body).type('Test ticket only, please ignore');
            });

            // Submit ticket
            cy.get('#form-submit > .fa').click();

            // Assert: Verify ticket is created
            cy.get('[style="border-top: 3px solid rgb(0, 166, 90);"] > :nth-child(1)').should('be.visible');

            // Ticket Activity
           // cy.get('.card-header > .nav > :nth-child(2) > .nav-link').click();

            // Assertion for Workflow
            //cy.get('.timeline-item').should('contain', 'Workflow for Automation');
        });
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
