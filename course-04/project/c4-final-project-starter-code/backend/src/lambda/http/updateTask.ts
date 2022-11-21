import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTask } from '../../businessLogic/task'
import { UpdateTaskRequest } from '../../requests/UpdateTaskRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const taskId = event.pathParameters.todoId
    const updatedTask: UpdateTaskRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    await updateTask(userId, taskId, updatedTask)
    return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      },
        body: ''
      }
    } 
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
