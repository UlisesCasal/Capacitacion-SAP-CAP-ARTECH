//SEGUNDO PASO AGREGAMOS UUID CON CRIPTOGRAFIA 
const crypto = require('crypto')

function generarUUID(externalId) {
    const hash = crypto.createHash('md5').update(String(externalId)).digest('hex').split('')
    hash[12] = '4' // fuerza el nibble de "version" a un valor valido (1-5)
    hash[16] = ['8', '9', 'a', 'b'][parseInt(hash[16], 16) % 4] // fuerza el nibble de "variant" a un valor valido (8-b)
    const fixed = hash.join('')
    return `${fixed.slice(0,8)}-${fixed.slice(8,12)}-${fixed.slice(12,16)}-${fixed.slice(16,20)}-${fixed.slice(20,32)}`
}

//PRIMER PASO:
function formatLibros(libros) {
    return libros.map((libro) => ({
        ID: generarUUID(libro.id), //Sin esto en primer paso 
        titulo: libro.title,
        autorNombre: libro.authors?.[0]?.name || 'Autor desconocido',
        genero: libro.subjects?.[0] || null,
        stock: null,
        status_code: null,
        IsActiveEntity: true,
        HasActiveEntity: false,
        HasDraftEntity: false
    }))
}

module.exports = {
    formatLibros
}