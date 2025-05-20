import React from 'react';
import { Check } from 'lucide-react';

interface BookingProgressProps {
  currentStep: number;
}

const steps = ['Select Movie', 'Select Seats', 'Complete Booking', 'Confirmation'];

const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            {/* Dot or Check Icon */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isActive
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}
            >
              {isCompleted ? <Check size={14} /> : null}
            </div>

            {/* Step Label */}
            <div
              className={`text-sm text-center transition-colors ${
                isActive
                  ? 'text-primary-600 font-semibold'
                  : isCompleted
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              {step}
            </div>

            {/* Connecting line (except last step) */}
            {index < steps.length - 1 && (
              <div className="absolute top-2.5 left-1/2 w-full z-[-1]">
                <div className="h-0.5 bg-gray-300 w-full absolute left-1/2 transform -translate-x-1/2" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BookingProgress;
