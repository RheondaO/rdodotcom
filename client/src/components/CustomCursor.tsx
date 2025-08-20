import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

interface CustomCursorProps {
  enabled?: boolean;
}

interface LetterTrailPoint {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  letter: string;
  opacity: number;
  scale: number;
  rotation: number;
  id: number;
}

export function CustomCursor({ enabled = true }: CustomCursorProps) {
  const [location] = useLocation();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [letterTrail, setLetterTrail] = useState<LetterTrailPoint[]>([]);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const targetPosition = useRef({ x: 0, y: 0 });
  const previousPosition = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const trailRef = useRef<LetterTrailPoint[]>([]);
  
  const isAboutPage = location === '/about';
  const textLetters = ['M', 'A', 'K', 'I', 'N', 'G', ' ', 'I', 'T', ' ', 'R', 'E', 'A', 'L'];

  useEffect(() => {
    if (!enabled) return;

    // Hide default cursor globally
    document.body.style.cursor = 'none';
    document.documentElement.style.cursor = 'none';

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Initialize letter trail for About page
    if (isAboutPage && trailRef.current.length === 0) {
      trailRef.current = textLetters.map((letter, index) => ({
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        letter: letter,
        opacity: letter === ' ' ? 0 : 1,
        scale: 1,
        rotation: 0,
        id: index
      }));
    }

    // 60 FPS animation loop with requestAnimationFrame
    const updateCursor = () => {
      const dx = targetPosition.current.x - cursorPosition.x;
      const dy = targetPosition.current.y - cursorPosition.y;
      
      // Smooth cursor movement with fast responsive easing
      const easing = 0.35;
      const newPosition = {
        x: cursorPosition.x + dx * easing,
        y: cursorPosition.y + dy * easing
      };
      
      setCursorPosition(newPosition);

      // Update letter trail on About page with brush stroke effect
      if (isAboutPage) {
        updateLetterTrail(newPosition.x, newPosition.y);
      }

      animationRef.current = requestAnimationFrame(updateCursor);
    };

    // Elegant letter trailing with perfect chain-following effect
    const updateLetterTrail = (cursorX: number, cursorY: number) => {
      const trailSpacing = 38; // Tighter spacing for smoother flow
      
      trailRef.current = trailRef.current.map((letter, index) => {
        let targetX, targetY;
        
        if (index === 0) {
          // First letter (M) follows cursor directly with minimal offset
          targetX = cursorX - 25;
          targetY = cursorY - 45;
        } else {
          // Each subsequent letter follows the previous one
          const prevLetter = trailRef.current[index - 1];
          const angle = Math.atan2(
            cursorY - prevLetter.y,
            cursorX - prevLetter.x
          );
          
          // Position behind the previous letter in chain
          targetX = prevLetter.x - trailSpacing * Math.cos(angle);
          targetY = prevLetter.y - trailSpacing * Math.sin(angle);
        }
        
        // Much faster easing for smoother, more responsive motion
        const easingFactor = index === 0 ? 0.35 : 0.18 + (index * 0.002);
        
        // Apply easing to create smooth following motion
        const newX = letter.x + (targetX - letter.x) * easingFactor;
        const newY = letter.y + (targetY - letter.y) * easingFactor;
        
        // Calculate velocity for dynamic effects
        const velocity = Math.sqrt(
          Math.pow(targetX - letter.x, 2) + 
          Math.pow(targetY - letter.y, 2)
        );
        
        // Dynamic visual effects - smoother and more subtle
        const scale = 0.95 + Math.min(0.15, velocity * 0.003);
        const rotation = Math.sin(Date.now() * 0.0008 + index * 0.3) * 1.5;
        const opacity = letter.letter === ' ' ? 0 : Math.max(0.85, 1 - velocity * 0.001);
        
        return {
          ...letter,
          x: newX,
          y: newY,
          targetX,
          targetY,
          scale,
          rotation,
          opacity
        };
      });
      
      setLetterTrail([...trailRef.current]);
    };

    // Enhanced event handlers
    const handleMouseMove = (e: MouseEvent) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      if (cursor) cursor.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (cursor) cursor.style.opacity = '1';
    };

    // Add event listeners with passive options for performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Start 60 FPS animation
    animationRef.current = requestAnimationFrame(updateCursor);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Restore default cursor
      document.body.style.cursor = 'auto';
      document.documentElement.style.cursor = 'auto';
    };
  }, [enabled, cursorPosition, isAboutPage]);

  // Clear trail when leaving About page
  useEffect(() => {
    if (!isAboutPage) {
      trailRef.current = [];
      setLetterTrail([]);
    }
  }, [isAboutPage]);

  if (!enabled) return null;

  // Cursor configuration based on page
  const getCursorConfig = () => {
    if (isAboutPage) {
      return {
        image: '/cursor-admin-move.png',
        clickImage: '/cursor-admin-click.png',
        size: 70,
        offsetX: 35,
        offsetY: 45
      };
    } else {
      return {
        image: '/cursor-move.png',
        clickImage: '/cursor-click.png',
        size: 60,
        offsetX: 30,
        offsetY: 40
      };
    }
  };

  const cursorConfig = getCursorConfig();

  return (
    <>
      {/* Gorgeous letter trail for About page */}
      {isAboutPage && letterTrail.map((letter) => (
        <div
          key={letter.id}
          style={{
            position: 'fixed',
            left: letter.x,
            top: letter.y,
            pointerEvents: 'none',
            zIndex: 9998,
            fontSize: '42px',
            fontFamily: 'Georgia, "Times New Roman", Times, serif',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: letter.opacity,
            transform: `scale(${letter.scale}) rotate(${letter.rotation}deg)`,
            userSelect: 'none',
            textShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            filter: 'drop-shadow(0 6px 12px rgba(102, 126, 234, 0.25))',
            transition: 'transform 0.05s linear, opacity 0.1s ease-out',
            letterSpacing: '3px',
            willChange: 'transform, opacity'
          }}
        >
          {letter.letter}
        </div>
      ))}
      
      {/* Custom cursor head image */}
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          position: 'fixed',
          left: cursorPosition.x - cursorConfig.offsetX,
          top: cursorPosition.y - cursorConfig.offsetY,
          width: `${cursorConfig.size}px`,
          height: `${cursorConfig.size}px`,
          backgroundImage: `url(${isClicking ? cursorConfig.clickImage : cursorConfig.image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 1,
          transform: isClicking ? 'scale(0.92) rotate(2deg)' : 'scale(1)',
          transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: isClicking 
            ? 'brightness(1.15) drop-shadow(0 0 15px rgba(255,255,255,0.4))' 
            : 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
          willChange: 'transform'
        }}
      />
    </>
  );
}