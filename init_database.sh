#!/bin/bash
echo "Setting up node..."
npm i 

echo "Resetting database..."
npm run reset-database
npm run prisma-pull-generate

echo "Inserting data"
npm run generate-database

