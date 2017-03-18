'use strict';
/*************************************
Generates a Sierpinski Triangle as a Raphael JS path.

Contains code to draw in both recursive (depth first)
and iterative (breadth first) fashions.

Author: Alex Berke (aberke)

Has dependencies in util.js
*************************************/


/**
Creates path for a Sierpinski Triangle as list of points on a plane.

@param {X: Number, Y: Number} startCenterPoint from which to draw triangle
@param {number} sideLength of outter most triangle
@param {number} order or depth of recursion with which to draw triangles
@param {number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {array} pathList representing path as list of points on a plane.
*/
function getSierpinskiTriangle(startCenterPoint, sideLength, order, orientation) {
	// Set default order.  Order represents the depth of recursion
	order = order || 3;

	// Set default orientation.  -1 => point downwards, +1 => point upwards
	if (!(orientation == -1 || orientation == 1))
		orientation = 1;

	// Draw outter most triangle (inverted by calling with inverted orientation)
	// start at bottom left corner
	var height = getTriangleHeight((2*Math.PI)/6, sideLength);
	var startPoint = {
		X: startCenterPoint.X - (1/2)*sideLength,
		Y: startCenterPoint.Y + (orientation)*(1/4)*height,
	}
	let pathList = getEquilateralTrianglePathList(startPoint, sideLength, (-1)*orientation);

	// Draw inner triangles starting at passed in startCenterPoint
	let innerTrianglesPathList = iterativeSierpinskiTriangleRoutine(startCenterPoint, sideLength/2, order, orientation);
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
@param {number} order or depth of recursion with which to continue
@param {number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {array} pathlist
*/
function iterativeSierpinskiTriangleRoutine(centerPoint, sideLength, order, orientation) {
	let pathList = []; // list of points and path commands returned

	// the triangleQueue holds the next triangles to draw in a queue
	let triangleQueue = [];
	// it starts off with one item -- the center (level 1) triangle to draw
	triangleQueue.push({
		centerPoint: centerPoint,
		sideLength: sideLength
	});

	while (triangleQueue.length < 3**order) {

		// pop next triangle to draw off the queue
		let nextTriangle = triangleQueue.shift();
		let centerPoint = nextTriangle.centerPoint;
		let sideLength = nextTriangle.sideLength;

		// draw next triangle
		var height = getTriangleHeight(RADIANS_60_DEGREES, sideLength);
		// draw the triangle with center = centerPoint, sideLength = sideLength
		var startPoint = {
			X: centerPoint.X - (1/2)*sideLength,
			Y: centerPoint.Y - orientation*(1/2)*height,
		}
		let trianglePathList = getEquilateralTrianglePathList(startPoint, sideLength, orientation);
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
@param {number} order or depth of recursion with which to continue
@param {number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {array} PathList
*/
function recursiveSierpinskiTriangleRoutine(centerPoint, sideLength, order, orientation) {
	if (order <= 0)
		return [];

	var height = getTriangleHeight(RADIANS_60_DEGREES, sideLength);

	// draw the triangle with center = centerPoint, sideLength = sideLength
	var startPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y - orientation*(1/2)*height,
	}
	let pathList = getEquilateralTrianglePathList(startPoint, sideLength, orientation);

	// handle left -- recursively call routine for smaller left triangle
	var leftCenterPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y + orientation*(1/4)*height,
	}
	var leftPathList = recursiveSierpinskiTriangleRoutine(leftCenterPoint, sideLength/2, order - 1, orientation);
	pathList = pathList.concat(leftPathList);

	// handle right -- recursively call routine for smaller right triangle
	var rightCenterPoint = {
		X: centerPoint.X + (1/2)*sideLength,
		Y: centerPoint.Y + orientation*(1/4)*height,
	}
	var rightPathList = recursiveSierpinskiTriangleRoutine(rightCenterPoint, sideLength/2, order - 1, orientation);
	pathList = pathList.concat(rightPathList);

	// handle vertical -- recursively call routine for smaller top triangle
	var verticalCenterPoint = {
		X: centerPoint.X,
		Y: centerPoint.Y - orientation*(3/4)*height,
	}
	var verticalPathList = recursiveSierpinskiTriangleRoutine(verticalCenterPoint, sideLength/2, order - 1, orientation);
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
	let pathList = [
		['M', startPoint.X, startPoint.Y]
	];
	let angle = 0;
	let point = startPoint;
	const angleChangeRadians = (2*Math.PI)/3; // adding 120 degrees
	for (var i=0; i<3; i++) {
		point = getNextPoint(point, sideLength, angle);
		pathList = addLine(pathList, point);
		angle += (orientation*angleChangeRadians);
	}
	return pathList;
}
