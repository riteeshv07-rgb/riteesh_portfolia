/* ==========================================================================
   PORTFOLIO WEBSITE - 3D INTERACTIVE ENGINE & CYBER-LUXE INTERACTIONS
   Authored with 35 Years of Creative Engineering & 3D Web Direction
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // 1. THREE.JS INTERACTIVE 3D WEBGL SCENE (CURSOR REACTIVE)
    // --------------------------------------------------------------------------
    const canvas = document.getElementById('webgl-canvas');
    let scene, camera, renderer, mainMesh, innerMesh, ringMesh, particleSystem, pointLightCyan, pointLightMagenta;
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function initThreeJS() {
        if (!canvas || typeof THREE === 'undefined') {
            initCanvasFallback();
            return;
        }

        try {
            // Scene & Camera setup
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 24;

            // WebGL Renderer with alpha transparency
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Ambient lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);

            // Cursor-tracking 3D Point Lights (Neon Cyan & Magenta)
            pointLightCyan = new THREE.PointLight(0x00f5d4, 2.5, 60);
            pointLightCyan.position.set(10, 10, 15);
            scene.add(pointLightCyan);

            pointLightMagenta = new THREE.PointLight(0xf72585, 2.2, 60);
            pointLightMagenta.position.set(-10, -10, 15);
            scene.add(pointLightMagenta);

            // Group for central 3D Hero Meshes
            const meshGroup = new THREE.Group();
            meshGroup.position.set(6, 1, 0); // Positioned slightly to the right of hero
            scene.add(meshGroup);

            // 1. Primary Wireframe Icosahedron
            const icoGeo = new THREE.IcosahedronGeometry(5.5, 1);
            const icoMat = new THREE.MeshStandardMaterial({
                color: 0x00f5d4,
                wireframe: true,
                roughness: 0.2,
                metalness: 0.8,
                emissive: 0x003f37,
                transparent: true,
                opacity: 0.75
            });
            mainMesh = new THREE.Mesh(icoGeo, icoMat);
            meshGroup.add(mainMesh);

            // 2. Inner Glowing Core
            const coreGeo = new THREE.IcosahedronGeometry(3.2, 0);
            const coreMat = new THREE.MeshStandardMaterial({
                color: 0xf72585,
                wireframe: true,
                emissive: 0x6e0d37,
                transparent: true,
                opacity: 0.6
            });
            innerMesh = new THREE.Mesh(coreGeo, coreMat);
            meshGroup.add(innerMesh);

            // 3. Orbiting Gyro Ring (Torus)
            const ringGeo = new THREE.TorusGeometry(8, 0.12, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x00f5d4,
                transparent: true,
                opacity: 0.4
            });
            ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 3;
            meshGroup.add(ringMesh);

            // 4. Floating 3D Starfield / Particle Swarm (1,200 points)
            const particleCount = 1200;
            const particleGeo = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            const color1 = new THREE.Color(0x00f5d4);
            const color2 = new THREE.Color(0xf72585);
            const color3 = new THREE.Color(0x4361ee);

            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 80;
                positions[i + 1] = (Math.random() - 0.5) * 60;
                positions[i + 2] = (Math.random() - 0.5) * 40 - 5;

                const mixedColor = Math.random() > 0.5 
                    ? color1.clone().lerp(color3, Math.random()) 
                    : color2.clone().lerp(color1, Math.random());
                colors[i] = mixedColor.r;
                colors[i + 1] = mixedColor.g;
                colors[i + 2] = mixedColor.b;
            }

            particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const particleMat = new THREE.PointsMaterial({
                size: 0.22,
                vertexColors: true,
                transparent: true,
                opacity: 0.85
            });

            particleSystem = new THREE.Points(particleGeo, particleMat);
            scene.add(particleSystem);

            // Global mouse move listener for 3D coordinate mapping
            window.addEventListener('mousemove', (e) => {
                mouse.targetX = (e.clientX - windowHalfX) / windowHalfX;
                mouse.targetY = (e.clientY - windowHalfY) / windowHalfY;
            }, { passive: true });

            // Window resize handler
            window.addEventListener('resize', () => {
                windowHalfX = window.innerWidth / 2;
                windowHalfY = window.innerHeight / 2;
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            });

            // Start animation render loop
            animateThreeJS();
        } catch (err) {
            console.warn('Three.js initialization failed, switching to 2D canvas fallback:', err);
            initCanvasFallback();
        }
    }

    // 3D Animation Render Loop
    function animateThreeJS() {
        requestAnimationFrame(animateThreeJS);

        // Smooth cursor interpolation (damping)
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Move 3D Point Lights with cursor coordinates
        if (pointLightCyan && pointLightMagenta) {
            pointLightCyan.position.x = mouse.x * 20 + 5;
            pointLightCyan.position.y = -mouse.y * 15 + 5;
            pointLightMagenta.position.x = -mouse.x * 20 - 5;
            pointLightMagenta.position.y = mouse.y * 15 - 5;
        }

        // Rotate central 3D meshes and react to cursor tilt
        if (mainMesh) {
            mainMesh.rotation.x += 0.003;
            mainMesh.rotation.y += 0.005;
            mainMesh.rotation.z = mouse.x * 0.5;

            innerMesh.rotation.x -= 0.005;
            innerMesh.rotation.y += 0.004;

            ringMesh.rotation.z += 0.004;
            ringMesh.rotation.y = mouse.x * 0.3;

            // Camera subtle parallax tilt
            camera.position.x += (mouse.x * 2.5 - camera.position.x) * 0.04;
            camera.position.y += (-mouse.y * 2.5 - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);
        }

        // Particle system subtle drifting
        if (particleSystem) {
            particleSystem.rotation.y += 0.0006;
            particleSystem.rotation.x += 0.0003;
            particleSystem.position.x = mouse.x * -1.2;
            particleSystem.position.y = mouse.y * 1.2;
        }

        renderer.render(scene, camera);
    }

    // Canvas Fallback (if WebGL/Three.js is offline)
    function initCanvasFallback() {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const stars = Array.from({ length: 140 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.8 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            color: Math.random() > 0.5 ? '#00f5d4' : '#f72585'
        }));

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        function renderFallback() {
            ctx.clearRect(0, 0, width, height);

            stars.forEach(star => {
                star.x += star.vx + mouse.targetX * 0.4;
                star.y += star.vy + mouse.targetY * 0.4;

                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;
                if (star.y < 0) star.y = height;
                if (star.y > height) star.y = 0;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.shadowColor = star.color;
                ctx.shadowBlur = 8;
                ctx.fill();
            });

            requestAnimationFrame(renderFallback);
        }
        renderFallback();
    }

    // Initialize 3D Engine
    initThreeJS();

    // --------------------------------------------------------------------------
    // 2. 3D CARD TILT & HOLOGRAPHIC GLARE ENGINE (VANILLA JS + CSS 3D)
    // --------------------------------------------------------------------------
    const tiltElements = document.querySelectorAll('[data-tilt]');

    tiltElements.forEach(card => {
        // Create dynamic glare element if not present
        let glare = card.querySelector('.glare-sheen');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'glare-sheen';
            glare.setAttribute('aria-hidden', 'true');
            card.appendChild(glare);
        }

        let bounds;

        function onMouseEnter() {
            bounds = card.getBoundingClientRect();
        }

        function onMouseMove(e) {
            if (!bounds) bounds = card.getBoundingClientRect();

            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;

            const xPct = mouseX / bounds.width;
            const yPct = mouseY / bounds.height;

            // Calculate 3D Euler angles (clamp max rotation to 14 deg for elegant feel)
            const rotX = ((yPct - 0.5) * -16).toFixed(2);
            const rotY = ((xPct - 0.5) * 16).toFixed(2);

            // Apply 3D perspective matrix
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Update radial glare sheen position
            if (glare) {
                glare.style.background = `radial-gradient(circle at ${xPct * 100}% ${yPct * 100}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
                glare.style.opacity = '1';
            }
        }

        function onMouseLeave() {
            // Smoothly restore neutral 3D position
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            if (glare) {
                glare.style.opacity = '0';
            }
            bounds = null;
        }

        card.addEventListener('mouseenter', onMouseEnter);
        card.addEventListener('mousemove', onMouseMove);
        card.addEventListener('mouseleave', onMouseLeave);
    });

    // --------------------------------------------------------------------------
    // 3. FLOATING 3D PARALLAX BADGES
    // --------------------------------------------------------------------------
    const parallaxChips = document.querySelectorAll('[data-parallax]');

    window.addEventListener('mousemove', (e) => {
        const normX = (e.clientX - windowHalfX) / windowHalfX;
        const normY = (e.clientY - windowHalfY) / windowHalfY;

        parallaxChips.forEach(chip => {
            const depth = parseFloat(chip.getAttribute('data-parallax')) || 20;
            const moveX = (normX * depth).toFixed(2);
            const moveY = (normY * depth).toFixed(2);

            chip.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
        });
    }, { passive: true });

    // --------------------------------------------------------------------------
    // 4. AMBIENT CURSOR GLOW ORB (SMOOTH LERP)
    // --------------------------------------------------------------------------
    const cursorGlow = document.getElementById('cursor-glow');
    let glowPos = { x: windowHalfX, y: windowHalfY };
    let mousePos = { x: windowHalfX, y: windowHalfY };

    if (cursorGlow) {
        window.addEventListener('mousemove', (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
        }, { passive: true });

        function updateCursorGlow() {
            glowPos.x += (mousePos.x - glowPos.x) * 0.12;
            glowPos.y += (mousePos.y - glowPos.y) * 0.12;

            cursorGlow.style.left = `${glowPos.x}px`;
            cursorGlow.style.top = `${glowPos.y}px`;

            requestAnimationFrame(updateCursorGlow);
        }
        updateCursorGlow();
    }

    // --------------------------------------------------------------------------
    // 5. THEME TOGGLE & MEDIA QUERY DETECTION
    // --------------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function getStoredTheme() {
        return localStorage.getItem('theme-preference');
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            rootElement.setAttribute('data-theme', 'dark');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<span>☀️ DAY MODE</span>';
                themeToggleBtn.setAttribute('aria-pressed', 'true');
            }
        } else if (theme === 'light') {
            rootElement.setAttribute('data-theme', 'light');
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = '<span>🌙 NIGHT MODE</span>';
                themeToggleBtn.setAttribute('aria-pressed', 'false');
            }
        } else {
            rootElement.removeAttribute('data-theme');
            const systemPrefersDark = darkModeMediaQuery.matches;
            if (themeToggleBtn) {
                themeToggleBtn.innerHTML = systemPrefersDark 
                    ? '<span>☀️ DAY MODE</span>' 
                    : '<span>🌙 NIGHT MODE</span>';
                themeToggleBtn.setAttribute('aria-pressed', systemPrefersDark ? 'true' : 'false');
            }
        }
    }

    // Initialize theme based on preference or system media query
    const savedTheme = getStoredTheme();
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(darkModeMediaQuery.matches ? 'dark' : 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = rootElement.getAttribute('data-theme') || 
                (darkModeMediaQuery.matches ? 'dark' : 'light');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            localStorage.setItem('theme-preference', newTheme);
            applyTheme(newTheme);
        });
    }

    darkModeMediaQuery.addEventListener('change', (e) => {
        if (!getStoredTheme()) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --------------------------------------------------------------------------
    // 6. VERTICAL NAVIGATION & MOBILE RESPONSIVENESS
    // --------------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('site-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const navLinks = document.querySelectorAll('.vertical-nav-list .nav-link');

    function openSidebar() {
        if (sidebar && backdrop && mobileMenuBtn) {
            sidebar.classList.add('is-open');
            backdrop.classList.add('is-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            backdrop.setAttribute('aria-hidden', 'false');
        }
    }

    function closeSidebar() {
        if (sidebar && backdrop && mobileMenuBtn) {
            sidebar.classList.remove('is-open');
            backdrop.classList.remove('is-open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            backdrop.setAttribute('aria-hidden', 'true');
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('is-open');
            if (isOpen) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('is-open')) {
            closeSidebar();
            mobileMenuBtn?.focus();
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                closeSidebar();
            }
        });
    });

    // --------------------------------------------------------------------------
    // 7. SCROLLSPY / ACTIVE NAV ITEM HIGHLIGHTING
    // --------------------------------------------------------------------------
    const sections = document.querySelectorAll('main section[id]');

    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    } else {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                updateActiveNavLink();
                scrollTimeout = null;
            }, 50);
        }
    }, { passive: true });

    updateActiveNavLink();
});
