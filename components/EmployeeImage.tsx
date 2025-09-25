import React, { useEffect, useState } from 'react';
import { UserIcon } from '../constants';

interface EmployeeImageProps {
  photoId: string;
  fullName: string;
  className?: string;
  iconClassName?: string;
  wrapperClassName?: string;
}

export const EmployeeImage: React.FC<EmployeeImageProps> = ({ 
    photoId, 
    fullName, 
    className = "h-10 w-10 rounded-full object-cover ring-2 ring-white",
    iconClassName = "h-6 w-6 text-slate-400",
    wrapperClassName = "h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center ring-2 ring-white"
}) => {
  const isDataUrl = photoId?.startsWith('data:image');
  // Only show loading state for remote images that have a photoId.
  const [isLoading, setIsLoading] = useState(!isDataUrl && !!photoId);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset component state when the photoId prop changes.
    setHasError(false);
    setIsLoading(!isDataUrl && !!photoId);
  }, [photoId, isDataUrl]);

  const imageUrl = isDataUrl ? photoId : `https://lh3.googleusercontent.com/d/${photoId}`;

  const handleError = () => {
    if (!isDataUrl) { // Only set error for non-data URLs
        setHasError(true);
        setIsLoading(false);
    }
  };

  // Case 1: No photo ID is provided, or the image failed to load. Show the fallback icon.
  if (hasError || !photoId) {
    return (
      <div className={wrapperClassName}>
        <UserIcon className={iconClassName} />
      </div>
    );
  }

  // Case 2: A photo ID is available. Render the image and a placeholder.
  return (
    <>
      {/* Show a pulsing placeholder while the image is loading. */}
      {/* It uses the wrapper's styles to maintain layout consistency. */}
      {isLoading && (
        <div className={`${wrapperClassName} animate-pulse`}>
          {/* This empty div is the visual placeholder. */}
        </div>
      )}
      
      {/* 
        The actual image. It's hidden using a 'hidden' class until it has finished loading.
        This prevents a broken image icon from appearing and avoids layout shifts.
      */}
      <img
        src={imageUrl}
        alt={fullName}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        loading="lazy"
      />
    </>
  );
};
