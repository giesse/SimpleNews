'use client';

import { useState } from 'react';
import SourceList from '@/components/SourceList';
import SourceForm from '@/components/SourceForm';
import { scrapeAllSources } from '@/lib/api';

export default function AdminSourcesPage() {
  // This state is used to trigger a re-render of the SourceList
  const [key, setKey] = useState(0);

  async function handleScrapeAll() {
    try {
      const result = await scrapeAllSources();
      alert(result.message);
      setKey(prevKey => prevKey + 1); // Trigger re-render
    } catch {
      alert('Failed to trigger scrape for all sources.');
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Sources</h1>
        <button
          onClick={handleScrapeAll}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Scrape All Sources
        </button>
      </div>
      <SourceForm onSourceCreated={() => setKey(prevKey => prevKey + 1)} />
      <SourceList key={key} />
    </div>
  );
}