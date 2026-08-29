// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const { Authentication } = require('../src/Infrastructures/database/models');
const SequelizePool = require('../src/Infrastructures/database/SequelizePool');

const pool = new SequelizePool();
// UNUSED 220925: Ensure compatibility with expectations that pool.end() exists
// TODO 110925: Implementasikan ORM Sequelize
const AuthenticationsTableTestHelper = {
  async addToken(token) {
    // TODO 110925: Sesuaikan dengan cara menambahkan data pada ORM Sequelize
    await Authentication.create({ token });
  },

  async findToken(token) {
    // TODO 110925: Return array so tests using .toHaveLength(1) work
    const query = await Authentication.findAll({
      where: { token },
      raw: true, // TODO 110925: return plain objects
    });
    // UNUSED 220925: Ensure the return is always an array
    return query;
  },
  
  async cleanTable() {
    await Authentication.destroy({
      where: {},
      truncate: false,
      // TODO 110925: Gunakan opsi 'cascade' jika diperlukan berdasarkan relasi tabel
      cascade: true,
    });
  },
};

module.exports = AuthenticationsTableTestHelper;
