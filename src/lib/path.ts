export type Coord = [number, number];

export interface PointData {
	coord: [number, number];
	h: 'left' | 'right' | 'proportional';
	v: 'top' | 'bottom' | 'proportional';
}

interface FullPointData {
	coord: [number, number];
	inner: [number, number];
	h: 'left' | 'right' | 'proportional';
	v: 'top' | 'bottom' | 'proportional';
}

export function getPath(points: PointData[], border: number): string {
	return genPath(getBorderedPoints(points, border));
}

export function getPolygon(points: PointData[], border: number): string {
	return genPolygon(getBorderedPoints(points, border));
}

function getBorderedPoints(pts: PointData[], border: number): FullPointData[] {
	const innerLines: [Coord, Coord][] = [];
	if(pts.length < 3) return [];
	const ptsClosed: PointData[] = [...pts, pts[0]];
	for (let i = 0; i < ptsClosed.length - 1; i++) {
		const p1 = ptsClosed[i];
		const p2 = ptsClosed[i + 1];
		// kx + b = y
		// b = y - kx
		const dx = p2.coord[0] - p1.coord[0];
		const dy = p2.coord[1] - p1.coord[1];
		const angle1 = Math.atan2(dy, dx);

		const angle2 = angle1 + 90 * Math.PI / 180;
		const p2_0 = p2.coord[0] + border * Math.cos(angle2);
		const p2_1 = p2.coord[1] + border * Math.sin(angle2);

		const angle0 = angle1 - Math.PI - 90 * Math.PI / 180;
		const p1_0 = p1.coord[0] + border * Math.cos(angle0);
		const p1_1 = p1.coord[1] + border * Math.sin(angle0);
		innerLines.push([[p1_0, p1_1], [p2_0, p2_1]]);
	}

	const innerPoints: Coord[] = [];
	innerLines.unshift(innerLines[innerLines.length - 1]);
	for (let i = 0; i < innerLines.length - 1; i++) {
		const l1 = innerLines[i];
		const l2 = innerLines[i + 1];
		const l1data = getLine(...l1);
		const l2data = getLine(...l2);
		//ax + c = bx + d;
		//ax - bx = d - c
		//x(a-b) = d-c
		//x = (d-c)/(a-b)
		let x, y;
		if (l1data.dx === 0) {
			x = l1[0][0];
			y = l2data.k * x + l2data.b;
		} else if (l2data.dx === 0) {
			x = l2[0][0];
			y = l1data.k * x + l1data.b;
		} else {
			x = (l2data.b - l1data.b) / (l1data.k - l2data.k); // 90 = A / (0 - 1.57), A = -1.57 * 90 =
			y = l1data.k * x + l1data.b;
		}
		innerPoints.push([x, y]);
	}
	innerPoints.push(innerPoints[0]);

	return pts.map((p, i) => ({...p, inner: innerPoints[i]}));
}

function genPath([first, ...points]: FullPointData[]): string {
	const outerStart = `${first.coord[0]} ${first.coord[1]}`;
	const outerEnd = outerStart;
	const outer = points.map(p => `L${p.coord[0]},${p.coord[1]}`).join(' ');
	const innerStart = `${first.inner[0]} ${first.inner[1]}`;
	const innerEnd = innerStart;
	const inner = points.map(p => `L${p.inner[0]} ${p.inner[1]}`).reverse().join(' ');
	return `M${outerStart} ${outer} L${outerEnd} L${innerStart} ${inner} L${innerEnd} L${outerEnd}`;
}

function genPolygon(allPoints: FullPointData[]): string {
	const xMax = Math.max(...allPoints.map(p => p.coord[0]));
	const yMax = Math.max(...allPoints.map(p => p.coord[1]));
	const [first, ...points] = allPoints;
	const outerStart = getPointCss(first.coord, first.h, first.v, xMax, yMax);
	const outerEnd = outerStart;
	const outer = points.map(p => getPointCss(p.coord, p.h, p.v, xMax, yMax)).join(', ');
	const innerStart = getPointCss(first.inner, first.h, first.v, xMax, yMax);
	const innerEnd = innerStart;
	const inner = points.map(p => getPointCss(p.inner, p.h, p.v, xMax, yMax)).reverse().join(', ')
	return `polygon(${outerStart}, ${outer}, ${outerEnd}, ${innerStart}, ${inner}, ${innerEnd})`;
}

function getPointCss(p: [number, number], h: 'left' | 'right' | 'proportional', v: 'top' | 'bottom' | 'proportional', xMax: number, yMax: number): string {
	const x = h === 'left' ? `${p[0]}px` : xMax === p[0] ? '100%' : `calc(100% - ${xMax - p[0]}px)`;
	const y = v === 'top' ? `${p[1]}px` : yMax === p[1] ? '100%' : `calc(100% - ${yMax - p[1]}px)`;
	return `${x} ${y}`;
}

function getLine(p1: [number, number], p2: [number, number]): {k: number, b: number, dx: number, dy: number} {
	const dx = p2[0] - p1[0];
	const dy = p2[1] - p1[1];
	const k = dy / dx;
	return {
		k,
		b: p2[1] - k * p2[0],
		dx,
		dy
	}
}