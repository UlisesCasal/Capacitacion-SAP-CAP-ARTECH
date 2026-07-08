sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'librerialistview/test/integration/FirstJourney',
		'librerialistview/test/integration/pages/LibrosList',
		'librerialistview/test/integration/pages/LibrosObjectPage'
    ],
    function(JourneyRunner, opaJourney, LibrosList, LibrosObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('librerialistview') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheLibrosList: LibrosList,
					onTheLibrosObjectPage: LibrosObjectPage
                }
            },
            opaJourney.run
        );
    }
);