/* istanbul ignore file */

// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const { User } = require('../src/Infrastructures/database/models');
const RegisteredUser = require('../src/Domains/users/entities/RegisteredUser');
const SequelizePool = require('../src/Infrastructures/database/SequelizePool');

const pool = new SequelizePool();
// ensure compatibility with expectations that pool.end() exists
if (!pool.end) {
  pool.end = pool.close ? pool.close.bind(pool) : async () => {};
}

// TODO 110925: Implementasikan ORM Sequelize
const UsersTableTestHelper = {
  async addUser({
    id = 'user-123', username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia',
  }) {
    // TODO 150925: Cukup create user tanpa return RegisteredUser
    await User.create({
      id,
      username,
      password,
      fullname,
    });
  },

  async findUsersById(id) {
    // TODO 110925: Changed to findAll to return an array so tests using .toHaveLength(1) work
    const users = await User.findAll({
      where: { id },
      raw: true, // TODO 110925: return plain objects
    });
    // TODO 110925: Ensure the return is always an array
    if (Array.isArray(users)) return users;
    if (users == null) return [];
    return [users];
  },

  async cleanTable() {
    await User.destroy({
      where: {},
      truncate: false,
      // TODO 110925: Gunakan opsi 'cascade' jika diperlukan berdasarkan relasi tabel
      cascade: true,
    });
  },
};

module.exports = UsersTableTestHelper;