'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import SourceList from './SourceList';
import SourceForm from './SourceForm';
import LoadingIndicator from './LoadingIndicator';
import { scrapeAllSources, getScrapeJobStatus, ScrapeJob } from '@/lib/api';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SourcesModal({ isOpen, onClose }: SourcesModalProps) {
  // This state is used to trigger a re-render of the SourceList
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [scrapeJob, setScrapeJob] = useState<ScrapeJob | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Clean up polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Poll for job status updates when there's an active job
  useEffect(() => {
    if (scrapeJob && scrapeJob.status !== 'completed' && scrapeJob.status !== 'failed') {
      const interval = setInterval(async () => {
        try {
          const updatedJob = await getScrapeJobStatus(scrapeJob.id);
          setScrapeJob(updatedJob);
          
          if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
            clearInterval(interval);
            setPollInterval(null);
            setIsLoading(false);
            
            // Update message based on job status
            setMessage({ 
              text: updatedJob.message || (updatedJob.status === 'completed' 
                ? 'Scraping completed successfully!' 
                : 'Scraping failed.'),
              type: updatedJob.status === 'completed' ? 'success' : 'error'
            });
            
            // Refresh source list if scraping was successful
            if (updatedJob.status === 'completed') {
              setKey(prevKey => prevKey + 1);
            }
          }
        } catch (error) {
          console.error('Error polling for job status:', error);
        }
      }, 2000); // Poll every 2 seconds
      
      setPollInterval(interval);
      return () => clearInterval(interval);
    }
  }, [scrapeJob]);

  async function handleScrapeAll() {
    try {
      setIsLoading(true);
      setMessage(null);
      const result = await scrapeAllSources();
      
      // If the backend returns a job_id, set up polling for progress
      if (result.job_id) {
        const initialJob = await getScrapeJobStatus(result.job_id);
        setScrapeJob(initialJob);
      } else {
        // Legacy support for backends without job tracking
        setMessage({ text: result.message || 'Scraping initiated.', type: 'success' });
        setKey(prevKey => prevKey + 1);
        setIsLoading(false);
      }
    } catch {
      setMessage({ text: 'Failed to trigger scrape for all sources.', type: 'error' });
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Sources" size="large">
      <div className="space-y-6">
        {message && (
          <div 
            className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
            role="alert"
          >
            {message.text}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handleScrapeAll}
            disabled={isLoading}
            className={`
              flex items-center px-4 py-2 rounded-md text-white font-medium
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
              transition-colors duration-200
            `}
          >
            {isLoading ? 'Scraping...' : 'Scrape All Sources'}
          </button>
        </div>
        
        {/* Scraping progress indicator */}
        {isLoading && scrapeJob && (
          <div className="bg-blue-50 p-4 rounded-md">
            <LoadingIndicator 
              progress={scrapeJob.progress} 
              message={scrapeJob.message || 'Scraping sources...'}
            />
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Add New Source</h3>
          <SourceForm onSourceCreated={() => setKey(prevKey => prevKey + 1)} />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Your Sources</h3>
          <SourceList key={key} />
        </div>
      </div>
    </Modal>
  );
}