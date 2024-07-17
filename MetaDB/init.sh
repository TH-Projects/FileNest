#!/bin/bash
set -e

envsubst < /docker-entrypoint-initdb.d/setup.sql > /docker-entrypoint-initdb.d/setup_final.sql
cat /docker-entrypoint-initdb.d/setup_final.sql
mysql -u root -p"$MYSQL_ROOT_PASSWORD" < /docker-entrypoint-initdb.d/setup_final.sql