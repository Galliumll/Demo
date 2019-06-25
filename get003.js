//使用匿名函数，防止变量污染
(function () {
    'use strict' //启用js严格模式，方式变量泄露

    const https=require('https');//因为链家使用的是https协议，因此引入https库来读取网页
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';//防止https证书错误，一定要加入

    const fs=require('fs');//引入文件操作库
    const path=require('path');//引入路径操作库

    /**
     * 对指定支付进行md5计算
     * @param str 需要进行md5计算的字符串
     */
    const md5=(function () {
        const crypto = require('crypto');
        return function (str) {
            return crypto.createHash('md5').update(str).digest('hex');
        };
    })();

    const expiryTime=60*60*1000;//设定文件缓存的过期时间是一个小时

    /**
     * 将https读取文件的过程，进行封装
     * @param url 目标读取地址
     * @param fn 完成操作后的回调函数
     */
    const load=function (url,fn) {
        let file=path.join('data','raw',md5(url));//设定缓存文件的路径及名称
        fs.stat(file,function (err,res) {//检查目标文件是否存在，若存在，则判断文件修改时间是否过期
            if(err!==null || res.mtimeMs+expiryTime<Date.now()){
                https.get(url,function (res) {
                    res.setEncoding('utf8');//设定接收编码为utf-8，防止乱码
                    let data='';
                    res.on('data', function (b) {
                        data+=b;
                    });
                    res.on('end', function() {
                        res.removeAllListeners('data');
                        res.removeAllListeners('end');

                        //将读取的内容，保存到缓存中
                        fs.writeFile(file,data,function () {
                            if(fn instanceof Function)fn(null,data);
                        });
                    }).on("error", function() {
                        if(fn instanceof Function)fn(false);
                    });
                });
            }else fs.readFile(file,{encoding:'UTF-8'},function (err,res) { //如果文件存在且没有过期，则使用缓存
                if(fn instanceof Function)fn(null,res);
            });
        })
    };

    const url='https://sz.lianjia.com';
    let region=[];
    const cheerio=require('cheerio');
    load(url+'/ershoufang/',function (err,res) {
        let $=cheerio.load(res);
        region.length=[];

        //执行区域数据的清洗
        Array.prototype.forEach.call($('div.m-filter>div.position>dl>dd>div[data-role="ershoufang"]>div>a'),function (a) {
            a=$(a);
            region.push({name:a.text(),url:a.attr('href')});
        });

        if(region.length!==0){
            console.log('共有',region.length,'个区域需要爬取');
        };
    })
})();