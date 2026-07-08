using { clase1.db as db } from '../db/schema';

service LibreriaService {
    entity Libros as projection on db.Libros;
    entity Autores as projection on db.Autores;
    entity Capitulos as projection on db.Capitulos;
    entity EstadoLibro as projection on db.EstadoLibro;
}
//Habilitamos el draft para la entidad Libros, ya que es la entidad principal de la aplicacion y es la que se va a modificar
annotate LibreriaService.Libros with @odata.draft.enabled;
