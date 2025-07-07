'use client';

import { useState, useEffect } from 'react';
import { createSource, updateSource, autodetectSelector } from '@/lib/api';
import { Source } from '@/lib/types';

interface SourceFormProps {
  source?: Source | null;
  onSourceCreated?: () => void;
  onSourceUpdated?: () => void;
  onCancel?: () => void;
}

export default function SourceForm({ source, onSourceCreated, onSourceUpdated, onCancel }: SourceFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [scraper_type, setScraperType] = useState('Auto');
  const [articleLinkSelector, setArticleLinkSelector] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const isEditMode = source !== null && source !== undefined;

  useEffect(() => {
    if (isEditMode) {
      setName(source.name);
      setUrl(source.url);
      setScraperType(source.scraper_type || 'Auto');
      // @ts-ignore
      setArticleLinkSelector(source.config?.article_link_selector || '');
    }
  }, [source, isEditMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const sourceData = {
      name,
      url,
      scraper_type,
      config: { article_link_selector: articleLinkSelector },
    };

    try {
      if (isEditMode) {
        await updateSource(source.id, sourceData);
        if (onSourceUpdated) onSourceUpdated();
      } else {
        await createSource(sourceData);
        if (onSourceCreated) onSourceCreated();
      }
      // Reset form only on create
      if (!isEditMode) {
        setName('');
        setUrl('');
        setScraperType('Auto');
        setArticleLinkSelector('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAutoDetect() {
    setDetecting(true);
    setError(null);
    try {
      const result = await autodetectSelector(name, url);
      setArticleLinkSelector(result.selector);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-detect selector.');
    } finally {
      setDetecting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Source' : 'Add New Source'}</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="url" className="block text-gray-700 font-bold mb-2">
          URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="scraper_type" className="block text-gray-700 font-bold mb-2">
          Source Type
        </label>
        <select
          id="scraper_type"
          value={scraper_type}
          onChange={(e) => setScraperType(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="Auto">Auto</option>
          <option value="HTML">HTML</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="article_link_selector" className="block text-gray-700 font-bold mb-2">
          Article Link Selector
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="article_link_selector"
            value={articleLinkSelector}
            onChange={(e) => setArticleLinkSelector(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={detecting || !url}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ml-2 focus:outline-none focus:shadow-outline"
          >
            {detecting ? 'Detecting...' : 'Auto-detect'}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {submitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Source' : 'Add Source')}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}