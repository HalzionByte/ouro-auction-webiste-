import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
  showIcon?: boolean;
}

export function CountdownTimer({ endTime, onExpire, showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;
      return Math.max(0, diff);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getColorClass = () => {
    const minutes = timeLeft / (60 * 1000);
    if (minutes < 5) {
      return 'text-destructive';
    } else if (minutes < 60) {
      return 'text-warning';
    }
    return 'text-foreground';
  };

  const isUrgent = timeLeft > 0 && timeLeft <= 30 * 1000;

  if (timeLeft === 0) {
    return (
      <div className="flex items-center space-x-1 text-muted-foreground">
        {showIcon && <Clock className="w-4 h-4" />}
        <span>Ended</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`flex items-center space-x-1 ${getColorClass()} font-medium`}
      animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
      transition={
        isUrgent
          ? { duration: 0.65, repeat: Infinity, ease: 'easeInOut' }
          : {}
      }
    >
      {showIcon && (
        <motion.div
          animate={isUrgent ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={isUrgent ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          <Clock className="w-4 h-4" />
        </motion.div>
      )}
      <span>{formatTime(timeLeft)}</span>
    </motion.div>
  );
}