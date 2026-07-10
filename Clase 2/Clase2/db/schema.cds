using { cuid, managed } from '@sap/cds/common';
namespace clase2.db; 

entity Libros : cuid, managed {
    titulo: String;
    autor: Association to Autores; //Asociacion autogestinado (No especificamos la key)
    genero: String;
    fechaPublicacion: String;
    paginas: Integer;
    precio: Decimal(9,2);
    stock: Integer;
    Capitulos: Composition of many Capitulos on Capitulos.libro = $self; 
    estado: Association to EstadoLibros;
    virtual autorString: String;
}

entity EstadoLibros {
    key codigo: CodigoEstadoLibro;
    criticidad: Integer;
    displayText: String;
}

entity Autores: cuid, managed {
    name: String;
    libros: Association to many Libros on libros.autor = $self; //Asociacion gestionada (Especificamos la key)
}
type CodigoEstadoLibro : String(1) enum {
    Disponible = 'D';
    Bajo_Stock = 'B';
    Sin_Stock = 'S';
}

entity Capitulos : cuid, managed {
    key libro: Association to Libros;
    numero: Integer;
    titulo: String;
    paginas: Integer; 
}
