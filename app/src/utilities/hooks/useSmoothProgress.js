import { useEffect, useRef, useState } from 'react';

export function useSmoothProgress() {
    const [progress, setProgress] = useState(0);
    const targetRef = useRef(0);
    const animationRef = useRef();

    const updateProgress = (newProgress) => {
        targetRef.current = newProgress;

        const animate = () => {
            setProgress((prev) => {
                if (Math.abs(prev - targetRef.current) < 1) {
                    cancelAnimationFrame(animationRef.current);
                    return targetRef.current;
                }

                const direction = targetRef.current > prev ? 1 : -1;
                return prev + direction * Math.min(Math.abs(prev - targetRef.current), 2); // speed
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        return () => cancelAnimationFrame(animationRef.current); // cleanup
    }, []);

    return [progress, updateProgress];
}
