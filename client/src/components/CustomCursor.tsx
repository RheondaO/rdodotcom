import { useEffect, useRef, useState } from 'react';

interface CustomCursorProps {
  enabled?: boolean;
}

export function CustomCursor({ enabled = true }: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Smooth cursor movement with easing
    const updateCursor = () => {
      const dx = targetPosition.current.x - cursorPosition.x;
      const dy = targetPosition.current.y - cursorPosition.y;
      
      // Easing factor (0.1 = smooth, 1 = instant)
      const easing = 0.15;
      
      setCursorPosition(prev => ({
        x: prev.x + dx * easing,
        y: prev.y + dy * easing
      }));

      animationRef.current = requestAnimationFrame(updateCursor);
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    // Mouse down handler
    const handleMouseDown = () => {
      setIsClicking(true);
    };

    // Mouse up handler
    const handleMouseUp = () => {
      setIsClicking(false);
    };

    // Mouse leave handler (hide cursor when leaving window)
    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    // Mouse enter handler (show cursor when entering window)
    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Start animation loop
    animationRef.current = requestAnimationFrame(updateCursor);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, cursorPosition]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{
        position: 'fixed',
        left: cursorPosition.x - 20, // Center the cursor (40px wide)
        top: cursorPosition.y - 25, // Adjust for Godzilla height
        width: '40px',
        height: '40px',
        backgroundImage: `url(${isClicking ? '/cursor-click.png' : '/cursor-move.png'})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'opacity 0.2s ease',
        opacity: 1,
        transform: isClicking ? 'scale(0.85) rotate(5deg)' : 'scale(1)',
        transitionProperty: 'transform',
        transitionDuration: '0.15s',
        transitionTimingFunction: 'ease-out',
        filter: isClicking ? 'brightness(1.2)' : 'brightness(1)'
      }}
    />
  );
}