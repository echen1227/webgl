"use strict";

var canvas;
var canvasRect
var gl;
var maxNumVertices;

var index = 0;
var vertexIndex = 0;
var xIndex;
var yIndex;

var inputColor;
var startIndex = [];
var mouseDown = false;
var clearButton;

var vertexArray = [];
var colorArray = [];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    canvasRect = canvas.getBoundingClientRect();
    inputColor = document.getElementById("inputColor");
    clearButton = document.getElementById("clear-button");
    maxNumVertices = canvas.width*canvas.height;

// maxNumVertices= 8;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(event){
        mouseDown = true;
        xIndex = event.clientX - canvasRect.left;
        yIndex = event.clientY - canvasRect.top;
        index = yIndex*canvas.width + xIndex;
        startIndex.push(index);
    });

    canvas.addEventListener("mouseup", function(event){
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", function(event){

        if(mouseDown)
        {
            xIndex = event.clientX - canvasRect.left;
            yIndex = event.clientY - canvasRect.top;
            index = yIndex*canvas.width + xIndex;

            gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
            var temp = vec4(2*xIndex/canvas.width-1, 2*(canvas.height-yIndex)/canvas.height-1, 0.0, 1.0);
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(temp));

            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            temp = vec4(HexToR(inputColor.value),HexToG(inputColor.value),HexToB(inputColor.value),1.0);
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(temp));
            ++vertexIndex;

            gl.clear( gl.COLOR_BUFFER_BIT );
            // if(startIndex.length > 1)
            // {
            //     for(var i =0; i < startIndex.length; i++)
            //     {
            //         gl.drawArrays( gl.LINE_STRIP, startIndex[i], startIndex[i+1]-startIndex[i] );
            //     }
            // }
            gl.drawArrays( gl.LINE_STRIP, 0, maxNumVertices);
        }
    } );
    clearButton.addEventListener("click", function(event){

        index = 0;
        startIndex = [];
        gl.clear( gl.COLOR_BUFFER_BIT );
    });


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    for(var i = 0; i < canvas.height; i++)
    {
        for (var j = 0; j < canvas.width; j++) {
            vertexArray.push(vec4(i,j,0.0,1.0));
            colorArray.push(vec4(0.5, 0.5, 0.0, 1.0));
        };
    }


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    gl.clear( gl.COLOR_BUFFER_BIT );

}

function HexToR(h) {return parseInt(h.substring(0,2),16)/255}
function HexToG(h) {return parseInt(h.substring(2,4),16)/255}
function HexToB(h) {return parseInt(h.substring(4,6),16)/255}