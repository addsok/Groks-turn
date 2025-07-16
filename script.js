// Initialize AOS
AOS.init({ duration: 1000 });

// Preloader
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
    }, 2000);
});

// Custom Cursor
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('.card, .nav-links a, .theme-toggle, #contactForm button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('grow');
        playSound('hover');
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});

// Sound Effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type === 'hover' ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(type === 'hover' ? 800 : 400, audioContext.currentTime);
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Theme Switcher
let currentTheme = 'dark';
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : currentTheme === 'light' ? 'futuristic' : 'dark';
    document.body.className = currentTheme;
    playSound('click');
}

// WebGL Shader Nebula (only for index.html)
if (document.getElementById('canvas')) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    const posArray = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 2000;
        posArray[i + 1] = (Math.random() - 0.5) * 2000;
        posArray[i + 2] = (Math.random() - 0.5) * 2000;
        colors[i] = Math.random();
        colors[i + 1] = Math.random();
        colors[i + 2] = 1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const vertexShader = `
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 5.0 * (1.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    const fragmentShader = `
        varying vec3 vColor;
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            gl_FragColor = vec4(vColor * vec3(0.0, 0.75, 1.0), 0.8);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);
    camera.position.z = 500;

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x = mouseY * 0.5;
        particlesMesh.rotation.y = mouseX * 0.5;
        const positions = particlesGeometry.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.1;
            if (positions[i + 1] > 1000) positions[i + 1] -= 2000;
        }
        particlesGeometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }
    animate();
}

// GSAP Scroll Animations
gsap.to('.hero-text', {
    scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    },
    opacity: 0,
    y: -100
});

gsap.to('.card', {
    scrollTrigger: {
        trigger: '.projects',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: true
    },
    rotationX: 20,
    rotationY: 20,
    ease: 'power1.inOut'
});

// Contact Form Submission
function handleSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('contactForm');
    const messageDiv = document.getElementById('formMessage');
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    if (name && email && msg) {
        playSound('click');
        messageDiv.textContent = 'Thank you! Your message has been sent (demo mode).';
        messageDiv.style.color = '#00c4ff';
        form.reset();
        setTimeout(() => messageDiv.textContent = '', 5000);
    } else {
        messageDiv.textContent = 'Please fill in all fields.';
        messageDiv.style.color = '#ff007a';
    }
}

// Resize Handler
window.addEventListener('resize', () => {
    if (document.getElementById('canvas')) {
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});