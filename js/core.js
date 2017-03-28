/***********************************************************************************************************************************************************************************************************************************************************************************************************
 * Form
 */

/**
 * 表单验证构造函数
 * @param [formSelector]{String} 获取form元素的字符串
 * @param validateArray{Array} 对象数组，每个对象定义某个类型的文本框的校验规则， 对象定义如下：
 * 		  {
 * 	          [require]: true | false,                  {Boolean}
 * 			  [reg]: {                                  {Obj}
 * 						pattern: {String},      // 正则表达式
 * 					    hint: {String}          // 提示内容
 * 					 },
 * 			  [triggerType]: 'change' <default>         {String}      
 *        }
 * 
 */
function Validate(formSelector, validateArray) {
	 var _this = this;
      
	 if(arguments.length === 1) {
	 	validateArray = arguments[0];
	 	formSelector = document;
	 }

	 _this.$form = $(formSelector);

	$.each(validateArray, function(i, obj) {
		// 绑定文本框事件
		var triggerType = obj.triggerType || 'input propertychange';
		 _this.$form.on(triggerType, obj.selector, function(e) {
			var newObj = obj;
			newObj.selector = this;
			_this.validate(new Array(newObj));
		});
	});
	
	

	_this.validateArray = validateArray;
}
/**
 * 表单验证构造函数Validate的校验方法
 * 
 * @param [validateArray]{Array} 对象数组
 * @return {Boolean} 校验是否通过
 * 
 */
Validate.prototype.validate = function(validateArray) {
	var _this = this;

	var _validateArray = validateArray || this.validateArray;
	
	var validatedArr = [];
	$.each(_validateArray, function(i, validateObj) {
		var require = validateObj.require;
		var reg = validateObj.reg;
		
		$.each(_this.$form.find(validateObj.selector), function(j, ele) {
			var val = $(ele).val();
			var $hint = $(ele).siblings('.hint');
			
			if(!validateArray && $hint.hasClass('error')) {                            // 后台请求验证过的表单无需验证
				validatedArr.push(false);
				return true;
			}
			
			// 不能为空
			if(require && val === '') {
				$hint.removeClass('success').addClass('error').text('不能为空');
				validatedArr.push(false);
				return true;   
			}
			
			// 正则
			if(reg && !new RegExp(reg.pattern).test(val)) {
				$hint.removeClass('success').addClass('error').text(reg.hint);
				validatedArr.push(false);
				return true
			}
			
			$hint.removeClass('error').addClass('success').text('');
			validatedArr.push(true);			
		});
	});
	
	var validated = true;
	$.each(validatedArr, function(z, val) {
		if(!val) {
			validated = false;  
			return false;
		}
	});
	return validated;
}
/**
 * 表单验证构造函数Validate显示后台返回信息的方法
 * 
 * @param msg{String} 
 * 
 */
Validate.prototype.ShowBackStageMsg = function (msg) {
	var _this = this;
	if(msg === null) msg = 'null';
	
	_this.$form.find('.hint-backstage').text(msg)
									  .show()
									  .removeClass('twinkle')
	setTimeout(function() {
		_this.$form.find('.hint-backstage').addClass('twinkle');
	},1);	
}

Validate.prototype.removeBackStageMsg = function () {
	this.$form.find('.hint-backstage').text('')
									  .hide();	
}
		
/**
 * 表单添加了ajax-submit类名的默认ajax提交 
 */
$(document).on('submit change', 'form.ajax-submit, form.ajax-submit-onchange', function(e) {
	var $form = $(this);
	if(e.type === 'change' && !$form.hasClass('ajax-submit-onchange')) return;
	e.preventDefault();     // 阻止默认提交
	
	var method = ($form.attr('method') || 'GET').toUpperCase();
	var contentType = $form.prop('enctype') || $form.attr('enctype');
	
	var url = $form.attr('action');
	
	var data = formSerializeArrayRemoveBlank($form.serializeArray());
	
	var xhr = $.ajax({
		url: url,
		type: method,
		data: data,
		contentType: contentType,
		dataType: 'json',
		beforeSend: function(xhr) {
			$form.trigger('form:beforesend', {data:data, xhr: xhr});
			if(!url) xhr.abort();
		},
		error: function(data) {
			$form.trigger('form:error', {data: data});
		},
		success: function(data) {
			$form.trigger('form:success', {data: data});
		}
	});
});

