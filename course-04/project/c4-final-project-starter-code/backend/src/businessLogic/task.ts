import { TaskAccess } from '../dataLayer/taskAcess'
import { createAttachmentUrl } from '../helpers/attachmentUtils';
import { TaskItem } from '../models/TaskItem'
import { CreateTaskRequest } from '../requests/CreateTaskRequest'
import { UpdateTaskRequest } from '../requests/UpdateTaskRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const taskAccess = new TaskAccess()

export async function getTaskByUserId(userId: string) {
    return await taskAccess.getTaskByUserId(userId)
}

export async function createTask(userId: string, createTasksRequest: CreateTaskRequest) {
    const taskId = uuid.v4()
    const createdAt = new Date().toISOString()

    return await taskAccess.createTask({
        userId: userId,
        taskId: taskId,
        name: createTasksRequest.name,
        createdAt: createdAt,
        dueDate: createTasksRequest.dueDate,
        done: false
    })
}

export async function updateTask(userId: string, taskId: string, updateTaskRequest: UpdateTaskRequest) {
    return await taskAccess.updateTask(
        userId, 
        taskId,
        {
            name: updateTaskRequest.name,
            dueDate: updateTaskRequest.dueDate,
            done: updateTaskRequest.done
        }
    )
}

export async function updatePresignedUrlForTask(userId: string, taskId: string, attachmentId: string) {
    const taskItem = await taskAccess.getTaskOfUserById(userId, taskId)
    const attachmentUrl = await createAttachmentUrl(attachmentId)
    
    return await taskAccess.updatePresignedUrlForTask(
        userId, 
        taskId,
        {
            name: taskItem.name,
            attachmentUrl: attachmentUrl,
            dueDate: taskItem.dueDate,
            done: taskItem.done,    
        }
    )
}

export async function deleteTask(userId: string, taskId: string) {
    return await taskAccess.deleteTask(userId, taskId)
}