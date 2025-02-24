import { MyError } from '#src/types/my-error';
import getConflicts from '#utilities/get-conflicts';
import HTTP_STATUS from '#utilities/http-status';
import {
  getLimitAndOffset,
  getPaginationObject,
} from '#utilities/pagination-helpers';
import { POSTGRES_ERROR_CODES } from '#utilities/postgres_error_codes';
import { promiseHandler } from '#utilities/promise-handler';
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';

export async function getTodos(
  kysely: Kysely<DB>,
  data: {
    page: number;
    size: number;
    search?: string;
  }
) {
  const [limit, offset] = getLimitAndOffset({
    page: data.page,
    size: data.size,
  });

  const query = kysely
    .selectFrom('todo')
    .where('isDeleted', '=', false)
    .$if(Boolean(data.search), (qb) => {
      if (!data.search) return qb;
      const searchText = '%' + data.search.replaceAll('%', '\\%') + '%';
      return qb.where('task', 'ilike', searchText);
    });

  const countQuery = query
    .select((eb) => eb.fn.countAll().as('total'))
    .executeTakeFirstOrThrow();

  const filteredQuery = query
    .select(['id', 'task', 'completed'])
    .groupBy('id')
    .orderBy('createdAt', 'desc')
    .offset(offset)
    .limit(limit)
    .execute();

  const [error, result, ok] = await promiseHandler(
    Promise.all([filteredQuery, countQuery])
  );

  if (!ok) {
    throw error;
  }

  const [records, { total }] = result;

  const pagination = getPaginationObject({
    page: data.page,
    size: data.size,
    total: Number(total),
  });

  return {
    records,
    pagination,
  };
}

export async function getTodoById(
  kysely: Kysely<DB>,
  data: {
    todoId: string;
  }
) {
  const query = kysely
    .selectFrom('todo')
    .select(['id', 'task', 'completed'])
    .where('isDeleted', '=', false)
    .where('id', '=', data.todoId)
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    throw error;
  }

  if (!result) {
    const error = new Error(
      `todo of id '${data.todoId}' does not exist`
    ) as MyError;
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const record = result;

  return { record };
}

export async function createTodo(
  kysely: Kysely<DB>,
  data: {
    task: string;
  }
) {
  const query = kysely
    .insertInto('todo')
    .values({
      task: data.task,
    })
    .returning(['id', 'task', 'completed'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
      const conflicts = getConflicts(error.detail);
      const alreadyExistError = new Error(
        `task '${conflicts.task}' already exist`
      ) as MyError;
      alreadyExistError.statusCode = HTTP_STATUS.CONFLICT;
      throw alreadyExistError;
    }

    throw error;
  }

  const record = result;

  return { record };
}

export async function updateTodoById(
  kysely: Kysely<DB>,
  data: {
    todoId: string;
    task: string;
  }
) {
  const query = kysely
    .updateTable('todo')
    .set('task', data.task)
    .where('isDeleted', '=', false)
    .where('id', '=', data.todoId)
    .returning(['id', 'task', 'completed'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
      const conflicts = getConflicts(error.detail);
      const alreadyExistError = new Error(
        `task '${conflicts.task}' already exist`
      ) as MyError;
      alreadyExistError.statusCode = HTTP_STATUS.CONFLICT;
      throw alreadyExistError;
    }

    throw error;
  }

  const record = result;

  return { record };
}

export async function deleteTodoById(
  kysely: Kysely<DB>,
  data: {
    todoId: string;
  }
) {
  const query = kysely
    .updateTable('todo')
    .set('isDeleted', true)
    .where('isDeleted', '=', false)
    .where('id', '=', data.todoId)
    .returning(['id'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    throw error;
  }

  if (!result) {
    const error = new Error(
      `todo of id '${data.todoId}' does not exist`
    ) as MyError;
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const record = result;

  return { record };
}

export async function updateTodoCompletionById(
  kysely: Kysely<DB>,
  data: {
    todoId: string;
    completed: boolean;
  }
) {
  const query = kysely
    .updateTable('todo')
    .set('completed', data.completed)
    .where('isDeleted', '=', false)
    .where('id', '=', data.todoId)
    .returning(['id', 'task', 'completed'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    throw error;
  }

  if (!result) {
    const error = new Error(
      `todo of id '${data.todoId}' does not exist`
    ) as MyError;
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const record = result;

  return { record };
}
