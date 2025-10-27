import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

interface CountdownTimerProps {
  duration: number;
  isActive?: boolean;
  onComplete?: () => void;
}

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration, isActive = true, onComplete }) => {
  const [remaining, setRemaining] = useState(duration);

  // Update remaining time when duration changes (from external source like simulation progress)
  useEffect(() => {
    if (!isActive) return;
    
    // Only update if duration is significantly different (avoid flicker from small updates)
    if (Math.abs(remaining - duration) > 2000) {
      setRemaining(duration);
    }
  }, [duration, isActive]);

  useEffect(() => {
    if (!isActive) return undefined;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Separate effect to handle completion
  useEffect(() => {
    if (remaining <= 0 && isActive) {
      onComplete?.();
    }
  }, [remaining, isActive, onComplete]);

  return (
    <View className="bg-dark-100/90 rounded-2xl px-4 py-3 items-center justify-center">
      <Text className="text-xs font-quicksand-medium text-white/70">Drone Arrival Countdown</Text>
      <Text className="text-2xl font-quicksand-semibold text-white mt-1">
        {formatTime(remaining)}
      </Text>
    </View>
  );
};

export default CountdownTimer;
