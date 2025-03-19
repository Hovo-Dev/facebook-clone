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
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE IF EXISTS auth_tokens;
  `);
};

exports._meta = {
  "version": 1
};
