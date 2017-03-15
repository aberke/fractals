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

@returns {angle: Number, point: Point} current point and angle in path
*/
function arrowheadCurve(order, pathList, fromPoint, sideLength, angle, angleChange) {
	// last is the most current point and angle in path
	let last;

	// at order 0: at bottom of recursion: draw next part of path
	if (order == 0) {
		nextPoint = getNextPoint(fromPoint, sideLength, angle);
		// appends to pathList
		pathList = addLine(pathList, nextPoint);
		last = {
			point: nextPoint,
			angle: angle
		}
		return last;
	}

	last = arrowheadCurve(order - 1, pathList, fromPoint, sideLength/2, angle, (-1)*angleChange);
	fromPoint = last.point;
	angle = last.angle;

	// turn
	angle += (angleChange*RADIANS_60_DEGREES);

	last = arrowheadCurve(order - 1, pathList, fromPoint, sideLength/2, angle, angleChange);
	fromPoint = last.point;
	angle = last.angle;

	// turn
	angle += (angleChange*RADIANS_60_DEGREES);

	last = arrowheadCurve(order - 1, pathList, fromPoint, sideLength/2, angle, (-1)*angleChange);
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

@param {number} order (Integer) depth of recursion with which to draw
@param {X: Number, Y: Number} startPoint
@param {number} sideLength

@returns {array} pathList
*/
function getSierpinskiArrowheadCurve(order, startPoint, sideLength) {
	// initialize pathList with only startPoint
	// this pathList will be appended to throughout the algorithm
	let pathList = [
		["M", startPoint.X, startPoint.Y]
	];

	// orient Sierpiński arrowhead curve to point up
	let angle = 0;
	if ((order % 2) == 0) { // order is even
		arrowheadCurve(order, pathList, startPoint, sideLength, angle, 1);
	} else { // order is odd
		angle -= RADIANS_60_DEGREES;
		arrowheadCurve(order, pathList, startPoint, sideLength, angle, 1);
	}
	return pathList;
}


/*
Returns {array} pathList
*/
function getSierpinskiTriangle(order, startCenterPoint, sideLength) {
	// order represents the depth of recursion
	order = order || 3;

	// draw outter most triangle (inverted by calling with -1)
	// start at bottom left corner
	var height = getTriangleHeight((2*Math.PI)/6, sideLength);
	var startPoint = {
		X: startCenterPoint.X - (1/2)*sideLength,
		Y: startCenterPoint.Y + (1/4)*height,
	}
	let pathList = getEquilateralTrianglePathList(startPoint, sideLength, -1);

	// draw inner triangles starting at passed in startCenterPoint
	let innerTrianglesPathList = sierpinskiTriangleRoutine(order, sideLength/2, startCenterPoint);
	pathList = pathList.concat(innerTrianglesPathList);

	return pathList;
}

/*
Recursive subroutine that creates the Sierpinski Triangle
Each triangle has 3 triangles with half its side length above, left, and right

@param {number} order or depth of recursion with which to continue
@param {number} sideLength
@param {X: Number, Y: Number} centerPoint point from which to draw triangle
*/
function sierpinskiTriangleRoutine(order, sideLength, centerPoint) {
	if (order <= 0) {
		return [];
	}
	var height = getTriangleHeight((2*Math.PI)/6, sideLength);

	// draw the triangle with center = centerPoint, sideLength = sideLength
	var startPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y - (1/2)*height,
	}
	let pathList = getEquilateralTrianglePathList(startPoint, sideLength);

	// handle left -- recursively call routine for smaller left triangle
	var leftCenterPoint = {
		X: centerPoint.X - (1/2)*sideLength,
		Y: centerPoint.Y + (1/4)*height,
	}
	var leftPathList = sierpinskiTriangleRoutine(order - 1, sideLength/2, leftCenterPoint);
	pathList = pathList.concat(leftPathList);

	// handle right -- recursively call routine for smaller right triangle
	var rightCenterPoint = {
		X: centerPoint.X + (1/2)*sideLength,
		Y: centerPoint.Y + (1/4)*height,
	}
	var rightPathList = sierpinskiTriangleRoutine(order - 1, sideLength/2, rightCenterPoint);
	pathList = pathList.concat(rightPathList);

	// handle top -- recursively call routine for smaller top triangle
	var topCenterPoint = {
		X: centerPoint.X,
		Y: centerPoint.Y - (3/4)*height,
	}
	var topPathList = sierpinskiTriangleRoutine(order - 1, sideLength/2, topCenterPoint);
	pathList = pathList.concat(topPathList);

	return pathList;
}

/**
Creates the path for an equilateral triangle oriented either up or down.
@param {X: Number, Y: Number} startPoint at which to start triangle
@param {number} sideLength
@param {number} orientation: -1= turn right, +1 = turn right
@returns {array} the PathList for a triangle.
*/
function getEquilateralTrianglePathList(startPoint, sideLength, orientation) {
	orientation = orientation || 1;
	let pathList = [
		["M", startPoint.X, startPoint.Y]
	];
	let angle = 0;
	let point = startPoint;
	const angleChangeRadians = orientation*((2*Math.PI)/3);
	for (var i=0; i<3; i++) {
		point = getNextPoint(point, sideLength, angle);
		pathList = addLine(pathList, point);
		angle += angleChangeRadians;
	}
	return pathList;
}
