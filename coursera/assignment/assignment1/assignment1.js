"use strict";

var canvas;
var gl;
var points = [];
var numTimesToSubdivide = 0;
var bufferId;
var angleInRadians;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    // First, initialize the corners of our gasket with three points.
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 10), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var angleInDegrees=0;
    angleInRadians = angleInDegrees * Math.PI / 180;
    var andelShader = gl.getUniformLocation(program, "angel");
    // Set the rotation.
    gl.uniform1f(andelShader, angleInRadians);

    render();

    document.getElementById("sub").onchange =
    function(event) {
        document.getElementById("subText").innerHTML = event.target.value;
        numTimesToSubdivide = parseInt(event.target.value);
        render();
    };
    document.getElementById("angel").onchange =
    function(event) {
        document.getElementById("angelText").innerHTML = event.target.value;
        angleInRadians = event.target.value * Math.PI / 180;
        var andelShader = gl.getUniformLocation(program, "angel");
        // Set the rotation.
        gl.uniform1f(andelShader, angleInRadians);
        render();
    };
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}

window.onload = init;

function render()
{
    var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0,  0.5 ),
        vec2(  0.5, -0.5)
    ];
    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    for( var i=0; i<points.length; i+=3)
        gl.drawArrays( gl.LINE_LOOP, i, 3 );
    points = [];
    // requestAnimFrame(render);
}
