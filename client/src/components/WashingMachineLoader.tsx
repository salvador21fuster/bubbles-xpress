import { motion, AnimatePresence } from 'framer-motion';

interface WashingMachineLoaderProps {
  isVisible: boolean;
}

export function WashingMachineLoader({ isVisible }: WashingMachineLoaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          data-testid="washing-machine-loader"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
              <motion.div
                className="w-24 h-24 rounded-full border-8 border-t-primary border-r-primary/60 border-b-primary/30 border-l-primary/10"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20" />
            </motion.div>
            <motion.p
              className="mt-4 text-center text-sm font-medium text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Processing...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
