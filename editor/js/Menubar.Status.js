import * as THREE from 'three';

import { UIPanel } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function MenubarStatus( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu right' );

	editor.signals.savingStarted.add( function () {

		console.log('Saving started')

	} );

	editor.signals.savingFinished.add( function () {

		console.log('Saving finished')

	} );

	/* commented out by Jason on Apr because UIAnchor does not exist
	const version = new UIAnchor( 'How to get started' );
	version.setClass( 'title' );
	version.setOpacity( 0.65 );
	version.setHref( 'https://docs.google.com/document/d/1qv7PBwLh8m6FqIqtHme363KDS9KRoEMxF3haKg3ciR4' );
	container.add( version );
	*/

	return container;

}

export { MenubarStatus };
