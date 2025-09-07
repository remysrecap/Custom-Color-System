// Test runner entry point
import { SimpleTestRunner } from './test-runner';

// Import all test files
import './core/__tests__/utils.test';
import './core/__tests__/state.test';
import './modules/__tests__/color-system.test';
import './test/integration.test';

async function runAllTests() {
  const runner = new SimpleTestRunner();
  const success = await runner.run();
  
  if (success) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed!');
    process.exit(1);
  }
}

runAllTests();
