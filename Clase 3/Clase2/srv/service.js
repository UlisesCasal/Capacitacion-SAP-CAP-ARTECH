const cds = require('@sap/cds')
const util = require('./utils/util')

module.exports = class LibreriaService extends cds.ApplicationService { init() {

  const { Libros, Autores, EstadoLibros, Capitulos } = cds.entities('LibreriaService')

  this.on('READ', Libros, async (req, next) => {
    const librosDB = await next()

    try{
      console.log("[ READ LIBROS ] LLamando a la API de Libros")
      const response = await fetch('https://gutendex.com/books?languages=es')
      const data = await response.json()
      const librosAPI = util.formatearLibrosApi(data.results)

      //Obtengo los libros que no estan persistidos en la base de datos
      const idsExistentes = new Set(librosDB.map(l => l.ID))
      const librosNuevos = librosAPI.filter(l => !idsExistentes.has(l.ID))
      
      //Persisto en la base de datos los libros que no existan
      if(librosNuevos.length){
        await cds.tx(req).run(
          INSERT.into(Libros).entries(
            librosNuevos.map(({ Capitulos, autorString, ...libro }) => libro)
          )
        )
      }
      //Caso del object page
      if(req.query.SELECT.one){
        if(librosDB) return librosDB
        return librosAPI.find(l => l.ID === req.data.ID)
      }

      return [...librosDB,...librosNuevos]

    }catch(error){
      return librosDB
    }
  })

  this.on('READ', Capitulos, async (req, next) => {
    
    const capitulosDB = await next()

    //Le paso a la funcion todos los libros ya guardados 
    const capitulosAPI = util.generarCapitulosApi(await cds.tx(req).run(SELECT.from(Libros)))

    //Inserto los capitulos generados en la tabla de la base de datos
    await cds.tx(req).run(
      UPSERT.into(Capitulos).entries(capitulosAPI) //Modifica o inserta aquellos ID que no estan
    )

    //Retorno un array con todos los capitulos que estan en la DB + los que se trae al generar con Faker
    return [...capitulosDB, ...capitulosAPI]
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
