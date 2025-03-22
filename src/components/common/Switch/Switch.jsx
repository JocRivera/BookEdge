import React from 'react';
import './Switch.css';

const Switch = ({ isOn, handleToggle, id }) => {
  return (
    <div className="switch-container">
      <input
        type="checkbox"
        id={`switch-${id}`}
        className="switch-checkbox"
        checked={isOn}
        onChange={() => handleToggle(id)}
      />
      <label className="switch-label" htmlFor={`switch-${id}`}>
        <span className="switch-button" />
      </label>
    </div>
  );
};

export default Switch;