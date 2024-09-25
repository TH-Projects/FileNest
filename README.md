<p align="right"> <img src="client/public/logo.png" alt="FileNestLogo" width="150"/> </p>

# FileNest  

A straightforward file-sharing server accessible through a web client. 
This project was developed as part of an examination for the Distributed Systems course at DHBW Heidenheim.

## Get The Application running

First clone the repo with the project directory `FielNest`.
```
https://github.com/TH-Projects/FileNest.git
```

Before launching the system it is needed to define a .env file containing needed variables for running the application and configuring the infrastructure.
The .env-file has so define the following environmental variables:

### Root .env
Place an .env file in the project root folder
```
#JWT
JWT_SECRET=<aSecretKeyForJWTAuth>

#API Calls
NGINX_API=http://nginx:81 # Adapt Port for Nginx if needed

#Minio
MINIO_ROOT_USER=<usernameForMinIORoot>
MINIO_ROOT_PASSWORD=<yourPassword>
MINIO_ALIAS=myminio
MINIO_ACCESS_KEY=<keyForMinIOAccess>
MINIO_SECRET_KEY=<minIOSecretKey>
MINIO_USER=<usernameForMinIO>
MINIO_USER_ACCESS_KEY=<userAccessKey>
MINIO_SERVER_PORT=9000 # Adapt port for minIO if needed


#MySQL
MYSQL_ROOT_PASSWORD=<mySQLRootPwd>
MYSQL_DATABASE=filenest
MYSQL_USER=<usernameForMySQL>
MYSQL_PASSWORD=<pwdForMySQL>

#URLs
URL_MINIO1=minio1  # Adapt if needed
URL_MINIO2=minio2  # Adapt if needed
URL_MINIO3=minio3  # Adapt if needed
URL_MINIO4=minio4  # Adapt if needed

URL_METADB1=metadb1  # Adapt if needed
URL_METADB2=metadb2  # Adapt if needed
URL_METADB3=metadb3  # Adapt if needed

URL_REACTAPP=reactapp  # Adapt if needed

URL_NGINX=nginx

URL_SERVERMETADB1=servermetadb1  # Adapt if needed
URL_SERVERMETADB2=servermetadb2  # Adapt if needed
URL_SERVERMETADB3=servermetadb3  # Adapt if needed


#Ports
PORT_MINIO=9000  # Adapt if needed

PORT_SERVERFASTIFY=3000  # Adapt if needed

PORT_METADB=3306  # Adapt if needed

PORT_REACTAPP=3000  # Adapt if needed

PORT_BROKER=6001  # Adapt if needed

PORT_NGINX=81  # Adapt if needed

PORT_SERVERMETADB=3001  # Adapt if needed

PORT_ADMIN=3000  # Adapt if needed

```

### React .env
Place an .env in the `./client` folder

```
VITE_APP_HOST=<yourHostURL> # e.g localhost
```

### Launching the system
All containers can be launched by the command
```
docker-compose up -d --scale broker=<numberOfBrokersToStart> --scale serverfastify=<numberOfFastifyServersToStart> --build
```

### Troubleshooting the system startup

Depending on your used hardware it can be the case that the metadbServer tries to connect to the database before it is set up.
In this case please restart your metadbServer-containers manually or adjust the sleep in the `app.js` of the metadbServer to a value that 
the system starts without the containers exiting.


## Project Documentation

A description of the structure and decisions in the project in german language is provided inside the `documentation`-Folder

Further information about used technologies can be found here:
- [Docker-Documentation](https://docs.docker.com/manuals/)
- [Nginx-Documentation](https://nginx.org/en/docs/)
- [minIO-Documentation](https://min.io/docs/minio/container/index.html)
- [React-Documentation](https://react.dev/learn)
- [Fastify-Documentation](https://fastify.dev/docs/latest/Guides/)
- [MariaDB-Documentation](https://mariadb.com/kb/en/documentation/)




