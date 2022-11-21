import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updatePresignedUrlForTask } from '../../businessLogic/task'
import { getUserId } from '../utils'

import * as uuid from 'uuid'
import { createPresignedUrl } from '../../helpers/attachmentUtils'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const attachmentId = uuid.v4()
    const presignedUrl: string = await createPresignedUrl(attachmentId)

    await updatePresignedUrlForTask(userId, todoId, attachmentId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    },
      body: JSON.stringify({
        'uploadUrl': presignedUrl
      })
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
