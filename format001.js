//使用匿名函数，防止变量污染
(function () {
    'use strict' //启用js严格模式，方式变量泄露

    const file='./data/raw/2a7494b7831d4b99c6b2847fe61e4a21.html';//手动引入引入文件

    const fs=require('fs');//引入文件操作库
    const path=require('path');//引入路径操作库
    const cheerio=require('cheerio');

    fs.readFile(file,{encoding:'UTF-8'},function (err,res) {
        let $=cheerio.load(res);

        //循环读取每个房屋的内容
        $('ul.sellListContent li').each(function () {
            let li=$(this);//jquery标准用法
            let item={
                '名称':li.find('div.info div.title a').text(),
                '特征':li.find('div.info div.address div.houseInfo').text(),
                '位址':li.find('div.info div.flood div.positionInfo').text(),
                '关注':li.find('div.info div.followInfo').text(),
                '条件':li.find('div.info div.tag').text(),
                '总价':li.find('div.info div.priceInfo div.totalPrice').text(),
                '单价':li.find('div.info div.priceInfo div.unitPrice').text(),
            };
            console.log(item)//将清洗结果输出
        });
    });



})();