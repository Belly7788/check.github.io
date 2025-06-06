import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getDarkModeClass } from '../../utils/darkModeUtils';

export default function ComingSoon404({ darkMode }) {
    const { t } = useTranslation();
    const canvasRef = useRef(null);
    const holoRef = useRef(null);

    useEffect(() => {
        // Binary animation
        const binaryContainer = document.querySelector('.binary-animation');
        if (binaryContainer) {
            const binaryChars = '01';
            let interval;

            const animateBinary = () => {
                const elements = binaryContainer.querySelectorAll('span');
                elements.forEach(el => {
                    if (Math.random() > 0.3) { // Only change some characters
                        el.textContent = binaryChars.charAt(Math.floor(Math.random() * binaryChars.length));
                    }
                });
            };

            interval = setInterval(animateBinary, 100);
            return () => clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        // Particle animation
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = Math.floor(window.innerWidth * window.innerHeight / 10000);

        const color = darkMode ? '#00ffaa' : '#0088ff';

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width || this.x < 0) {
                    this.speedX = -this.speedX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.speedY = -this.speedY;
                }
            }

            draw() {
                ctx.fillStyle = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animateParticles);
        };

        animateParticles();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [darkMode]);

    useEffect(() => {
        // Holographic grid animation
        const holoElement = holoRef.current;
        if (!holoElement) return;

        const gridSize = 20;
        const gridItems = [];

        for (let i = 0; i < gridSize * gridSize; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.style.width = `${100 / gridSize}%`;
            gridItem.style.height = `${100 / gridSize}%`;
            gridItem.style.opacity = Math.random() * 0.3 + 0.1;
            holoElement.appendChild(gridItem);
            gridItems.push(gridItem);
        }

        const animateGrid = () => {
            gridItems.forEach(item => {
                if (Math.random() > 0.8) {
                    item.style.opacity = Math.random() * 0.3 + 0.1;
                }
            });
        };

        const gridInterval = setInterval(animateGrid, 300);
        return () => clearInterval(gridInterval);
    }, []);

    return (
        <div className={`coming-soon-container ${getDarkModeClass(darkMode, 'dark-mode', 'light-mode')}`}>
            <div className="tech-background">
                <canvas ref={canvasRef} className="particle-canvas"></canvas>
                <div className="binary-animation">
                    {Array.from({ length: 500 }).map((_, i) => (
                        <span key={i}>0</span>
                    ))}
                </div>
                <div className="circuit-line"></div>
                <div className="circuit-line circuit-line-2"></div>
            </div>

            <div className="coming-soon-content">
                <div className="holographic-display">
                    <div ref={holoRef} className="holo-grid"></div>
                    <div className="holo-circle"></div>
                    <div className="holo-circle"></div>
                    <div className="holo-circle"></div>
                    <h1 className="coming-soon-title">{t('comingSoon.title', 'Coming Soon')}</h1>
                    <p className="coming-soon-message">{t('comingSoon.message', "We're developing something amazing!")}</p>
                    <div className="scanline"></div>
                </div>

                <div className="tech-progress">
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                        <div className="progress-node"></div>
                    </div>
                    <p className="progress-text">{t('comingSoon.progress', 'Development in progress: 42%')}</p>
                </div>

                <div className="tech-dots">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="tech-dot"></div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .coming-soon-container {
                    position: relative;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .light-mode {
                    background-color: #f0f4f8;
                    color: #1a1a1a;
                }

                .dark-mode {
                    background-color: #050a13;
                    color: #fff;
                }

                .tech-background {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }

                .particle-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                .binary-animation {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    opacity: 0.1;
                    font-size: 12px;
                    pointer-events: none;
                }

                .light-mode .binary-animation {
                    color: #0088ff;
                }

                .dark-mode .binary-animation {
                    color: #00ffaa;
                }

                .binary-animation span {
                    margin: 0 2px;
                    transition: all 0.3s ease;
                }

                .circuit-line {
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    top: 50%;
                    animation: circuitGlow 3s infinite;
                }

                .circuit-line-2 {
                    top: 30%;
                    animation-delay: 1s;
                }

                .light-mode .circuit-line {
                    background: linear-gradient(90deg, transparent, #0088ff, transparent);
                    box-shadow: 0 0 10px rgba(0, 136, 255, 0.5);
                }

                .dark-mode .circuit-line {
                    background: linear-gradient(90deg, transparent, #00ffaa, transparent);
                    box-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
                }

                @keyframes circuitGlow {
                    0% { opacity: 0.3; transform: scaleX(0.9); }
                    50% { opacity: 0.8; transform: scaleX(1); }
                    100% { opacity: 0.3; transform: scaleX(0.9); }
                }

                .coming-soon-content {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    padding: 2rem;
                    max-width: 800px;
                }

                .holographic-display {
                    position: relative;
                    padding: 3rem;
                    margin-bottom: 3rem;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .light-mode .holographic-display {
                    background: rgba(0, 136, 255, 0.05);
                    box-shadow: 0 0 30px rgba(0, 136, 255, 0.1);
                    border: 1px solid rgba(0, 136, 255, 0.2);
                }

                .dark-mode .holographic-display {
                    background: rgba(0, 255, 170, 0.05);
                    box-shadow: 0 0 30px rgba(0, 255, 170, 0.1);
                    border: 1px solid rgba(0, 255, 170, 0.2);
                }

                .holo-grid {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-wrap: wrap;
                    pointer-events: none;
                }

                .grid-item {
                    transition: opacity 0.5s ease;
                }

                .light-mode .grid-item {
                    border: 1px solid rgba(0, 136, 255, 0.1);
                }

                .dark-mode .grid-item {
                    border: 1px solid rgba(0, 255, 170, 0.1);
                }

                .holo-circle {
                    position: absolute;
                    border-radius: 50%;
                    animation: holoPulse 4s infinite ease-in-out;
                    pointer-events: none;
                }

                .light-mode .holo-circle {
                    border: 1px solid rgba(0, 136, 255, 0.3);
                }

                .dark-mode .holo-circle {
                    border: 1px solid rgba(0, 255, 170, 0.3);
                }

                .holo-circle:nth-child(1) {
                    width: 100px;
                    height: 100px;
                    top: -50px;
                    left: -50px;
                }

                .holo-circle:nth-child(2) {
                    width: 150px;
                    height: 150px;
                    bottom: -75px;
                    right: -75px;
                    animation-delay: 1s;
                }

                .holo-circle:nth-child(3) {
                    width: 80px;
                    height: 80px;
                    top: 50%;
                    right: 20px;
                    animation-delay: 2s;
                }

                @keyframes holoPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }

                .coming-soon-title {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    animation: textGlow 2s infinite alternate;
                    position: relative;
                }

                .light-mode .coming-soon-title {
                    background: linear-gradient(90deg, #0088ff, #00ffaa);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }

                .dark-mode .coming-soon-title {
                    background: linear-gradient(90deg, #00ffaa, #0088ff);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }

                @keyframes textGlow {
                    from { text-shadow: 0 0 10px rgba(0, 255, 170, 0.3); }
                    to { text-shadow: 0 0 20px rgba(0, 255, 170, 0.6); }
                }

                .coming-soon-message {
                    font-size: 1.5rem;
                    opacity: 0.9;
                    margin-bottom: 0;
                    position: relative;
                }

                .scanline {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        to bottom,
                        rgba(0, 255, 170, 0) 0%,
                        rgba(0, 255, 170, 0.1) 50%,
                        rgba(0, 255, 170, 0) 100%
                    );
                    animation: scan 4s linear infinite;
                    pointer-events: none;
                }

                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }

                .tech-progress {
                    margin-top: 2rem;
                    position: relative;
                }

                .progress-bar {
                    height: 6px;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 1rem;
                    position: relative;
                }

                .light-mode .progress-bar {
                    background: rgba(0, 0, 0, 0.1);
                }

                .dark-mode .progress-bar {
                    background: rgba(255, 255, 255, 0.1);
                }

                .progress-fill {
                    height: 100%;
                    width: 42%;
                    border-radius: 3px;
                    animation: progressPulse 2s infinite;
                    position: relative;
                }

                .light-mode .progress-fill {
                    background: linear-gradient(90deg, #0088ff, #00ffaa);
                }

                .dark-mode .progress-fill {
                    background: linear-gradient(90deg, #00ffaa, #0088ff);
                }

                .progress-node {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    animation: nodePulse 1.5s infinite;
                }

                .light-mode .progress-node {
                    background: #0088ff;
                    box-shadow: 0 0 10px #0088ff;
                }

                .dark-mode .progress-node {
                    background: #00ffaa;
                    box-shadow: 0 0 10px #00ffaa;
                }

                @keyframes progressPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                @keyframes nodePulse {
                    0%, 100% { transform: translateY(-50%) scale(1); }
                    50% { transform: translateY(-50%) scale(1.2); }
                }

                .progress-text {
                    font-size: 0.9rem;
                    opacity: 0.7;
                    letter-spacing: 1px;
                }

                .tech-dots {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 2rem;
                }

                .tech-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    animation: dotPulse 2s infinite;
                }

                .light-mode .tech-dot {
                    background: #0088ff;
                }

                .dark-mode .tech-dot {
                    background: #00ffaa;
                }

                .tech-dot:nth-child(1) { animation-delay: 0s; }
                .tech-dot:nth-child(2) { animation-delay: 0.2s; }
                .tech-dot:nth-child(3) { animation-delay: 0.4s; }
                .tech-dot:nth-child(4) { animation-delay: 0.6s; }
                .tech-dot:nth-child(5) { animation-delay: 0.8s; }

                @keyframes dotPulse {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.3); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
