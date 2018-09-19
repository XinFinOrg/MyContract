// JavaScript Document

 <!-- Toastr alert -->
        function myAlert() {
            toastr.success('You have successfully logged in.', '', {
                positionClass: 'toastr toast-bottom-right',
                containerId: 'toast-bottom-right',
                "progressBar": true
            });
            checkBalances();
        }
        function checkBalances() {
          $.get('/getBalances', function(result) {
            balance = result["XDCE"];
            ethBalance = result["ETH"];
            $("#xdce").text(balance);
            $("#eth").text(ethBalance);
          });
        }
        window.onload = myAlert;
        window.setInterval(function() {
          checkBalances();
        }, 30000);
    <!-- Toastr alert Ends -->


<!-- Copy to clipboard -->
(function() {
	'use strict';
  // click events
  document.body.addEventListener('click', copy, true);
	// event handler
	function copy(e) {
    // find target element
    var
      t = e.target,
      c = t.dataset.copytarget,
      inp = (c ? document.querySelector(c) : null);
    // is element selectable?
    if (inp && inp.select) {
      // select text
      inp.select();
      try {
        // copy text
        document.execCommand('copy');
        inp.blur();
        // copied animation
        t.classList.add('copied');
        setTimeout(function() { t.classList.remove('copied'); }, 1000);
      }
      catch (err) {
        alert('please press Ctrl/Cmd+C to copy');
      }
    }
	}
})();
