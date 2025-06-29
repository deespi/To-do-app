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
        // Formularz dodawania zadania
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
            return;
        }

        if (this.isLoading) return;

        try {
            this.isLoading = true;
            const newTodo = await todoAPI.createTodo(title);
            
            // Dodaj do lokalnej listy
            this.todos.unshift(newTodo);
            
            // Wyczyść input
            todoInput.value = '';
            
            // Odśwież interfejs
            this.renderTodos();
            todoFilters.updateTodos(this.todos);
            
            this.showToast('Zadanie dodane pomyślnie', 'success');
            console.log('✅ Zadanie dodane:', newTodo);
        } catch (error) {
            console.error('Błąd dodawania zadania:', error);
            this.showToast(error.message || 'Błąd dodawania zadania', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Switch finished task status
    async toggleTodo(id) {
        if (this.isLoading) return;

        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        try {
            this.isLoading = true;
            const updatedTodo = await todoAPI.toggleTodo(id, !todo.completed);
            
            // Update locally
            const index = this.todos.findIndex(t => t.id === id);
            if (index !== -1) {
                this.todos[index] = updatedTodo;
            }
            
            // Update interface
            this.renderTodos();
            todoFilters.updateTodos(this.todos);
            
            const status = updatedTodo.completed ? 'ukończone' : 'aktywne';
            this.showToast(`Zadanie oznaczone jako ${status}`, 'success');
        } catch (error) {
            console.error('Błąd zmiany statusu zadania:', error);
            this.showToast(error.message || 'Błąd aktualizacji zadania', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Task editing
    startEdit(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (!todoElement) return;

        const titleElement = todoElement.querySelector('.todo-title');
        if (!titleElement) return;

        // Save original title
        const originalTitle = todo.title;
        
        // Edit window
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalTitle;
        input.className = 'edit-input';
        input.style.cssText = `
            width: 100%;
            padding: 0.5rem;
            border: 2px solid var(--primary-color);
            border-radius: var(--radius-sm);
            font-size: 1rem;
            font-family: inherit;
            background: var(--bg-primary);
        `;

        // Change title
        titleElement.replaceWith(input);
        input.focus();
        input.select();

        this.editingTodo = id;

        // Save changed task
        const saveEdit = async () => {
            const newTitle = input.value.trim();
            
            if (!newTitle) {
                this.showToast('Tytuł zadania nie może być pusty', 'warning');
                input.focus();
                return;
            }

            if (newTitle === originalTitle) {
                this.cancelEdit(id, originalTitle);
                return;
            }

            try {
                const updatedTodo = await todoAPI.editTodoTitle(id, newTitle);
                
                const index = this.todos.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.todos[index] = updatedTodo;
                }
                
                this.renderTodos();
                todoFilters.updateTodos(this.todos);
                
                this.editingTodo = null;
                this.showToast('Zadanie zaktualizowane', 'success');
            } catch (error) {
                console.error('Błąd edycji zadania:', error);
                this.showToast(error.message || 'Błąd edycji zadania', 'error');
                this.cancelEdit(id, originalTitle);
            }
        };

        const cancelEdit = () => {
            this.cancelEdit(id, originalTitle);
        };

        // Event listener
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    // Cancel editing
    cancelEdit(id, originalTitle) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (!todoElement) return;

        const input = todoElement.querySelector('.edit-input');
        if (!input) return;

        // Revoke original title
        const titleElement = document.createElement('div');
        titleElement.className = 'todo-title';
        titleElement.textContent = originalTitle;
        
        input.replaceWith(titleElement);
        this.editingTodo = null;
    }

    // Delete task + confirmation
    deleteTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.showDeleteConfirmation(todo);
    }

    // Show modals for task deletion
    showDeleteConfirmation(todo) {
        const modal = document.getElementById('confirmModal');
        const modalTodoTitle = document.getElementById('modalTodoTitle');
        
        if (!modal || !modalTodoTitle) return;

        modalTodoTitle.textContent = todo.title;
        modal.style.display = 'flex';
        
        // Save deletion event ID
        modal.dataset.deleteId = todo.id;
    }

    // Hide modal
    hideModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'none';
            delete modal.dataset.deleteId;
        }
    }

    // Confirm task deletion
    async confirmDelete() {
        const modal = document.getElementById('confirmModal');
        const deleteId = modal?.dataset.deleteId;
        
        if (!deleteId) return;

        try {
            this.isLoading = true;
            await todoAPI.deleteTodo(deleteId);
            
            // Delete from local list
            this.todos = this.todos.filter(t => t.id != deleteId);
            
            // Update interface
            this.renderTodos();
            todoFilters.updateTodos(this.todos);
            
            this.hideModal();
            this.showToast('Zadanie usunięte', 'success');
        } catch (error) {
            console.error('Błąd usuwania zadania:', error);
            this.showToast(error.message || 'Błąd usuwania zadania', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-message">${this.escapeHtml(message)}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Closing listerner
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeToast(toast);
            });
        }

        // Add toast do container
        toastContainer.appendChild(toast);

        // Automatic deletion
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    // Delete animation toast
    removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // XSS security
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update data
    async refresh() {
        await this.loadTodos();
        this.showToast('Dane odświeżone', 'success');
    }

    // Check status
    getStats() {
        const stats = {
            total: this.todos.length,
            completed: this.todos.filter(t => t.completed).length,
            active: this.todos.filter(t => !t.completed).length,
            completionRate: this.todos.length > 0 
                ? Math.round((this.todos.filter(t => t.completed).length / this.todos.length) * 100) 
                : 0
        };
        
        console.log('📊 Statystyki aplikacji:', stats);
        return stats;
    }
}

// App initialization after DOM
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoApp;
}