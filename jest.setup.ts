// Setup global test configuration
import 'jest';

// Mock console.error globally to avoid cluttering test output
jest.spyOn(console, 'error').mockImplementation(() => {});

// Additional global setup can be added here