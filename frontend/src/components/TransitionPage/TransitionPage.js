// Post-login logo animation, purely presentational. It's a fixed sequence of
// timed CSS class changes (letters slide in, then everything shrinks and
// moves), ending with a callback so the caller can navigate away.
import React, { useEffect, useState } from 'react';
import './TransitionPage.css';
import toothLogo from '../../assets/dentist-logo-inv-blck.png'; 
import lettersImage from '../../assets/letters-img-inv-blck.png';

function TransitionPage({ onAnimationEnd }) {
  const [showLetters, setShowLetters] = useState(false);
  const [showShrinkMove, setShowShrinkMove] = useState(false);

  useEffect(() => {
    const lettersTimer = setTimeout(() => {
      setShowLetters(true);
    }, 2000); // start letters sliding in after 2s

    // After letters reveal (3s), wait 2s then show shrink-move container
    const shrinkMoveTimer = setTimeout(() => {
      setShowShrinkMove(true);
    }, 2000 + 3000 + 1000); // 2s + 3s + 1s = 6s

    // After shrink-move animation (2s) + 1s delay, call onAnimationEnd
    const finishTimer = setTimeout(() => {
      if (onAnimationEnd) onAnimationEnd();
    }, 6000 + 1500); // 7s + 1.5s = 7.5s total

    return () => {
      clearTimeout(lettersTimer);
      clearTimeout(shrinkMoveTimer);
      clearTimeout(finishTimer);
    };
  }, [onAnimationEnd]);

  return (
    <div className="transition-page">

      {/* Letters-in Container */}
      <div
        className={`transition-logo-container-1 ${showLetters ? 'letters-in' : ''} ${showShrinkMove ? 'fade-out' : ''}`}
      >
        <img src={toothLogo} alt="Transition Tooth" className="transition-tooth" />
        <div className="letters-wrapper">
          <img src={lettersImage} alt="Transition Letters" className="transition-letters" />
        </div>
      </div>

      {/* Shrink-Move Container */}
      <div
        className={`transition-logo-container-2 ${showShrinkMove ? 'shrink-move' : ''}`}
        style={{
          pointerEvents: showShrinkMove ? 'auto' : 'none',
        }}
      >
        <img src={toothLogo} alt="Transition Tooth" className="transition-tooth small" />
        <img src={lettersImage} alt="Transition Letters" className="transition-letters small" />
      </div>

    </div>
  );
}

export default TransitionPage;