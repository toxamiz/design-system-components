const { renderToStaticMarkup } = require( 'react-dom/server' );
const React = require( 'react' );
const Babel = require( '@babel/core' );
const ReactDocs = require( 'react-docgen' );
const Pretty = require( 'pretty' );
const ReactElementToJSXString = require( 'react-element-to-jsx-string' );


/**
 * Transform ES6 or JSX into CommonJS.
 * @param {string} code - Code to transpile
 * 
 * @returns {string} - CommonJS string output
 */
const TransformCode = ( code ) => {
	return Babel.transform( code, {
		presets: [ '@babel/preset-react', '@babel/preset-env' ],
		minified: true,
		comments: false
	}).code;
}


/**
 * Return a valid, evaluated React component, given react source code.
 * 
 * @param {string} reactSource - React source code data.
 */
const CreateComponent = ( reactSource ) => {
	let commonjs = TransformCode( reactSource );

	return React.createElement( eval( commonjs ), GetRequiredProps( reactSource ) );
}


/**
 * Return HTML markup from a React component
 * 
 * @param {string} reactSource - React source code data.
 */
const RenderHTML = ( reactSource ) => {
	let Component = CreateComponent( reactSource );

	// Extract static markup from react source
	let html = renderToStaticMarkup( Component );

	// Return formatted HTML as string.
	return Pretty( html );
}


/**
 * Return JSX markup from a React component
 * 
 * @param {string} reactSource - React source code data.
 */
const RenderReactJSX = ( reactSource ) => {
	let Component = CreateComponent( reactSource );

	return ReactElementToJSXString( Component );
}


/**
 * Return a object containg the required properties and their description.
 * 
 * @param {string} reactSource - React source code data.
 */
const GetRequiredProps = ( reactSource ) => {
	let docs = ReactDocs.parse( reactSource );
	let result = {}

	Object.entries( docs.props ).forEach( ( [ key, value ] ) => {
		if( value.required == true ){
			Object.assign( result, { [ key ]: value.description } );
		}
	});

	return result;
}


/**
 * 
 * @param {object} reactSource - Object of file paths
 */
const RenderReactPropsMarkdownTable = async ( reactSource ) => {
	if( reactSource ) {
		let docs = ReactDocs.parse( reactSource );
		let result = `Prop name | Type | Description | Required\n--- | --- | --- | ---\n`;
	
		Object.entries( docs.props ).forEach( ( [key, value] ) => {
			result += `${key} | ${value.type.name} | ${value.description} | ${value.required}\n`
		})
	
		return result;
	}
	return "";
}


module.exports.RenderHTML = RenderHTML;
module.exports.RenderReactJSX = RenderReactJSX;
module.exports.RenderReactPropsMarkdownTable = RenderReactPropsMarkdownTable;