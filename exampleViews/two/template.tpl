<div class="demo-container">
	<p>
		Popup can also display other views as their contents.
	</p>
	<button class="big-button trigger">Click</button>
	<span class="popup"></span>
</div>
<div class="code-container">
	<div class="code-wrapper">
<pre><code data-language="javascript">ModuiPopup.open( {
  target : this.ui.clickBtn,
  position : 'right center',
  contents : this.exampleTwoView
} );</code></pre>
	</div>
</div>