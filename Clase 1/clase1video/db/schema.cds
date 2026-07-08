using { cuid, managed } from '@sap/cds/common';
namespace clase1.db; 

entity Libros : cuid, managed {
    titulo: String;
    autor: Association to Autores; //Asociacion autogestinado (No especificamos la key)
}

entity Autores: cuid, managed {
    name: String;
    libros: Association to many Libros on libros.autor = $self; //Asociacion gestionada (Especificamos la key)
}