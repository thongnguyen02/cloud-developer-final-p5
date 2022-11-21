import { TaskAccess } from '../../src/dataLayer/taskAcess'
import * as Todo from '../../src/businessLogic/task'

jest.mock('../../src/dataLayer/todosAcess')

const todo = {
    todoId: 'todo-id',
    name: 'todo-name',
    userId: 'user-id'
}

const todoAccess = (TaskAccess as any).mock.instances[0]

test('get todo should return todo data from the access layer', async () => {
    await todoAccess.getTodosByUserId.mockResolvedValue(todo)
    const result = await Todo.getTodosByUserId(todo.userId)

    expect(result).toEqual(todo)
    expect(todoAccess.getTodosByUserId).toHaveBeenCalledWith(todo.userId)
})

test('delete todo successfully from the access layer', async () => {
    await Todo.deleteTask(todo.todoId,todo.userId)

    expect(todoAccess.deleteTodo).toHaveBeenCalledWith(todo.todoId,todo.userId)
})
