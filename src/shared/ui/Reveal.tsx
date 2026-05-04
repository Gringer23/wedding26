'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    delay?: number;
    className?: string;
};

export default function Reveal({ children, delay = 0, className }: Props) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 40,
                scale: 0.98,
            }}
            whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            viewport={{
                once: true,
                amount: 0.18,
            }}
            transition={{
                duration: 0.75,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}