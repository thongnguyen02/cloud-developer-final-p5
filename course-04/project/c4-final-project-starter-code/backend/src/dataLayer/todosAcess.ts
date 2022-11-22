import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import {createLogger} from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
        private readonly logger = createLogger('todos-access')) {
    }

    async getTodosByUserId(userId: string): Promise<TodoItem[]> {
        this.logger.info(`Getting all todos of user ${userId}`)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        this.logger.info(`Getted all todos of user ${userId}.`)

        const items = result.Items
        return items as TodoItem[]
    }

    async getTodoOfUserById(userId: string, todoId: string): Promise<TodoItem> {
        this.logger.info(`Getting todo item with id ${todoId} of user ${userId}.`)
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()

        this.logger.info(`Getted todo item with id ${todoId} of user ${userId}.`)

        const items = result.Items
        return items[0] as TodoItem
    }
    
    async getTodosForUserByName(userId: string, name: string): Promise<TodoItem[]> {
        this.logger.info(`search todo for userId: ${userId} by name: ${name}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            // IndexName: this.todosIndex,
            // FilterExpression: 'name = :name',
            KeyConditionExpression: 'userId = :userId AND name = :todoName',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoName': name
            }
        }).promise()

        this.logger.info('Data query:', result.Items)
        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        this.logger.info(`Creating todo item with id ${todoItem.todoId} for user ${todoItem.userId}.`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        this.logger.info(`Created new todo item with id ${todoItem.todoId} for user ${todoItem.userId}.`)

        return todoItem
    }

    async updateTodo(userId: string, todoId: string, todoItem: TodoUpdate) {
        const todo = this.getTodoOfUserById(userId, todoId)

        if (!todo) {
            this.logger.error(`Todo item with id ${todoId} of user ${userId} is not found.`)
            throw new Error(`Todo item ${todoId} is not found`)
        }

        this.logger.info(`Updating data for todo item ${todoId} of user ${userId}.`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET #username = :username, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#username': 'name'
            },
            ExpressionAttributeValues: {
                ':username': todoItem.todoName,
                ':dueDate': todoItem.dueDate,
                ':done': todoItem.done
            }
        }).promise()

        this.logger.info(`Updated data of todo item ${todoId}.`)
    }

    async updatePresignedUrlForTodo(userId: string, todoId: string, todoItem: TodoUpdate) {
        const todo = this.getTodoOfUserById(userId, todoId)
        
        if (!todo) {
            this.logger.error(`Todo item with id ${todoId} of user ${userId} is not found.`)
            throw new Error(`Todo item ${todoId} is not found`)
        }

        this.logger.info(`Updating attachmentUrl of todo item ${todoId} of user ${userId}.`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': todoItem.attachmentUrl
            }
        }).promise()

        this.logger.info(`Updated attachmentUrl of todo item ${todoId}.`)
    }

    async deleteTodo(userId: string, todoId: string) {
        this.logger.info(`Delete todo item ${todoId} of user ${userId}.`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
    }

   
}