/**
 * 将form序列化的数组对象中去掉value为空串的属性
 * 
 * @param formArray jquery.form对象
 */
formSerializeArrayRemoveBlank = function(formArray) {
	var arrays = new Array();
	var j = 0;
	for ( var i = 0; i < formArray.length; i++) {
		if (null != formArray[i].value && formArray[i].value != "") {
			arrays[j] = formArray[i];
			j++;
		}
	}// end for
	return arrays;
};

/**
 * 倒计时函数
 * @param totalTime{number} 倒计时总时间
 * @param callback{Function} 每一帧执行的回调函数
 * @param stopCallback{Function} 最后一帧执行的回调函数
 */
function timer(totalTime, callback, stopCallback) {
	var timer = setInterval(function() {
		totalTime --;
		if(totalTime > 0) {
			callback(totalTime)
		}else {
			clearInterval(timer);
			stopCallback();
		}
	}, 1000);
}

/********************************************** jquery方法扩展 **********************************************/
$.extend({
	/**
	 * 获取url后面的参数
	 */
	getUrlVars: function() {
		var vars = [],
			hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(decodeURI(hash[0]));
			vars[hash[0]] = decodeURI(hash[1]);
		}
		return vars;
	},
	
	/**
	 * 获取url后面某个参数的值
	 * 
	 * @param {string} name 参数的属性名
	 */
	getUrlVar: function(name) {
		return $.getUrlVars()[name];
	},
});

/********************************************** 判断邮箱地址 **********************************************/
var mdutil = {
	mailMap: {
		"163.com": "http://mail.163.com",
		"gmail.com": "http://gmail.com",
		"126.com": "http://www.126.com",
		"yahoo.com": "http://mail.cn.yahoo.com",
		"yahoo.com.cn": "http://mail.cn.yahoo.com",
		"yahoo.cn": "http://mail.cn.yahoo.com",
		"hotmail.com": "http://mail.live.com",
		"live.com": "http://mail.live.com",
		"yeah.net": "http://www.yeah.net",
		"tom.com": "http://mail.tom.com",
		"sina.com": "http://mail.sina.com.cn",
		"sina.com.cn": "http://mail.sina.com.cn",
		"sina.cn": "http://mail.sina.com.cn",
		"263.net": "http://mail.263.net",
		"263.net.cn": "http://mail.263.net",
		"x263.net": "http://mail.263.net",
		"21cn.com": "http://mail.21cn.con",
		"people.com.cn": "http://www.peoplemail.com.cn/extend/gb",
		"vip.188.com": "http://www.188.com",
		"188.com": "http://www.188.com",
		"ruyi.com": "http://mail.ruyi.com",
		"139.com": "http://mail.139.com",
		"qq.com": "http://mail.qq.com",
		"xinhuanet.com": "http://mail.xinhuanet.com",
		"cctv.com": "http://mail.cctv.com",
		"eyou.com": "http://www.eyou.com",
		"eyou.net": "http://mail.eyou.net",
		"35.com": "http://mail.35.com",
		"shangmail.com": "http://www.shangmail.com",
		"alibaba.com.cn": "http://china.alibaba.com/member/mail/mailLogin.htm",
		"eastday.com": "http://mail.eastday.com"
	},
	// 切换input的可见状态
	showPassword: function(eye) {
		var $input = $(eye).siblings('input');
		$(eye).toggleClass('active');
		if($(eye).hasClass('active')) {
			$input.prop('type', 'text');
		}else {
			$input.prop('type', 'password');
		}
	}
}
