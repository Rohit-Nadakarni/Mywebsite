// Import cookie utilities
import { setCookie, getCookie, removeCookie } from './cookie-utils.js';

// Global music state
let isMusicPlaying = false;
const musicVolume = 0.8; // 80% volume

// Toggle background music on/off
function toggleMusic() {
    const backgroundMusic = document.getElementById('background-music');
    const musicButton = document.querySelector('.music-toggle');
    
    if (!backgroundMusic || !musicButton) return;
    
    if (isMusicPlaying) {
        // Pause the music
        backgroundMusic.pause();
        musicButton.classList.remove('playing');
        musicButton.innerHTML = '<i class="fas fa-music"></i>';
        setCookie('musicPlaying', false);
        setCookie('musicPosition', backgroundMusic.currentTime);
    } else {
        // Play the music
        backgroundMusic.volume = musicVolume;
        const savedPosition = parseFloat(getCookie('musicPosition') || '0');
        
        // Only set current time if it's a valid position
        if (savedPosition > 0 && !isNaN(savedPosition)) {
            try {
                backgroundMusic.currentTime = savedPosition;
            } catch (e) {
                console.log('Could not set music position:', e);
            }
        }
        
        backgroundMusic.play()
            .then(() => {
                console.log('Music started successfully');
                setCookie('musicPlaying', true);
            })
            .catch(error => {
                console.error('Error playing music:', error);
            });
        musicButton.classList.add('playing');
        musicButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    
    isMusicPlaying = !isMusicPlaying;
}

// Initialize music button state
function initMusicButton() {
    const musicButton = document.querySelector('.music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    
    if (!musicButton || !backgroundMusic) return;
    
    // Set initial state
    musicButton.innerHTML = '<i class="fas fa-music"></i>';
    musicButton.classList.remove('playing');
    
    // Save music position every second while playing
    setInterval(() => {
        if (isMusicPlaying && backgroundMusic) {
            setCookie('musicPosition', backgroundMusic.currentTime);
        }
    }, 1000);
    
    // Check if music was playing before
    if (getCookie('musicPlaying') === true) {
        // Get position from localStorage
        const savedPosition = parseFloat(getCookie('musicPosition') || '0');
        
        // Only set current time if it's a valid position
        if (savedPosition > 0 && !isNaN(savedPosition)) {
            try {
                backgroundMusic.currentTime = savedPosition;
            } catch (e) {
                console.log('Could not set music position:', e);
            }
        }
        
        backgroundMusic.volume = musicVolume;
        
        // Attempt to play
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                musicButton.classList.add('playing');
                musicButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            }).catch(error => {
                console.error('Could not autoplay music:', error);
                // Reset state since autoplay failed
                isMusicPlaying = false;
                setCookie('musicPlaying', false);
            });
        }
    }
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && backgroundMusic && isMusicPlaying) {
            // Page is hidden, save position
            setCookie('musicPosition', backgroundMusic.currentTime);
            setCookie('musicPlaying', true);
        } else if (document.visibilityState === 'visible') {
            // Page is visible again, check if we should resume
            if (getCookie('musicPlaying') === true && !isMusicPlaying && backgroundMusic) {
                const savedPosition = parseFloat(getCookie('musicPosition') || '0');
                if (savedPosition > 0 && !isNaN(savedPosition)) {
                    try {
                        backgroundMusic.currentTime = savedPosition;
                    } catch (e) {
                        console.log('Could not set music position:', e);
                    }
                }
                
                backgroundMusic.play().then(() => {
                    isMusicPlaying = true;
                    musicButton.classList.add('playing');
                    musicButton.innerHTML = '<i class="fas fa-volume-up"></i>';
                }).catch(e => console.log('Could not resume music:', e));
            }
        }
    });
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference to cookies
    const isDarkMode = document.body.classList.contains('dark-mode');
    setCookie('darkMode', isDarkMode);
    
    // Update toggle icon
    const darkModeToggle = document.querySelector('.dark-mode-toggle i');
    if (darkModeToggle) {
        darkModeToggle.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for dark mode and music toggle
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const musicToggle = document.querySelector('.music-toggle');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    // Initialize music button state
    initMusicButton();
    
    // Page transition effect
    document.body.classList.add('fade-in');
    
    // Handle page transitions
    document.querySelectorAll('a[href^="index"], a[href^="about"], a[href^="portfolio"], a[href^="tools"], a[href^="contact"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const target = this.href;
            
            // Only handle internal navigation
            if (target.includes(window.location.host)) {
                e.preventDefault();
                
                // If music is playing, save the state but don't restart on the next page
                if (isMusicPlaying) {
                    const backgroundMusic = document.getElementById('background-music');
                    if (backgroundMusic) {
                        setCookie('musicPlaying', true);
                        setCookie('musicPosition', backgroundMusic.currentTime);
                    }
                }
                
                // Add fade-out animation
                document.body.classList.add('fade-out');
                
                // Navigate after animation completes
                setTimeout(() => {
                    window.location.href = target;
                }, 500);
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
            
            window.scrollTo({
                top: targetSection.offsetTop - 80, // Account for header height
                behavior: 'smooth'
            });
        });
    });
    
    // Tool modal functionality
    const toolCards = document.querySelectorAll('.tool-card');
    const toolModalOverlay = document.getElementById('tool-modal-overlay');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const toolModalTitle = document.getElementById('tool-modal-title');
    const toolContents = document.querySelectorAll('.tool-content');
    
    // Open tool modal when clicking on a tool card
    toolCards.forEach(card => {
        const openBtn = card.querySelector('.open-tool-btn');
        if (openBtn && !openBtn.disabled) {
            openBtn.addEventListener('click', () => {
                const toolId = openBtn.getAttribute('data-tool');
                const toolName = card.querySelector('h2').textContent;
                
                openToolModal(toolId, toolName);
            });
        }
    });
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeToolModal);
    }
    
    // Close modal on overlay click
    if (toolModalOverlay) {
        toolModalOverlay.addEventListener('click', event => {
            if (event.target === toolModalOverlay) {
                closeToolModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && toolModalOverlay && toolModalOverlay.classList.contains('active')) {
            closeToolModal();
        }
    });
    
    function openToolModal(toolId, toolName) {
        if (!toolModalTitle || !toolModalOverlay) return;
        
        // Update modal title
        toolModalTitle.textContent = toolName;
        
        // Hide all tool content panels
        toolContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the selected tool content
        const selectedTool = document.getElementById(`${toolId}-tool`);
        if (selectedTool) {
            selectedTool.classList.add('active');
        }
        
        // Show modal
        toolModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Initialize specific tool if needed
        initializeTool(toolId);
    }
    
    function closeToolModal() {
        if (!toolModalOverlay) return;
        
        toolModalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Enable scrolling
    }
    
    function initializeTool(toolId) {
        switch(toolId) {
            case 'pomodoro':
                initPomodoro();
                break;
            case 'todo':
                initTodoList();
                break;
            case 'notes':
                initNotes();
                break;
            case 'habit':
                initHabitTracker();
                break;
            case 'password':
                initPasswordGenerator();
                break;
            case 'unit':
                initUnitConverter();
                break;
            case 'music':
                initFocusMusic();
                break;
            case 'quote':
                initQuoteGenerator();
                break;
        }
    }
    
    // ===== POMODORO TIMER =====
    function initPomodoro() {
        // Timer elements
        const timerDisplay = document.getElementById('timer');
        const pomodoroLabel = document.getElementById('pomodoro-label');
        const taskDisplay = document.getElementById('task-display');
        const currentTaskInput = document.getElementById('current-task');
        const startTimerBtn = document.getElementById('start-timer');
        const pauseTimerBtn = document.getElementById('pause-timer');
        const resetTimerBtn = document.getElementById('reset-timer');
        const focusCountDisplay = document.getElementById('focus-count');
        const totalFocusTimeDisplay = document.getElementById('total-focus-time');
        
        // Mode buttons
        const modeBtns = document.querySelectorAll('.pomodoro-mode-btn');
        
        // Timer settings
        const focusTimeDisplay = document.getElementById('focus-time');
        const shortBreakTimeDisplay = document.getElementById('short-break-time');
        const longBreakTimeDisplay = document.getElementById('long-break-time');
        const cyclesDisplay = document.getElementById('pomodoro-cycles');
        
        // Setting buttons
        const settingBtns = document.querySelectorAll('.setting-btn');
        
        // Toggle settings
        const autoStartBreaksToggle = document.getElementById('auto-start-breaks');
        const autoStartPomodorosToggle = document.getElementById('auto-start-pomodoros');
        const soundNotificationsToggle = document.getElementById('sound-notifications');
        
        // Check if timer elements are present
        if (!timerDisplay) return;
        
        // Timer state
        let timerInterval = null;
        let sessionCount = 0;
        let totalFocusMinutes = 0;
        let currentCycle = 0;
        
        // Timer settings
        let settings = {
            focus: 25,
            shortBreak: 5,
            longBreak: 15,
            cycles: 4,
            autoStartBreaks: false, // Default value
            autoStartPomodoros: false, // Default value
            soundNotifications: true // Default value (as per HTML)
        };
        
        // Timer mode
        let currentMode = 'focus';
        let isRunning = false;
        let timeLeft = settings.focus * 60;
        let totalTime = timeLeft;
        
        // Load from cookies if available
        const savedSettings = getCookie('pomodoroSettings');
        if (savedSettings) {
            try {
                settings = {...settings, ...savedSettings};
            } catch (e) {
                console.error('Failed to load pomodoro settings:', e);
            }
        }
        
        // Apply loaded toggle settings to checkboxes
        if (autoStartBreaksToggle) autoStartBreaksToggle.checked = settings.autoStartBreaks;
        if (autoStartPomodorosToggle) autoStartPomodorosToggle.checked = settings.autoStartPomodoros;
        if (soundNotificationsToggle) soundNotificationsToggle.checked = settings.soundNotifications;
        
        // Load session stats if available
        const savedStats = getCookie('pomodoroStats');
        if (savedStats) {
            try {
                sessionCount = savedStats.sessionCount || 0;
                totalFocusMinutes = savedStats.totalFocusMinutes || 0;
                currentCycle = savedStats.currentCycle || 0;
                
                // Update stats display
                if (focusCountDisplay) focusCountDisplay.textContent = sessionCount;
                if (totalFocusTimeDisplay) totalFocusTimeDisplay.textContent = `${totalFocusMinutes} min`;
            } catch (e) {
                console.error('Failed to load pomodoro stats:', e);
            }
        }
        
        // Initialize circular progress
        const circle = document.querySelector('.timer-progress-ring');
        if (circle) {
            const radius = parseInt(circle.getAttribute('r'));
            const circumference = radius * 2 * Math.PI;
            
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference;
        }
        
        // Update settings displays
        function updateSettingsDisplay() {
            if (focusTimeDisplay) focusTimeDisplay.textContent = settings.focus;
            if (shortBreakTimeDisplay) shortBreakTimeDisplay.textContent = settings.shortBreak;
            if (longBreakTimeDisplay) longBreakTimeDisplay.textContent = settings.longBreak;
            if (cyclesDisplay) cyclesDisplay.textContent = settings.cycles;
        }
        
        // Update timer display
        function updateTimerDisplay() {
            if (!timerDisplay) return;
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update progress ring
            updateCircularProgress();
            
            // Update document title
            document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
        }
        
        // Update circular progress
        function updateCircularProgress() {
            const circle = document.querySelector('.timer-progress-ring');
            if (!circle) return;
            
            const radius = parseInt(circle.getAttribute('r'));
            const circumference = radius * 2 * Math.PI;
            const progressFraction = 1 - (timeLeft / totalTime);
            const offset = circumference - (progressFraction * circumference);
            
            circle.style.strokeDashoffset = offset;
        }
        
        // Set timer mode
        function setTimerMode(mode) {
            currentMode = mode;
            
            // Clear any existing interval
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Reset buttons
            if (startTimerBtn) startTimerBtn.disabled = false;
            if (pauseTimerBtn) pauseTimerBtn.disabled = true;
            
            // Set timer duration based on mode
            switch (mode) {
                case 'focus':
                    timeLeft = settings.focus * 60;
                    if (pomodoroLabel) pomodoroLabel.textContent = 'FOCUS TIME';
                    break;
                case 'shortBreak':
                    timeLeft = settings.shortBreak * 60;
                    if (pomodoroLabel) pomodoroLabel.textContent = 'SHORT BREAK';
                    break;
                case 'longBreak':
                    timeLeft = settings.longBreak * 60;
                    if (pomodoroLabel) pomodoroLabel.textContent = 'LONG BREAK';
                    break;
            }
            
            totalTime = timeLeft;
            isRunning = false;
            
            // Update mode buttons
            modeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
            });
            
            // Update displays
            updateTimerDisplay();
        }
        
        // Start timer
        function startPomodoro() {
            if (isRunning) return;
            
            isRunning = true;
            
            if (startTimerBtn) startTimerBtn.disabled = true;
            if (pauseTimerBtn) pauseTimerBtn.disabled = false;
            
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    // Timer completed
                    clearInterval(timerInterval);
                    timerCompleted();
                }
            }, 1000);
        }
        
        // Pause timer
        function pausePomodoro() {
            if (!isRunning) return;
            
            isRunning = false;
            clearInterval(timerInterval);
            
            if (startTimerBtn) startTimerBtn.disabled = false;
            if (pauseTimerBtn) pauseTimerBtn.disabled = true;
        }
        
        // Reset timer
        function resetPomodoro() {
            pausePomodoro();
            
            // Reset to current mode's full time
            switch (currentMode) {
                case 'focus':
                    timeLeft = settings.focus * 60;
                    break;
                case 'shortBreak':
                    timeLeft = settings.shortBreak * 60;
                    break;
                case 'longBreak':
                    timeLeft = settings.longBreak * 60;
                    break;
            }
            
            totalTime = timeLeft;
            updateTimerDisplay();
        }
        
        // Timer completed
        function timerCompleted() {
            // Play sound notification if enabled
            if (settings.soundNotifications) {
                playNotificationSound();
            }
            
            // Update stats if focus session completed
            if (currentMode === 'focus') {
                sessionCount++;
                totalFocusMinutes += settings.focus;
                
                // Update stats display
                if (focusCountDisplay) focusCountDisplay.textContent = sessionCount;
                if (totalFocusTimeDisplay) totalFocusTimeDisplay.textContent = `${totalFocusMinutes} min`;
                
                // Save stats to cookies
                saveSettings();
                
                // Determine next timer mode
                currentCycle++;
                
                if (currentCycle >= settings.cycles) {
                    // After completing the set number of cycles, take a long break
                    currentCycle = 0;
                    
                    if (settings.autoStartBreaks) {
                        setTimerMode('longBreak');
                        startPomodoro();
                    } else {
                        setTimerMode('longBreak');
                    }
                } else {
                    // Otherwise take a short break
                    if (settings.autoStartBreaks) {
                        setTimerMode('shortBreak');
                        startPomodoro();
                    } else {
                        setTimerMode('shortBreak');
                    }
                }
            } else {
                // After a break, start a new focus session
                if (settings.autoStartPomodoros) {
                    setTimerMode('focus');
                    startPomodoro();
                } else {
                    setTimerMode('focus');
                }
            }
        }
        
        // Play notification sound
        function playNotificationSound() {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-2568.mp3');
            audio.volume = 0.7;
            audio.play().catch(e => console.log('Error playing sound:', e));
        }
        
        // Save settings and stats to cookies
        function saveSettings() {
            // Update settings object with current toggle states before saving
            if (autoStartBreaksToggle) settings.autoStartBreaks = autoStartBreaksToggle.checked;
            if (autoStartPomodorosToggle) settings.autoStartPomodoros = autoStartPomodorosToggle.checked;
            if (soundNotificationsToggle) settings.soundNotifications = soundNotificationsToggle.checked;

            setCookie('pomodoroSettings', settings);
            
            const stats = {
                sessionCount: sessionCount,
                totalFocusMinutes: totalFocusMinutes,
                currentCycle: currentCycle
            };
            setCookie('pomodoroStats', stats);
        }
        
        // Update task display
        function updateTaskDisplay() {
            if (currentTaskInput && taskDisplay) {
                const taskText = currentTaskInput.value.trim();
                taskDisplay.textContent = taskText || 'No task set';
            }
        }
        
        // Event listeners for mode buttons
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setTimerMode(btn.getAttribute('data-mode'));
            });
        });
        
        // Event listeners for settings buttons
        settingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const setting = btn.getAttribute('data-setting');
                const change = btn.classList.contains('plus') ? 1 : -1;
                changeSetting(setting, change);
            });
        });
        
        // Timer control buttons
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', startPomodoro);
        }
        
        if (pauseTimerBtn) {
            pauseTimerBtn.addEventListener('click', pausePomodoro);
        }
        
        if (resetTimerBtn) {
            resetTimerBtn.addEventListener('click', resetPomodoro);
        }
        
        // Task input
        if (currentTaskInput) {
            currentTaskInput.addEventListener('input', updateTaskDisplay);
            currentTaskInput.addEventListener('change', updateTaskDisplay);
        }
        
        // Event listeners for toggle switches
        if (autoStartBreaksToggle) {
            autoStartBreaksToggle.addEventListener('change', saveSettings);
        }
        if (autoStartPomodorosToggle) {
            autoStartPomodorosToggle.addEventListener('change', saveSettings);
        }
        if (soundNotificationsToggle) {
            soundNotificationsToggle.addEventListener('change', saveSettings);
        }
        
        // Initialize
        updateSettingsDisplay();
        setTimerMode('focus');
        updateTaskDisplay();
    }
    
    // ===== TO-DO LIST =====
    function initTodoList() {
        const todoInput = document.getElementById('todo-input');
        const addTodoBtn = document.getElementById('add-todo');
        const todoList = document.getElementById('todo-list');
        let todos = getCookie('todos') || [];
        
        if (!todoList) return;
        
        function renderTodos() {
            todoList.innerHTML = '';
            
            todos.forEach((todo, index) => {
                const li = document.createElement('li');
                li.className = todo.completed ? 'completed' : '';
                
                const todoText = document.createElement('span');
                todoText.textContent = todo.text;
                
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'todo-actions';
                
                const completeBtn = document.createElement('button');
                completeBtn.innerHTML = todo.completed ? '<i class="fas fa-undo"></i>' : '<i class="fas fa-check"></i>';
                completeBtn.title = todo.completed ? 'Mark as incomplete' : 'Mark as complete';
                completeBtn.addEventListener('click', () => toggleTodoComplete(index));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.title = 'Delete';
                deleteBtn.addEventListener('click', () => deleteTodo(index));
                
                actionsDiv.appendChild(completeBtn);
                actionsDiv.appendChild(deleteBtn);
                
                li.appendChild(todoText);
                li.appendChild(actionsDiv);
                todoList.appendChild(li);
            });
            
            // Save to cookies
            setCookie('todos', todos);
            
            // Update stats
            updateTodoStats();
        }
        
        function updateTodoStats() {
            const totalEl = document.getElementById('tasks-total');
            const completedEl = document.getElementById('tasks-completed');
            const remainingEl = document.getElementById('tasks-remaining');
            
            if (totalEl) totalEl.textContent = todos.length;
            if (completedEl) completedEl.textContent = todos.filter(todo => todo.completed).length;
            if (remainingEl) remainingEl.textContent = todos.filter(todo => !todo.completed).length;
        }
        
        function addTodo() {
            if (!todoInput || !todoInput.value.trim()) return;
            
            todos.push({
                text: todoInput.value.trim(),
                completed: false
            });
            
            todoInput.value = '';
            renderTodos();
        }
        
        function toggleTodoComplete(index) {
            todos[index].completed = !todos[index].completed;
            renderTodos();
        }
        
        function deleteTodo(index) {
            todos.splice(index, 1);
            renderTodos();
        }
        
        if (addTodoBtn) {
            addTodoBtn.addEventListener('click', addTodo);
        }
        
        if (todoInput) {
            todoInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') addTodo();
            });
        }
        
        // Initialize
        renderTodos();
    }
    
    // ===== NOTES APP =====
    function initNotes() {
        const newNoteBtn = document.getElementById('new-note');
        const saveNoteBtn = document.getElementById('save-note');
        const notesList = document.getElementById('notes-list');
        const noteTitle = document.getElementById('note-title');
        const noteContent = document.getElementById('note-content');
        let notes = getCookie('notes') || [];
        let currentNoteIndex = -1;
        
        if (!notesList || !noteTitle || !noteContent) return;
        
        function renderNotesList() {
            // Clear options except the default one
            while (notesList.options.length > 1) {
                notesList.remove(1);
            }
            
            // Add notes to select
            notes.forEach((note, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = note.title || 'Untitled Note';
                notesList.appendChild(option);
            });
            
            // Save to cookies
            setCookie('notes', notes);
        }
        
        function createNewNote() {
            noteTitle.value = '';
            noteContent.value = '';
            currentNoteIndex = -1;
            notesList.selectedIndex = 0;
        }
        
        function saveNote() {
            const title = noteTitle.value.trim() || 'Untitled Note';
            const content = noteContent.value.trim();
            
            if (currentNoteIndex >= 0) {
                // Update existing note
                notes[currentNoteIndex] = { title, content };
            } else {
                // Create new note
                notes.push({ title, content });
                currentNoteIndex = notes.length - 1;
            }
            
            renderNotesList();
            notesList.value = currentNoteIndex;
            
            // Show confirmation
            alert('Note saved!');
        }
        
        function loadNote() {
            const selectedIndex = parseInt(notesList.value);
            
            if (isNaN(selectedIndex) || selectedIndex < 0) {
                createNewNote();
                return;
            }
            
            const note = notes[selectedIndex];
            noteTitle.value = note.title;
            noteContent.value = note.content;
            currentNoteIndex = selectedIndex;
        }
        
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', createNewNote);
        }
        
        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', saveNote);
        }
        
        if (notesList) {
            notesList.addEventListener('change', loadNote);
        }
        
        // Initialize
        renderNotesList();
    }
    
    // Portfolio filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                const filter = button.getAttribute('data-filter');
                
                // Filter portfolio items
                portfolioItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        // Add animation
                        item.style.animation = 'fadeIn 0.5s forwards';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Portfolio modal functionality
    const viewProjectLinks = document.querySelectorAll('.view-project');
    const portfolioModal = document.querySelector('.portfolio-modal');
    const modalClose = document.querySelector('.modal-close');
    
    if (viewProjectLinks.length > 0 && portfolioModal) {
        viewProjectLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get project details from the parent portfolio item
                const portfolioItem = this.closest('.portfolio-item');
                const title = portfolioItem.querySelector('.portfolio-details h3').textContent;
                const image = portfolioItem.querySelector('.portfolio-image img').src;
                const description = portfolioItem.querySelector('.portfolio-details p').textContent;
                const techStackItems = portfolioItem.querySelectorAll('.tech-stack span');
                
                // Update modal content
                portfolioModal.querySelector('.modal-title').textContent = title;
                portfolioModal.querySelector('.modal-image img').src = image;
                portfolioModal.querySelector('.modal-image img').alt = title;
                portfolioModal.querySelector('.modal-description p').textContent = description;
                
                // Update tech stack
                const modalTechStack = portfolioModal.querySelector('.modal-description .tech-stack');
                modalTechStack.innerHTML = '';
                techStackItems.forEach(item => {
                    modalTechStack.appendChild(item.cloneNode(true));
                });
                
                // Sample features - in a real scenario, these would come from a data source
                const featureList = portfolioModal.querySelector('.feature-list');
                featureList.innerHTML = `
                    <li>Responsive design for all devices</li>
                    <li>User-friendly interface</li>
                    <li>Fast performance</li>
                    <li>Secure authentication</li>
                `;
                
                // Show modal
                portfolioModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        // Close modal
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                portfolioModal.classList.remove('active');
                document.body.style.overflow = 'auto'; // Enable scrolling
            });
        }
        
        // Close modal when clicking outside
        portfolioModal.addEventListener('click', (e) => {
            if (e.target === portfolioModal) {
                portfolioModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && portfolioModal.classList.contains('active')) {
                portfolioModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // In a real website, you would send this data to a server
            // For now, we'll just show a success message
            alert(`Thank you, ${name}! Your message has been received. We'll get back to you soon.`);
            contactForm.reset();
        });
    }
    
    // Email validation helper function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Check if dark mode is enabled in cookies
    const isDarkMode = getCookie('darkMode') === true;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        
        // Update toggle icon
        const darkModeToggle = document.querySelector('.dark-mode-toggle i');
        if (darkModeToggle) {
            darkModeToggle.className = 'fas fa-sun';
        }
    }
    
    // ===== HABIT TRACKER =====
    function initHabitTracker() {
        const habitInput = document.getElementById('habit-input');
        const addHabitBtn = document.getElementById('add-habit');
        const habitList = document.getElementById('habit-list');
        let habits = getCookie('habits') || [];
        
        if (!habitList) return;
        
        function renderHabits() {
            habitList.innerHTML = '';
            
            habits.forEach((habit, index) => {
                const row = document.createElement('div');
                row.className = 'habit-row';
                
                const nameCol = document.createElement('div');
                nameCol.className = 'habit-name-col';
                nameCol.textContent = habit.name;
                
                const daysCol = document.createElement('div');
                daysCol.className = 'habit-days';
                
                // Create 7 day checkboxes
                for (let i = 0; i < 7; i++) {
                    const dayWrapper = document.createElement('div');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = habit.days && habit.days[i];
                    checkbox.addEventListener('change', () => {
                        if (!habit.days) habit.days = Array(7).fill(false);
                        habit.days[i] = checkbox.checked;
                        setCookie('habits', habits);
                    });
                    dayWrapper.appendChild(checkbox);
                    daysCol.appendChild(dayWrapper);
                }
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'habit-delete-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.addEventListener('click', () => {
                    habits.splice(index, 1);
                    renderHabits();
                    setCookie('habits', habits);
                });
                
                row.appendChild(nameCol);
                row.appendChild(daysCol);
                row.appendChild(deleteBtn);
                habitList.appendChild(row);
            });
            
            // Save to cookies
            setCookie('habits', habits);
        }
        
        function addHabit() {
            if (!habitInput || !habitInput.value.trim()) return;
            
            habits.push({
                name: habitInput.value.trim(),
                days: Array(7).fill(false)
            });
            
            habitInput.value = '';
            renderHabits();
        }
        
        if (addHabitBtn) {
            addHabitBtn.addEventListener('click', addHabit);
        }
        
        if (habitInput) {
            habitInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') addHabit();
            });
        }
        
        // Initialize
        renderHabits();
    }
    
    // ===== PASSWORD GENERATOR =====
    function initPasswordGenerator() {
        const lengthInput = document.getElementById('password-length');
        const lengthValue = document.getElementById('length-value');
        const uppercaseCheck = document.getElementById('uppercase');
        const lowercaseCheck = document.getElementById('lowercase');
        const numbersCheck = document.getElementById('numbers');
        const symbolsCheck = document.getElementById('symbols');
        const generateBtn = document.getElementById('generate-password');
        const passwordResult = document.getElementById('password-result');
        const copyBtn = document.getElementById('copy-password');
        
        if (!passwordResult) return;
        
        // Character sets
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Update length value display
        if (lengthInput && lengthValue) {
            lengthInput.addEventListener('input', () => {
                lengthValue.textContent = lengthInput.value;
            });
        }
        
        function generatePassword() {
            const length = parseInt(lengthInput.value);
            let chars = '';
            
            if (uppercaseCheck.checked) chars += uppercaseChars;
            if (lowercaseCheck.checked) chars += lowercaseChars;
            if (numbersCheck.checked) chars += numberChars;
            if (symbolsCheck.checked) chars += symbolChars;
            
            if (chars === '') {
                alert('Please select at least one character type!');
                return;
            }
            
            let password = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                password += chars[randomIndex];
            }
            
            passwordResult.value = password;
        }
        
        function copyPassword() {
            if (!passwordResult.value) {
                alert('Generate a password first!');
                return;
            }
            
            passwordResult.select();
            document.execCommand('copy');
            
            // Show "Copied" notification
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 1500);
        }
        
        if (generateBtn) {
            generateBtn.addEventListener('click', generatePassword);
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', copyPassword);
        }
        
        // Generate a password on init
        if (generateBtn) {
            generatePassword();
        }
    }
    
    // ===== UNIT CONVERTER =====
    function initUnitConverter() {
        const unitTypeButtons = document.querySelectorAll('.unit-type-btn');
        const unitInput = document.getElementById('unit-input');
        const unitOutput = document.getElementById('unit-output');
        const unitFromSelect = document.getElementById('unit-from');
        const unitToSelect = document.getElementById('unit-to');
        const swapBtn = document.getElementById('swap-units');
        
        if (!unitInput || !unitOutput || !unitFromSelect || !unitToSelect) return;
        
        // Conversion data
        const conversionData = {
            length: {
                units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
                labels: ['Millimeters', 'Centimeters', 'Meters', 'Kilometers', 'Inches', 'Feet', 'Yards', 'Miles'],
                // Base unit is meters
                toBase: [0.001, 0.01, 1, 1000, 0.0254, 0.3048, 0.9144, 1609.34],
                fromBase: [1000, 100, 1, 0.001, 39.3701, 3.28084, 1.09361, 0.000621371]
            },
            weight: {
                units: ['mg', 'g', 'kg', 'oz', 'lb', 'st', 't'],
                labels: ['Milligrams', 'Grams', 'Kilograms', 'Ounces', 'Pounds', 'Stone', 'Tons'],
                // Base unit is grams
                toBase: [0.001, 1, 1000, 28.3495, 453.592, 6350.29, 1000000],
                fromBase: [1000, 1, 0.001, 0.03527396, 0.00220462, 0.000157473, 0.000001]
            },
            temperature: {
                units: ['C', 'F', 'K'],
                labels: ['Celsius', 'Fahrenheit', 'Kelvin'],
                // Special conversion handled separately
                toBase: [1, 1, 1],
                fromBase: [1, 1, 1]
            }
        };
        
        let currentType = 'length';
        
        function updateUnitSelects() {
            unitFromSelect.innerHTML = '';
            unitToSelect.innerHTML = '';
            
            const data = conversionData[currentType];
            
            data.units.forEach((unit, index) => {
                const optionFrom = document.createElement('option');
                optionFrom.value = index;
                optionFrom.textContent = data.labels[index];
                unitFromSelect.appendChild(optionFrom);
                
                const optionTo = document.createElement('option');
                optionTo.value = index;
                optionTo.textContent = data.labels[index];
                unitToSelect.appendChild(optionTo);
            });
            
            // Default selections
            unitFromSelect.selectedIndex = 0;
            unitToSelect.selectedIndex = 1;
            
            convertUnits();
        }
        
        function convertUnits() {
            if (!unitInput.value) {
                unitOutput.value = '';
                return;
            }
            
            const value = parseFloat(unitInput.value);
            if (isNaN(value)) {
                unitOutput.value = 'Invalid input';
                return;
            }
            
            const fromIndex = parseInt(unitFromSelect.value);
            const toIndex = parseInt(unitToSelect.value);
            
            if (currentType === 'temperature') {
                unitOutput.value = convertTemperature(value, fromIndex, toIndex);
                return;
            }
            
            const data = conversionData[currentType];
            const baseValue = value * data.toBase[fromIndex];
            const result = baseValue * data.fromBase[toIndex];
            
            unitOutput.value = result.toFixed(6).replace(/\.?0+$/, '');
        }
        
        function convertTemperature(value, fromUnit, toUnit) {
            // 0: Celsius, 1: Fahrenheit, 2: Kelvin
            let celsius;
            
            switch (fromUnit) {
                case 0: // From Celsius
                    celsius = value;
                    break;
                case 1: // From Fahrenheit
                    celsius = (value - 32) * 5/9;
                    break;
                case 2: // From Kelvin
                    celsius = value - 273.15;
                    break;
            }
            
            switch (toUnit) {
                case 0: // To Celsius
                    return celsius.toFixed(2);
                case 1: // To Fahrenheit
                    return ((celsius * 9/5) + 32).toFixed(2);
                case 2: // To Kelvin
                    return (celsius + 273.15).toFixed(2);
            }
        }
        
        function swapUnits() {
            const temp = unitFromSelect.value;
            unitFromSelect.value = unitToSelect.value;
            unitToSelect.value = temp;
            convertUnits();
        }
        
        // Event listeners
        unitTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                unitTypeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentType = button.getAttribute('data-type');
                updateUnitSelects();
            });
        });
        
        if (unitInput) {
            unitInput.addEventListener('input', convertUnits);
        }
        
        if (unitFromSelect) {
            unitFromSelect.addEventListener('change', convertUnits);
        }
        
        if (unitToSelect) {
            unitToSelect.addEventListener('change', convertUnits);
        }
        
        if (swapBtn) {
            swapBtn.addEventListener('click', swapUnits);
        }
        
        // Initialize
        updateUnitSelects();
    }
    
    // ===== FOCUS MUSIC PLAYER =====
    function initFocusMusic() {
        const musicTitle = document.getElementById('music-title');
        const musicCategory = document.getElementById('music-category');
        const prevTrackBtn = document.getElementById('prev-track');
        const playMusicBtn = document.getElementById('play-music');
        const nextTrackBtn = document.getElementById('next-track');
        const volumeSlider = document.getElementById('music-volume');
        const categoryButtons = document.querySelectorAll('.music-category-btn');
        
        const audioPlayer = new Audio();
        let isPlaying = false;
        let currentTrackIndex = 0;
        let currentCategory = 'ambient';
        
        // Music tracks data structure
        const musicLibrary = {
            ambient: [
                { title: "Dancing at the Table (1)", file: "music/ambient/Dancing at the Table (1).mp3" },
                { title: "Eternal Serenade", file: "music/ambient/Eternal Serenade.mp3" }
            ],
            nature: [
                { title: "Dancing at the Table", file: "music/nature/Dancing at the Table.mp3" }
            ],
            lofi: [
                { title: "Eternal Serenade (1)", file: "music/lofi/Eternal Serenade (1).mp3" }
            ]
        };
        
        function loadTrack() {
            const track = musicLibrary[currentCategory][currentTrackIndex];
            audioPlayer.src = track.file;
            
            if (musicTitle) musicTitle.textContent = track.title;
            if (musicCategory) musicCategory.textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
            
            // Set volume
            if (volumeSlider) {
                audioPlayer.volume = parseFloat(volumeSlider.value) / 100;
            }
            
            // Play if it was playing before
            if (isPlaying) {
                playMusic();
            }
        }
        
        function playMusic() {
            audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                    if (playMusicBtn) {
                        playMusicBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        playMusicBtn.classList.add('playing');
                    }
                })
                .catch(error => {
                    console.error('Error playing music:', error);
                    alert('Failed to play music. Please select a different track.');
                });
        }
        
        function pauseMusic() {
            audioPlayer.pause();
            isPlaying = false;
            if (playMusicBtn) {
                playMusicBtn.innerHTML = '<i class="fas fa-play"></i>';
                playMusicBtn.classList.remove('playing');
            }
        }
        
        function togglePlayPause() {
            if (isPlaying) {
                pauseMusic();
            } else {
                playMusic();
            }
        }
        
        function prevTrack() {
            currentTrackIndex--;
            if (currentTrackIndex < 0) {
                currentTrackIndex = musicLibrary[currentCategory].length - 1;
            }
            loadTrack();
        }
        
        function nextTrack() {
            currentTrackIndex++;
            if (currentTrackIndex >= musicLibrary[currentCategory].length) {
                currentTrackIndex = 0;
            }
            loadTrack();
        }
        
        function changeCategory(category) {
            currentCategory = category;
            currentTrackIndex = 0;
            
            // Update category buttons
            categoryButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-category') === category);
            });
            
            loadTrack();
        }
        
        // Event listeners
        if (playMusicBtn) {
            playMusicBtn.addEventListener('click', togglePlayPause);
        }
        
        if (prevTrackBtn) {
            prevTrackBtn.addEventListener('click', prevTrack);
        }
        
        if (nextTrackBtn) {
            nextTrackBtn.addEventListener('click', nextTrack);
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                audioPlayer.volume = parseFloat(volumeSlider.value) / 100;
            });
        }
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                changeCategory(button.getAttribute('data-category'));
            });
        });
        
        // Handle audio events
        audioPlayer.addEventListener('ended', nextTrack);
        
        // Initialize
        loadTrack();
    }
    
    // ===== QUOTE GENERATOR =====
    function initQuoteGenerator() {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        const newQuoteBtn = document.getElementById('new-quote');
        const shareQuoteBtn = document.getElementById('share-quote');
        const categoryButtons = document.querySelectorAll('.quote-category-btn');
        
        let currentCategory = 'motivational';
        
        // Quote collections
        const quotes = {
            motivational: [
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
                { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
            ],
            success: [
                { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
                { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
                { text: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis" },
                { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
                { text: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett" }
            ],
            wisdom: [
                { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
                { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
                { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
                { text: "What we think, we become.", author: "Buddha" },
                { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" }
            ]
        };
        
        function getRandomQuote() {
            const categoryQuotes = quotes[currentCategory];
            const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
            return categoryQuotes[randomIndex];
        }
        
        function displayQuote() {
            const quote = getRandomQuote();
            
            if (quoteText) quoteText.textContent = quote.text;
            if (quoteAuthor) quoteAuthor.textContent = `- ${quote.author}`;
        }
        
        function shareQuote() {
            if (!quoteText || !quoteAuthor) return;
            
            const twitterUrl = `https://twitter.com/intent/tweet?text="${quoteText.textContent}" ${quoteAuthor.textContent}`;
            window.open(twitterUrl, '_blank');
        }
        
        function changeCategory(category) {
            currentCategory = category;
            
            // Update category buttons
            categoryButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-category') === category);
            });
            
            displayQuote();
        }
        
        // Event listeners
        if (newQuoteBtn) {
            newQuoteBtn.addEventListener('click', displayQuote);
        }
        
        if (shareQuoteBtn) {
            shareQuoteBtn.addEventListener('click', shareQuote);
        }
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                changeCategory(button.getAttribute('data-category'));
            });
        });
        
        // Initialize
        displayQuote();
    }
});

// Optimized Typewriter effect
class TypeWriter {
    constructor(element, words, wait = 2000) {
        this.element = element;
        this.words = words;
        this.wait = parseInt(wait, 10);
        this.txt = '';
        this.wordIndex = 0;
        this.isDeleting = false;
        this.lastTxt = '';
        this.typing = true;
        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        // Only update DOM if text changed
        if (this.txt !== this.lastTxt) {
            this.element.innerHTML = `<span class="txt">${this.txt}</span>`;
            this.lastTxt = this.txt;
        }
        // Always keep the blinking cursor outside
        if (!this.element.nextSibling || !this.element.nextSibling.classList || !this.element.nextSibling.classList.contains('cursor')) {
            if (this.element.parentNode) {
                let cursor = document.createElement('span');
                cursor.className = 'cursor';
                cursor.textContent = '|';
                this.element.parentNode.insertBefore(cursor, this.element.nextSibling);
            }
        }

        let typeSpeed = 100;
        if (this.isDeleting) typeSpeed = 50;

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 600;
        }
        setTimeout(() => this.type(), typeSpeed);
    }
}

// Only one DOMContentLoaded for typewriter
(function() {
    const typewriter = document.getElementById('typewriter');
    if (typewriter) {
        const words = [
            'coder',
            'content creator',
            'aspiring entrepreneur'
        ];
        new TypeWriter(typewriter, words, 2000);
    }
})(); 