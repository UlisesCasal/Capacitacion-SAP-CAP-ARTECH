using {
    cuid,
    managed,
    sap.common.Currencies //Utilidad para value helps
} from '@sap/cds/common';

namespace clase1.db;

entity Libros : cuid, managed {
    titulo           : String;
    autor            : Association to Autores; //Asociacion autogestinado (No especificamos la key)
    genero           : String;
    fechaPublicacion : Date;
    paginas          : Integer;
    precio           : Decimal(9, 2);
    moneda           : Association to Currencies; //Value help de monedas (Asociacion autogestionada)
    stock            : Integer;
    status           : Association to EstadoLibro; //Asociacion autogestionada (No especificamos la key)
    Capitulos        : Association to many Capitulos
                           on Capitulos.libro = $self; //Asociacion gestionada (Especificamos la key)
    virtual autorNombre : String; //Solo para cuando se llama desde la API 
}

entity EstadoLibro {
    key codigo      : CodigoEstadoLibro;
        criticidad  : Integer;
        displayText : String;
}

type CodigoEstadoLibro : String(1) enum {
    Disponible = 'D';
    Bajo_Stock = 'B';
    Sin_Stock = 'S';
}


entity Autores : cuid, managed {
    name   : String;
    libros : Association to many Libros
                 on libros.autor = $self; //Asociacion gestionada (Especificamos la key)
}

entity Capitulos : cuid, managed {
    key libro   : Association to Libros; //Asociacion autogestionada
        numero  : Integer;
        titulo  : String;
        paginas : Integer;

}
