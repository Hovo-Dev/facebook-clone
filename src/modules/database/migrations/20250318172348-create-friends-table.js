'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE IF NOT EXISTS friends (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      friend_id UUID NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id),
      CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
      CONSTRAINT check_no_self_friendship CHECK (user_id <> friend_id)
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE IF EXISTS friends;
  `);
};

exports._meta = {
  "version": 1
};
