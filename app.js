// Savings Tracker Application Logic

class SavingsTracker {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
        this.initializeEventListeners();
        this.renderGoals();
    }

    initializeEventListeners() {
        // Add Goal Button
        document.getElementById('add-goal-btn').addEventListener('click', () => {
            document.getElementById('add-goal-modal').style.display = 'block';
        });

        // Close Modal Buttons
        document.querySelectorAll('.close-modal').forEach(el => {
            el.addEventListener('click', () => {
                el.closest('.modal').style.display = 'none';
            });
        });

        // New Goal Form Submission
        document.getElementById('new-goal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const goalName = document.getElementById('goal-name').value;
            const goalAmount = parseFloat(document.getElementById('goal-amount').value);

            this.addGoal(goalName, goalAmount);
            document.getElementById('add-goal-modal').style.display = 'none';
            e.target.reset();
        });
    }

    addGoal(name, totalAmount) {
        const newGoal = {
            id: Date.now(),
            name: name,
            totalAmount: totalAmount,
            savedAmount: 0,
            entries: []
        };

        this.goals.push(newGoal);
        this.saveGoals();
        this.renderGoals();
    }

    addSavingsEntry(goalId, amount) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.savedAmount += amount;
            goal.entries.push({
                date: new Date().toISOString(),
                amount: amount
            });
            this.saveGoals();
            this.renderGoals();
            this.showGoalDetails(goalId);
        }
    }

    saveGoals() {
        localStorage.setItem('savingsGoals', JSON.stringify(this.goals));
    }

    renderGoals() {
        const container = document.getElementById('goals-container');
        container.innerHTML = '';

        this.goals.forEach(goal => {
            const card = document.createElement('div');
            card.className = 'goal-card';
            card.dataset.goalId = goal.id;

            const progress = Math.min((goal.savedAmount / goal.totalAmount) * 100, 100);

            card.innerHTML = `
                <div class="goal-card-placeholder"></div>
                <div class="goal-card-content">
                    <h3>${goal.name}</h3>
                    <p>$${goal.savedAmount.toFixed(2)} / $${goal.totalAmount.toFixed(2)}</p>
                    <div class="goal-progress">
                        <div class="goal-progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => this.showGoalDetails(goal.id));
            container.appendChild(card);
        });
    }

    showGoalDetails(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            const detailsModal = document.getElementById('goal-details-modal');
            const detailsContent = document.getElementById('goal-details-content');

            const entriesList = goal.entries.map(entry => 
                `<div>
                    <span>${new Date(entry.date).toLocaleDateString()}</span>
                    <span>$${entry.amount.toFixed(2)}</span>
                </div>`
            ).join('');

            detailsContent.innerHTML = `
                <h2>${goal.name}</h2>
                <p>Total Goal: $${goal.totalAmount.toFixed(2)}</p>
                <p>Saved: $${goal.savedAmount.toFixed(2)}</p>
                
                <h3>Savings Entries</h3>
                <div>
                    <input type="number" id="new-entry-amount" placeholder="Enter Amount">
                    <button id="add-entry-btn">Add Entry</button>
                </div>
                <div id="entries-list">
                    ${entriesList}
                </div>
            `;

            // Add event listener for new entry
            const addEntryBtn = detailsContent.querySelector('#add-entry-btn');
            const newEntryInput = detailsContent.querySelector('#new-entry-amount');
            addEntryBtn.addEventListener('click', () => {
                const amount = parseFloat(newEntryInput.value);
                if (amount > 0) {
                    this.addSavingsEntry(goalId, amount);
                    newEntryInput.value = '';
                }
            });

            detailsModal.style.display = 'block';
        }
    }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const savingsTracker = new SavingsTracker();
});
