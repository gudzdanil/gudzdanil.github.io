<script lang="ts">
	export let coord: [number, number];
	export let horizontal: "left" | "right" | "proportional";
	export let vertical: "top" | "bottom" | "proportional";
</script>

<label>
	X:
	<input bind:value={coord[0]} name="x" type="number">
</label>
<label>
	Y:
	<input bind:value={coord[1]} name="y" type="number">
</label>
<label>
	Horizontal alignment:
	<select bind:value={horizontal} name="horizontal">
		<option value="left">Left</option>
		<option value="right">Right</option>
		<option value="proportional">Proportional</option>
	</select>
</label>
<label>
	Vertical alignment:
	<select bind:value={vertical} name="vertical">
		<option value="top">Top</option>
		<option value="bottom">Bottom</option>
		<option value="proportional">Proportional</option>
	</select>
</label>