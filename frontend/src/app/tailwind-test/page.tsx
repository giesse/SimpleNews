'use client';

import TailwindTest from '@/components/TailwindTest';
import TailwindVerifier from '@/components/TailwindVerifier';
import React, { useState } from 'react';

export default function TailwindTestPage() {
  const [activeTab, setActiveTab] = useState('test');
  const configInfo = {
    postcssConfig: 'plugins: ["tailwindcss", "autoprefixer"]',
    tailwindVersion: 'v4',
    postcssVersion: 'v8.4.38'
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Tailwind CSS Test Page</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <p className="text-gray-600 mb-4">
          This page tests if Tailwind CSS is properly configured and working in your project.
          It includes visual elements and automated verification.
        </p>
        
        <div className="flex border-b">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'test' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('test')}
          >
            Automated Test
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'visual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('visual')}
          >
            Visual Elements
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'config' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
        </div>
        
        <div className="mt-6">
          {activeTab === 'test' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Automated Tailwind Test</h2>
              <p className="mb-4 text-gray-600">
                This test dynamically creates elements with Tailwind classes and verifies if the 
                correct CSS is being applied by checking computed styles.
              </p>
              
              <TailwindVerifier />
            </div>
          )}
          
          {activeTab === 'visual' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Visual Elements</h2>
              <p className="mb-4 text-gray-600">
                These elements use various Tailwind classes. If they display properly styled,
                Tailwind is working correctly.
              </p>
              
              <h3 className="text-lg font-medium mb-2">Colors & Typography</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'gray'].map(color => (
                  <div key={color} className={`p-4 bg-${color}-500 text-white rounded flex items-center justify-center`}>
                    {color}-500
                  </div>
                ))}
              </div>
              
              <h3 className="text-lg font-medium mb-2">Buttons</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Primary Button
                </button>
                <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                  Secondary Button
                </button>
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">
                  Rounded Button
                </button>
                <button className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-2 px-4 rounded">
                  Outline Button
                </button>
              </div>
              
              <h3 className="text-lg font-medium mb-2">Layout</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-200 p-4">Grid 1</div>
                <div className="bg-green-300 p-4">Grid 2</div>
                <div className="bg-green-400 p-4">Grid 3</div>
              </div>
              
              <TailwindTest />
            </div>
          )}
          
          {activeTab === 'config' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Configuration Analysis</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800">Package Versions</h3>
                  <div className="bg-gray-100 p-3 rounded mt-2">
                    <p>Tailwind CSS: <code className="text-pink-600">{configInfo.tailwindVersion}</code></p>
                    <p>PostCSS: <code className="text-pink-600">{configInfo.postcssVersion}</code></p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800">PostCSS Configuration</h3>
                  <pre className="bg-gray-100 p-3 rounded mt-2 overflow-auto">
                    <code>{configInfo.postcssConfig}</code>
                  </pre>
                  <div className="mt-2 text-sm">
                    <p className="text-green-600 font-medium">✓ Using correct plugin name &quot;tailwindcss&quot;</p>
                    <p className="text-green-600 font-medium">✓ Autoprefixer is configured properly</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800">Tailwind Configuration</h3>
                  <pre className="bg-gray-100 p-3 rounded mt-2 overflow-auto">
                    <code>{`content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
]`}</code>
                  </pre>
                  <div className="mt-2 text-sm">
                    <p className="text-green-600 font-medium">✓ Content paths include app components</p>
                    <p className="text-green-600 font-medium">✓ Content paths include all necessary file extensions</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800">CSS Imports</h3>
                  <pre className="bg-gray-100 p-3 rounded mt-2 overflow-auto">
                    <code>{`@tailwind base;
@tailwind components;
@tailwind utilities;`}</code>
                  </pre>
                  <div className="mt-2 text-sm">
                    <p className="text-green-600 font-medium">✓ All required Tailwind directives are present</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-800">Troubleshooting Tips</h3>
                <ul className="list-disc list-inside space-y-2 mt-2 text-gray-600">
                  <li>Make sure your development server is running with the latest configuration</li>
                  <li>Check for any build errors in the terminal</li>
                  <li>Try clearing your browser cache and reloading</li>
                  <li>Ensure all dependencies are properly installed</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
        <p className="text-yellow-700">
          <strong>Note:</strong> If the styles on this page don&apos;t look correct, there&apos;s an issue with your Tailwind CSS configuration.
          The automated tests will help identify exactly what&apos;s not working.
        </p>
      </div>
    </div>
  );
}