import LiquidEther from '@/components/LiquidEther';
import SpotlightCard from '@/components/SpotlightCard';
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', backgroundColor: 'black'}}>
      <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0}}>
        <LiquidEther
          colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
          mouseForce={15}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.4}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.3}
          autoIntensity={4}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-white text-center h-screen pointer-events-none">
        <h1 className="text-7xl font-extrabold mb-4 leading-tight">AI in Action: Detect the World in Real Time</h1>
        <p className="text-2xl mb-8 max-w-3xl mx-auto">
          This project blends deep learning, modern web tech, and real-time performance. Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">YOLO</span>, built with React and Django, it’s more than a demo — it’s proof of what I can build when AI meets full-stack development.
        </p>
        <Link to="/login" className="pointer-events-auto">
          <button className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105">
            Try It Now
          </button>
        </Link>
      </div>

      <div className="relative z-10 bg-black bg-opacity-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-white">
          <h2 className="text-5xl font-bold text-center mb-12">What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">YOLO</span>?</h2>
          <p className="text-xl text-left leading-relaxed">
            YOLO, or "You Only Look Once," is a state-of-the-art, real-time object detection system. Unlike traditional methods that apply a model to an image at multiple locations and scales, YOLO views object detection as a single regression problem. It divides the image into a grid and, for each grid cell, predicts bounding boxes and class probabilities simultaneously. This unified architecture allows it to be extremely fast, making it ideal for real-time applications like ours.
          </p>
        </div>
      </div>

      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-white">
          <h2 className="text-5xl font-bold text-center mb-12"><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">YOLO</span> Architecture</h2>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.25)">
              <h3 className="text-3xl font-bold mb-4">Backbone</h3>
              <p className="text-lg leading-relaxed">
                The Backbone is a convolutional neural network that extracts essential features from the input image. It is typically a powerful, pre-trained network like CSPDarknet, which is highly efficient at capturing hierarchical features at different scales.
              </p>
            </SpotlightCard>
            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.25)">
              <h3 className="text-3xl font-bold mb-4">Neck</h3>
              <p className="text-lg leading-relaxed">
                The Neck connects the Backbone and the Head. Its primary role is to fuse and refine the features extracted by the backbone. It often uses mechanisms like Feature Pyramid Networks (FPN) or Path Aggregation Networks (PANet) to combine features from different scales, enhancing the model's ability to detect objects of various sizes.
              </p>
            </SpotlightCard>
            <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.25)">
              <h3 className="text-3xl font-bold mb-4">Head</h3>
              <p className="text-lg leading-relaxed">
                The Head is the final part of the network, responsible for making the actual predictions. It takes the fused features from the Neck and predicts bounding boxes, objectness scores (confidence that an object is present), and class probabilities for each grid cell in the image.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;