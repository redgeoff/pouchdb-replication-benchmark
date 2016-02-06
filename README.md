# pouchdb-replication-benchmark

The purpose of this project is to provide an objective mechanism for benchmarking the initial replication speed of PouchDB. These tests are not focused on how long it takes to populate a CouchDB database as in most apps, data will be written to the DB over a relatively long period of time and therefore the time it takes to write data is not nearly as significant as the time it takes to read data. The time is takes to download data that already resides in a DB is paramount as most modern apps require users to be able to switch devices at will and not have to wait a long time when they first run an app. This wait time can make-or-break an app.

This documentation will outline how to test the replication when the CouchDB server is local and remote. We will use AWS to test the remote scenario, but you could pretty easily adapt the instructions to work with any environment.

We will assume a data set of 10,000 docs, where each document has been updated 100 times. With PouchDB, these 10,000 docs will occupy about 140 MB of space in the browser's offline storage. This is not a particularly large amount of data, but we assume that your database has been partitioned, e.g. there is a DB per user, and therefore the size of this data set is probably typical of a fairly average app that is used quite frequently.


Summary
---

##### CouchDB <2.0: 104 seconds to replicate 10,000 docs
##### CouchDB >2.0: 5.9 seconds to replicate 10,000 docs


Initial Replication of 10,000 docs (Average of 3 trials):
---

| Local/Remote CouchDB | Native      | express-pouchdb-replication-stream  | pouchdb-load  |
| -------------------- | ----------: | ----------------------------------: | ------------: |
| Local                | 63.7 secs   | 32.9 secs                           | 5.7 secs      |
| Remote               | 104.6 secs  | 38.2 secs                           | 5.9 secs      |


Notes:
* All tests were conducted with CouchDB 1.5. CouchDB >= 2.0 will contain the [bulk_get API](https://issues.apache.org/jira/browse/COUCHDB-2310), which will allow native initial replication to perform at speeds similar to the pouchdb-load trials above. In these trials, we use pouchdb-replication-stream to dump the database to a JSON file and then use pouchdb-load to perform the initial replication.
* The speed of the computer running the browser tests is probably not significant as the major cause of latency is in the transmission of data over the Internet and the chattiness of the replication protocol
* The time it takes to replicate docs is directly related to the number of docs. This relationship should be linear so it is pretty safe to use this benchmarking to estimate your use case. For example, it should take roughly 50.9 seconds to sync 50,000 docs with pouchdb-load
* After compaction, it takes 12 MB on the DB server to store these 10,000 docs.
* In Chrome, it takes roughly 114 MB to store these 10,000 in IndexedDB storage


Install & Benchmark
---

1. Install Vagrant, VirtualBox and git

  * http://www.vagrantup.com
  * https://www.virtualbox.org (don't worry about setting up any VMs as the steps below will cover this)
  * http://git-scm.com


2. Set up

 * Edit /etc/hosts locally and add `192.168.50.8 couchdb-local.dev`
 * $ git clone https://github.com/redgeoff/pouchdb-replication-benchmark.git
 * $ cd pouchdb-replication-benchmark
 * $ vagrant up
 * $ vagrant ssh


3. Run test against local CouchDB instance

 * $ npm run server
 * Visit http://couchdb-local.dev:8001/index.html?grep=local. This page will output the time it takes to initially replicate the 10,000 docs in the browser when the CouchDB instance is local


4. Create remote CouchDB instance

 * Launch E2 ubuntu instance and make sure to allow access on ports 22, 5984 & 8001
 * ssh into instance
 * $ sudo apt-get install -y git
 * $ git clone https://github.com/redgeoff/pouchdb-replication-benchmark.git
 * $ cd pouchdb-replication-benchmark
 * $ sudo ./set-up.sh # This will populate the database
 * $ cd app
 * $ npm run server # starts web server for testing
 * Edit /etc/hosts locally and add `255.255.255.255 couchdb-remote.dev`. Replace 255.255.255.255 with the IP of your EC2 instance

5. Run test against remote CouchDB instance

Locally via your Vagrant env (similar to step 3):

 * $ npm run server
 * Visit http://couchdb-local.dev:8001/index.html?grep=remote. This page will output the time it takes to initially replicate the 10,000 docs in the browser when the CouchDB instance is remote


Optional: Fill and dump
---

Filling the database locally can take around an hour. As these tests focus on the read operation, a dump.txt file is already provided as populating with a dump file only takes a few minutes.

If however, you wish to generate your own dump file you can do the following:

 * $ npm run fill # populates 10,000 docs that have each been updated 100 times. Takes an hr
 * $ npm run dump # dumps the 10,000 docs to dump.txt
