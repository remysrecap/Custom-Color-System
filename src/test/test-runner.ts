// Simple test runner - no external dependencies
export class SimpleTestRunner {
  private tests: Array<{ name: string; fn: () => void | Promise<void> }> = [];
  private passed = 0;
  private failed = 0;

  test(name: string, fn: () => void | Promise<void>) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Running tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

// Global test function
export function test(name: string, fn: () => void | Promise<void>) {
  if (!globalThis.testRunner) {
    globalThis.testRunner = new SimpleTestRunner();
  }
  globalThis.testRunner.test(name, fn);
}

// Global expect function
export function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null, got ${actual}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected defined value, got undefined`);
      }
    },
    toBeCloseTo(expected: number, precision: number = 2) {
      const diff = Math.abs(actual - expected);
      const threshold = Math.pow(10, -precision);
      if (diff >= threshold) {
        throw new Error(`Expected ${actual} to be close to ${expected} (precision: ${precision})`);
      }
    },
    toThrow() {
      try {
        actual();
        throw new Error('Expected function to throw');
      } catch (error) {
        // Expected behavior
      }
    }
  };
}

// Declare global types
declare global {
  var testRunner: SimpleTestRunner;
}
