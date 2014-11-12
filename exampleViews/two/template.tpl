<div class="demo-container">
	<p>
		So now you've got the idea. Simple popups. In the last example, we just provided some static text. Now, what if we instead want to pass in a backbone template? Totally doable. See that enormous button over there? Click <em>it</em>.
	</p>
	<button class="big-button trigger">Click</button>
	<span class="popup"></span>
</div>
<div class="code-container">
	<div class="code-wrapper">
		<pre><code data-language="javascript">ModuiPopup.open( {
  target : this.ui.trigger,
  position : 'right center',
  contents : this.exampleTwoView
} );</code></pre>
	</div>
</div>