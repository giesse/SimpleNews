'use client';

import React from 'react';

export default function TailwindTest() {
  return (
    <div className="tailwind-test-container p-4 m-4 bg-blue-500 text-white rounded-lg">
      <h1 className="text-2xl font-bold mb-2">Tailwind Test Component</h1>
      <p className="text-sm italic">This component tests if Tailwind classes are applied correctly.</p>
      <div className="mt-4 flex space-x-2">
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Green Button
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Red Button
        </button>
      </div>
    </div>
  );
}