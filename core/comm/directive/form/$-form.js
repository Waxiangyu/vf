/**
 * Created by xiyuan on 16-8-17.
 */
form(function ($app, $appConfig) {
    /**
     * 获取元素容器内表单元素数据
     * @param formElement
     * @returns {*}
     */
    function getData(formElement){
        var elementName,
            formData={},
            isFileUpload=false,
            inputAll=[].slice.call(formElement.querySelectorAll('input')),
            selectAll=[].slice.call(formElement.querySelectorAll('select')),
            buttonAll=[].slice.call(formElement.querySelectorAll('button')),
            textareaAll=[].slice.call(formElement.querySelectorAll('textarea'));

        //input元素集合处理
        inputAll.forEach(function (element) {

            //检查元素name是否存在 或设置disabled则不予处理
            if(!(elementName=element.name) || element.disabled)return;

            switch (element.type){
                case 'text':
                case 'week':
                case 'url':
                case 'search':
                case 'time':
                case 'password':
                case 'number':
                case 'month':
                case 'hidden':
                case 'email':
                case 'datetime-local':
                case 'datetime':
                case 'date':
                case 'color':
                case 'button':
                case 'range':
                case 'image':
                case 'submit':
                    //把值存入数据容器中
                    typeof formData[elementName] !== "undefined" && (formData[elementName]= formData[elementName] instanceof Array ? formData[elementName]:[formData[elementName]]).push(element.value)  ||(formData[elementName]=element.value)
                    break;
                case 'radio':
                case 'checkbox':
                    if(element.checked){
                        if(formData[elementName]){
                            (formData[elementName] instanceof Array ? formData[elementName]:formData[elementName] = [formData[elementName]]).push(element.value)
                        }else{
                            formData[elementName]=element.value;
                        }
                    }
                    break;
                case 'file':
                    //文件lists解析
                    var files=element.files,
                        fileLength=files.length;

                    while(fileLength){
                        --fileLength;
                        isFileUpload=true;
                        //把值存入数据容器中
                        formData[elementName] && (formData[elementName].push(files[fileLength])) ||(formData[elementName]=files[fileLength]);
                    }
                    break;
                case 'reset':
            }
        });

        selectAll.forEach(function (element) {
            //检查元素name是否存在 或设置disabled则不予处理
            if(!(elementName=element.name) || element.disabled)return;

            [].slice.call(element.options).forEach(function (options) {
                if(options.selected){
                    //把值存入数据容器中
                    typeof formData[elementName] !== "undefined" && (formData[elementName]= formData[elementName] instanceof Array ? formData[elementName]:[formData[elementName]]).push(element.value)  ||(formData[elementName]=element.value)
                }
            });
        });

        //文本域 与 按钮
        textareaAll.concat(buttonAll).forEach(function(element){
            //检查元素name是否存在 或设置disabled则不予处理
            if(!(elementName=element.name) || element.disabled)return;
            //把值存入数据容器中
            typeof formData[elementName] !== "undefined" && (formData[elementName]= formData[elementName] instanceof Array ? formData[elementName]:[formData[elementName]]).push(element.value)  ||(formData[elementName]=element.value)
        });
        
        if(isFileUpload){
            //表单数据对象
            var $formData = new FormData();
            //循环取出数据容器中数据放入FormData中
            Object.keys(formData).forEach(function (name) {
                $formData.append(name, formData[name]);
            });
            return $formData;
        }
        return formData;
    }

    /**
     * 表单校验
     * @param formElement
     */
    function valid(formElement) {
        //自定义事件
        var validEvent = document.createEvent('HTMLEvents'/*Event*/);
        validEvent.initEvent("valid", true, true);
        validEvent.eventType = 'valid';

        var valid,
            isPass=true,
            //合并容器内所有表单元素
            formChilds=[].slice.call(formElement.querySelectorAll('input')).concat(
                [].slice.call(formElement.querySelectorAll('select')),
                [].slice.call(formElement.querySelectorAll('textarea'))
            );


        //容器内循环表单元素
        formChilds.forEach(function (element) {
            //触发校验事件
            element.dispatchEvent(validEvent);
            //检查校验结果
            element.dataset['validresult'] === 'false' && (isPass=false);
        });

        return isPass;
    }

    $app.directiveRegister('$Form', {
        //指令优先级 降序执行
        priority: 0,
        //是否显示指令代码
        directiveShow: false,
        //引入的工具类
        tools:['log'],
        //只调用一次，在指令第一次绑定到元素上时调用。
        handle: function (log) {

            var formElement = this.$element,
                expReg=this.$expression.match(/^\s*([^\.\[\(]+)([\s\S]*)$/),
                modelName=expReg[1],
                watchKey=expReg[2],
                $VM=this.$scope[modelName]=(this.$scope[modelName] || this.$MODEL());

            $VM.write(watchKey,{
                getData:function () {
                    return getData(formElement);
                },
                valid:function () {
                    return valid(formElement);
                }
            });

        }
    });
});