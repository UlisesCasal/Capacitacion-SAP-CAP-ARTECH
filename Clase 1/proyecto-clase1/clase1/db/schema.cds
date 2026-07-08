using { cuid, managed } from '@sap/cds/common';
namespace clase1.db;

entity Libros: cuid, managed  {
    titulo: String;
    autor: Association to Autores; //Asociacion autoadministrada 
}

entity Autores: cuid, managed{
    nombre: String;
    libros: Association to many Libros on libros.autor = $self; //Asociacion administrada
}