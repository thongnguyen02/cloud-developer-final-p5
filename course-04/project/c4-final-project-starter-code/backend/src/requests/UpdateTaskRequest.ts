/**
 * Fields in a request to update a single task item.
 */
export interface UpdateTaskRequest {
  name: string
  dueDate: string
  done: boolean
}