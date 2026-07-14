using LibreriaService as service from '../../srv/service';
using from '../../db/schema';

annotate service.Libros with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'titulo',
                Value : titulo,
            },
            {
                $Type : 'UI.DataField',
                Label : 'genero',
                Value : genero,
            },
            {
                $Type : 'UI.DataField',
                Label : 'fechaPublicacion',
                Value : fechaPublicacion,
            },
            {
                $Type : 'UI.DataField',
                Label : 'paginas',
                Value : paginas,
            },
            {
                $Type : 'UI.DataField',
                Label : 'precio',
                Value : precio,
            },
            {
                $Type : 'UI.DataField',
                Label : 'stock',
                Value : stock,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Capitulos',
            ID : 'Capitulos',
            Target : 'Capitulos/@UI.LineItem#Capitulos',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'titulo',
            Value : titulo,
        },
        {
            $Type : 'UI.DataField',
            Label : 'genero',
            Value : genero,
        },
        {
            $Type : 'UI.DataField',
            Label : 'fechaPublicacion',
            Value : fechaPublicacion,
        },
        {
            $Type : 'UI.DataField',
            Label : 'precio',
            Value : precio,
        },
        {
            $Type : 'UI.DataField',
            Value : estado_codigo,
            Label : 'estado_codigo',
            Criticality : estado.criticidad,
        },
        {
            $Type : 'UI.DataField',
            Value : autorString,
            Label : 'autorString',
        },
    ],
    UI.SelectionFields : [
        genero,
    ],
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : titulo,
        },
        TypeName : '',
        TypeNamePlural : '',
    },
);

annotate service.Libros with {
    autor @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'Autores',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : autor_ID,
                ValueListProperty : 'ID',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name',
            },
        ],
    }
};

annotate service.Libros with {
    genero @Common.Label : 'genero'
};

annotate service.Capitulos with @(
    UI.LineItem #Capitulos : [
        {
            $Type : 'UI.DataField',
            Value : libro.Capitulos.titulo,
            Label : 'titulo',
        },
        {
            $Type : 'UI.DataField',
            Value : libro.Capitulos.numero,
            Label : 'numero',
        },
        {
            $Type : 'UI.DataField',
            Value : libro.Capitulos.paginas,
            Label : 'paginas',
        },
    ]
);

annotate service.Libros with {
    estado @(
        Common.Text : estado.displayText,
        Common.Text.@UI.TextArrangement : #TextOnly,
        )
};

