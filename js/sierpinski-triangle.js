// 'use strict'; // commented out in prod to work nicely with safari
/*************************************
Generates a Sierpinski Triangle as a Raphael JS path.

Contains code to draw in both recursive (depth first)
and iterative (breadth first) fashions.

Author: Alex Berke (aberke)

Has dependencies in util.js
*************************************/


/**
Creates rotated versions of Sierpinski Triangle that 'flower out'

@param {object} paper to draw on
@param {X: Number, Y: Number} centerPoint from which to draw triangle
@param {number} size

@return {array} paper.set() of the paths
*/
function drawSierpinskiTriangleFlower(paper, centerPoint, size, level) {
	var sideLength = size/2;
	var height = getTriangleHeight((2*Math.PI)/6, sideLength);
	// initialize paper path set that will be returned
	var pathSet = paper.set();

	// draw 1 triangle first and then the others from rotating it
	var startCenterPoint = {
		X: centerPoint.X + (1/2)*sideLength,
		Y: centerPoint.Y - (1/2)*height,
	};
	var options = {
		level: level || 4,
		orientation: 1,
		levelChange: {l: 2, r: 1, v: 1},
		innerTrianglesFunction: recursiveSierpinskiTriangleRoutine,
	};
	var pathList = getSierpinskiTriangle(startCenterPoint, sideLength, options);
	var path = paper.path(pathList);
	pathSet.push(path);
	// rotate the path twice to generate the other triangles
	var rotationDegrees = 120;
	var rotations = 3;
	for (var r=1; r<rotations; r++) {
		var clonedPath = path.clone();
		clonedPath.rotate(r*rotationDegrees, centerPoint.X, centerPoint.Y);
		pathSet.push(clonedPath);
	}

	return pathSet;
}


/**
Draws Sierpinski Triangle on paper

@param {object} paper to draw on
@param {X: Number, Y: Number} centerPoint from which to draw triangle
@param {number} sideLength of outter most triangle
@param {object} options

@return {object} path drawn on paper
**/
function drawSierpinskiTriangle(paper, centerPoint, sideLength, options) {
	var pathList = getSierpinskiTriangle(centerPoint, sideLength, options);
	return paper.path(pathList);	
}


/**
Creates path for a Sierpinski Triangle as list of points on a plane.

@param {X: Number, Y: Number} centerPoint from which to draw triangle
@param {number} sideLength of outter most triangle
@param {number} level or depth of recursion with which to draw triangles
@param {number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {array} pathList representing path as list of points on a plane.
*/
function getSierpinskiTriangle(centerPoint, sideLength, options) {
	options = options || {};

	// Get or set default level.  level represents the depth of recursion
	var level = options.level || 3;

	// Get or set default orientation. -1 => point downwards, +1 => point upwards
	var orientation = options.orientation;
	if (!(orientation == -1 || orientation == 1))
		orientation = 1;


	var innerTrianglesFunction = options.innerTrianglesFunction || iterativeSierpinskiTriangleRoutine;

	// Draw outter most triangle (inverted by calling with inverted orientation)
	// start at bottom left corner
	var height = getTriangleHeight((2*Math.PI)/6, sideLength);
	var startPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y + orientation*(1/2)*height,
	}
	var pathList = getEquilateralTrianglePathList(startPoint, sideLength, (-1)*orientation);

	// Draw inner triangles with shifted centerPoint
	var nextCenterPoint = {
		X: centerPoint.X,
		Y: centerPoint.Y + orientation*(1/4)*height,

	}
	var innerTrianglesPathList = innerTrianglesFunction(nextCenterPoint, sideLength/2, level, options);
	pathList = pathList.concat(innerTrianglesPathList);

	return pathList;
}


