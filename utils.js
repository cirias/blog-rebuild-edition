var fs = require("fs");
var path = require("path");

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//删除此目录下所有目录及文件，不删除此目录
exports.deleteContentsInDir = function(p, callback) {
    var root = p;

    function recursivelyRemove(p, callback) {
        if (fs.existsSync(p)) {
            var files = [];
            files = fs.readdirSync(p);
            files.map(function(file) {
                return path.join(p, file);
            }).forEach(function(file) {
                if (!fs.lstatSync(file).isDirectory()) {
                    fs.unlinkSync(file);
                } else {
                    recursivelyRemove(file, callback);
                }
            });

            if (root !== p) {
                fs.rmdirSync(p);
            }
        }
    }

    recursivelyRemove(p, callback);
}

