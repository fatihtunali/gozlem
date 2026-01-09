'use client';

import { useEffect, useState } from 'react';

interface AdBannerProps {
  slot?: string;
  className?: string;
  type?: 'banner' | 'native';
}

export default function AdBanner({ slot, className = '', type = 'banner' }: AdBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Google AdSense initialization would go here
    // For now, show placeholder
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

  // Placeholder for ad - replace with actual ad code
  if (type === 'native') {
    return (
      <div className={`glass-card rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">📢</span>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-0.5">Sponsor</div>
            <div className="text-sm font-medium">Reklam Alani</div>
            <div className="text-xs text-gray-500">Reklamverin: ads@haydihepberaber.com</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 text-center">
        <div className="text-xs text-gray-500 mb-1">REKLAM</div>
        <div className="text-sm text-gray-400">
          Bu alanda reklaminiz olabilir
        </div>
        <div className="text-xs text-gray-600 mt-1">
          ads@haydihepberaber.com
        </div>
      </div>
    </div>
  );
}
