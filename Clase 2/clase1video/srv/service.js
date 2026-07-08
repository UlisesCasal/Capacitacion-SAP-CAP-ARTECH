const cds = require('@sap/cds')
const util = require('./utils/utils.js')//Nos traemos nuestro utils con todas sus funciones

//Clase encargada de extender todo el comportamiento de nuestro service.cds, para poder agregar logica de negocio a los eventos de nuestras entidades
//El init significa que se ejecutara cuando se inicialice el servicio en el servidor
module.exports = class LibreriaService extends cds.ApplicationService {
  init() {

    //Importa las entidades de nuestro service.cds 
    const { Libros, Autores, EstadoLibro, Capitulos } = cds.entities('LibreriaService')

    //Recibe una lista de eventos y una entidad, y ejecuta la funcion asincrona que recibe como tercer parametro antes de que se ejecute el evento
    this.before(['CREATE', 'UPDATE'], Libros, async (req) => {
      console.log('Before CREATE/UPDATE Libros', req.data)
    })

    //En este metodo entra cuando se traen todos los libros o cuando hacemos click en el object page
    //Llenamos con mas libros: 
    this.on('READ', 'Libros', async (req, next) => {
      const librosDB = await next() // ejecuta el SELECT normal contra la BD (objeto/undefined si es .one, array si es lista)

      try {
        const response = await fetch('https://gutendex.com/books?languages=es')
        const data = await response.json()
        const librosAPI = util.formatLibros(data.results)

        //Cuando entra al object page (READ por key): nunca hacemos spread de librosDB,
        //porque ahi puede venir un objeto solo o undefined (no es iterable)
        if (req.query.SELECT.one) {
          if (librosDB) return librosDB //el libro es de la BD, ya esta resuelto
          return librosAPI.find(l => l.ID === req.data.ID) //buscamos solo entre los de la API
        }

        return [...(librosDB || []), ...librosAPI]

      } catch (error) {
        console.log('Error al leer los libros de la API', error)
        return librosDB //si falla la API, devolvemos lo que haya (o undefined -> 404 normal en el .one)
      }
    })

/*
    this.before('READ', Libros, async (req) => {

    })
    this.after('READ', Libros, async (libros, req) => {
      console.log('After READ Libros', libros)
    })
    this.before(['CREATE', 'UPDATE'], Autores, async (req) => {
      console.log('Before CREATE/UPDATE Autores', req.data)
    })
    this.after('READ', Autores, async (autores, req) => {
      console.log('After READ Autores', autores)
    })
    this.before(['CREATE', 'UPDATE'], EstadoLibro, async (req) => {
      console.log('Before CREATE/UPDATE EstadoLibro', req.data)
    })
    this.after('READ', EstadoLibro, async (estadoLibro, req) => {
      console.log('After READ EstadoLibro', estadoLibro)
    })
    this.before(['CREATE', 'UPDATE'], Capitulos, async (req) => {
      console.log('Before CREATE/UPDATE Capitulos', req.data)
    })
    this.after('READ', Capitulos, async (capitulos, req) => {
      console.log('After READ Capitulos', capitulos)
    })
  */

    return super.init()
  }
}
