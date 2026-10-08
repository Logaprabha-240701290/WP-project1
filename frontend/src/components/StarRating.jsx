import React, { useState } from 'react';

const StarRating = ({
  score = 0,
  maxStars = 5,
  interactive = false,
  onChange = null,
  showScore = false,
  ratingCount = null,
  size = 'md', // sm, md, lg
}) => {
  const [hoverScore, setHoverScore] = useState(0);

  const displayScore = interactive && hoverScore > 0 ? hoverScore : score;

  const handleClick = (starValue) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (interactive) {
      setHoverScore(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverScore(0);
    }
  };

  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    let iconClass = 'fa-regular fa-star';
    if (displayScore >= i) {
      iconClass = 'fa-solid fa-star filled';
    } else if (displayScore >= i - 0.5) {
      iconClass = 'fa-solid fa-star-half-stroke filled';
    }

    stars.push(
      <i
        key={i}
        className={`${iconClass} star-icon star-${size} ${interactive ? 'interactive' : ''}`}
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        role={interactive ? 'button' : 'img'}
        aria-label={`${i} stars`}
      />
    );
  }

  return (
    <div className="star-rating-wrapper">
      <div className="stars-group">{stars}</div>
      {showScore && <span className="star-score-text">{Number(score).toFixed(1)}</span>}
      {ratingCount !== null && (
        <span className="star-count-text">({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})</span>
      )}
    </div>
  );
};

export default StarRating;
