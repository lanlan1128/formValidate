/***********************************************************************************************************************************************************************************************************************************************************************************************************
 * Form
 */

/**
 * 表单验证构造函数
 * 
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
function Validate(validateArray) {
	 var _this = this;
	// 绑定文本框输入事件
	$.each(validateArray, function(i, obj) {
		var triggerType = obj.triggerType || 'input propertychange';
		$(obj.selector).on(triggerType, function(e) {
			var newObj = obj;
			obj.selector = this;
			_this.validate(new Array(newObj));
		});
	});
	this.validateArray = validateArray;
}
/**
 * 表单验证构造函数Validate的校验方法
 * 
 * @param [validateArray]{Array} 对象数组
 * @return {Boolean} 校验是否通过
 * 
 */
Validate.prototype.validate = function(validateArray) {
	var validateArray = validateArray || this.validateArray;
	
	var validated = false;
	$.each(validateArray, function(i, validateObj) {
		var require = validateObj.require;
		var reg = validateObj.reg;
		
		$.each($(validateObj.selector), function(j, ele) {
			var val = $(ele).val();
			var $hint = $(ele).siblings('.hint');
			
			// 不能为空
			if(require && val === '') {
				$hint.removeClass('success').addClass('error').text('不能为空');
				validated = false;
				return true;   // 退出本次循环 
			}
			
			// 正则
			if(reg && !new RegExp(reg.pattern).test(val)) {
				$hint.removeClass('success').addClass('error').text(reg.hint);
				validated = false;
				return true
			}
			
			$hint.removeClass('error').addClass('success').text('');
			validated = true;
			
		});
	});
	
	return validated;
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
	if(!url) return;
	
	var data = formSerializeArrayRemoveBlank($form.serializeArray());
	
	var xhr = $.ajax({
		url: url,
		type: method,
		data: data,
		contentType: contentType,
		dataType: 'json',
		beforeSend: function(xhr) {
			$form.trigger('form:beforesend', {data:data, xhr: xhr});
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