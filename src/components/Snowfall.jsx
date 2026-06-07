import React, { useMemo, useState, useEffect } from "react";

const Snowfall = ({ isSnowing }) => {
  const [mounted, setMounted] = useState(isSnowing);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isSnowing) {
      setMounted(true);
      const showTimer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(showTimer);
    } else {
      setVisible(false);
      const unmountTimer = setTimeout(() => setMounted(false), 1000);
      return () => clearTimeout(unmountTimer);
    }
  }, [isSnowing]);

  const snowflakes = useMemo(() => {
    const flakes = [];
    const numberOfFlakes = 350;

    for (let i = 0; i < numberOfFlakes; i++) {
      const sizeInt = Math.random() * 4 + 1;
      const isForeground = sizeInt > 3;

      flakes.push({
        id: i,
        left: `${Math.random() * 100}vw`,
        size: `${sizeInt}px`,
        opacity: isForeground
          ? Math.random() * 0.5 + 0.4
          : Math.random() * 0.3 + 0.1,
        fallDuration: `${Math.random() * 15 + 10}s`,
        fallDelay: `-${Math.random() * 25}s`,
        swayDuration: `${Math.random() * 5 + 3}s`,
        swayDelay: `-${Math.random() * 8}s`,
        swayAmount: `${Math.random() * 50 + 10}px`,
        blur: isForeground ? "blur-0" : "blur-[1px]",
      });
    }
    return flakes;
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[9999] overflow-hidden transition-opacity duration-1000 ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-0"
          style={{
            left: flake.left,
            animation: `fall ${flake.fallDuration} linear infinite`,
            animationDelay: flake.fallDelay,
          }}
        >
          <div
            className={`bg-white rounded-full ${flake.blur}`}
            style={{
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
              animation: `sway ${flake.swayDuration} ease-in-out infinite alternate`,
              animationDelay: flake.swayDelay,
              "--sway-amount": flake.swayAmount,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(Snowfall);
