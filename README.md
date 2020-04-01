# Examples on the usage of the emubot framework

Setting up a minimal example of an application using the [emubot framework](https://github.com/emundo/emubot)) is [simple](https://github.com/emundo/emubot-minimal-example). But to leverage the framework’s advantages you might want to use some of the functionality (e.g. to pseudonymize the user) and connect your application to a database. This repository aims at providing exactly that.

This repository uses the emubot npm module to provide functionality for real use cases. Some of the examples are not useful if you use the default behavior, but require (any) working Chat- and NlpAdapter and the respective configuration. For more information, please take a look at the [documentation](https://emundo.github.io/emubot_doc/_build/html/index.html)

## Structure of this repository

We provide some examplary setup files for different messengers and NLP platforms. What you need is the following minimal structure:

```
root
│   main.ts
|
└───configuration/
│   │   config.ts
│
└───interceptors
    │   ....
    │   ...
```

A valid configuration file is required to run your bot, more information on their formatcan be found in the documentation.
Most of the presented functionalities are separated by using distinctive interceptors. These interceptors can be combined to e.g. include a database as well as calling external APIs in a single interceptor.

## Starting the bot

Make sure that you have installed `npm` and install the dependencies using `npm -i`.
Compile the typescript code using `npm run tsc` and start the bot with `npm run start`. This will use the default configuration: make sure to change it in advance.

## Supported Features

### Database

A rudimentary database implementation is provided with this repo. The implementation is based on the [TypeORM](https://typeorm.io/#/) package and should be used with a [postgres](https://www.postgresql.org/) database. In order to use the database you will need to setup a postgres database and provide a valid configuration for the database in the `src/configuration/databasePostgresConfig.ts` file. If you do not have an existing postgres database, an easy way to set one up is by using the [postgres docker image](https://hub.docker.com/_/postgres). If you do not have docker installed please refer to this [tutorial](https://docs.docker.com/install/). After you have installed docker you can run the following commands to start the postgres docker image

```bash
docker pull postgres
docker run --name some-postgres-container-name -p 5432:5432 -e
    POSTGRES_PASSWORD=password_set_as_environmentvar -d postgres
```

This will start the postgres docker container listening for connections on port 5432. The next step will be to create the database inside the docker container. You can log into the docker container with the command

```
docker exec -it some-postgres-container-name /bin/bash
```

where you replaced `some-postgres-container-name` with the name of your container. Inside the docker container, you will need to create database:

```
su postgres
psql
CREATE DATABASE databaseName;
```

Afterwards a `\l` command should list your database

```
    postgres=# \l
                                 List of databases
    Name    |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges
    -----------+----------+----------+------------+------------+-----------------------
    postgres          | postgres | UTF8     | en_US.utf8 | en_US.utf8 |
    template0         | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
                      |          |          |            |            | postgres=CTc/postgres
    template1         | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
                      |          |          |            |            | postgres=CTc/postgres
    databaseName      | postgres | UTF8     | en_US.utf8 | en_US.utf8 |


```

If all looks good and you can see your database in the list you have to provide the database configuration to the framework:

```
const databasePostgresConfig: DatabaseConfig = {
    host: 'server-hostname', // <- your host URL
    name: 'name-of-database', // <- your database name
    password: 'password_set_as_environmentvar', // <- your database password
    port: 5432, // <- your database port
    type: 'postgres',
    user: 'postgres', // <- your database user name
    entities: [string]; // Directory of the entities
};
```

### (De-)pseudonymize the userId

Pseudonymization (using a database to store the identifiers) is implemented with the `DatabasepseudonymizationInterceptor` and `DatabaseDepseudonymizationInterceptor`. In order to use those interceptors simply set them up in the configuration file (Chat to Core and Nlp to Core interceptors).

### Stop the chatbot temporarily

In order to stop a bot a `NlpControlledPauseInterceptor` is provided. This interceptor requires a database to save the state of the conversation (paused or unpaused). The pause will be triggered by a fallback intent and resume if an intent with the "unpause" action is detected. For every user the current state of the interaction is saved in the database. This interceptor could serve as baseline for some clever logic to inform your staff that one of your bot conversations has some issues that need to be addressed (fix the bot, contact the user personally).

## Contact

Please send a mail to emubot@e-mundo.de if you have any further questions/inquiries.
