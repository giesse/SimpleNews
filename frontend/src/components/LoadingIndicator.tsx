interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  progress?: number; // Optional progress percentage (0-100)
}

export default function LoadingIndicator({ 
  size = 'medium', 
  message, 
  progress 
}: LoadingIndicatorProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }[size];

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Spinner or progress bar */}
      {progress !== undefined ? (
        <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      ) : (
        <div className={`${sizeClasses} animate-spin`}>
          <svg className="text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      
      {/* Optional message */}
      {message && (
        <p className={`${textSizeClasses} text-gray-600 mt-2`}>{message}</p>
      )}
      
      {/* Progress percentage */}
      {progress !== undefined && (
        <p className={`${textSizeClasses} text-gray-600 font-medium`}>
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
}