// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const { Thread } = require('../src/Infrastructures/database/models');
const SequelizePool = require('../src/Infrastructures/database/SequelizePool');

const pool = new SequelizePool();
// UNUSED 220925: Ensure compatibility with expectations that pool.end() exists
// TODO 110925: Implementasikan ORM Sequelize
const ThreadsTableTestHelper = {
  // TODO 220925: Ubah constructor function addThread
  async addThread({
    id, 
    title = 'Example Title', 
    body = 'Example Body', 
    owner,
    date = new Date().toISOString()
  }) {
    const query = await Thread.create({
      id,
      title,
      body,
      owner,
      date
    });

    await query;
  },

  async findThreadById(id) {
    // TODO 110925: Return single object as findOne is appropriate here
    const query = await Thread.findAll({
      where: { id },
      raw: true, // TODO 110925: return plain objects
    });
    // UNUSED 220925: Ensure the return is always an array
    return [query];
  },

  async cleanTable() {
    await Thread.destroy({
      where: {},
      truncate: true,
      // TODO 110925: Gunakan opsi 'cascade' jika diperlukan berdasarkan relasi tabel
      cascade: true,
    });
  },
};

module.exports = ThreadsTableTestHelper;
