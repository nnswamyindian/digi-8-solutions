import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
};

export default function RevealOnScroll({ children, className = '' }: Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
