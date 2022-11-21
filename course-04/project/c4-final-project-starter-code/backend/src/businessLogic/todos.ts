import { TodosAccess } from '../dataLayer/todosAcess'
import { createAttachmentUrl } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()

export async function getTodosByUserId(userId: string) {
    return await todosAccess.getTodosByUserId(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    return await todosAccess.createTodo({
        userId: userId,
        todoId: todoId,
        name: createTodoRequest.name,
        createdAt: createdAt,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
    return await todosAccess.updateTodo(
        userId, 
        todoId,
        {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        }
    )
}

export async function updatePresignedUrlForTodo(userId: string, todoId: string, attachmentId: string) {
    const todoItem = await todosAccess.getTodoOfUserById(userId, todoId)
    const attachmentUrl = await createAttachmentUrl(attachmentId)
    
    return await todosAccess.updatePresignedUrlForTodo(
        userId, 
        todoId,
        {
            name: todoItem.name,
            attachmentUrl: attachmentUrl,
            dueDate: todoItem.dueDate,
            done: todoItem.done,    
        }
    )
}

export async function deleteTodo(userId: string, todoId: string) {
    return await todosAccess.deleteTodo(userId, todoId)
}