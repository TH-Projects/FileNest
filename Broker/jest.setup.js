// Suppress console.error during tests so that intentional error-path tests
// don't pollute the test log with noise when the tests themselves pass.
console.error = () => {};
