<script lang="ts">
	import Point from './Point.svelte';
	import { getPath, getPolygon, parsePointsFromSvgPath, type PointData } from '$lib';

	let dims: [number, number] = [0, 0];
	let border = 1;
	let points: PointData[] = [];

	$: clipPath = points.length ? getPolygon(points, border) : '';
	$: path = points.length ? getPath(points, border) : '';

	function removePoint(i: number): void {
		points = [...points];
		points.splice(i, 1);
	}
	function addPoint(): void {
		const last = points[points.length - 1];
		points = [...points,{ ...last, coord: [...last.coord] }];
	}

	function reverse(): void {
		points = [...points].reverse()
	}

	function handleSubmit(event: Event): void {
		const data = new FormData(event.currentTarget as HTMLFormElement);
		const d = data.get('d');
		if (!d) return;

		const res = parsePointsFromSvgPath(d as string);
		if (!res) return;
		points = res.points;
		dims = res.dims;
	}
</script>

{#if points.length > 0}
	<form on:submit|preventDefault={handleSubmit}>
		<label>Border: <input type="number" bind:value={border}></label>
		{#each points as point, i}
			<fieldset>
				<Point bind:coord={point.coord} bind:horizontal={point.h} bind:vertical={point.v}></Point>
				<button on:click={() => removePoint(i)}>Delete</button>
			</fieldset>
		{/each}
		<button on:click={addPoint}>Add</button>
		<button on:click={reverse}>Reverse points</button>
	</form>
	<hr>
	<div>
		<p>SVG:</p>
		<div class="example">
			<svg width={dims[0]} height={dims[1]}>
				<path d={path}></path>
			</svg>
		</div>
		<code>d="{path}"</code>
	</div>
	<hr>
	<p>DIV: </p>
	<div class="example">
		<div class="elem" style="width: {dims[0]}px; height: {dims[1]}px; --clip-path: {clipPath}"></div>
	</div>
	<p>DIV (2x size): </p>
	<div class="example">
		<div class="elem" style="width: {dims[0] * 2}px; height: {dims[1] * 2}px; --clip-path: {clipPath}"></div>
	</div>
	<code>clip-path: {clipPath}</code>
{:else}
	<form on:submit|preventDefault={handleSubmit}>
		<h3>Setup points:</h3>
		<label>Svg path:
			<textarea name="d" cols="30" rows="10" placeholder="M0 0L ..."></textarea>
		</label>
		<button>Parse</button>
	</form>
{/if}

<style>
    fieldset {
        display: flex;
    }

    path {
        fill: red;
        stroke: none;
    }

    .elem {
        position: relative;
    }

    .elem:before {
        content: "";
        position: absolute;
        inset: 0;
        background: red;
        clip-path: var(--clip-path);
    }

    code {
        display: block;
        border: 1px solid grey;
        padding: 10px;
        border-radius: 8px;
        background: #d7d7d7;
        margin: 10px 0;
    }

		.example {
				padding: 10px;
				border: 1px solid black;
				border-radius: 8px;
				display: inline-block;
		}
</style>