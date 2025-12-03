import type { DB } from '#src/types/database';
import type { Kysely } from 'kysely';
import getConflicts from '#utilities/get-conflicts';
import HTTP_STATUS from '#utilities/http-status-codes';
import {
  getLimitAndOffset,
  getPaginationObject,
} from '#utilities/pagination-helpers';
import { POSTGRES_ERROR_CODES } from '#utilities/postgres_error_codes';
import { promiseHandler } from '#utilities/promise-handler';
import createError from '@fastify/error';
import { sql } from 'kysely';

const TodoIdNotFoundError = createError(
  'APP_TODO_ID_NOT_FOUND',
  'todo with id \'%s\' does not exist',
  HTTP_STATUS.NOT_FOUND,
);

const TodoAlreadyExistsError = createError(
  'APP_TODO_ALREADY_EXISTS',
  'todo \'%s\' already exists',
  HTTP_STATUS.CONFLICT,
);

export async function getTodos(
  kysely: Kysely<DB>,
  data: {
    page: number;
    search?: string;
    size: number;
  },
) {
  const [limit, offset] = getLimitAndOffset({
    page: data.page,
    size: data.size,
  });

  const query = kysely
    .selectFrom('todo')
    .where('deletedAt', 'is', null)
    .$if(Boolean(data.search), (qb) => {
      if (!data.search || !data.search.trim())
        return qb;
      const searchText = `%${data.search.replaceAll(/[%_]/g, String.raw`\$&`)}%`;
      return qb.where('task', 'ilike', searchText);
    });

  const countQuery = query
    .select(eb => eb.fn.countAll().as('total'))
    .executeTakeFirstOrThrow();

  const filteredQuery = query
    .select(['id', 'task', 'completed'])
    .groupBy('id')
    .orderBy('createdAt', 'desc')
    .offset(offset)
    .limit(limit)
    .execute();

  const [error, result, ok] = await promiseHandler(
    Promise.all([filteredQuery, countQuery]),
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
    pagination,
    records,
  };
}

export async function getTodoById(
  kysely: Kysely<DB>,
  data: {
    todoId: string;
  },
) {
  const query = kysely
    .selectFrom('todo')
    .select(['id', 'task', 'completed'])
    .where('deletedAt', 'is', null)
    .where('id', '=', data.todoId)
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    throw error;
  }

  if (!result) {
    throw new TodoIdNotFoundError(data.todoId);
  }

  const record = result;

  return { record };
}

export async function createTodo(
  kysely: Kysely<DB>,
  data: {
    task: string;
  },
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
      throw new TodoAlreadyExistsError(conflicts.task);
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
  },
) {
  const query = kysely
    .updateTable('todo')
    .set('task', data.task)
    .where('deletedAt', 'is', null)
    .where('id', '=', data.todoId)
    .returning(['id', 'task', 'completed'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
      const conflicts = getConflicts(error.detail);
      throw new TodoAlreadyExistsError(conflicts.task);
    }

    throw error;
  }

  if (!result) {
    throw new TodoIdNotFoundError(data.todoId);
  }

  const record = result;

  return { record };
}

export async function deleteTodoById(
  kysely: Kysely<DB>,
  data: {
    todoId: string;
  },
) {
  const query = kysely
    .updateTable('todo')
    .set('deletedAt', sql`CURRENT_TIMESTAMP`)
    .where('deletedAt', 'is', null)
    .where('id', '=', data.todoId)
    .returning(['id'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    throw error;
  }

  if (!result) {
    throw new TodoIdNotFoundError(data.todoId);
  }

  const record = result;

  return { record };
}

export async function updateTodoCompletionById(
  kysely: Kysely<DB>,
  data: {
    todoId: string;
    completed: boolean;
  },
) {
  const query = kysely
    .updateTable('todo')
    .set('completed', data.completed)
    .where('deletedAt', 'is', null)
    .where('id', '=', data.todoId)
    .returning(['id', 'task', 'completed'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    throw error;
  }

  if (!result) {
    throw new TodoIdNotFoundError(data.todoId);
  }

  const record = result;

  return { record };
}
