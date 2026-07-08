using LibreriaService as service from '../../srv/service';
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
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
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
            Value : status_codigo,
            Label : 'status_codigo',
        },
        {
            $Type : 'UI.DataField',
            Value : stock,
            Label : 'stock',
        },
    ],
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

