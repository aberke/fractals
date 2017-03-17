'use strict';

/*************************************
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
	let innerTrianglesPathList = sierpinskiTriangleRoutine(startCenterPoint, sideLength/2, order, orientation);
	pathList = pathList.concat(innerTrianglesPathList);

	return pathList;
}

/*
Recursive subroutine that creates the Sierpinski Triangle
Each triangle has 3 triangles with half its side length left, right, and either
above or below (depending or orientation)

@param {X: Number, Y: Number} centerPoint point from which to draw triangle
@param {number} sideLength
@param {number} order or depth of recursion with which to continue
@param {number} orientation where +1 => triangle points down, -1 => triangle points up
*/
function sierpinskiTriangleRoutine(centerPoint, sideLength, order, orientation) {
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
	var leftPathList = sierpinskiTriangleRoutine(leftCenterPoint, sideLength/2, order - 1, orientation);
	pathList = pathList.concat(leftPathList);

	// handle right -- recursively call routine for smaller right triangle
	var rightCenterPoint = {
		X: centerPoint.X + (1/2)*sideLength,
		Y: centerPoint.Y + orientation*(1/4)*height,
	}
	var rightPathList = sierpinskiTriangleRoutine(rightCenterPoint, sideLength/2, order - 1, orientation);
	pathList = pathList.concat(rightPathList);

	// handle vertical -- recursively call routine for smaller top triangle
	var verticalCenterPoint = {
		X: centerPoint.X,
		Y: centerPoint.Y - orientation*(3/4)*height,
	}
	var verticalPathList = sierpinskiTriangleRoutine(verticalCenterPoint, sideLength/2, order - 1, orientation);
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
		["M", startPoint.X, startPoint.Y]
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