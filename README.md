
# Domestic Power Monitoring

Front-end software used for monitoring power information recorded by custom hardware designed for this project. This was written with Javascript and MySQL, and uses TCP to communicate with micro-controllers embedded in each power monitoring device.

The project was done as the Capstone Engineering Project as required by the Engineering Department at Walla Walla University.

While my portion of the project was software, check out our group's final paper [here](https://abinder.dev/img/Smart_Domestic_Power_Monitoring.pdf).

# Installation
Requires node.js and a MySQL server.

The system consists of three sections: the client, API, and database. Installation of each environment is described below.

## API

Navigate into the api folder and install with npm. 

```
cd client
npm install
```
### Configuration

After installation completes, the back-end needs to be configured by modifying the [config.json](/api/config.json) file. 

In the database section, user information needs to be input for connecting to the database. The user needs read/write access to the `devices` and `powerusage` tables of the database.

In the TCP server section, the information for running the TCP server is held here. It needs an IP address and Port. In Windows environments, the port needs to be opened to TCP traffic in Windows Firewall.

After configuration is complete, the back-end can be run with `npm start`.


## Client

Navigate into the client folder and install with npm. On Windows environments, client installation should be done in an elevated command prompt.

```
cd client
npm install
```

After installation, the client should be configured by modifying the [config.json](/client/src/config.json) file with the information from the API setup.

After setup, the client can be run with `npm start`.

## Database

The database can be installed with the MySQL community installer. While the MySQL Server is the only requirement, MySQL Workbench is recommended for management. 

The default user needs to be setup with the Legacy Authentication Method in order for the API to connect to the database.

After the server is set up, the [create.sql](/db/create.sql) script should be run to configure the database.

The front-end will not run with at least one device in the database, so one needs to be added manually using MySQL Workbench.

Once everything is setup, the interface should be available at `localhost:3000` if default configuration ports are used.
