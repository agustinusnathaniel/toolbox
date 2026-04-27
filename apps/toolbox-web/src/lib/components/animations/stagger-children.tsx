import { type MotionProps, motion, type Variants } from 'motion/react';
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

type StaggerChildrenProps<T extends ElementType = 'div'> = {
  as?: T;
  children: ReactNode;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  className?: string;
} & Omit<ComponentPropsWithRef<T>, 'as' | 'children' | 'className'>;

const motionComponents = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  main: motion.main,
  header: motion.header,
  footer: motion.footer,
  nav: motion.nav,
  ul: motion.ul,
  ol: motion.ol,
} as const;

type MotionComponentKey = keyof typeof motionComponents;

export const StaggerChildren = <T extends ElementType = 'div'>({
  as,
  children,
  delay = 0,
  duration = 0.28,
  staggerDelay = 0.08,
  className,
  ...props
}: StaggerChildrenProps<T>) => {
  const reducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: reducedMotion ? { opacity: 1 } : { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion
        ? { duration: 0 }
        : {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
    },
  };

  const childVariants: Variants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0 }
        : {
            duration,
            ease: [0.4, 0, 0.2, 1],
          },
    },
  };

  const tag = (as as MotionComponentKey) || 'div';
  const Component = motionComponents[tag] || motion.div;

  return (
    <Component
      animate="visible"
      className={className}
      initial={reducedMotion ? 'visible' : 'hidden'}
      variants={containerVariants}
      {...(props as MotionProps)}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            /* biome-ignore lint/suspicious/noArrayIndexKey: Stagger animation requires index-based keys */
            <motion.div key={index} variants={childVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </Component>
  );
};
