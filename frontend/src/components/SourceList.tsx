'use client';

import { useEffect, useState } from 'react';
import { getSources, deleteSource, scrapeSource } from '@/lib/api';
import { Source } from '@/lib/types';

export default function SourceList() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSources() {
    try {
      setLoading(true);
      const data = await getSources();
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSources();
  }, []);

  async function handleDelete(id: number) {
    try {
      await deleteSource(id);
      loadSources();
    } catch {
      alert('Failed to delete source.');
    }
  }

  async function handleScrape(id: number) {
    try {
      const result = await scrapeSource(id);
      alert(result.message);
    } catch {
      alert('Failed to trigger scrape.');
    }
  }

  if (loading) {
    return <div>Loading sources...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <div key={source.id} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{source.name}</h3>
            <p className="text-gray-500">{source.url}</p>
            <p className="text-sm text-gray-400">
              Last scraped: {source.last_scraped_at ? new Date(source.last_scraped_at).toLocaleString() : 'Never'}
            </p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handleScrape(source.id)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Scrape
            </button>
            <button
              onClick={() => alert('Edit functionality not implemented yet.')}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(source.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}