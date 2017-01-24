var inherit = require('inherit');
var View = require('BoxPopupView');


function DefaultPopup() {
	View.call(this);
	//var self = this;
}

inherit(DefaultPopup, View);

module.exports = DefaultPopup;
