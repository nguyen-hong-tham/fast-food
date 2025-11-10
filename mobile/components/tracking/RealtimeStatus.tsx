import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

interface RealtimeStatusProps {
  isConnected?: boolean;
  showWhenConnected?: boolean;
}

const RealtimeStatus: React.FC<RealtimeStatusProps> = ({ 
  isConnected = true,
  showWhenConnected = false 
}) => {
  const [showStatus, setShowStatus] = useState(!isConnected);

  useEffect(() => {
    if (isConnected && !showWhenConnected) {
      // Hide after 3 seconds when connected
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowStatus(true);
    }
  }, [isConnected, showWhenConnected]);

  if (!showStatus) return null;

  return (
    <View 
      className={`absolute top-2 right-2 px-3 py-2 rounded-full z-50 ${
        isConnected 
          ? 'bg-green-500/90' 
          : 'bg-yellow-500/90'
      }`}
    >
      <Text className="text-white text-xs font-quicksand-semibold">
        {isConnected ? '✓ Live Updates' : '⚠ Checking Connection...'}
      </Text>
    </View>
  );
};

export default RealtimeStatus;
