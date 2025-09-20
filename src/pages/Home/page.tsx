import LiquidEther from '@/components/LiquidEther';
import React from 'react';

const Home: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', backgroundColor: 'black'}}>
      <LiquidEther
        colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.2}
        autoIntensity={4}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />
    </div>
  );
};

export default Home;