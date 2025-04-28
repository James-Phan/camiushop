import React from "react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  max = 5, 
  size = "md", 
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  const renderStar = (position: number) => {
    const filled = rating >= position;
    const halfFilled = !filled && rating >= position - 0.5;
    
    return (
      <span 
        key={position}
        className={`text-amber-400 ${sizeClasses[size]}`}
        onClick={() => {
          if (interactive && onRatingChange) {
            onRatingChange(position);
          }
        }}
        style={interactive ? { cursor: 'pointer' } : {}}
      >
        {filled ? (
          <i className="ri-star-fill"></i>
        ) : halfFilled ? (
          <i className="ri-star-half-line"></i>
        ) : (
          <i className="ri-star-line"></i>
        )}
      </span>
    );
  };

  return (
    <div className="flex">
      {Array.from({ length: max }, (_, i) => renderStar(i + 1))}
    </div>
  );
}
