import { ScrapeJob } from '@/lib/types';

function formatDuration(seconds: number): string {
    if (seconds < 0) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
}

export default function ScrapingProgress({ job }: { job: ScrapeJob }) {
    return (
        <div className="w-full bg-gray-100 p-4 rounded-lg shadow-inner">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Scraping Progress</span>
                <span className="text-sm font-bold text-gray-900">{job.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${job.progress}%` }}></div>
            </div>
            <div className="mt-3 text-xs text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex justify-between">
                    <span className="font-medium">Sources:</span>
                    <span>{job.processed_sources} / {job.total_sources}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Articles:</span>
                    <span>{job.processed_articles} / {job.total_articles}</span>
                </div>
                <div className="flex justify-between col-span-2">
                    <span className="font-medium">ETA:</span>
                    <span>{formatDuration(job.eta_seconds)}</span>
                </div>
            </div>
            <p className="mt-2 text-xs text-center text-gray-500 italic">{job.message}</p>
        </div>
    );
}