import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-500 hover:text-primary-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
  );
};

export default BackButton;