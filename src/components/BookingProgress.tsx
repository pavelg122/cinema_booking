import React from 'react';

interface BookingProgressProps {
  currentStep: number;
}

const steps = ['Select Movie', 'Select Seats', 'Complete Payment', 'Confirmation'];

const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={index}
            style={{
              paddingBottom: 8,
              borderBottom: `3px solid ${isActive ? '#007bff' : isCompleted ? 'green' : 'lightgray'}`,
              fontWeight: isActive ? 'bold' : 'normal',
              color: isActive ? '#007bff' : isCompleted ? 'green' : 'gray',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {step}
          </div>
        );
      })}
    </div>
  );
};

export default BookingProgress;