<div class="demo-container example4">
	<p>
		Fence me in.
	</p>
	<div class="outer">
		<div class="inner">
			<div class="trigger"></div>
		</div>
	</div>
</div>
<div class="code-container">
	<div class="code-wrapper">
<pre><code data-language="javascript">var outer = this.ui.outer;
var popup = ModuiPopup.open( {
  target : this.ui.inner,
  position : 'top center',
  contents : 'Dance!',
  closeOnOutsideClick : false,
  keepWithinRect : {
    top : outer.offset().top,
    bottom : outer.offset().top + outer.height(),
    left : outer.offset().left,
    right : outer.offset().left + outer.width()
  }
} );

this.ui.outer.on( 'scroll', function() {
  popup.reposition();
} );</code></pre>
	</div>
</div>