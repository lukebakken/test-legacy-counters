 /* jshint newcap: false */

'use strict';

var parseArgs = require('minimist');
var logger = require('winston');
var Riak = require('basho-riak-client');

var riakNodes = [ 'riak-test:10017', 'riak-test:10027', 'riak-test:10037', 'riak-test:10047' ];

var client = new Riak.Client(riakNodes);

function client_shutdown() {
    client.shutdown(function (state) {
        if (state === Riak.Cluster.State.SHUTDOWN) {
            process.exit();
        }
    });
}

var args_options = {
    alias: {
        debug: [ 'verbose', 'd', 'v' ]
    }
};
var argv = parseArgs(process.argv, args_options);

if (argv.debug) {
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, {
        level : 'debug',
        colorize: true,
        timestamp: true
    });
}

logger.debug("parsed argv: '%s'", JSON.stringify(argv));

function check(e) {
    if (e) {
        logger.error("ERROR:", e);
        client_shutdown();
    }
}

var bt = 'default';
var b = 'lc';
var k = 'c1';

function fetch_counter(next) {
    var cb = function(e, r) {
        check(e);
        logger.info("COUNTER:", JSON.stringify(r));
        if (next) {
            next();
        } else {
            client_shutdown();
        }
    };
    var fetch = new Riak.Commands.CRDT.FetchCounter.Builder()
        .withBucketType(bt)
        .withBucket(b)
        .withKey(k)
        .withCallback(cb)
        .build();
    client.execute(fetch);
}

function update_func() {
    var cb = function(e, r) {
        check(e);
        logger.info("UPDATE RESP:", JSON.stringify(r));
        fetch_counter();
    };
    var update = new Riak.Commands.CRDT.UpdateCounter.Builder()
        .withBucketType(bt)
        .withBucket(b)
        .withKey(k)
        .withIncrement(5)
        .withReturnBody(true)
        .withCallback(cb)
        .build();
    client.execute(update);
}

fetch_counter(update_func);
