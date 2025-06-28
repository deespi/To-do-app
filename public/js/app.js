// Main Application Logic
class TodoApp {
    constructor() {
        this.todos = [];
        this.editingTodo = null;
        this.isLoading = false;
        this.initializeApp();
    }

    // App initialization
    async initializeApp() {
        console.log('🚀 Inicjalizacja Todo App...');
        
        try {
            this.bindEventListeners();
            this.showLoadingState();
            await this.loadTodos();
            console.log('✅ Aplikacja zainicjalizowana pomyślnie');
        } catch (error) {
            console.error('❌ Błąd inicjalizacji aplikacji:', error);
            this.showErrorState();
        }
    }

    // Event listerners binding
    bindEventListeners() {
        // Add new task form
        const todoForm = document.getElementById('todoForm');
        const todoInput = document.getElementById('todoInput');
        const retryBtn = document.getElementById('retryBtn');

        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddTodo();
            });
        }

        if (todoInput) {
            // Add task after clicking 'Enter'
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleAddTodo();
                }
            });
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadTodos();
            });
        }

        // Modal confirmation
        this.bindModalEventListeners();
    }

    // Modal event listening
    bindModalEventListeners() {
        const modal = document.getElementById('confirmModal');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideModal());
        }

        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.hideModal());
        }

        if (modalConfirm) {
            modalConfirm.addEventListener('click', () => this.confirmDelete());
        }

        // Close modal when clicking background
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Close modal when clicking 'Escape'
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    // Show loading state
    showLoadingState() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const todosList = document.getElementById('todosList');

        if (loadingState) loadingState.style.display = 'block';
        if (errorState) errorState.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        if (todosList) todosList.style.display = 'none';

        this.isLoading = true;
    }

    // Show error state
    showErrorState() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const todosList = document.getElementById('todosList');

        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (todosList) todosList.style.display = 'none';

        this.isLoading = false;
    }

    // Hide all states
    hideAllStates() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');

        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';

        this.isLoading = false;
    }

    // Load tasks from API
    async loadTodos() {
        try {
            this.showLoadingState();
            const todos = await todoAPI.getTodos();
            this.todos = todos;
            this.renderTodos();
            todoFilters.updateTodos(this.todos);
            this.hideAllStates();
        } catch (error) {
            console.error('Błąd ładowania zadań:', error);
            this.showErrorState();
            this.showToast('Błąd ładowania zadań', 'error');
        }
    }

    // Render tasks
    renderTodos() {
        const todosList = document.getElementById('todosList');
        if (!todosList) return;

        if (this.todos.length === 0) {
            todosList.style.display = 'none';
            return;
        }

        todosList.innerHTML = '';
        todosList.style.display = 'block';

        this.todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            todosList.appendChild(todoElement);
        });
    }

    // Create task element
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        const createdDate = new Date(todo.created_at).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 onclick="todoApp.toggleTodo(${todo.id})">
            </div>
            <div class="todo-content">
                <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                <div class="todo-meta">Utworzono: ${createdDate}</div>
            </div>
            <div class="todo-actions">
                <button class="todo-btn edit-btn" onclick="todoApp.startEdit(${todo.id})" 
                        title="Edytuj zadanie">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="todo-btn delete-btn" onclick="todoApp.deleteTodo(${todo.id})" 
                        title="Usuń zadanie">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return li;
    }

    // Handle new task
    async handleAddTodo() {
        const todoInput = document.getElementById('todoInput');
        if (!todoInput) return;

        const title = todoInput.value.trim();
        if (!title) {
            this.showToast('Wpisz tytuł zadania', 'warning');
        }
    }
}