import React from 'react';
import { Info } from 'lucide-react';

interface VersionInfoProps {
  className?: string;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ className = '' }) => {
  // package.json에서 버전 정보 가져오기
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const buildTime = import.meta.env.VITE_BUILD_TIME || new Date().toISOString();

  const formatBuildTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    });
  };

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      <Info size={14} />
      <span>
        v{version} • 빌드: {formatBuildTime(buildTime)}
      </span>
    </div>
  );
};

export default VersionInfo; 