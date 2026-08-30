/* istanbul ignore file */

const { User } = require('../src/Infrastructures/database/models');

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
    const {
      Reply, UserCommentLike, Comment, Thread, Authentication,
    } = require('../src/Infrastructures/database/models');
    if (Reply) await Reply.destroy({ where: {}, truncate: false });
    if (UserCommentLike) await UserCommentLike.destroy({ where: {}, truncate: false });
    if (Comment) await Comment.destroy({ where: {}, truncate: false });
    if (Thread) await Thread.destroy({ where: {}, truncate: false });
    if (Authentication) await Authentication.destroy({ where: {}, truncate: false });
    await User.destroy({
      where: {},
      truncate: false,
    });
  },
};

module.exports = UsersTableTestHelper;
