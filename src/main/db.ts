import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

// Enable PouchDB query capabilities
PouchDB.plugin(PouchDBFind)

const localDB = new PouchDB('water-park') // Local database
const remoteDB = new PouchDB('http://admin:admin@127.0.0.1:5984/water-park') // Remote CouchDB

// Sync localDB with CouchDB
localDB
  .sync(remoteDB, { live: true, retry: true })
  .on('change', (info) => console.log('Sync change:', info))
  .on('error', (err) => console.error('Sync error:', err))

// write queries here
