// tsParticles 背景粒子配置
tsParticles.load("tsparticles", {
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
        number: { value: 35, density: { enable: true, area: 800 } },
        color: { value: ["#ffffff", "#ffd700", "#87ceeb", "#f0e68c"] },
        shape: {
            type: ["circle", "star"],
        },
        opacity: {
            value: { min: 0.15, max: 0.5 },
            animation: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false }
        },
        size: {
            value: { min: 1, max: 4 },
            animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false }
        },
        move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
        },
        links: {
            enable: false
        },
        twinkle: {
            particles: {
                enable: true,
                frequency: 0.03,
                color: { value: "#ffd700" },
                opacity: 0.8
            }
        }
    },
    interactivity: {
        events: {
            onHover: { enable: true, mode: "bubble" },
            resize: true
        },
        modes: {
            bubble: { distance: 150, size: 6, duration: 2, opacity: 0.6 }
        }
    },
    detectRetina: true
});
