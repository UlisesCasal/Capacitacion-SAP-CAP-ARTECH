sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"libreria/test/integration/pages/LibrosList.gen",
	"libreria/test/integration/pages/LibrosObjectPage.gen"
], function (JourneyRunner, LibrosListGenerated, LibrosObjectPageGenerated) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('libreria') + '/test/flp.html#app-preview',
        pages: {
			onTheLibrosListGenerated: LibrosListGenerated,
			onTheLibrosObjectPageGenerated: LibrosObjectPageGenerated
        },
        async: true
    });

    return runner;
});

