import * as THREE from 'three';

import { UIPanel } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function MenubarStatus( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu right' );

	const autosave = new UIBoolean( editor.config.getKey( 'autosave' ), strings.getKey( 'menubar/status/autosave' ) );
	autosave.text.setColor( '#888' );
	autosave.onChange( function () {

		const value = this.getValue();

		editor.config.setKey( 'autosave', value );

		if ( value === true ) {

			editor.signals.sceneGraphChanged.dispatch();

		}

	} );
	container.add( autosave );

	editor.signals.savingStarted.add( function () {

		autosave.text.setTextDecoration( 'underline' );

	} );

	editor.signals.savingFinished.add( function () {

		autosave.text.setTextDecoration( 'none' );

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
