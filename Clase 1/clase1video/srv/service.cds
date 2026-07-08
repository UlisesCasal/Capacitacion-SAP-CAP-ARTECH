using { clase1.db as db } from '../db/schema';

service LibreriaService {
    entity Libros as projection on db.Libros;
    entity Autores as projection on db.Autores;
}