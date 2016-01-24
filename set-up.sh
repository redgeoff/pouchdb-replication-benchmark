#!/usr/bin/env bash

# Update apt-get
apt-get update -y

# Update Ubuntu
apt-get -y upgrade
apt-get -y dist-upgrade

# Get latest version of node
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -

# Install node & build-essential (for make)
apt-get install -y nodejs build-essential

# Update npm
npm install npm -g

# Install CouchDB
apt-get install couchdb -y

# Enable CouchDB to listen on any host
sed -i "s/;bind_address = 127.0.0.1/bind_address = 0.0.0.0/g" /etc/couchdb/local.ini
service couchdb restart

# Enabled CORS
npm install -g add-cors-to-couchdb
add-cors-to-couchdb

# Install npm deps
cd /vagrant/app
npm install

# Populate the database
npm run load
