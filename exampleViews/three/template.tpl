<div class="demo-container">
	<p>
		Now that that's out of the way, how about positioning the bubble? Yeah, you can do that, too. Try some of those there radio buttons.
	</p>
	<table class="example3-table">
		<tr class="example3-table__top">
			<td class="example3-table__left">
				<input class="trigger" type="radio" name="trigger" value="top left">
			</td>
			<td class="example3-table__center">
				<input class="trigger" type="radio" name="trigger" value="top center">
			</td>
			<td class="example3-table__right">
				<input class="trigger" type="radio" name="trigger" value="top right">
			</td>
		</tr>
		<tr>
			<td class="example3-table__left">
				<input class="trigger" type="radio" name="trigger" value="left center">
			</td>
			<td>
			</td>
			<td class="example3-table__right">
				<input class="trigger" type="radio" name="trigger" value="right center">
			</td>
		</tr>
		<tr class="example3-table__bottom">
			<td class="example3-table__left">
				<input class="trigger" type="radio" name="trigger" value="bottom left">
			</td>
			<td class="example3-table__center">
				<input class="trigger" type="radio" name="trigger" value="bottom center">
			</td>
			<td class="example3-table__right">
				<input class="trigger" type="radio" name="trigger" value="bottom right">
			</td>
		</tr>
	</table>
</div>
<div class="code-container">
	<div class="code-wrapper">
		<pre><code data-language="javascript">var position = this.$el.find( 'input[name="trigger"]:checked' ).val();
ModuiPopup.open( {
  target : this.ui.target,
  position : position,
  contents : this.example3Contents
} );</code></pre>
	</div>
</div>