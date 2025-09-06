const Logo = ({ className, iconOnly = false, ...props }: { className?: string; iconOnly?: boolean }) => {
  // Icon-only version for collapsed navigation
  if (iconOnly) {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        {/* House Shape */}
        <path
          d="M8 20L24 6L40 20V38C40 40.2091 38.2091 42 36 42H12C9.79086 42 8 40.2091 8 38V20Z"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Checkmark */}
        <path
          d="M16 24L22 30L32 20"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Full logo with text
  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      {/* House Icon with Checkmark */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* House Shape */}
        <path
          d="M8 20L24 6L40 20V38C40 40.2091 38.2091 42 36 42H12C9.79086 42 8 40.2091 8 38V20Z"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Checkmark */}
        <path
          d="M16 24L22 30L32 20"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Text Content */}
      <div className="flex flex-col">
        <div className="text-white text-2xl font-bold tracking-tight">
          Dayboard
        </div>
        <div className="text-white/80 text-sm font-medium">
          Household Command Center
        </div>
      </div>
    </div>
  );
};

export default Logo;
