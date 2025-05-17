import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RatingPopupProps {
  onClose: () => void;
}

const RatingPopup: React.FC<RatingPopupProps> = ({ onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error: insertError } = await supabase.from('ratings').insert({
        user_id: user.id,
        rating,
        comment: comment.trim() || null
      });

      if (insertError) {
        throw insertError;
      }

      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-800 rounded-lg max-w-md w-full animate-zoom-in">
        <div className="p-6 border-b border-secondary-700">
          <h2 className="text-xl font-semibold text-white">Rate Your Experience</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    star <= (hoveredStar ?? rating)
                      ? 'fill-accent-500 text-accent-500'
                      : 'text-secondary-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-secondary-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input w-full"
              placeholder="Tell us about your experience..."
            />
          </div>

          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingPopup;