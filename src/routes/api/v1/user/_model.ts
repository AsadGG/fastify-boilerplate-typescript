export default {
  USER: {
    GET: async function (knex, data) {
      const usersQuery = knex.from('users').where((queryBuilder) => {
        const searchText = data.query.search;
        if (searchText) {
          queryBuilder
            .orWhereRaw('LOWER(firstName::text) LIKE LOWER(?)', [
              `%${searchText}%`,
            ])
            .orWhereRaw('LOWER(lastName::text) LIKE LOWER(?)', [
              `%${searchText}%`,
            ])
            .orWhereRaw('LOWER(email::text) LIKE LOWER(?)', [`%${searchText}%`])
            .orWhereRaw('LOWER(phone::text) LIKE LOWER(?)', [
              `%${searchText}%`,
            ]);
        }
      });

      const totalUsersQuery = usersQuery.clone().count();

      const limit = data.query.size;
      const offset = data.query.page * limit;

      const paginatedUsersQuery = usersQuery
        .clone()
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const multiQuery = [totalUsersQuery, paginatedUsersQuery].join(';');

      const [[{ count: totalRecordCount }], records] =
        await knex.raw(multiQuery);

      let currentPage = 0;
      if (totalRecordCount > 0) {
        currentPage = Math.ceil(offset / limit);
      }
      const totalRecords = Number(totalRecordCount);
      const totalPages = Math.ceil(totalRecords / limit);
      const prevPage = currentPage !== 0 ? currentPage - 1 : null;
      const nextPage = currentPage < totalPages - 1 ? currentPage + 1 : null;
      return {
        records,
        pagination: {
          totalRecords,
          currentPage,
          totalPages,
          prevPage,
          nextPage,
        },
      };
    },
    POST: async function (knex, data) {
      return knex
        .from('users')
        .insert({
          firstName: data.body.firstName,
          lastName: data.body.lastName,
          email: data.body.email,
          password: data.body.password,
          amount: data.body.amount,
          phone: data.body.phone,
          roleId: data.body.roleId,
        })
        .returning('*');
    },
  },
};
