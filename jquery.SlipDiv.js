(function ($) {
	'use strict';

	function touchHandler (e) { // touch event導向mouse event
		var event = e.originalEvent,
			touches = event.changedTouches,
			first = touches[0],
			type = '';
		switch (event.type) {
		case 'touchstart':
			type = 'mousedown';
			touchHandler.touchTargetPosition = [first.pageX, first.pageY];
			break;
		case 'touchmove':
			type = 'mousemove';
			break;
		case 'touchend':
			if (touchHandler.touchTargetPosition[0] == first.pageX && touchHandler.touchTargetPosition[0] == first.pageY) {
				type = 'mouseup';
			} else {
				type = 'click';
			}
			break;
		default:
			return;
		}
		//initMouseEvent(type, canBubble, cancelable, view, clickCount,
		//           screenX, screenY, clientX, clientY, ctrlKey,
		//           altKey, shiftKey, metaKey, button, relatedTarget);
		var simulatedEvent = document.createEvent('MouseEvent');
		simulatedEvent.initMouseEvent(type, true, true, window, 1,
			first.screenX, first.screenY,
			first.clientX, first.clientY, false,
			false, false, false, 0/*left*/, null);
		first.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	}

	function SlipDiv(elm, callback) { // callback為滑動時or滑動結束時執行的function
		this.state = {active: false};
		this.div = $(elm).css({border: '1px solid #000000', overflow: 'hidden'});
		this.innerDiv = $(elm).children('div');
		this.maxLeft = 0;
		// minLeft,
		this.outerWidth = this.div.width(); // 外層div寬度
		//innerWidth, // 內包div寬度
		this.callback = callback;

		this.init();
	}
	SlipDiv.prototype.adjustLeft = function (left) {
		if (left > this.maxLeft) {
			return this.maxLeft;
		} else if (left < this.minLeft) {
			return this.minLeft;
		} else {
			return left;
		}
	};
	SlipDiv.prototype.reset = function () {
		this.innerDiv.css({left: '0px'});
	};
	SlipDiv.prototype.init = function () {
		// 其下內容一律再包一層div
		var _innerDivId = 'slippable_inner_' + Math.round(Math.random() * 10000000);
		this.div.wrapInner('<div id="' + _innerDivId + '" style="position: absolute; top: 0px; left: 0px;"/>');
		this.innerDiv = $('#' + _innerDivId);

		// 改在mousedown時抓
		// this.innerWidth = this.innerDiv.width();
		// this.minLeft = this.outerWidth - this.innerWidth;

		// 前面position先用absolute, 正確抓到其width後, 須再改回relative
		this.innerDiv.css({position: 'relative'});

		this.div.on('mousedown', {obj: this}, function (event) {
			var obj = event.data.obj;

			// 避免在slippable()後, 有異動內容改變寬度, 在每次mousedown時須重抓寬度
			// 欲正確抓到其width, 須暫時先將position改成absolute
			obj.innerDiv.css({position: 'absolute'});
			obj.innerWidth = obj.innerDiv.width();
			obj.minLeft = obj.outerWidth - obj.innerWidth;
			obj.innerDiv.css({position: 'relative'});

			obj.state.startTime = new Date();
			obj.state.startXY = {x: event.pageX, y: event.pageY};
			obj.state.startPos = {left: parseInt(obj.innerDiv.css('left'), 10), top: parseInt(obj.innerDiv.css('top'), 10)};
			obj.state.active = true;
			obj.innerDiv.stop(true, false); // 停止animate, 如果有在動作的話
			event.preventDefault();
		})
		.on('touchstart touchmove touchend', touchHandler)
		.on('mouseup', {obj: this}, function (event) {
			var obj = event.data.obj,
				distance = event.pageX - obj.state.startXY.x, // 因僅支援左右滑動, 只需考慮x
				// slipped = false,
				speed,
				left,
				ms;
			if (Math.abs(distance) > 20) { // 至少位移10以上才可能觸發slip
				if (new Date().getTime() - obj.movingTime < 50) { // mouseup前滑鼠靜止的時間須少於0.05秒才觸發slip
					speed = distance / ((obj.state.startTime.getTime() - new Date().getTime()) / 1000);
					if (Math.abs(speed) > 200) { // 動作夠快(每秒200px以上)才觸發slip
						left = parseInt(obj.innerDiv.css('left'), 10) + parseInt(distance * Math.abs(distance) / 100, 10);
						ms = Math.ceil(Math.abs(distance) / 300) * 1000;
						// obj.innerDiv.animate({left: obj.adjustLeft(left) + 'px'}, ms, 'easeOutCubic', function () {
						// 	obj.callback.call(obj.div); // callback中的this為slippable那個div的jQuery物件
						// });
						obj.innerDiv.animate({left: obj.adjustLeft(left) + 'px'}, {
							duration: ms,
							easing: 'easeOutCubic',
							progress: function () {
								obj.callback.call(obj.div);
							},
							complete: function () {
								obj.callback.call(obj.div);
							}
						});
						// slipped = true;
					}
				}
			}
			// if (!slipped) { // 未滑動, 仍有可能是drag&drop, 也須執行callback
			// 	obj.callback.call(obj.div);
			// }

			obj.state.active = false;
		})
		.on('mouseout', {obj: this}, function (event) {
			var obj = event.data.obj;
			// obj.callback.call(obj.div);
			obj.state.active = false;
		})
		.on('mousemove', {obj: this}, function (event) {
			var obj = event.data.obj;
			obj.movingTime = new Date().getTime();
			if (obj.state.active) {
				var left = obj.state.startPos.left + event.pageX - obj.state.startXY.x;
				obj.innerDiv.css({left: obj.adjustLeft(left) + 'px'});
				obj.callback.call(obj.div);
			}
		});
	};

	$.fn.slippable = function (fn) {
		if (!this.length) {
			return this;
		}
		var callback = (Object.prototype.toString.call(fn) === '[object Function]') ? fn : function () {};
		this.each(function () {
			if (this.tagName.toUpperCase() == 'DIV') { // div才支援slippable()
				$(this).data('slip', new SlipDiv(this, callback));
			}
		});
		return this;
	};
})(jQuery);