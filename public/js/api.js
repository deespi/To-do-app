// API Communication Layer
class TodoAPI {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    // HTTP requests
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Fetch all data
    async getTodos() {
        try {
            console.log('📡 Pobieranie zadań z API...');
            const response = await this.request('/todos');
            console.log('✅ Zadania pobrane pomyślnie:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('❌ Błąd podczas pobierania zadań:', error);
            throw new Error('Nie udało się pobrać zadań. Sprawdź połączenie z serwerem.');
        }
    }

    // Add new task
    async createTodo(title) {
        if (!title || title.trim() === '') {
            throw new Error('Tytuł zadania nie może być pusty');
        }

        try {
            console.log('📡 Dodawanie nowego zadania:', title);
            const response = await this.request('/todos', {
                method: 'POST',
                body: JSON.stringify({ title: title.trim() })
            });
            console.log('✅ Zadanie dodane pomyślnie:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Błąd podczas dodawania zadania:', error);
            throw new Error('Nie udało się dodać zadania. Spróbuj ponownie.');
        }
    }

    // Update data
    async updateTodo(id, updates) {
        if (!id) {
            throw new Error('ID zadania jest wymagane');
        }

        try {
            console.log('📡 Aktualizacja zadania:', id, updates);
            const response = await this.request(`/todos/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            console.log('✅ Zadanie zaktualizowane pomyślnie:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Błąd podczas aktualizacji zadania:', error);
            if (error.message.includes('404') || error.message.includes('nie znalezione')) {
                throw new Error('Zadanie nie zostało znalezione');
            }
            throw new Error('Nie udało się zaktualizować zadania. Spróbuj ponownie.');
        }
    }

    // Task status
    async toggleTodo(id, completed) {
        return this.updateTodo(id, { completed });
    }

    // Edit task's title
    async editTodoTitle(id, title) {
        if (!title || title.trim() === '') {
            throw new Error('Tytuł zadania nie może być pusty');
        }
        return this.updateTodo(id, { title: title.trim() });
    }

    // Delete task
    async deleteTodo(id) {
        if (!id) {
            throw new Error('ID zadania jest wymagane');
        }

        try {
            console.log('📡 Usuwanie zadania:', id);
            const response = await this.request(`/todos/${id}`, {
                method: 'DELETE'
            });
            console.log('✅ Zadanie usunięte pomyślnie:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Błąd podczas usuwania zadania:', error);
            if (error.message.includes('404') || error.message.includes('nie znalezione')) {
                throw new Error('Zadanie nie zostało znalezione');
            }
            throw new Error('Nie udało się usunąć zadania. Spróbuj ponownie.');
        }
    }

    // Check server connection
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/todos`, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('❌ Brak połączenia z serwerem:', error);
            return false;
        }
    }
}

// New instance
const todoAPI = new TodoAPI();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoAPI;
}