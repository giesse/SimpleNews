'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { getInterestPrompt, updateInterestPrompt, recalculateAllArticleScores, ScrapeJob, getScrapeJobStatus } from '@/lib/api';
import LoadingIndicator from './LoadingIndicator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [interestPrompt, setInterestPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculationJobId, setRecalculationJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<{ status: string; progress: number; message: string } | null>(null);
  
  // Load current interest prompt
  useEffect(() => {
    if (isOpen) {
      const loadPrompt = async () => {
        try {
          const data = await getInterestPrompt();
          setInterestPrompt(data.interest_prompt);
        } catch (error) {
          console.error('Failed to load interest prompt:', error);
        }
      };
      loadPrompt();
    }
  }, [isOpen]);
  
  // Poll job status if there's an active recalculation job
  useEffect(() => {
    if (recalculationJobId) {
      const interval = setInterval(async () => {
        try {
          const status = await getScrapeJobStatus(recalculationJobId);
          setJobStatus(status);
          
          if (status.status === 'completed' || status.status === 'failed') {
            setIsRecalculating(false);
            setRecalculationJobId(null);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Failed to get job status:', error);
          setIsRecalculating(false);
          setRecalculationJobId(null);
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [recalculationJobId]);
  
  const handleSavePrompt = async () => {
    try {
      setIsSaving(true);
      await updateInterestPrompt(interestPrompt);
    } catch (error) {
      console.error('Failed to update interest prompt:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRecalculateScores = async () => {
    try {
      setIsRecalculating(true);
      const response = await recalculateAllArticleScores();
      setRecalculationJobId(response.job_id);
    } catch (error) {
      console.error('Failed to start recalculation:', error);
      setIsRecalculating(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="medium">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Interest Preferences</h3>
          <p className="text-sm text-gray-500 mb-4">
            Define your interests to personalize article scoring.
          </p>
          
          <label htmlFor="interest-prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Interest Prompt
          </label>
          <textarea
            id="interest-prompt"
            rows={4}
            value={interestPrompt}
            onChange={(e) => setInterestPrompt(e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Technology, AI, Programming, Data Science"
          />
          
          <div className="mt-3">
            <button
              onClick={handleSavePrompt}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Article Scoring</h3>
          <p className="text-sm text-gray-500 mb-4">
            Recalculate interest scores for all articles based on your current preferences.
          </p>
          
          {isRecalculating && jobStatus ? (
            <div className="bg-gray-50 border rounded-md p-4">
              <LoadingIndicator size="small" message={jobStatus.message} />
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${jobStatus.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1 text-right">{jobStatus.progress}%</p>
            </div>
          ) : (
            <button
              onClick={handleRecalculateScores}
              disabled={isRecalculating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Recalculate All Scores
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
