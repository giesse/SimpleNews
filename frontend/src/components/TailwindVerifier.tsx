'use client';

import React, { useEffect, useState } from 'react';

/**
 * This component tests if Tailwind CSS classes are being properly applied
 * by checking the computed styles of elements with Tailwind classes.
 */
export default function TailwindVerifier() {
  const [results, setResults] = useState<{
    passed: string[];
    failed: string[];
    total: number;
    passing: number;
  }>({
    passed: [],
    failed: [],
    total: 0,
    passing: 0
  });

  useEffect(() => {
    // Run tests once component is mounted
    const testResults = runTailwindTests();
    setResults(testResults);
  }, []);

  // Function to run Tailwind tests
  function runTailwindTests() {
    const passed: string[] = [];
    const failed: string[] = [];
    
    // Test cases for Tailwind classes and their expected computed styles
    const testCases = [
      {
        className: 'bg-blue-500',
        property: 'backgroundColor',
        expectedPattern: /rgb\(59,\s*130,\s*246\)|#3b82f6/i
      },
      {
        className: 'text-2xl',
        property: 'fontSize',
        expectedPattern: /24px|1.5rem/i
      },
      {
        className: 'p-4',
        property: 'padding',
        expectedPattern: /16px|1rem/i
      },
      {
        className: 'rounded-lg',
        property: 'borderRadius',
        expectedPattern: /8px|0.5rem/i
      },
      {
        className: 'font-bold',
        property: 'fontWeight',
        expectedPattern: /700|bold/i
      },
      {
        className: 'flex',
        property: 'display',
        expectedPattern: /flex/i
      },
      {
        className: 'hidden',
        property: 'display',
        expectedPattern: /none/i
      }
    ];
    
    // Run each test
    testCases.forEach(test => {
      const result = testTailwindClass(test.className, test.property, test.expectedPattern);
      if (result.passed) {
        passed.push(`${test.className} → ${test.property}: ${result.actual}`);
      } else {
        failed.push(`${test.className} → ${test.property}: Expected ${test.expectedPattern}, got ${result.actual}`);
      }
    });
    
    return {
      passed,
      failed,
      total: testCases.length,
      passing: passed.length
    };
  }
  
  // Test a single Tailwind class
  function testTailwindClass(className: string, property: string, expectedPattern: RegExp) {
    // Create a test element with the class
    const testElement = document.createElement('div');
    testElement.className = className;
    document.body.appendChild(testElement);
    
    // Get computed style
    const computedStyle = window.getComputedStyle(testElement);
    // Type-safe property access with indexed access type
    const actualValue = computedStyle[property as keyof CSSStyleDeclaration] as string;
    
    // Remove test element
    document.body.removeChild(testElement);
    
    // Check if the computed style matches expected pattern
    return {
      passed: expectedPattern.test(actualValue),
      actual: actualValue
    };
  }
  
  // Calculate success percentage
  const successPercentage = results.total > 0 
    ? Math.round((results.passing / results.total) * 100) 
    : 0;
  
  // Determine overall status
  const status = successPercentage === 100 
    ? 'passed' 
    : successPercentage >= 50 
      ? 'partial' 
      : 'failed';
  
  return (
    <div className="tailwind-verifier border rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Tailwind CSS Verification</h2>
      
      <div className={`
        mb-4 p-4 rounded-md
        ${status === 'passed' ? 'bg-green-100 text-green-800' : 
          status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'}
      `}>
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {status === 'passed' ? 'All tests passed!' : 
             status === 'partial' ? 'Some tests passed' : 
             'Tests failed'}
          </span>
          <span className="text-sm">
            {results.passing}/{results.total} tests passing ({successPercentage}%)
          </span>
        </div>
      </div>
      
      {results.failed.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-red-600 mb-2">Failed Tests:</h3>
          <ul className="space-y-1 text-sm">
            {results.failed.map((message, i) => (
              <li key={i} className="bg-red-50 p-2 rounded">{message}</li>
            ))}
          </ul>
        </div>
      )}
      
      {results.passed.length > 0 && (
        <div>
          <h3 className="font-semibold text-green-600 mb-2">Passing Tests:</h3>
          <ul className="space-y-1 text-sm">
            {results.passed.map((message, i) => (
              <li key={i} className="bg-green-50 p-2 rounded">{message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t text-sm text-gray-500">
        <p>This test creates elements with Tailwind classes and checks if the expected CSS styles are applied.</p>
        <p>If tests are failing, it indicates that Tailwind is not properly processing your classes.</p>
      </div>
    </div>
  );
}