import React, { useRef, useEffect } from 'react';

/**
 * A reusable React component that renders text as an interactive particle field.
 * This component is designed to be used as an overlay. For the best effect,
 * the original text element it covers should be made transparent.
 *
 * @param {object} props - The component props.
 * @param {string} props.text - The text to render as particles.
 * @param {number} props.fontSize - The font size in pixels to use for the text.
 * @param {string} props.className - Additional CSS classes for the container.
 * @returns {JSX.Element}
 */
const HeroParticleEffect = ({ text = "NXL", fontSize = 128, className = "" }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null); // Ref for the container div
    
    // Refs for animation state to avoid re-renders
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: null, y: null, radius: 100 });
    const breathingCounterRef = useRef(0);

    // --- Configuration Constants ---
    const PARTICLE_CHARS = ['N', 'X', 'L'];
    const FONT_FAMILY = '"Roboto Mono", monospace';
    const BASE_COLOR = '#FFFFFF';
    const HOVER_COLOR = '#FFFFFF';
    const SHADOW_COLOR = '#444444';

    // --- Physics and Animation Parameters ---
    const PARTICLE_BASE_SIZE = 4;
    const PARTICLE_GAP = 2;
    const PARTICLE_EASE_FACTOR = 0.005;
    const MOUSE_INTERACTION_FRICTION = 0.46;
    const DEFAULT_FRICTION = 0.90;
    const PARTICLE_BASE_DENSITY = 25;
    const PARTICLE_RANDOM_DENSITY = 3;
    const BREATHING_SPEED = 0.03;
    const BREATHING_POSITION_MAGNITUDE = 2.5;
    const BREATHING_SIZE_MAGNITUDE = 1;

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let animationFrameId;

        // --- Particle Class Definition ---
        // This encapsulates the state and behavior of a single particle.
        class Particle {
            constructor(x, y, char, color, size) {
                this.originX = x;
                this.originY = y;
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.char = char;
                this.baseColor = color;
                this.color = color;
                this.baseSize = size;
                this.size = size;
                this.vx = 0;
                this.vy = 0;
                this.density = (Math.random() * PARTICLE_RANDOM_DENSITY) + PARTICLE_BASE_DENSITY;
                this.frameCount = Math.floor(Math.random() * 100);
                this.changeInterval = Math.floor(Math.random() * 100 + 10);
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.font = `${this.size}px ${FONT_FAMILY}`;
                ctx.fillText(this.char, this.x, this.y);
            }

            update() {
                this.frameCount++;
                if (this.frameCount % this.changeInterval === 0) {
                    this.char = PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)];
                }

                const mouse = mouseRef.current;
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = (mouse.x !== null) ? Math.sqrt(dx * dx + dy * dy) : Infinity;

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;
                    this.vx -= directionX;
                    this.vy -= directionY;
                    this.color = HOVER_COLOR;
                    this.size = this.baseSize;
                } else {
                    const breath = Math.sin(breathingCounterRef.current + this.originY * 0.05);
                    const targetX = this.originX + breath * BREATHING_POSITION_MAGNITUDE;
                    const targetY = this.originY + breath * BREATHING_POSITION_MAGNITUDE;
                    this.size = this.baseSize + breath * BREATHING_SIZE_MAGNITUDE;
                    this.vx += (targetX - this.x) * PARTICLE_EASE_FACTOR;
                    this.vy += (targetY - this.y) * PARTICLE_EASE_FACTOR;
                    this.color = this.baseColor;
                }

                const friction = distance < mouse.radius ? MOUSE_INTERACTION_FRICTION : DEFAULT_FRICTION;
                this.vx *= friction;
                this.vy *= friction;
                this.x += this.vx;
                this.y += this.vy;
            }
        }

        // --- Initialization and Animation Functions ---
        const initParticles = () => {
            if (canvas.width <= 0 || canvas.height <= 0) return;
            
            const mainParticles = [];
            const shadowParticles = [];
            
            ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const shadowOffsetX = 2;
            const shadowOffsetY = 2;
            
            const textX = (canvas.width / 2) - (shadowOffsetX / 2);
            const textY = (canvas.height / 2) - (shadowOffsetY / 2);

            ctx.fillText(text, textX, textY);
            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let y = 0; y < textCoordinates.height; y += PARTICLE_GAP) {
                for (let x = 0; x < textCoordinates.width; x += PARTICLE_GAP) {
                    if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                        const randomChar = PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)];
                        mainParticles.push(new Particle(x, y, randomChar, BASE_COLOR, PARTICLE_BASE_SIZE));
                        shadowParticles.push(new Particle(x + shadowOffsetX, y + shadowOffsetY, randomChar, SHADOW_COLOR, PARTICLE_BASE_SIZE));
                    }
                }
            }
            particlesRef.current = [...shadowParticles, ...mainParticles];
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            breathingCounterRef.current += BREATHING_SPEED;
            particlesRef.current.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        // --- Event Handlers ---
        const handleResize = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            initParticles();
        };

        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = event.clientX - rect.left;
            mouseRef.current.y = event.clientY - rect.top;
        };

        const handleMouseOut = () => {
            mouseRef.current.x = null;
            mouseRef.current.y = null;
        };

        // --- Setup and Cleanup ---
        handleResize();
        animate();
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseout', handleMouseOut);

        return () => {
            resizeObserver.unobserve(container);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, [text, fontSize]); // Re-run effect if text or fontSize props change

    return (
        <div ref={containerRef} className={`w-full h-full absolute top-0 left-0 pointer-events-auto ${className}`}>
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
    );
};

export default HeroParticleEffect;
