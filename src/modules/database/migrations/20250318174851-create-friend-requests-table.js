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

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE IF NOT EXISTS friend_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      requester_id UUID NOT NULL,
      recipient_id UUID NOT NULL,
      status SMALLINT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT unique_friend_request UNIQUE (requester_id, recipient_id),
      CONSTRAINT check_no_self_request CHECK (requester_id <> recipient_id),
      CONSTRAINT check_valid_status CHECK (status IN (0, 1, 2))
    );

    CREATE INDEX idx_friend_requests_requester ON friend_requests(requester_id);
    CREATE INDEX idx_friend_requests_recipient ON friend_requests(recipient_id);
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE IF EXISTS friend_requests;
  `);
};

exports._meta = {
  "version": 1
};
