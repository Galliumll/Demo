//使用匿名函数，防止变量污染
(function () {
    'use strict' //启用js严格模式，方式变量泄露

    // const file='./data/raw/2a7494b7831d4b99c6b2847fe61e4a21.html';//手动引入引入文件

    const fs=require('fs');//引入文件操作库
    const path=require('path');//引入路径操作库
    const cheerio=require('cheerio');


    let dir='./data/raw';
    //遍历目录下的所有文件
    fs.readdir(dir,async function (err,list) {
        let data=[];
        (function read(){
            if(list.length===0){
                console.log('共整理出数据：',data.length,'条。');
            }else{
                //读取一个html缓存文件
                fs.readFile(path.join(dir,list.pop()),{encoding:'UTF-8'},function (err,res) {
                    let $=cheerio.load(res);
                    //循环读取每个房屋的内容
                    $('ul.sellListContent li').each(function () {
                        let li=$(this);//jquery标准用法
                        let item={
                            '行政区':$('div.position dl dd div a.selected').text().trim(),//补充行政区
                            '名称':li.find('div.info div.title a').text(),
                            // '特征':li.find('div.info div.address div.houseInfo').text(),
                            // '位址':li.find('div.info div.flood div.positionInfo').text(),
                            // '关注':li.find('div.info div.followInfo').text(),
                            '条件':li.find('div.info div.tag').text(),
                            '总价':li.find('div.info div.priceInfo div.totalPrice').text().replace(/[^\d\.]/g,''),
                            '单价':li.find('div.info div.priceInfo div.unitPrice').text().replace(/[^\d\.]/g,''),
                        };

                        //力高君御国际  | 4室2厅 | 87.99平米 | 南 | 其他
                        //将文本分割为数组，对数组中的元素逐个进行清洗分类
                        li.find('div.info div.address div.houseInfo').text().split('|').forEach(function (value,index) {
                            value=value.trim();
                            if(index===0)item['小区']=value;
                            else if(/\d+[室厅]\d+[室厅]/.test(value))item['房型']=value;
                            else if(/[\d\.]+平米/.test(value))item['面积']=value.replace(/[^\d\.]/g,'');//仅保留数字和小数点
                            else if(/[东南西北中]+/.test(value))item['朝向']=value;//仅保留数字和小数点
                            else if(/[其他电梯]/.test(value))item['电梯']=value;
                            else if(/[精简豪装]+|毛坯|[独栋]+[别墅]+/g.test(value))item['装修']=value;
                            else throw ('需要重新匹配规则:'+value)
                        });

                        //低楼层(共35层)2016年建板塔结合  -  坪山
                        //应对不同情况的数据格式的清洗方式
                        let position=li.find('div.info div.flood div.positionInfo').text().trim();
                        //在运行的过程中，发现会出现空字符，过滤掉
                        if(position!==''){
                            position=position.split('-');

                            item['位置']=position[1].trim();
                            let keys=position[0].indexOf('(')===-1
                                ? {'楼层':/([\d一二三四五六七八九十]+)层/,'建成年份':/(\d{4})年建/,'结构工艺':/[板塔]+[楼结]{0,1}[合]{0,1}/}
                                : {'楼层':/([高中低矮]+)楼层/,'总层高':/共(\d+)层/,'建成年份':/(\d{4})年建/,'结构工艺':/[板塔]+[楼结]{0,1}[合]{0,1}/};
                            Object.keys(keys).forEach(function (b) {
                                let t=keys[b].exec(position[0]);
                                if(t!==null)item[b]=t[1]||t[0];
                            });

                            //9人关注 / 共9次带看 / 2个月以前发布
                            li.find('div.info div.followInfo').text().split('/').forEach(function (value,index) {
                                if(index===0)item['关注人数']=value.replace(/[^\d]/g,'');
                                else if(index===0)item['带看人数']=value.replace(/[^\d]/g,'');
                                else item['发布时间']=value.trim();
                            });
                        };

                        //将结果保存到缓存当中
                        data.push(item);
                    });
                    read();
                });
            };
        })();
    });
})();