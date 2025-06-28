-- Todo App Database Initialization
-- Creating todos table

DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adding example data
INSERT INTO todos (title, completed) VALUES 
('Example TODO #1', true),
('Example TODO #2', false),
('Example TODO #3', false),
('Example TODO #4', false);

-- Creating index for better optimalization
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at);

-- Automatic updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic update
CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON todos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();