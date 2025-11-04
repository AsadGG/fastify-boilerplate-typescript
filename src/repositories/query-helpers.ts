import type { DB } from '#src/types/database';
import type { ExpressionBuilder } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';

export function fileJsonExpression(eb: ExpressionBuilder<DB, 'file'>) {
  return eb
    .case()
    .when(eb.ref('file.id'), 'is not', null)
    .then(
      jsonBuildObject({
        id: eb.ref('file.id').$notNull(),
        filename: eb.ref('file.filename').$notNull(),
        url: eb.ref('file.url').$notNull(),
        mimetype: eb.ref('file.mimetype').$notNull(),
        size: eb.ref('file.size').$notNull(),
      }),
    )
    .else(eb.val(null))
    .end();
}
