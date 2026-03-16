// Suppress console output during tests so that intentional error-path tests
// don't pollute the test log with noise when the tests themselves pass.
// console.log is also suppressed here because delete.js logs the response
// on the happy path, which would otherwise appear in passing test output.
console.error = () => {};
console.log = () => {};
