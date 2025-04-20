import * as THREE from 'three';

import { UIPanel, UIRow, UIInput,
	  UIColor, UISelect,
	  UIText, UINumber
	 } from './libs/ui.js';
import { SetValueCommand } from './commands/SetValueCommand.js';
import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { SetRotationCommand } from './commands/SetRotationCommand.js';
import { SetScaleCommand } from './commands/SetScaleCommand.js';

import { refreshUI } from './Sidebar.Scene.js';

const predefinedColors = {
	4: [ 'Transparent Blue', '0000FF', .55 ],
	5: [ 'Fire', 'FF0000', 1.0 ],
	6: [ 'Green', '228B22', 0.4 ],
	7: [ 'Brown', 'A52A2A', 0.8 ],
	8: [ 'Water', '40A4DF', 0.2 ],
};

function generateOptions( baseOptions, colorKey, predefined ) {
	const options = { ...baseOptions };
	options[ colorKey ] = 'Color';
	for ( const key in predefined ) {
		options[ key ] = predefined[ key ][ 0 ];
	}
	return options;
}

function findPredefinedKey( hex, alpha, predefined ) {
	const alphaTolerance = 0.001;
	for ( const key in predefined ) {
		if ( predefined[ key ][ 1 ].toLowerCase() === hex.toLowerCase() &&
		     Math.abs( predefined[ key ][ 2 ] - alpha ) < alphaTolerance ) {
			return key;
		}
	}
	return null;
}

