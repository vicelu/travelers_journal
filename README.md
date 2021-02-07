# Travelers journal

### Fancy interactive log of visited places

#### Mapbox as frontend, with Node.JS backend server pulling data from PostGIS spatial database

## To use Traveler's Journal locally

#### Databse preparation

 - Create a user with username _postgis_user_ and password _password_ 
 - Create a db called _travelers_journal_ and make sure you extend your Postgres db with PostGIS
 - To restore db use the databse dump found in _root/dump_ folder:

	    psql -U postgis_user -d travelers_journal < dbexport.pgsql

#### Install dependencies

 - In _root/server_ AND in _root/src_ run the following command:
        
        yarn install

#### Crank up the server

- In _root/server_ run:
        
        yarn start

#### Bring the GUI to life

- In _root/src_ run:

        yarn serve

### Voila, now you can access the app at _localhost:8080_
