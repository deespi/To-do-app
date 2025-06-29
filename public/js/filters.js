// Filtering and Counting Functionality
class TodoFilters {
    constructor() {
        this.currentFilter = 'all';
        this.todos = [];
        this.initializeEventListeners();
    }

    // Initialize event listeners for filters
    initializeEventListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setActiveFilter(filter);
            });
        });
    }

    // Set active filter
    setActiveFilter(filter) {
        if (this.currentFilter === filter) return;

        this.currentFilter = filter;
        this.updateFilterButtons();
        this.filterTodos();
        
        console.log(`🔍 Filtr zmieniony na: ${filter}`);
    }

    // Update filter button's look 
    updateFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            const isActive = button.dataset.filter === this.currentFilter;
            button.classList.toggle('active', isActive);
        });
    }

    // Update todos data and counters
    updateTodos(todos) {
        this.todos = todos || [];
        this.updateCounts();
        this.filterTodos();
    }

    // Counters for each filter
    updateCounts() {
        const counts = this.calculateCounts();
        
        // Update counters in interface
        const allCountEl = document.getElementById('allCount');
        const activeCountEl = document.getElementById('activeCount');
        const completedCountEl = document.getElementById('completedCount');

        if (allCountEl) allCountEl.textContent = counts.all;
        if (activeCountEl) activeCountEl.textContent = counts.active;
        if (completedCountEl) completedCountEl.textContent = counts.completed;
    }

    // Calculate counters for each category
    calculateCounts() {
        const counts = {
            all: this.todos.length,
            active: this.todos.filter(todo => !todo.completed).length,
            completed: this.todos.filter(todo => todo.completed).length
        };

        console.log('📊 Liczniki zaktualizowane:', counts);
        return counts;
    }

    // Filter tasks
    filterTodos() {
        const todoItems = document.querySelectorAll('.todo-item');
        let visibleCount = 0;

        todoItems.forEach(item => {
            const isCompleted = item.classList.contains('completed');
            let shouldShow = false;

            switch (this.currentFilter) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'active':
                    shouldShow = !isCompleted;
                    break;
                case 'completed':
                    shouldShow = isCompleted;
                    break;
            }

            // Show/hide animation
            if (shouldShow) {
                item.style.display = 'flex';
                item.style.animation = 'slideIn 0.3s ease-out';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // Show state if no tasks
        this.updateEmptyState(visibleCount);
        
        console.log(`🔍 Filtrowanie ukończone. Widoczne zadania: ${visibleCount}`);
    }

    // Update empty list state
    updateEmptyState(visibleCount) {
        const emptyStateEl = document.getElementById('emptyState');
        const todosListEl = document.getElementById('todosList');
        
        if (!emptyStateEl || !todosListEl) return;

        if (this.todos.length === 0) {
            // No tasks
            emptyStateEl.innerHTML = `
                <i class="fas fa-clipboard-list"></i>
                <h3>Brak zadań</h3>
                <p>Dodaj swoje pierwsze zadanie powyżej</p>
            `;
            emptyStateEl.style.display = 'block';
            todosListEl.style.display = 'none';
        } else if (visibleCount === 0) {
            // No tasks for active filter
            const messages = {
                active: {
                    icon: 'fas fa-check-circle',
                    title: 'Wszystkie zadania ukończone!',
                    description: 'Świetna robota! Nie masz aktywnych zadań.'
                },
                completed: {
                    icon: 'fas fa-clock',
                    title: 'Brak ukończonych zadań',
                    description: 'Ukończ kilka zadań, aby zobaczyć je tutaj.'
                }
            };

            const message = messages[this.currentFilter];
            if (message) {
                emptyStateEl.innerHTML = `
                    <i class="${message.icon}"></i>
                    <h3>${message.title}</h3>
                    <p>${message.description}</p>
                `;
                emptyStateEl.style.display = 'block';
                todosListEl.style.display = 'none';
            }
        } else {
            emptyStateEl.style.display = 'none';
            todosListEl.style.display = 'block';
        }
    }

    getCurrentFilter() {
        return this.currentFilter;
    }

    // Check if should show task for current filter
    shouldShowTodo(todo) {
        switch (this.currentFilter) {
            case 'all':
                return true;
            case 'active':
                return !todo.completed;
            case 'completed':
                return todo.completed;
            default:
                return true;
        }
    }

    // Filter reset
    reset() {
        this.currentFilter = 'all';
        this.todos = [];
        this.updateFilterButtons();
        this.updateCounts();
    }

    // Filter change animation
    animateFilterChange() {
        const todosContainer = document.querySelector('.todos-container');
        if (todosContainer) {
            todosContainer.style.opacity = '0.7';
            setTimeout(() => {
                todosContainer.style.opacity = '1';
            }, 150);
        }
    }
}

// New filters instance
const todoFilters = new TodoFilters();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoFilters;
}