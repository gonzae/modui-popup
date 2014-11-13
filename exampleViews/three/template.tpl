<div class="demo-container example3">
	<p>
		Position to taste.
	</p>
	<table class="table">
		<tr class="table__top">
			<td class="table__left">
				<input class="trigger" type="radio" name="trigger" value="top left">
			</td>
			<td class="table__center">
				<input class="trigger" type="radio" name="trigger" value="top center">
			</td>
			<td class="table__right">
				<input class="trigger" type="radio" name="trigger" value="top right">
			</td>
		</tr>
		<tr>
			<td class="table__left">
				<input class="trigger" type="radio" name="trigger" value="left center">
			</td>
			<td>
			</td>
			<td class="table__right">
				<input class="trigger" type="radio" name="trigger" value="right center">
			</td>
		</tr>
		<tr class="table__bottom">
			<td class="table__left">
				<input class="trigger" type="radio" name="trigger" value="bottom left">
			</td>
			<td class="table__center">
				<input class="trigger" type="radio" name="trigger" value="bottom center">
			</td>
			<td class="table__right">
				<input class="trigger" type="radio" name="trigger" value="bottom right">
			</td>
		</tr>
	</table>
</div>
<div class="code-container">
	<div class="code-wrapper">
<pre><code data-language="javascript">var ModuiPopup = require( 'modui-popup' );

ModuiPopup.open( {
  target : this.ui.target,
  position : this.$el.find( 'input:checked' ).val(),
  contents : [
    'I\'m here!',
    'Over here!',
    'Psych!',
    'No, I\'m over here!'
  ][ Math.floor( Math.random() * 4 ) ],
  signature : 'example3'
} );</code></pre>
	</div>
</div>