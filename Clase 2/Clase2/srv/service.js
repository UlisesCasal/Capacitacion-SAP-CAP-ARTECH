const cds = require('@sap/cds')
const util = require('./utils/util')

module.exports = class LibreriaService extends cds.ApplicationService { init() {

  const { Libros, Autores, EstadoLibros } = cds.entities('LibreriaService')

  this.on('READ', Libros, async (req, next) => {
    const librosDB = await next()

    try{
      const response = await fetch('https://gutendex.com/books?languages=es')
      const data = await response.json()
      const librosAPI = util.formatearLibrosApi(data.results)

      if(req.query.SELECT.one){
        if(librosDB) return librosDB
        return librosAPI.find(l => l.ID === req.data.ID)
      }

      return [...librosDB,...librosAPI]

    }catch(error){
      return librosDB
    }
  })

  /*
  this.before (['CREATE', 'UPDATE'], Libros, async (req) => {
    console.log('Before CREATE/UPDATE Libros', req.data)
  })
  this.after ('READ', Libros, async (libros, req) => {
    console.log('After READ Libros', libros)
  })
  this.before (['CREATE', 'UPDATE'], Autores, async (req) => {
    console.log('Before CREATE/UPDATE Autores', req.data)
  })
  this.after ('READ', Autores, async (autores, req) => {
    console.log('After READ Autores', autores)
  })
  this.before (['CREATE', 'UPDATE'], EstadoLibros, async (req) => {
    console.log('Before CREATE/UPDATE EstadoLibros', req.data)
  })
  this.after ('READ', EstadoLibros, async (estadoLibros, req) => {
    console.log('After READ EstadoLibros', estadoLibros)
  })
  */

  return super.init()
}}
