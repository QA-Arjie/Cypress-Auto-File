const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');
const cucumber = require('cypress-cucumber-preprocessor').default;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        writeCSV({ filePath, csvContent }) {
          console.log('Writing CSV to:', filePath);
          console.log('Content length:', csvContent.length);

          // Create directory if it doesn't exist
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Write CSV file
          try {
            fs.writeFileSync(filePath, csvContent, 'utf8');
            console.log('CSV file written successfully.');
          } catch (error) {
            console.error('Error writing CSV file:', error);
            throw error; // Throw error to indicate failure
          }

          // Verify file was written (optional, for debugging purposes)
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            console.log('Written content length:', fileContent.length);
          } catch (error) {
            console.error('Error reading CSV file:', error);
          }

          return filePath; // Return the file path after writing the file
        }
      });

      // Setup Cucumber preprocessor
      on('file:preprocessor', cucumber());
    },
    //specPattern: "cypress/e2e/*.feature", // This pattern matches all feature files
    experimentalStudio: true,
  },
  viewportWidth: 1280, // Set default width to 1280px
  viewportHeight: 720, // Set default height to 720px
  defaultCommandTimeout: 100000,    // Default timeout for most commands
  assertionTimeout: 100000,         // Default timeout for assertions
  pageLoadTimeout: 30000,           // Timeout for page loads
  requestTimeout: 100000,           // Timeout for network request
  watchForFileChanges: false,     // Disabled Auto Run after changes
});
