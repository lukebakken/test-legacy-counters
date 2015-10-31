curl -4vvv -i http://localhost:10018/buckets/lc/props -X PUT -d '{"props":{"allow_mult":true}}' -H "Content-Type: application/json"
curl -4vvv -i http://localhost:10018/buckets/lc/counters/c1 -X POST -d "1"
curl -4vvv -i http://localhost:10018/buckets/lc/counters/c1
