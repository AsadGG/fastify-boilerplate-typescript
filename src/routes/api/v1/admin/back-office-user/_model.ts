export default {
  CREATE: {
    POST: async function (knex, data) {
      return knex
        .from('users')
        .insert({
          userName: data.body.email,
          email: data.body.email,
          password: data.body.password,
        })
        .returning('*');
    },
  },
  LOGIN: {
    POST: async function (knex, data) {
      const user = await knex
        .from('users')
        .where({
          user_name: data.body.userName,
          password: data.body.password,
        })
        .first();
      if (!user) {
        const noUserFound = new Error('Invalid Credentials') as any;
        noUserFound.details = 'Invalid Credentials';
        throw noUserFound;
      }
      return user;
    },
  },
};
