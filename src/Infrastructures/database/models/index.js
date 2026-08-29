const User = require('./User');
const Thread = require('./Thread');
const Comment = require('./Comment');
const Reply = require('./Reply');
const Authentication = require('./Authentication');
const UserCommentLike = require('./UserCommentLike');

User.hasMany(Thread, { foreignKey: 'owner', as: 'threads' });
Thread.belongsTo(User, { foreignKey: 'owner', as: 'user' });

User.hasMany(Comment, { foreignKey: 'owner', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'owner', as: 'user' });

Thread.hasMany(Comment, { foreignKey: 'thread_id', as: 'comments' });
Comment.belongsTo(Thread, { foreignKey: 'thread_id', as: 'thread' });

User.hasMany(Reply, { foreignKey: 'owner', as: 'replies' });
Reply.belongsTo(User, { foreignKey: 'owner', as: 'user' });

Thread.hasMany(Reply, { foreignKey: 'thread_id', as: 'replies' });
Reply.belongsTo(Thread, { foreignKey: 'thread_id', as: 'thread' });

Comment.hasMany(Reply, { foreignKey: 'comment_id', as: 'replies' });
Reply.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment' });

User.hasMany(UserCommentLike, { foreignKey: 'owner', as: 'likes' });
UserCommentLike.belongsTo(User, { foreignKey: 'owner', as: 'user' });

Comment.hasMany(UserCommentLike, { foreignKey: 'comment_id', as: 'likes' });
UserCommentLike.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment' });

module.exports = {
  User,
  Thread,
  Comment,
  Reply,
  Authentication,
  UserCommentLike,
};