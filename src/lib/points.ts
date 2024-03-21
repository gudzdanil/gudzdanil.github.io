import type { Coord, PointData } from '$lib/path';

export function parsePointsFromSvgPath(svgPath: string): {points: PointData[], dims: [number, number]} | undefined {
	const matches = svgPath.match(/\w[\d.,\s]+/g);
	if (!matches) return;
	const parsedPoints: [number, number][] = [];
	for (const m of matches) {
		const [command] = m.match(/^\w/)!;
		const values = m.slice(1).replace(/(^\s+)|(\s+$)/g, '').split(/,|\s+/g).map(v => parseFloat(v.trim()));
		if (command === 'M' || command === 'L') {
			parsedPoints.push([values[0], values[1]]);
			continue;
		}
		if (command === 'H') {
			parsedPoints.push([values[0], parsedPoints[parsedPoints.length - 1][1]]);
			continue;
		}
		if (command === 'V') {
			parsedPoints.push([parsedPoints[parsedPoints.length - 1][0], values[0]]);
		}
	}
	if (checkPointsEqual(parsedPoints[0], parsedPoints[parsedPoints.length - 1])) {
		parsedPoints.pop();
	}
	const maxX = Math.max(...parsedPoints.map(p => p[0]));
	const maxY = Math.max(...parsedPoints.map(p => p[1]));
	const centerX = maxX / 2;
	const centerY = maxY / 2;
	return {dims: [maxX, maxY],points: parsedPoints.map(coord => ({
		coord,
		v: coord[1] < centerY ? 'top' : 'bottom',
		h: coord[0] < centerX ? 'left' : 'right'
	}))};
}

function checkPointsEqual(p1: Coord, p2: Coord): boolean {
	return p1[0] === p2[0] && p1[1] === p2[1];
}
