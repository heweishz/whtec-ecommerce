import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './TableGameUserIcon.css';

const TableGameUserIcon = ({ user, onClick, currentUser }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [clickAllowed, setClickAllowed] = useState(true);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // Animation duration in milliseconds

      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleClick = () => {
    if (user.name !== currentUser && clickAllowed) {
      setIsAnimating(true);
      onClick(user.name);

      // Play click sound
      const clickSound = new Audio('/sounds/9898.mp3');
      clickSound.play();

      // Prevent further clicks for 1 second
      setClickAllowed(false);
      setTimeout(() => setClickAllowed(true), 1000); // Duration matching the animation
    }
  };

  return (
    <div
      className={`user-icon-container ${isAnimating ? 'animated' : ''}`}
      onClick={handleClick}
    >
      <img src={user.icon} alt={`${user.name}'s icon`} className='user-icon' />
      <span className='score'>
        {user.name}: 积分{user.score}{' '}
        {/* Use a colon to separate name and score */}
      </span>
    </div>
  );
};

TableGameUserIcon.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  currentUser: PropTypes.string.isRequired, // Add currentUser prop validation
};

export default TableGameUserIcon;
