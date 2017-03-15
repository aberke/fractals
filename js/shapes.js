'use strict';

/*************************************
Has dependencies in util.js

*************************************/


/*
Recursive subroutine to construct the Sierpiński arrowhead curve

@param {number} order or depth of recursion with which to continue
@param {array} pathList
@param {X: Number, Y: Number} fromPoint
@param {number} sideLength length of current side
@param {number} angle angle expressed in radians.  Is a multiple of 60 degrees
@param {number} angleChange (-1 | 1) indicates whether to update angle by -60 or +60 degrees
@param {number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {angle: Number, point: Point} current point and angle in path
*/
function arrowheadCurve(order, pathList, fromPoint, sideLength, angle, angleChange, orientation) {
	// last is the most current point and angle in path
	let last;

	// at order 0: at bottom of recursion: draw next part of path
	if (order == 0) {
		let nextPoint = getNextPoint(fromPoint, sideLength, (orientation)*angle);
		// appends to pathList
		pathList = addLine(pathList, nextPoint);
		last = {
			point: nextPoint,
			angle: angle
		}
		return last;
	}

	last = arrowheadCurve(order - 1, pathList, fromPoint, sideLength/2, angle, (-1)*angleChange, orientation);
	fromPoint = last.point;
	angle = last.angle;

	// turn
	angle += (angleChange*RADIANS_60_DEGREES);

	last = arrowheadCurve(order - 1, pathList, fromPoint, sideLength/2, angle, angleChange, orientation);
	fromPoint = last.point;
	angle = last.angle;

	// turn
	angle += (angleChange*RADIANS_60_DEGREES);

	last = arrowheadCurve(order - 1, pathList, fromPoint, sideLength/2, angle, (-1)*angleChange, orientation);
	return last;
}


/*
Sierpiński arrowhead curve
---------------------------
The Sierpiński arrowhead curve can be expressed by a rewrite system (L-system).
Alphabet: X, Y
Constants: F, +, −
Axiom: XF
Production rules:
	X → YF + XF + Y
	Y → XF − YF − X
Here, F means “draw forward”, + means “turn left 60°”, and − means “turn right 60°”

@param {X: Number, Y: Number} centerPoint
@param {number} sideLength
@param {number} order (Integer) depth of recursion with which to draw
@param {number} orientation where +1 => triangle points down, -1 => triangle points up

@returns {array} pathList
*/
function getSierpinskiArrowheadCurve(centerPoint, sideLength, order, orientation) {
	// set default orientation.  -1 => point downwards, +1 => point upwards
	if (!(orientation == -1 || orientation == 1))
		orientation = 1;

	// start at bottom left corner
	var height = getTriangleHeight((2*Math.PI)/6, sideLength);
	var startPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y + (orientation)*(1/4)*height,
	}

	// initialize pathList with only startPoint
	// this pathList will be appended to throughout the algorithm
	let pathList = [
		["M", startPoint.X, startPoint.Y]
	];

	// orient Sierpiński arrowhead curve
	let angle = 0;
	if ((order % 2) == 0) { // order is even
		arrowheadCurve(order, pathList, startPoint, sideLength, angle, 1, orientation);
	} else { // order is odd
		angle -= RADIANS_60_DEGREES;
		arrowheadCurve(order, pathList, startPoint, sideLength, angle, 1, orientation);
	}
	return pathList;
}


/*
Returns {array} pathList
*/
function getSierpinskiTriangle(startCenterPoint, sideLength, order, orientation) {
	// set default order.  Order represents the depth of recursion
	order = order || 3;

	// set default orientation.  -1 => point downwards, +1 => point upwards
	if (!(orientation == -1 || orientation == 1))
		orientation = 1;

	// draw outter most triangle (inverted by calling with inverted orientation)
	// start at bottom left corner
	var height = getTriangleHeight((2*Math.PI)/6, sideLength);
	var startPoint = {
		X: startCenterPoint.X - (1/2)*sideLength,
		Y: startCenterPoint.Y + (orientation)*(1/4)*height,
	}
	// let pathList = [];
	let pathList = getEquilateralTrianglePathList(startPoint, sideLength, (-1)*orientation);

	// draw inner triangles starting at passed in startCenterPoint
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
	if (order <= 0) {
		return [];
	}
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
*/
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
