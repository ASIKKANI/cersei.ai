import React, { useRef } from 'react';
import './GooeyNav.css';

export interface GooeyNavItem {
  label: string;
  id: string;
  icon?: React.ReactNode;
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  activeId,
  onSelect,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(0, items.findIndex((i) => i.id === activeId));

  return (
    <div className={`gooey-nav-container ${className}`.trim()} ref={containerRef}>
      <nav className="rounded-full bg-slate-100/90 p-1 border border-slate-200/80 backdrop-blur-md">
        <ul className="flex items-center gap-1">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={item.id} className={isActive ? 'active' : ''}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default GooeyNav;
