import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        padding: '8px 12px',
        fontSize: '14px',
        cursor: 'pointer',
        marginBottom: '16px',
      }}
    >
      ← Back
    </button>
  );
};

export default BackButton;