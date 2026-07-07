'use client';
import { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState('hidden');

  useEffect(() => {
    // Fade in shortly after mount
    const t1 = setTimeout(() => {
      setStage('fade-in');
    }, 100);

    // Slide up after 2.5 seconds
    const t2 = setTimeout(() => {
      setStage('slide-up');
    }, 2500);

    // Unmount after animation finishes
    const t3 = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  let transformStyle = '';
  let opacityStyle = 0;

  if (stage === 'fade-in') {
    opacityStyle = 1;
    transformStyle = 'translateY(0)';
  } else if (stage === 'slide-up') {
    opacityStyle = 1;
    transformStyle = 'translateY(-100%)';
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#000',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: opacityStyle,
      transform: transformStyle,
      transition: stage === 'slide-up' ? 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)' : 'opacity 0.5s ease-in'
    }}>
      <img 
        src="/loading.png" 
        alt="Loading..."
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '8%',
        color: '#fff',
        fontFamily: '"Courier New", Courier, monospace',
        fontWeight: 'bold',
        fontSize: '16px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        animation: 'pulse 1.5s infinite',
        textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
        zIndex: 10
      }}>
        Geser ke atas ↑
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-5px); }
          100% { opacity: 0.4; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
