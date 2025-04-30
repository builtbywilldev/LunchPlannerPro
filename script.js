document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContent = document.querySelector('.tab-content');
    const mobileContainer = document.querySelector('.mobile-days');
    const clearWeekBtn = document.getElementById('clearWeekBtn');
    const printWeekBtn = document.getElementById('printWeekBtn');
    const saveStatus = document.getElementById('saveStatus');
    const saveStatusText = document.getElementById('saveStatusText');
    const saveStatusIcon = document.getElementById('saveStatusIcon');
    const dayTemplate = document.getElementById('day-template');
    
    // Lunch planner data structure
    const days = [
        'monday', 'tuesday', 'wednesday', 
        'thursday', 'friday', 'saturday', 'sunday'
    ];
    
    const daysFull = {
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday'
    };
    
    // Default empty plan - function to generate a fresh empty plan
    function getEmptyPlan() {
        return {
            monday: { mainMeal: '', snack: '', drink: '', notes: '' },
            tuesday: { mainMeal: '', snack: '', drink: '', notes: '' },
            wednesday: { mainMeal: '', snack: '', drink: '', notes: '' },
            thursday: { mainMeal: '', snack: '', drink: '', notes: '' },
            friday: { mainMeal: '', snack: '', drink: '', notes: '' },
            saturday: { mainMeal: '', snack: '', drink: '', notes: '' },
            sunday: { mainMeal: '', snack: '', drink: '', notes: '' }
        };
    }
    
    const emptyPlan = getEmptyPlan();
    
    // Current plan - initialize from localStorage or use a fresh empty plan
    let currentPlan = JSON.parse(localStorage.getItem('lunchPlan')) || getEmptyPlan();
    
    // Save timeout for debouncing
    let saveTimeout = null;
    
    // Initialize the UI
    function initializeUI() {
        // Setup desktop tabs
        renderTabContent('monday'); // Default to Monday
        
        // Setup mobile accordion
        renderMobileAccordion();
        
        // Add event listeners
        setupEventListeners();
    }
    
    // Render tab content for desktop view
    function renderTabContent(day) {
        tabContent.innerHTML = '';
        
        const dayPlanClone = dayTemplate.content.cloneNode(true);
        const dayPlan = currentPlan[day];
        
        const mainMealInput = dayPlanClone.querySelector('#mainMeal');
        const snackInput = dayPlanClone.querySelector('#snack');
        const drinkInput = dayPlanClone.querySelector('#drink');
        const notesInput = dayPlanClone.querySelector('#notes');
        
        mainMealInput.value = dayPlan.mainMeal;
        snackInput.value = dayPlan.snack;
        drinkInput.value = dayPlan.drink;
        notesInput.value = dayPlan.notes;
        
        // Update IDs to be unique for each day
        mainMealInput.id = `${day}-mainMeal`;
        snackInput.id = `${day}-snack`;
        drinkInput.id = `${day}-drink`;
        notesInput.id = `${day}-notes`;
        
        // Update for labels
        dayPlanClone.querySelectorAll('label').forEach(label => {
            const forAttr = label.getAttribute('for');
            label.setAttribute('for', `${day}-${forAttr}`);
        });
        
        // Add event listeners for inputs
        [mainMealInput, snackInput, drinkInput, notesInput].forEach(input => {
            input.addEventListener('input', function() {
                handleInputChange(day, input);
            });
        });
        
        tabContent.appendChild(dayPlanClone);
    }
    
    // Render mobile accordion
    function renderMobileAccordion() {
        mobileContainer.innerHTML = '';
        
        days.forEach(day => {
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.innerHTML = `
                <h3>${daysFull[day]}</h3>
                <i class="fas fa-chevron-down toggle-icon"></i>
            `;
            
            const dayContent = document.createElement('div');
            dayContent.className = 'day-content';
            
            // Clone the template content
            const dayPlanClone = dayTemplate.content.cloneNode(true);
            const dayPlan = currentPlan[day];
            
            const mainMealInput = dayPlanClone.querySelector('#mainMeal');
            const snackInput = dayPlanClone.querySelector('#snack');
            const drinkInput = dayPlanClone.querySelector('#drink');
            const notesInput = dayPlanClone.querySelector('#notes');
            
            mainMealInput.value = dayPlan.mainMeal;
            snackInput.value = dayPlan.snack;
            drinkInput.value = dayPlan.drink;
            notesInput.value = dayPlan.notes;
            
            // Update IDs to be unique for mobile
            mainMealInput.id = `mobile-${day}-mainMeal`;
            snackInput.id = `mobile-${day}-snack`;
            drinkInput.id = `mobile-${day}-drink`;
            notesInput.id = `mobile-${day}-notes`;
            
            // Update for labels
            dayPlanClone.querySelectorAll('label').forEach(label => {
                const forAttr = label.getAttribute('for');
                label.setAttribute('for', `mobile-${day}-${forAttr}`);
            });
            
            dayContent.appendChild(dayPlanClone);
            
            // Add event listeners for inputs
            [mainMealInput, snackInput, drinkInput, notesInput].forEach(input => {
                input.addEventListener('input', function() {
                    handleInputChange(day, input);
                });
            });
            
            // Toggle accordion on click
            dayHeader.addEventListener('click', function() {
                const isActive = dayContent.classList.contains('active');
                
                // Close all sections
                document.querySelectorAll('.day-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                document.querySelectorAll('.toggle-icon').forEach(icon => {
                    icon.classList.remove('active');
                });
                
                // If it wasn't active, open it
                if (!isActive) {
                    dayContent.classList.add('active');
                    dayHeader.querySelector('.toggle-icon').classList.add('active');
                }
            });
            
            daySection.appendChild(dayHeader);
            daySection.appendChild(dayContent);
            mobileContainer.appendChild(daySection);
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Tab buttons
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const day = this.dataset.day;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                renderTabContent(day);
            });
        });
        
        // Clear week button
        clearWeekBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all lunch plans for the week?')) {
                // Get a fresh empty plan
                currentPlan = getEmptyPlan();
                
                // Clear localStorage immediately
                localStorage.removeItem('lunchPlan');
                localStorage.setItem('lunchPlan', JSON.stringify(currentPlan));
                
                // Get current active day
                const activeDay = document.querySelector('.tab-btn.active').dataset.day;
                
                // Re-render UI for both views
                renderTabContent(activeDay);
                renderMobileAccordion();
                
                // Update all input fields in the desktop view
                const tabInputs = tabContent.querySelectorAll('textarea');
                tabInputs.forEach(input => {
                    input.value = '';
                });
                
                // Update all input fields in the mobile view
                const mobileInputs = mobileContainer.querySelectorAll('textarea');
                mobileInputs.forEach(input => {
                    input.value = '';
                });
                
                // Show saved status
                showSaveStatus('Week cleared successfully!');
                
                console.log('Plan cleared:', currentPlan);
            }
        });
        
        // Print week button
        printWeekBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Handle input changes, save to localStorage
    function handleInputChange(day, input) {
        const field = input.id.split('-').pop(); // Get the field name (mainMeal, snack, etc.)
        
        // Update our data structure
        currentPlan[day][field] = input.value;
        
        // Show saving status
        showSavingStatus();
        
        // Debounce the save to localStorage
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        saveTimeout = setTimeout(function() {
            localStorage.setItem('lunchPlan', JSON.stringify(currentPlan));
            showSaveStatus('All changes saved');
        }, 1000);
    }
    
    // Show saving status indicator
    function showSavingStatus() {
        saveStatus.classList.add('saving');
        saveStatusText.textContent = 'Saving changes...';
        saveStatusIcon.className = 'fas fa-sync-alt saving';
    }
    
    // Show saved status indicator
    function showSaveStatus(message) {
        saveStatus.classList.remove('saving');
        saveStatusText.textContent = message;
        saveStatusIcon.className = 'fas fa-check-circle';
    }
    
    // Initialize the application
    initializeUI();
});
