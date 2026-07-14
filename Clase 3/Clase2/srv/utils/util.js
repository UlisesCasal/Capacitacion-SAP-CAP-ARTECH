const crypto = require('crypto')
const { faker } = require('@faker-js/faker')

function generarUUID(externalId) {
    const hash = crypto.createHash('md5').update(String(externalId)).digest('hex').split('')
    hash[12] = '4' // fuerza el nibble de "version" a un valor valido (1-5)
    hash[16] = ['8', '9', 'a', 'b'][parseInt(hash[16], 16) % 4] // fuerza el nibble de "variant" a un valor valido (8-b)
    const fixed = hash.join('')
    return `${fixed.slice(0, 8)}-${fixed.slice(8, 12)}-${fixed.slice(12, 16)}-${fixed.slice(16, 20)}-${fixed.slice(20, 32)}`
}

function formatearLibrosApi(libros) {
    return libros.map((libro) => ({
        ID: generarUUID(libro.id),
        titulo: libro.title,
        fechaPublicacion: null,
        paginas: null,
        precio: null,
        genero: libro.subjects?.[0] || null,
        stock: null,
        Capitulos: [],
        autorString: libro.authors[0]?.name || null

    }))

}

function generarCapitulosApi(libros) {
    const capitulos = [];
    //Recorro los libros y genero 5 capítulos para cada uno
    libros.forEach(libro => {
        for (let i = 1; i <= 5; i++) {
            
            console.log(`[ UTIL.JS ] Generando capítulo ${i} para el libro ${libro.ID}`);
            capitulos.push(generarCapitulo(libro.ID, i));
        }
    });

    return capitulos
}

function generarCapitulo(libroID, numeroCapitulo) {
    return {
        ID: generarUUID(libroID + numeroCapitulo),
        createdAt: faker.date.anytime(),
        createdBy: faker.internet.email(),
        modifiedAt: faker.date.anytime(),
        modifiedBy: faker.internet.email(),
        libro_ID: libroID,
        numero: numeroCapitulo,
        titulo: faker.book.title().replace(/^\w/, (c) => c.toUpperCase()),
        paginas: faker.number.int({ min: 4, max: 50 })
    }
}


module.exports = {
    formatearLibrosApi,
    generarCapitulosApi
}