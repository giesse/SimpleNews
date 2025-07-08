'use client';

import { useEffect, useState } from 'react';
import { getSources, deleteSource, scrapeSource, getScrapeJobStatus, ScrapeJob } from '@/lib/api';
import { Source } from '@/lib/types';
import SourceForm from './SourceForm';
import LoadingIndicator from './LoadingIndicator';

interface ScrapeProgress {
  sourceId: number;
  job: ScrapeJob;
  pollInterval: NodeJS.Timeout;
}

export default function SourceList() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [scrapeProgress, setScrapeProgress] = useState<ScrapeProgress | null>(null);

  // Clean up any polling intervals on unmount
  useEffect(() => {
    return () => {
      if (scrapeProgress) {
        clearInterval(scrapeProgress.pollInterval);
      }
    };
  }, [scrapeProgress]);

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
    if (!confirm('Are you sure you want to delete this source?')) {
      return;
    }
    
    try {
      await deleteSource(id);
      loadSources();
    } catch {
      setError('Failed to delete source.');
    }
  }

  async function handleScrape(id: number) {
    try {
      // Clear any existing polling interval
      if (scrapeProgress) {
        clearInterval(scrapeProgress.pollInterval);
      }
      
      const result = await scrapeSource(id);
      
      if (result.job_id) {
        // Get initial job status
        const job = await getScrapeJobStatus(result.job_id);
        
        // Set up polling for job progress
        const interval = setInterval(async () => {
          try {
            const updatedJob = await getScrapeJobStatus(result.job_id);
            
            setScrapeProgress(prev => {
              if (!prev) return null;
              return { ...prev, job: updatedJob };
            });
            
            if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
              // Stop polling and reload sources
              if (scrapeProgress) {
                clearInterval(scrapeProgress.pollInterval);
              }
              setScrapeProgress(null);
              loadSources();
            }
          } catch (error) {
            console.error('Error polling for job status:', error);
          }
        }, 2000);
        
        setScrapeProgress({
          sourceId: id,
          job,
          pollInterval: interval
        });
      } else {
        // Legacy support for backends without job tracking
        alert(result.message || 'Scraping initiated.');
        loadSources();
      }
    } catch {
      setError('Failed to trigger scrape.');
    }
  }

  function handleEdit(source: Source) {
    setEditingSource(source);
  }

  function handleCancelEdit() {
    setEditingSource(null);
  }

  function handleSourceUpdated() {
    setEditingSource(null);
    loadSources();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingIndicator size="large" message="Loading sources..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => { setError(null); loadSources(); }}
              className="mt-2 text-sm text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (editingSource) {
    return (
      <SourceForm
        source={editingSource}
        onSourceUpdated={handleSourceUpdated}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (sources.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No sources</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a source to start collecting articles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sources.map((source) => {
        // Use Boolean to ensure isScraping is always a boolean value
        const isScraping = Boolean(scrapeProgress && scrapeProgress.sourceId === source.id);
        
        return (
          <div 
            key={source.id} 
            className="bg-white border rounded-lg shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-800">{source.name}</h3>
              <p className="text-gray-600 break-all">{source.url}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {source.scraper_type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {source.scraper_type}
                  </span>
                )}
                {source.last_scraped_at && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Last scraped: {new Date(source.last_scraped_at).toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Scraping progress indicator */}
              {isScraping && scrapeProgress && (
                <div className="mt-3 w-full">
                  <LoadingIndicator 
                    size="small"
                    progress={scrapeProgress.job.progress} 
                    message={scrapeProgress.job.message || 'Scraping in progress...'}
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleScrape(source.id)}
                disabled={isScraping}
                className={`
                  inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium
                  ${isScraping 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'}
                  transition-colors duration-150
                `}
              >
                <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                {isScraping ? 'Scraping...' : 'Scrape'}
              </button>
              
              <button
                onClick={() => handleEdit(source)}
                className="inline-flex items-center px-3 py-2 border border-yellow-200 rounded-md text-sm font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors duration-150"
              >
                <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
              
              <button
                onClick={() => handleDelete(source.id)}
                disabled={isScraping}
                className={`
                  inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium
                  ${isScraping 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'}
                  transition-colors duration-150
                `}
              >
                <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}