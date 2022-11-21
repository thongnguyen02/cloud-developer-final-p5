import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TaskItem } from '../models/TaskItem'
import { TaskUpdate } from '../models/TaskUpdate'
import {createLogger} from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

export class TaskAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly logger = createLogger('task-access')) {
    }

    async getTaskByUserId(userId: string): Promise<TaskItem[]> {
        this.logger.info(`Getting all task of user ${userId}`)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        this.logger.info(`Getted all task of user ${userId}.`)

        const items = result.Items
        return items as TaskItem[]
    }

    async getTaskOfUserById(userId: string, taskId: string): Promise<TaskItem> {
        this.logger.info(`Getting task item with id ${taskId} of user ${userId}.`)
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': taskId
            }
        }).promise()

        this.logger.info(`Getted task item with id ${taskId} of user ${userId}.`)

        const items = result.Items
        return items[0] as TaskItem
    }
    
    async createTask(taskItem: TaskItem): Promise<TaskItem> {
        this.logger.info(`Creating task item with id ${taskItem.taskId} for user ${taskItem.userId}.`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: taskItem
        }).promise()

        this.logger.info(`Created new task item with id ${taskItem.taskId} for user ${taskItem.userId}.`)

        return taskItem
    }

    async updateTask(userId: string, taskId: string, taskItem: TaskUpdate) {
        const todo = this.getTaskOfUserById(userId, taskId)

        if (!todo) {
            this.logger.error(`task item with id ${taskId} of user ${userId} is not found.`)
            throw new Error(`task item ${taskId} is not found`)
        }

        this.logger.info(`Updating data for task item ${taskId} of user ${userId}.`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: taskId
            },
            UpdateExpression: 'SET #username = :username, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#username': 'name'
            },
            ExpressionAttributeValues: {
                ':username': taskItem.name,
                ':dueDate': taskItem.dueDate,
                ':done': taskItem.done
            }
        }).promise()

        this.logger.info(`Updated data of task item ${taskId}.`)
    }

    async updatePresignedUrlForTask(userId: string, taskId: string, taskItem: TaskUpdate) {
        const todo = this.getTaskOfUserById(userId, taskId)
        
        if (!todo) {
            this.logger.error(`task item with id ${taskId} of user ${userId} is not found.`)
            throw new Error(`task item ${taskId} is not found`)
        }

        this.logger.info(`Updating attachmentUrl of task item ${taskId} of user ${userId}.`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: taskId
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': taskItem.attachmentUrl
            }
        }).promise()

        this.logger.info(`Updated attachmentUrl of todo item ${taskId}.`)
    }

    async deleteTask(userId: string, taskId: string) {
        this.logger.info(`Delete task item ${taskId} of user ${userId}.`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId: taskId
            }
        }).promise()
    }

   
}