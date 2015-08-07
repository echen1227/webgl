"use strict";

var gl;
var canvas;
var canvasRect;
var shaderProgram;

var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = -10;
var far = -7;

var modelViewMatrix, projectionMatrix;
var eye;
const lookat = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var axisVertexBuffer;
var axisColorBuffer;
var vertexBufferArray = [];
var colorBufferArray = [];

$(document).ready(function(){

	$("#gl-canvas").click(function(event){
	});

    $("#create-button").click(function(event){

        var value = $('input[name="model"]:checked').val();
        if(value == "cube")
        {
            createCube();
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

    // init shader
    shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( shaderProgram );

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    //camera matrix
    eye = vec3( radius*Math.sin(theta)*Math.cos(phi),
                radius*Math.sin(theta)*Math.sin(phi),
                radius*Math.cos(theta));
    // eye = vec3(1,1,1);
    modelViewMatrix = lookAt(eye, lookat , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    // projectionMatrix = perspective(90.0,1.0,near,far);

    gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, flatten(projectionMatrix) );


    // init axis
    var points = [  vec4(100.0, 0.0, 0.0, 1),
                    vec4(-100.0, 0.0, 0.0, 1),
                    vec4(0.0, 100.0, 0.0, 1),
                    vec4(0.0, -100.0, 0.0, 1),
                    vec4(0.0, 0.0, 100.0, 1),
                    vec4(0.0, 0.0, -100.0, 1)];

    var colors = [  vec4(1.0,0.0,0.0,1.0),
                    vec4(1.0,0.0,0.0,1.0),
                    vec4(0.0,1.0,0.0,1.0),
                    vec4(0.0,1.0,0.0,1.0),
                    vec4(0.0,0.0,1.0,1.0),
                    vec4(0.0,0.0,1.0,1.0)];

    axisVertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, axisVertexBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    axisColorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, axisColorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    gl.enable(gl.DEPTH_TEST);
    tick();
}

function drawAxis()
{
    gl.bindBuffer( gl.ARRAY_BUFFER, axisVertexBuffer);
    gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, axisColorBuffer );
    gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( gl.LINES, 0, 6 );
}

function createCube()
{
    var cube = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];
    cube.vertexArray = [
        cube[1],cube[0],cube[3],cube[1],cube[3],cube[2],
        cube[2],cube[3],cube[7],cube[2],cube[7],cube[6],
        cube[3],cube[0],cube[4],cube[3],cube[4],cube[7],
        cube[6],cube[5],cube[1],cube[6],cube[1],cube[2],
        cube[4],cube[5],cube[6],cube[4],cube[6],cube[7],
        cube[5],cube[4],cube[0],cube[5],cube[0],cube[1],
    ];
    cube.colorArray = [];
    for ( var i = 0; i < cube.vertexArray.length; i++ ) {
        cube.colorArray.push(vec4(0.0, 0.0, 0.0, 1.0 ));
    }

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cube.vertexArray), gl.STATIC_DRAW);
    vBuffer.dimension = 4;
    vBuffer.itemSize = cube.vertexArray.length;
    vBuffer.type = "cube";
    vertexBufferArray.push(vBuffer);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cube.colorArray), gl.STATIC_DRAW );
    cBuffer.dimension = 4;
    cBuffer.itemSize = cube.colorArray.length;
    colorBufferArray.push(cBuffer);

}

function drawScene()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawAxis();
    for(var i=0; i<vertexBufferArray.length; i++)
    {
        gl.bindBuffer( gl.ARRAY_BUFFER, vertexBufferArray[i]);
        gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer( gl.ARRAY_BUFFER, colorBufferArray[i]);
        gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

        for( var j=0; j<vertexBufferArray[i].itemSize; j+=3)
        {
            gl.drawArrays( gl.TRIANGLES, j, 3 );
        }
    }
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
}