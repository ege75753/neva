// Data for pre-written messages
const messagesData = {
    'argued': "Listen. No matter what we had a fight about, it doesn't change how I feel about you. Arguments are temporary, its me and you agaisnt the problem, not me agaisnt you, i love you a lot.",
    'offline': "I'm probably just asleep, im never busy for you.",
    'dontcare': "If I ever made you feel like this, Im sorry. Sometimes i mess up, but you are the most important person to me. I love you and care about you even if i couldnt show it this time.",
    'scared': "I chose you. I keep choosing you every single day. You dont have to be perfect for me to stay. You need to be yourself."
};

document.addEventListener('DOMContentLoaded', () => {

    // --- Stars Background Animation ---
    function createStars() {
        const container1 = document.getElementById('stars-container');
        const container2 = document.getElementById('stars-container-2');

        for (let i = 0; i < 100; i++) {
            createStar(container1);
            createStar(container2);
        }
    }

    function createStar(container) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1; // 1 to 3px

        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = Math.random() > 0.8 ? 'var(--accent-solid)' : '#fff';
        star.style.borderRadius = '50%';
        star.style.opacity = Math.random() * 0.5 + 0.1;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        // Simple twinkle animation via inline transition for simplicity, or complex CSS keyframes
        // We'll rely on CSS opacity for standard look, JS to reposition sometimes
        container.appendChild(star);
    }

    // Create parallax stars
    const starsStyle = document.createElement('style');
    starsStyle.innerHTML = `
        @keyframes drift1 { from { transform: translateY(0px); } to { transform: translateY(-1000px); } }
        @keyframes drift2 { from { transform: translateY(0px); } to { transform: translateY(-800px); } }
        #stars-container { animation: drift1 100s linear infinite; }
        #stars-container-2 { animation: drift2 150s linear infinite; top: 100%; }
    `;
    document.head.appendChild(starsStyle);
    createStars();


    // --- Login Logic ---
    const loginInput = document.getElementById('passcode-input');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const viewLogin = document.getElementById('view-login');
    const mainContent = document.getElementById('main-content');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const welcomeName = document.getElementById('welcome-name');

    // Audio elements
    const musicToggle = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    const audioVisualizer = document.getElementById('audio-visualizer');
    let isPlaying = false;

    // Placeholder passcode is '1234' for testing
    const validPasscode = '260925';

    function attemptLogin() {
        if (loginInput.value === validPasscode) {
            loginError.classList.add('hidden');

            // Play background music if available
            if (bgMusic.src && !bgMusic.src.endsWith('undefined') && window.location.href !== bgMusic.src) {
                bgMusic.volume = 0.2; // Set volume to 20%
                bgMusic.play().catch(e => console.log("Audio play failed:", e));
                musicToggle.classList.add('playing');
                audioVisualizer.classList.remove('hidden');
                audioVisualizer.classList.remove('paused');
                isPlaying = true;
            }

            // Fade out login
            viewLogin.classList.remove('active');

            // Show welcome overlay
            setTimeout(() => {
                welcomeOverlay.classList.remove('hidden');
                setTimeout(() => {
                    welcomeName.classList.add('show');
                }, 100);
            }, 800);

            // Transition to main app
            setTimeout(() => {
                welcomeOverlay.style.opacity = '0';

                setTimeout(() => {
                    welcomeOverlay.classList.add('hidden');
                    mainContent.classList.remove('hidden');

                    // Activate Home View
                    document.getElementById('view-drift').classList.add('active');

                    // Trigger intro animations
                    setTimeout(() => {
                        document.querySelector('.drift-intro').classList.add('show');
                        document.querySelector('.letters-grid').classList.add('show');
                    }, 500);

                }, 2000); // Wait for fade out
            }, 4000); // Keep welcome screen for 4s

        } else {
            loginError.classList.remove('hidden');
            loginInput.value = '';
            // Shake effect
            loginInput.style.transform = 'translateX(-10px)';
            setTimeout(() => loginInput.style.transform = 'translateX(10px)', 100);
            setTimeout(() => loginInput.style.transform = 'translateX(-10px)', 200);
            setTimeout(() => loginInput.style.transform = 'translateX(0)', 300);
        }
    }

    loginBtn.addEventListener('click', attemptLogin);
    loginInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });


    // --- Navigation Logic ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update nav active state
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch views
            const targetId = btn.getAttribute('data-target');
            views.forEach(view => {
                if (view.id === targetId) {
                    view.classList.add('active');
                } else if (view.id !== 'view-login') {
                    view.classList.remove('active');
                }
            });
        });
    });


    // --- Audio Logic ---
    musicToggle.addEventListener('click', () => {
        if (!bgMusic.src || bgMusic.src.endsWith('undefined') || window.location.href === bgMusic.src) {
            // No song loaded, user needs to add one
            alert("No music file configured. Add your mp3 to the <audio> tag in index.html!");
            return;
        }

        if (isPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            audioVisualizer.classList.add('paused');
        } else {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
            musicToggle.classList.add('playing');
            audioVisualizer.classList.remove('hidden');
            audioVisualizer.classList.remove('paused');
        }
        isPlaying = !isPlaying;
    });


    // --- "In Case We Drift" Logic (Letters) ---
    const letters = document.querySelectorAll('.letter');
    const modal = document.getElementById('letter-modal');
    const modalText = document.getElementById('modal-text');
    const closeModal = document.querySelector('.close-modal');
    let isWarmMode = false;
    let shootingStarInterval = null;
    let sparkleLastTime = 0;

    // Handle cursor sparkles
    window.addEventListener('mousemove', (e) => {
        if (!isWarmMode) return;

        // simple throttle to prevent too many DOM nodes
        const now = Date.now();
        if (now - sparkleLastTime < 30) return;
        sparkleLastTime = now;

        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = `${e.clientX}px`;
        sparkle.style.top = `${e.clientY}px`;
        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1500);
    });

    // Function to spawn a shooting star
    function spawnShootingStar() {
        if (!isWarmMode) return;
        const star = document.createElement('div');
        star.classList.add('shooting-star');
        // Spawn from top half of screen
        star.style.top = `${Math.random() * 50}vh`;
        star.style.left = `-150px`; // start off screen left
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 1000); // match animation duration
    }

    // Function to stop warm mode
    function stopWarmMode() {
        isWarmMode = false;
        document.body.classList.remove('warm-active');
        if (shootingStarInterval) {
            clearInterval(shootingStarInterval);
            shootingStarInterval = null;
        }
    }

    letters.forEach(letter => {
        letter.addEventListener('click', () => {
            const id = letter.getAttribute('data-id');
            modalText.innerText = messagesData[id] || "Message not found.";
            modal.classList.remove('hidden');

            if (id === 'scared') {
                isWarmMode = true;
                document.body.classList.add('warm-active');
                // Spawn one immediately, then every 5 seconds
                spawnShootingStar();
                shootingStarInterval = setInterval(spawnShootingStar, 5000);
            } else {
                stopWarmMode();
            }
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        stopWarmMode();
    });

    // Close modal on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            stopWarmMode();
        }
    });


    // --- "Future" Timeline Scroll behavior ---
    const timelineContainer = document.querySelector('.timeline-container');
    // Enable horizontal scroll using mouse wheel
    timelineContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        timelineContainer.scrollLeft += e.deltaY; // map vertical scroll to horizontal
    });


    // --- Polaroid Logic ---
    const polaroids = document.querySelectorAll('.polaroid');
    polaroids.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

});
