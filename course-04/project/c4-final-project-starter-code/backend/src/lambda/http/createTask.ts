import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTaskRequest as CreateTaskRequest } from '../../requests/CreateTaskRequest'
import { getUserId } from '../utils';
import { createTask } from '../../businessLogic/task'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTask: CreateTaskRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const item = await createTask(userId, newTask)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    },
      body: JSON.stringify({
        item
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
