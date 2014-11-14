<div class="demo-container">
	<p>
		Popups can also use other views as their contents.
	</p>
	<div class="big-button trigger">Click</div>
	<span class="popup"></span>
</div>
<div class="code-container">
	<div class="code-wrapper">
<pre><code data-language="javascript">var ModuiPopup = require( 'modui-popup' );

ModuiPopup.open( {
  target : this.ui.clickBtn,
  position : 'right center',
  contents : this.exampleTwoView
} );</code></pre>
	</div>
</div>