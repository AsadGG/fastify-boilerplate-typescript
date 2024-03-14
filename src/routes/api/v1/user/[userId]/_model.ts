export default {
  USER_ID: {
    GET: async function (knex, data) {
      return knex.from('users').where('id', data.params.userId).first();
    },
    PATCH: async function (knex, data) {
      return knex
        .from('users')
        .where('id', data.params.userId)
        .update({
          firstName: data.body.firstName,
          lastName: data.body.lastName,
          email: data.body.email,
          amount: data.body.amount,
          phone: data.body.phone,
          roleId: data.body.roleId,
        })
        .returning('*');
    },
    DELETE: async function (knex, data) {
      return knex.from('users').where('id', data.params.userId).del();
    },
  },
};
