"use strict";

var gl;
var canvas;
var canvasRect;
var program;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(1.0, 1.0, 1.0);
const up = vec3(0.0, 1.0, 0.0);

var points;
var colors;
var axisVB;
var axisCB;

$(document).ready(function(){

	$("#gl-canvas").click(function(event){
	});

    $("#create-button").click(function(event){

        var value = $('input[name="model"]:checked').val();
        if(value == "cube")
        {
            console.log("cube");
            drawCube();
        }
    });

});

window.onload = function init() {

	canvas = document.getElementById( "gl-canvas" );
	canvasRect = canvas.getBoundingClientRect();

	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3( radius*Math.sin(theta)*Math.cos(phi),
                radius*Math.sin(theta)*Math.sin(phi),
                radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    drawAxis();

}

function drawAxis()
{
	points = [ vec4(100.0, 0.0, 0.0, 1),
			     vec4(-100.0, 0.0, 0.0, 1),
			     vec4(0.0, 100.0, 0.0, 1),
			     vec4(0.0, -100.0, 0.0, 1),
			     vec4(0.0, 0.0, 100.0, 1),
			     vec4(0.0, 0.0, -100.0, 1)];

    colors = [  vec4(1.0,0.0,0.0,1.0),
                vec4(1.0,0.0,0.0,1.0),
                vec4(0.0,1.0,0.0,1.0),
                vec4(0.0,1.0,0.0,1.0),
                vec4(0.0,0.0,1.0,1.0),
                vec4(0.0,0.0,1.0,1.0)];

    axisVB = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, axisVB);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    axisCB = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, axisCB );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    gl.drawArrays( gl.LINES, 0, 6 );
}

function drawCube()
{

    points = [];
    colors = [];
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );



gl.bindBuffer( gl.ARRAY_BUFFER, axisVB);
gl.bindBuffer( gl.ARRAY_BUFFER, axisCB );
gl.drawArrays( gl.LINES, 0, 6 );

var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    console.log(points.length);
    for( var i=0; i<points.length; i+=3)
    {
        gl.drawArrays( gl.LINE_LOOP, i, 3 );
    }
}
function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vec4(1.0, 0.0, 0.0, 1.0 ));
    }

}