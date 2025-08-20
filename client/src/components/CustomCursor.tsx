import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

interface CustomCursorProps {
  enabled?: boolean;
}

interface TextTrailPoint {
  x: number;
  y: number;
  letter: string;
  opacity: number;
  id: number;
}

export function CustomCursor({ enabled = true }: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const targetPosition = useRef({ x: 0, y: 0 });
  const [location] = useLocation();
  const [textTrail, setTextTrail] = useState<TextTrailPoint[]>([]);
  const trailRef = useRef<TextTrailPoint[]>([]);
  const nextIdRef = useRef(0);
  
  // Check if we're on the About page (meet the admin page)
  const isAboutPage = location === '/about';
  
  // Text to display in trail
  const trailText = "Making it Real";
  const textLetters = trailText.split('');

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
      
      const newPosition = {
        x: cursorPosition.x + dx * easing,
        y: cursorPosition.y + dy * easing
      };
      
      setCursorPosition(newPosition);

      // Update text trail on About page
      if (isAboutPage) {
        updateTextTrail(newPosition.x, newPosition.y);
      }

      animationRef.current = requestAnimationFrame(updateCursor);
    };

    // Text trail management for About page
    const updateTextTrail = (x: number, y: number) => {
      const currentTime = Date.now();
      
      // Add new letter to trail every few pixels of movement
      const lastPoint = trailRef.current[trailRef.current.length - 1];
      const distance = lastPoint ? 
        Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)) : 
        30;
      
      if (distance > 25) { // Add letter every 25 pixels
        const letterIndex = trailRef.current.length % textLetters.length;
        const newPoint: TextTrailPoint = {
          x: x - 40, // Offset behind cursor
          y: y - 10,
          letter: textLetters[letterIndex],
          opacity: 1,
          id: nextIdRef.current++
        };
        
        trailRef.current.push(newPoint);
        
        // Limit trail length
        if (trailRef.current.length > 50) {
          trailRef.current.shift();
        }
      }
      
      // Update opacity and remove old points
      trailRef.current = trailRef.current
        .map(point => ({
          ...point,
          opacity: Math.max(0, point.opacity - 0.02)
        }))
        .filter(point => point.opacity > 0);
      
      setTextTrail([...trailRef.current]);
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

  // Clear text trail when leaving About page
  useEffect(() => {
    if (!isAboutPage) {
      trailRef.current = [];
      setTextTrail([]);
    }
  }, [isAboutPage]);

  if (!enabled) return null;

  // Choose cursor images based on the page
  const getCursorImages = () => {
    if (isAboutPage) {
      return {
        normal: '/cursor-admin-move.png',
        click: '/cursor-admin-click.png',
        size: 70, // Larger for admin face
        offsetX: 35,
        offsetY: 45
      };
    } else {
      return {
        normal: '/cursor-move.png',
        click: '/cursor-click.png',
        size: 60, // Standard Godzilla size
        offsetX: 30,
        offsetY: 40
      };
    }
  };

  const cursorConfig = getCursorImages();

  return (
    <>
      {/* Text trail for About page */}
      {isAboutPage && textTrail.map((point) => (
        <div
          key={point.id}
          style={{
            position: 'fixed',
            left: point.x,
            top: point.y,
            pointerEvents: 'none',
            zIndex: 9998,
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            fontWeight: '600',
            color: '#9333ea',
            opacity: point.opacity,
            userSelect: 'none',
            textShadow: '0 0 4px rgba(147, 51, 234, 0.3)',
            transition: 'opacity 0.1s ease-out'
          }}
        >
          {point.letter}
        </div>
      ))}
      
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          position: 'fixed',
          left: cursorPosition.x - cursorConfig.offsetX,
          top: cursorPosition.y - cursorConfig.offsetY,
          width: `${cursorConfig.size}px`,
          height: `${cursorConfig.size}px`,
          backgroundImage: `url(${isClicking ? cursorConfig.click : cursorConfig.normal})`,
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
    </>
  );
}