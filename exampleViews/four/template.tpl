<div class="demo-container">
	<p>
		Now wait, what if you want the popup to only appear within a limited bounding box? Well, <code>modui-popup</code> can handle that, too. Try clicking on that blue square over there. See how the popup appears above it? Now scroll way over to the left and try clicking it again. Notice that the popup now appears to the left? <code>modui-popup</code> is magic.
	</p>
	<div class="example4--outer">
		<div class="example4--inner">
			<div class="example4--trigger trigger"></div>
		</div>
	</div>
</div>
<div class="code-container">
	<div class="code-wrapper">
		<pre><code data-language="javascript">var outer = this.ui.outer;
  var popup = ModuiPopup.open( {
    target : this.ui.trigger,
    position : 'top center',
    contents : 'Dance!',
    keepWithinRect : function(){ return {
      top : outer.offset().top,
      bottom : outer.offset().top + outer.height(),
      left   : outer.offset().left,
      right  : outer.offset().left + outer.width()
    };
  }
} );</code></pre>
	</div>
</div>