function SidebarObject( editor ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIPanel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setDisplay( 'none' );

	// name

	const objectNameRow = new UIRow();
	const objectName = new UIInput()
		.setWidth( '150px' )
		.setFontSize( '12px' )
		.setId( 'Name' )
		.onChange( function () {

			editor.execute(
				new SetValueCommand(
					editor,
					editor.selected,
					'name',
					objectName.getValue()
				)
			);
			refreshUI();

		} );

	objectNameRow.add(
		new UIText( strings.getKey( 'sidebar/object/name' ) ).setClass( 'Label' )
	);
	objectNameRow.add( objectName );

	container.add( objectNameRow );

	// position

	const objectPositionRow = new UIRow();
	const objectPositionX = new UINumber()
		.setPrecision( 3 )
		.setWidth( '50px' )
		.setId( 'PosX' )
		.onChange( update );
	const objectPositionY = new UINumber()
		.setPrecision( 3 )
		.setWidth( '50px' )
		.setId( 'PosY' )
		.onChange( update );
	const objectPositionZ = new UINumber()
		.setPrecision( 3 )
		.setWidth( '50px' )
		.setId( 'PosZ' )
		.onChange( update );

	objectPositionRow.add(
		new UIText( strings.getKey( 'sidebar/object/position' ) ).setClass( 'Label' )
	);
	objectPositionRow.add( objectPositionX, objectPositionY, objectPositionZ );

	container.add( objectPositionRow );

	// rotation

	const objectRotationRow = new UIRow();
	const objectRotationX = new UINumber()
		.setStep( 10 )
		.setNudge( 0.1 )
		.setUnit( '°' )
		.setWidth( '50px' )
		.setId( 'RotX' )
		.onChange( update );
	const objectRotationY = new UINumber()
		.setStep( 10 )
		.setNudge( 0.1 )
		.setUnit( '°' )
		.setWidth( '50px' )
		.setId( 'RotY' )
		.onChange( update );
	const objectRotationZ = new UINumber()
		.setStep( 10 )
		.setNudge( 0.1 )
		.setUnit( '°' )
		.setWidth( '50px' )
		.setId( 'RotZ' )
		.onChange( update );

	objectRotationRow.add(
		new UIText( strings.getKey( 'sidebar/object/rotation' ) ).setClass( 'Label' )
	);
	objectRotationRow.add( objectRotationX, objectRotationY, objectRotationZ );

	container.add( objectRotationRow );

	// scale

	const objectScaleRow = new UIRow();
	const objectScaleX = new UINumber( 1 )
		.setPrecision( 3 )
		.setWidth( '50px' )
		.setId( 'SizeX' )
		.onChange( update );
	const objectScaleY = new UINumber( 1 )
		.setPrecision( 3 )
		.setWidth( '50px' )
		.setId( 'SizeY' )
		.onChange( update );
	const objectScaleZ = new UINumber( 1 )
		.setPrecision( 3 )
		.setWidth( '50px' )
		.setId( 'SizeZ' )
		.onChange( update );

	objectScaleRow.add(
		new UIText( strings.getKey( 'sidebar/object/scale' ) ).setClass( 'Label' )
	);
	objectScaleRow.add( objectScaleX, objectScaleY, objectScaleZ );

	container.add( objectScaleRow );

	// texture

	// Dropdown menu
	const dropdownRow = new UIRow();
	dropdownRow.add( new UIText( 'Texture' ).setClass( 'Label' ) );

	// Dropdowns for different conditions
	const sphereCylinderOptions = generateOptions( {}, 3, predefinedColors ); // Base {}, Color key 3
	const sphereCylinderDropdown = new UISelect()
		.setWidth( '150px' )
		.setFontSize( '12px' )
		.setOptions( sphereCylinderOptions ) // Use generated options
		.setId( 'SphereCylinderTexture' )
		.onChange( updateTexture );

	const coneDropdown = new UISelect()
		.setWidth( '150px' )
		.setFontSize( '12px' )
		.setOptions( { 4: 'Texture 1', 5: 'Texture 2', 3: 'Color' } ) // Cone options remain specific
		.setId( 'ConeTexture' )
		.onChange( updateTexture );

	const platformBoxBaseOptions = { 0: 'Texture 1', 1: 'Texture 2', 2: 'Texture 3', 3: 'Texture 4' };
	// Need to remap predefined keys for Box to avoid collision with texture keys (0-3)
	const platformPredefinedRemapped = {};
	let boxKeyStart = 5; // Start keys for predefined after textures (0-3) and custom color (4)
	for ( const key in predefinedColors ) {
		platformPredefinedRemapped[ boxKeyStart ] = predefinedColors[ key ];
		boxKeyStart++;
	}
	const platformBoxOptions = generateOptions( platformBoxBaseOptions, 4, platformPredefinedRemapped ); // Base textures, Color key 4
	const platformBoxDropdown = new UISelect()
		.setWidth( '150px' )
		.setFontSize( '12px' )
		.setOptions( platformBoxOptions ) // Use generated options
		.setId( 'PlatformTexture' )
		.onChange( updateTexture );

	dropdownRow.add( sphereCylinderDropdown );
	dropdownRow.add( coneDropdown );
	dropdownRow.add( platformBoxDropdown );

	// Color picker
	const colorPickerRow = new UIRow().setDisplay( 'none' ).setId( 'colorPickerRow' );
	const colorPicker = new UIColor()
		.setWidth( '150px' )
		.setId( 'TextureColor' )
		.onChange( handleColorChange );
	colorPickerRow.add( colorPicker );

	// Alpha
	const alphaRow = new UIRow().setDisplay( 'none' ).setId( 'alphaRow' );
	alphaRow.add( new UIText( 'Alpha' ).setClass( 'Label' ) );
	const alphaInput = new UINumber( 1 )
		.setPrecision( 2 )
		.setWidth( '50px' )
		.setRange( 0, 1 )
		.setId( 'TextureAlpha' )
		.onChange( handleAlphaChange );
	alphaRow.add( alphaInput );

	container.add( dropdownRow );
	container.add( colorPickerRow );
	container.add( alphaRow );

	// change functions
	function handleSelectionChange() {

		if ( editor.selected === null ) return;

		const selectedObject = editor.selected;

		// Hide all dropdowns initially
		sphereCylinderDropdown.setDisplay( 'none' );
		coneDropdown.setDisplay( 'none' );
		platformBoxDropdown.setDisplay( 'none' );
		colorPickerRow.setDisplay( 'none' );
		alphaRow.setDisplay( 'none' );

		// Show the correct UI elements based on the selected object
		if ( selectedObject.geometry.type == 'SphereGeometry' || selectedObject.geometry.type == 'CylinderGeometry' ) {

			sphereCylinderDropdown.setDisplay( '' );
			colorPickerRow.setDisplay( '' ); // Always show color/alpha for relevant types
			alphaRow.setDisplay( '' );

		} else if ( selectedObject.geometry.type == 'ConeGeometry' && selectedObject.name !== 'Spawn' ) {

			coneDropdown.setDisplay( '' );
			colorPickerRow.setDisplay( '' );
			alphaRow.setDisplay( '' );

		} else if ( selectedObject.geometry.type == 'BoxGeometry' ) {

			platformBoxDropdown.setDisplay( '' );
			colorPickerRow.setDisplay( '' ); // Show color picker even for textures, though it might be less relevant
			alphaRow.setDisplay( '' );

		}

	}

	function handleColorChange() {
		updateTexture();
	}

	function handleAlphaChange() {
		updateTexture();
	}

	function updateTexture() {

        if ( editor.selected === null ) return;

        const selectedObject = editor.selected;
        let selectedValue;
        let activeDropdown;

        // Determine active dropdown based on the selected object's geometry
        if ( selectedObject.geometry.type == 'SphereGeometry' || selectedObject.geometry.type == 'CylinderGeometry' ) {
            activeDropdown = sphereCylinderDropdown;
        } else if ( selectedObject.geometry.type == 'ConeGeometry' && selectedObject.name !== 'Spawn' ) {
            activeDropdown = coneDropdown;
        } else if ( selectedObject.geometry.type == 'BoxGeometry' ) {
            activeDropdown = platformBoxDropdown;
        } else {
            return;
        }

        selectedValue = activeDropdown.getValue();

        if ( selectedValue === null || selectedValue === undefined ) return;

        const colorValue = colorPicker.getValue();
        const alphaValue = alphaInput.getValue();
        let newMaterial;
        let updateSynchronous = true;

        // Determine which set of predefined colors/keys to use based on geometry
        const currentPredefined = ( selectedObject.geometry.type === 'BoxGeometry' ) ? platformPredefinedRemapped : predefinedColors;
        const customColorKey = ( selectedObject.geometry.type === 'BoxGeometry' ) ? '4' : '3';

        // Check if selectedValue corresponds to a predefined color
        const predefinedData = currentPredefined[ selectedValue ];

        if ( selectedObject.geometry.type == 'ConeGeometry' && ( selectedValue === '4' || selectedValue === '5' ) ) {
            const colors = [ 0xd52b2b, 0x41aed9 ];
            newMaterial = new THREE.MeshBasicMaterial( {
                color: colors[ selectedValue - 4 ],
                opacity: alphaValue,
                transparent: alphaValue < 1.0,
            } );
            selectedObject.material = newMaterial;
            selectedObject.userData.CustomTexture = [ 'hex', colors[ selectedValue - 4 ].toString(16).padStart(6, '0'), parseFloat( alphaValue ) ];

        } else if ( selectedObject.geometry.type == 'BoxGeometry' && ( selectedValue <= 3 && selectedValue >= 0 ) ) {
            updateSynchronous = false;
            const textureLoader = new THREE.TextureLoader();
            const texturePaths = [ './images/textures/bright.png', './images/textures/pm1.png', './images/textures/pm2.png', './images/textures/dark.png' ];
            textureLoader.load( texturePaths[ parseInt( selectedValue ) ], function ( texture ) {
                texture.colorSpace = THREE.SRGBColorSpace;
                newMaterial = new THREE.MeshBasicMaterial( {
                    map: texture,
                    color: 0xffffff,
                    opacity: alphaValue,
                    transparent: alphaValue < 1.0,
                } );
                selectedObject.material = newMaterial;
                selectedObject.userData.CustomTexture = [ texturePaths[ parseInt( selectedValue ) ], parseFloat(alphaValue) ];
                editor.signals.materialChanged.dispatch( selectedObject.material );
                editor.signals.objectChanged.dispatch( selectedObject );
            }, undefined, function ( error ) {
                console.error( 'An error happened during texture loading:', error );
            } );

        } else if ( predefinedData ) {
            const colorHex = predefinedData[ 1 ];
            const alpha = predefinedData[ 2 ];
            newMaterial = new THREE.MeshBasicMaterial( {
                color: parseInt( colorHex, 16 ),
                opacity: alpha,
                transparent: alpha < 1.0,
            } );
            selectedObject.material = newMaterial;
            selectedObject.userData.CustomTexture = [ 'hex', colorHex, alpha ];
            alphaInput.setValue( alpha );
            colorPicker.setValue( '#' + colorHex );

        } else if ( selectedValue === customColorKey ) {
            newMaterial = new THREE.MeshBasicMaterial( {
                color: colorValue,
                opacity: alphaValue,
                transparent: alphaValue < 1.0,
            } );
            selectedObject.material = newMaterial;
            selectedObject.userData.CustomTexture = [ 'hex', colorValue.substring( 1 ), parseFloat( alphaValue ) ];

        } else {
            return;
        }

        if ( updateSynchronous ) {
             editor.signals.materialChanged.dispatch( selectedObject.material );
             editor.signals.objectChanged.dispatch( selectedObject );
        }

    }

	editor.signals.objectSelected.add( handleSelectionChange );

	signals.objectSelected.add( function ( objects ) {

		if ( objects !== null) {

			container.setDisplay( 'block' );
			updateRows( objects );
			handleSelectionChange();
			updateUI( objects );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object !== editor.selected ) return;

		updateUI( object );

	} );

	signals.refreshSidebarObject3D.add( function ( object ) {

		if ( object !== editor.selected ) return;

		updateUI( object );

	} );

	function updateUI( object ) {

		objectName.setValue( object.name );
		if ( object.name == 'Spawn' ) {

		    document.querySelectorAll( 'input' )[ 5 ].disabled = true;

		} else {

		    document.querySelectorAll( 'input' )[ 5 ].disabled = false;

		}

		objectPositionX.setValue( object.position.x );
		objectPositionY.setValue( object.position.y );
		objectPositionZ.setValue( object.position.z );

		objectRotationX.setValue( object.rotation.x * THREE.MathUtils.RAD2DEG );
		objectRotationY.setValue( object.rotation.y * THREE.MathUtils.RAD2DEG );
		objectRotationZ.setValue( object.rotation.z * THREE.MathUtils.RAD2DEG );

		objectScaleX.setValue( object.scale.x );
		objectScaleY.setValue( object.scale.y );
		objectScaleZ.setValue( object.scale.z );

		const customTextureData = object.userData.CustomTexture;
		let currentDropdown = null;
		let currentTextureValue = null;
		let currentColor = '#ffffff';
		let currentAlpha = 1.0;
		let isPredefined = false;

		let activePredefined = predefinedColors;
		let activeCustomColorKey = '3';
		if ( object.geometry.type == 'SphereGeometry' || object.geometry.type == 'CylinderGeometry' ) {
			currentDropdown = sphereCylinderDropdown;
		} else if ( object.geometry.type == 'ConeGeometry' && object.name !== 'Spawn' ) {
			currentDropdown = coneDropdown;
		} else if ( object.geometry.type == 'BoxGeometry' ) {
			currentDropdown = platformBoxDropdown;
			activePredefined = platformPredefinedRemapped;
			activeCustomColorKey = '4';
		}

		if ( customTextureData ) {
			const type = customTextureData[ 0 ];
			if ( type === 'hex' ) {
				const hex = customTextureData[ 1 ];
				const alpha = customTextureData[ 2 ];
				currentColor = '#' + hex;
				currentAlpha = alpha;

				const predefinedKey = findPredefinedKey( hex, alpha, activePredefined );
				if ( predefinedKey !== null ) {
					currentTextureValue = predefinedKey;
					isPredefined = true;
				} else {
					currentTextureValue = activeCustomColorKey;
				}

				const coneColors = { 'd52b2b': '4', '41aed9': '5' };
				if ( object.geometry.type == 'ConeGeometry' && coneColors[ hex.toLowerCase() ] ) {
					currentTextureValue = coneColors[ hex.toLowerCase() ];
				}

			} else {
				const path = type;
				const alpha = customTextureData[ 1 ];
				currentAlpha = alpha;
				const boxPaths = { './images/textures/bright.png': '0', './images/textures/pm1.png': '1', './images/textures/pm2.png': '2', './images/textures/dark.png': '3' };
				if ( object.geometry.type == 'BoxGeometry' && boxPaths[ path ] ) {
					currentTextureValue = boxPaths[ path ];
				}
			}
		} else if ( object.material && object.material.isMeshBasicMaterial ) {
			const hex = object.material.color.getHexString();
			const alpha = object.material.opacity;
			currentColor = '#' + hex;
			currentAlpha = alpha;

			if ( object.material.map && object.geometry.type === 'BoxGeometry' ) {
				currentTextureValue = activeCustomColorKey;
			} else {
				const predefinedKey = findPredefinedKey( hex, alpha, activePredefined );
				if ( predefinedKey !== null ) {
					currentTextureValue = predefinedKey;
					isPredefined = true;
				} else {
					currentTextureValue = activeCustomColorKey;
				}
			}
		}

		if ( currentDropdown ) {
			const originalOnChange = currentDropdown.onChangeCallback;
			currentDropdown.onChangeCallback = null;
			currentDropdown.setValue( currentTextureValue );
			currentDropdown.onChangeCallback = originalOnChange;
		}

		const originalColorOnChange = colorPicker.onChangeCallback;
		const originalAlphaOnChange = alphaInput.onChangeCallback;
		colorPicker.onChangeCallback = null;
		alphaInput.onChangeCallback = null;

		colorPicker.setValue( currentColor );
		alphaInput.setValue( currentAlpha );

		colorPicker.onChangeCallback = originalColorOnChange;
		alphaInput.onChangeCallback = originalAlphaOnChange;

		if ( object.geometry.type == 'PlaneGeometry' ) {

		    	document.getElementById( 'PosX' ).disabled = true;
			document.getElementById( 'PosY' ).disabled = true;
			document.getElementById( 'RotX' ).disabled = true;
			document.getElementById( 'RotY' ).disabled = true;
			document.getElementById( 'RotZ' ).disabled = true;
			document.getElementById( 'SizeX' ).disabled = true;
			document.getElementById( 'SizeZ' ).disabled = true;
			document.getElementById( 'PosX' ).style.color = 'gray';
			document.getElementById( 'PosY' ).style.color = 'gray';
			document.getElementById( 'RotX' ).style.color = 'gray';
			document.getElementById( 'RotY' ).style.color = 'gray';
			document.getElementById( 'RotZ' ).style.color = 'gray';
			document.getElementById( 'SizeX' ).style.color = 'gray';
			document.getElementById( 'SizeZ' ).style.color = 'gray';

		} else {

		    	document.getElementById( 'PosX' ).disabled = false;
			document.getElementById( 'PosY' ).disabled = false;
			document.getElementById( 'RotX' ).disabled = false;
			document.getElementById( 'RotY' ).disabled = false;
			document.getElementById( 'RotZ' ).disabled = false;
			document.getElementById( 'SizeX' ).disabled = false;
			document.getElementById( 'SizeZ' ).disabled = false;
			document.getElementById( 'PosX' ).style.color = '';
			document.getElementById( 'PosY' ).style.color = '';
			document.getElementById( 'RotX' ).style.color = '';
			document.getElementById( 'RotY' ).style.color = '';
			document.getElementById( 'RotZ' ).style.color = '';
			document.getElementById( 'SizeX' ).style.color = '';
			document.getElementById( 'SizeZ' ).style.color = '';

		}

		updateTransformRows( object );

	}

	function updateRows( object ) {

		const properties = {};

		for ( const property in properties ) {

			const uiElement = properties[ property ];

			if ( Array.isArray( uiElement ) === true ) {

				for ( let i = 0; i < uiElement.length; i ++ ) {

					uiElement[ i ].setDisplay( object[ property ] !== undefined ? '' : 'none' );

				}

			} else {

				uiElement.setDisplay( object[ property ] !== undefined ? '' : 'none' );

			}

		}

	}

	function updateTransformRows( object ) {

		if ( object.isLight ) {

			objectRotationRow.setDisplay( 'none' );
			objectScaleRow.setDisplay( 'none' );

		} else {

			objectRotationRow.setDisplay( '' );
			objectScaleRow.setDisplay( '' );

		}

	}

	function update() {

		const object = editor.selected;

		if ( object !== null ) {

			const newPosition = new THREE.Vector3(
				objectPositionX.getValue(),
				objectPositionY.getValue(),
				objectPositionZ.getValue()
			);
			if ( object.position.distanceTo( newPosition ) >= 0.01 ) {

				editor.execute( new SetPositionCommand( editor, object, newPosition ) );

			}

			const newRotation = new THREE.Euler(
				objectRotationX.getValue() * THREE.MathUtils.DEG2RAD,
				objectRotationY.getValue() * THREE.MathUtils.DEG2RAD,
				objectRotationZ.getValue() * THREE.MathUtils.DEG2RAD
			);
			if (
				new THREE.Vector3()
					.setFromEuler( object.rotation )
					.distanceTo( new THREE.Vector3().setFromEuler( newRotation ) ) >= 0.01
			) {

				editor.execute( new SetRotationCommand( editor, object, newRotation ) );

			}

			const newScale = new THREE.Vector3(
				objectScaleX.getValue(),
				objectScaleY.getValue(),
				objectScaleZ.getValue()
			);
			if ( object.scale.distanceTo( newScale ) >= 0.01 ) {

				if ( editor.selected.geometry.type == 'ConeGeometry' ) return;
				editor.execute( new SetScaleCommand( editor, object, newScale ) );

			}

		}

	}

	return container;

}

export { SidebarObject };
