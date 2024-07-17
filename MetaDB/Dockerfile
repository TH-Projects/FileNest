FROM mariadb

COPY setup.sql /docker-entrypoint-initdb.d/
COPY init.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init.sh