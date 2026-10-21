// Thin routing wrapper around TransitionPage: once the animation finishes,
// send the user on to Calendar, the app's landing page.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransitionPage from './TransitionPage';

function TransitionPageWrapper() {
  const navigate = useNavigate();

  const handleAnimationEnd = () => {
    navigate('/Month');
    console.log('done!');
  };

  return <TransitionPage onAnimationEnd={handleAnimationEnd} />;
}

export default TransitionPageWrapper;