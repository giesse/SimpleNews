import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import SourceList from './SourceList';
import SourceForm from './SourceForm';
import ScrapingProgress from './ScrapingProgress';
import { scrapeAllSources, getScrapeJobStatus, cancelScrapeJob, ScrapeJob } from '@/lib/api';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SourcesModal({ isOpen, onClose }: SourcesModalProps) {
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [scrapeJob, setScrapeJob] = useState<ScrapeJob | null>(null);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const updatedJob = await getScrapeJobStatus(jobId);
      setScrapeJob(updatedJob);

      if (updatedJob.status === 'completed' || updatedJob.status === 'failed' || updatedJob.status === 'canceled') {
        setIsLoading(false);
        setMessage({
          text: updatedJob.message || 'Job finished.',
          type: updatedJob.status === 'completed' ? 'success' : (updatedJob.status === 'failed' ? 'error' : 'info'),
        });
        if (updatedJob.status === 'completed') {
          setKey(prevKey => prevKey + 1); // Refresh source list
        }
      } else {
        // Keep polling
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (error) {
      console.error('Error polling for job status:', error);
      setIsLoading(false);
      setMessage({ text: 'Error checking job status.', type: 'error' });
    }
  }, []);

  async function handleScrapeAll() {
    try {
      setIsLoading(true);
      setMessage(null);
      setScrapeJob(null);
      const result = await scrapeAllSources();
      
      if (result.job_id) {
        pollJobStatus(result.job_id);
      } else {
        setMessage({ text: result.message || 'Scraping initiated.', type: 'success' });
        setKey(prevKey => prevKey + 1);
        setIsLoading(false);
      }
    } catch (error) {
      setMessage({ text: 'Failed to trigger scrape for all sources.', type: 'error' });
      setIsLoading(false);
    }
  }

  async function handleCancelScrape() {
    if (!scrapeJob || !isLoading) return;

    try {
      await cancelScrapeJob(scrapeJob.id);
      setMessage({ text: 'Cancellation request sent.', type: 'info' });
    } catch (error) {
      setMessage({ text: 'Failed to send cancellation request.', type: 'error' });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Sources" size="large">
      <div className="space-y-6">
        {message && (
          <div 
            className={`p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' :
              message.type === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}
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
        
        {isLoading && scrapeJob && (
          <div className="bg-blue-50 p-4 rounded-md">
            <ScrapingProgress job={scrapeJob} />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCancelScrape}
                className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
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