/*
Iterative subroutine that creates the Sierpinski Triangle.
Each triangle has 3 triangles with half its side length left, right, and either
above or below (depending or orientation).
Pattern generated in breadth first fashion.

@param {X: Number, Y: Number} centerPoint point from which to draw triangle
@param {number} sideLength
@param {number} level or depth of recursion with which to continue
@param {Object} options:
	{number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {array} pathlist
*/
function iterativeSierpinskiTriangleRoutine(centerPoint, sideLength, level, options) {
	options = options || {};

	// Get or set default orientation. -1 => point downwards, +1 => point upwards
	var orientation = options.orientation;
	if (!(orientation == -1 || orientation == 1))
		orientation = 1;

	var pathList = []; // list of points and path commands returned

	// the triangleQueue holds the next triangles to draw in a queue
	var triangleQueue = [];
	// it starts off with one item -- the center (level 1) triangle to draw
	triangleQueue.push({
		centerPoint: centerPoint,
		sideLength: sideLength
	});

	while (triangleQueue.length < Math.pow(3, level)) {

		// pop next triangle to draw off the queue
		var nextTriangle = triangleQueue.shift();
		var centerPoint = nextTriangle.centerPoint;
		var sideLength = nextTriangle.sideLength;

		// draw next triangle
		var height = getTriangleHeight(RADIANS_60_DEGREES, sideLength);
		// draw the triangle with center = centerPoint, sideLength = sideLength
		var startPoint = {
			X: centerPoint.X - (1/2)*sideLength,
			Y: centerPoint.Y - orientation*(1/2)*height,
		}
		var trianglePathList = getEquilateralTrianglePathList(startPoint, sideLength, orientation);
		pathList = pathList.concat(trianglePathList);

		// put its 3 child triangles on the triangleQueue:
		// handle left
		var leftCenterPoint = {
			X: centerPoint.X - (1/2)*sideLength,
			Y: centerPoint.Y + orientation*(1/4)*height,
		}
		triangleQueue.push({
			centerPoint: leftCenterPoint,
			sideLength: sideLength/2
		});

		// handle right -- recursively call routine for smaller right triangle
		var rightCenterPoint = {
			X: centerPoint.X + (1/2)*sideLength,
			Y: centerPoint.Y + orientation*(1/4)*height,
		}
		triangleQueue.push({
			centerPoint: rightCenterPoint,
			sideLength: sideLength/2
		});

		// handle vertical -- recursively call routine for smaller top triangle
		var verticalCenterPoint = {
			X: centerPoint.X,
			Y: centerPoint.Y - orientation*(3/4)*height,
		}
		triangleQueue.push({
			centerPoint: verticalCenterPoint,
			sideLength: sideLength/2
		});
	}
	return pathList;
}


/*
Recursive subroutine that creates the Sierpinski Triangle.
Each triangle has 3 triangles with half its side length left, right, and either
above or below (depending or orientation).
Pattern generated in depth first fashion.

@param {X: Number, Y: Number} centerPoint point from which to draw triangle
@param {number} sideLength
@param {number} level or depth of recursion with which to continue
@param {Object} options:
	{number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {array} PathList
*/
function recursiveSierpinskiTriangleRoutine(centerPoint, sideLength, level, options) {
	if (level <= 0)
		return [];

	options = options || {};
	var orientation = options.orientation || 1;
	var levelChange = options.levelChange || {l: 1, r: 1, v: 1};

	var height = getTriangleHeight(RADIANS_60_DEGREES, sideLength);

	// draw the triangle with center = centerPoint, sideLength = sideLength
	var startPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y - orientation*(1/2)*height,
	}
	var pathList = getEquilateralTrianglePathList(startPoint, sideLength, orientation);

	// handle left -- recursively call routine for smaller left triangle
	var leftCenterPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y + orientation*(1/4)*height,
	}
	var leftPathList = recursiveSierpinskiTriangleRoutine(leftCenterPoint, sideLength/2, level - levelChange.l, options);
	pathList = pathList.concat(leftPathList);

	// handle right -- recursively call routine for smaller right triangle
	var rightCenterPoint = {
		X: centerPoint.X + (1/2)*sideLength,
		Y: centerPoint.Y + orientation*(1/4)*height,
	}
	var rightPathList = recursiveSierpinskiTriangleRoutine(rightCenterPoint, sideLength/2, level - levelChange.r, options);
	pathList = pathList.concat(rightPathList);

	// handle vertical -- recursively call routine for smaller top triangle
	var verticalCenterPoint = {
		X: centerPoint.X,
		Y: centerPoint.Y - orientation*(3/4)*height,
	}
	var verticalPathList = recursiveSierpinskiTriangleRoutine(verticalCenterPoint, sideLength/2, level - levelChange.v, options);
	pathList = pathList.concat(verticalPathList);

	return pathList;
}


/**
Creates the path for an equilateral triangle oriented either up or down.

@param {X: Number, Y: Number} startPoint at which to start triangle
@param {number} sideLength
@param {number} orientation: +1 => points downward, -1 => points upward

@returns {array} the PathList for a triangle.
**/
function getEquilateralTrianglePathList(startPoint, sideLength, orientation) {
	orientation = orientation || 1;
	var pathList = [
		['M', startPoint.X, startPoint.Y]
	];
	var angle = 0;
	var point = startPoint;
	var  angleChangeRadians = (2*Math.PI)/3; // adding 120 degrees
	for (var i=0; i<3; i++) {
		point = getNextPoint(point, sideLength, angle);
		pathList = addLine(pathList, point);
		angle += (orientation*angleChangeRadians);
	}
	return pathList;
}
