import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-sm text-secondary-300 hover:text-white mb-4"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  );
};

export default BackButton;