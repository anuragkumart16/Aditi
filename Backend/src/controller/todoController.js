let todos = [];

export const getTodos = (req, res) => {
    res.json(todos);
};

export const createTodo = (req, res) => {
    const { title } = req.body;
    const newTodo = { id: Date.now().toString(), title };
    todos.push(newTodo);
    res.status(201).json(newTodo);
};

export const updateTodo = (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.title = title;
        res.json(todo);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
};

export const deleteTodo = (req, res) => {
    const { id } = req.params;
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
        const deleted = todos.splice(index, 1);
        res.json(deleted[0]);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
}; 