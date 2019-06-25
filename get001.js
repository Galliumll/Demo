//使用匿名函数，防止变量污染
(function () {
    'use strict' //启用js严格模式，方式变量泄露

    const https=require('https');//因为链家使用的是https协议，因此引入https库来读取网页
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';//防止https证书错误，一定要加入

    /**
     * 将https读取文件的过程，进行封装
     * @param url 目标读取地址
     * @param fn 完成操作后的回调函数
     */
    const load=function (url,fn) {
        https.get(url,function (res) {
            res.setEncoding('utf8');//设定接收编码为utf-8，防止乱码
            let data='';
            res.on('data', function (b) {
                data+=b;
            });
            res.on('end', function() {
                res.removeAllListeners('data');
                res.removeAllListeners('end');
                if(fn instanceof Function)fn(null,data);
            }).on("error", function() {
                if(fn instanceof Function)fn(false);
            });
        });
    };

    load('https://sz.lianjia.com/ershoufang/',function (err,res) {
        console.log('err:',err);
        console.log(res)
    })
})();