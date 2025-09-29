'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'motion/react';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`cursor-pointer relative inline-flex items-center justify-center rounded-full bg-[#060010] border-neutral-700 border-2 shadow-md ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, child => cloneElement(child as React.ReactElement, { isHovered }))}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

function DockLabel({ children, className = '', ...rest }: DockLabelProps) {
  const { isHovered } = rest as { isHovered: MotionValue<number> };
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-neutral-700 bg-[#060010] px-2 py-0.5 text-xs text-white`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

function DockIcon({ children, className = '' }: DockIconProps) {
  return <div className={`flex items-center justify-center text-white ${className}`}>{children}</div>;
}

const ProfilePopup = ({ user, logout }: { user: any; logout: () => void; }) => {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-gray-900 border border-purple-700 rounded-lg shadow-lg p-4">
      <div className="text-center">
        <p className="text-white font-semibold">{user.username}</p>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>
      <div className="mt-4 flex flex-col space-y-2">
        {/* <Link to="/profile" className="text-center w-full px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700">
          Profile Settings
        </Link> */}
        <button
          onClick={logout}
          className="cursor-pointer w-full px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  dockHeight = 256,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const { user, logout } = useAuth();

  const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [magnification]);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  const handleProfileClick = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setShowProfilePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const modifiedItems = items.map(item => {
    if (item.label === 'Profile') {
      return { ...item, onClick: handleProfileClick };
    }
    return item;
  });

  return (
    <motion.div ref={dockRef} className="mx-2 flex max-w-full items-center">
      {showProfilePopup && user && <ProfilePopup user={user} logout={logout} />}
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} flex items-end w-fit gap-4 rounded-2xl border-neutral-700 border-2 pb-2 px-4`}
        role="toolbar"
        aria-label="Application dock"
      >
        {modifiedItems.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}