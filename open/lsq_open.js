import { Crypto, load, _ } from './lib/cat.js';

/**
 * 发布页：https://kan80.app/
 */
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';
const PC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36';
const UA = 'Mozilla/5.0';
const UC_UA = 'Mozilla/5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.5.5.1035 Mobile Safari/537.36';
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
const RULE_CK = 'cookie'; // 源cookie的key值
let html = '';

var charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
let HOST = '';
let validUrl = HOST + '/index.php/verify/index.html?';
let validCheckUrl = 'https://www.hdmyy.com/index.php/ajax/verify_check?type=search&verify='
let siteKey = '';
let siteType = 0;
let COOKIE = 'PHPSESSID=' + randStr(26, true);
let maxRetryTime = 5;
let currentRetryTime = 0;
let parseUrl = [];

// var rule = {
//     title:'',//规则标题,没有实际作用,但是可以作为cms类名称依据
//     编码:'',//不填就默认utf-8
//     搜索编码:'',//不填则不编码，默认都是按utf-8.可优先于全局编码属性.比如网页源码编码是gbk,这里可以指定utf-8搜索独立编码。多数情况这个属性不填或者填写gbk应对特殊的网站搜索
//     host:'https://saohuo.us',//网页的域名根,包含http头如 https://www,baidu.com
//     // hostJs: `request(HOST);||
//     //         const $ = load(html);
//     //         let src = $("ul > li > div > div > a").attr("href");
//     //         HOST=src`,//网页域名根动态抓取js代码。通过HOST=赋值
//     homeUrl:'/',//网站的首页链接,可以是完整路径或者相对路径,用于分类获取和推荐获取 fyclass是分类标签 fypage是页数
//     url:'/vodshow/fyclass-{{area}}-{{by}}-{{type}}-----fypage---{{year}}.html',//网站的分类页面链接
//     detailUrl:'fyid',//非必填,二级详情拼接链接,感觉没啥卵用
//     searchUrl:'',//搜索链接 可以是完整路径或者相对路径,用于分类获取和推荐获取 **代表搜索词 fypage代表页数
//     searchable:0,//是否启用全局搜索,
//     quickSearch:0,//是否启用快速搜索,
//     filterable:0,//是否启用筛选,
//     // filter:{
//     //     '1':[{'key':'class','name':'剧情','init':'','value':[{'n':'全部','v':''},{'n':'喜剧','v':'喜剧'},{'n':'爱情','v':'爱情'},{'n':'恐怖','v':'恐怖'},{'n':'动作','v':'动作'},{'n':'科幻','v':'科幻'},{'n':'剧情','v':'剧情'},{'n':'战争','v':'战争'},{'n':'警匪','v':'警匪'},{'n':'犯罪','v':'犯罪'},{'n':'动画','v':'动画'},{'n':'奇幻','v':'奇幻'},{'n':'武侠','v':'武侠'},{'n':'冒险','v':'冒险'},{'n':'枪战','v':'枪战'},{'n':'恐怖','v':'恐怖'},{'n':'悬疑','v':'悬疑'},{'n':'惊悚','v':'惊悚'},{'n':'经典','v':'经典'},{'n':'青春','v':'青春'},{'n':'文艺','v':'文艺'},{'n':'微电影','v':'微电影'},{'n':'古装','v':'古装'},{'n':'历史','v':'历史'},{'n':'运动','v':'运动'},{'n':'农村','v':'农村'},{'n':'儿童','v':'儿童'},{'n':'网络电影','v':'网络电影'}]},{'key':'area','name':'地区','init':'','value':[{'n':'全部','v':''},{'n':'中国大陆','v':'中国大陆'},{'n':'中国香港','v':'中国香港'},{'n':'中国台湾','v':'中国台湾'},{'n':'美国','v':'美国'},{'n':'法国','v':'法国'},{'n':'英国','v':'英国'},{'n':'日本','v':'日本'},{'n':'韩国','v':'韩国'},{'n':'德国','v':'德国'},{'n':'泰国','v':'泰国'},{'n':'印度','v':'印度'},{'n':'意大利','v':'意大利'},{'n':'西班牙','v':'西班牙'},{'n':'加拿大','v':'加拿大'},{'n':'其他','v':'其他'}]},{'key':'year','name':'年份','init':'','value':[{'n':'全部','v':''},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':'时间','v':'time'},{'n':'人气','v':'hits'},{'n':'评分','v':'score'}]}],
//     //     '2':[{'key':'class','name':'剧情','init':'','value':[{'n':'全部','v':''},{'n':'爱情','v':'爱情'},{'n':'古装','v':'古装'},{'n':'悬疑','v':'悬疑'},{'n':'都市','v':'都市'},{'n':'喜剧','v':'喜剧'},{'n':'战争','v':'战争'},{'n':'剧情','v':'剧情'},{'n':'青春','v':'青春'},{'n':'历史','v':'历史'},{'n':'网剧','v':'网剧'},{'n':'奇幻','v':'奇幻'},{'n':'冒险','v':'冒险'},{'n':'励志','v':'励志'},{'n':'犯罪','v':'犯罪'},{'n':'商战','v':'商战'},{'n':'恐怖','v':'恐怖'},{'n':'穿越','v':'穿越'},{'n':'农村','v':'农村'},{'n':'人物','v':'人物'},{'n':'商业','v':'商业'},{'n':'生活','v':'生活'},{'n':'短剧','v':'短剧'},{'n':'其他','v':'其他'}]},{'key':'area','name':'地区','init':'','value':[{'n':'全部','v':''},{'n':'中国大陆','v':'中国大陆'},{'n':'中国香港','v':'中国香港'},{'n':'中国台湾','v':'中国台湾'},{'n':'韩国','v':'韩国'},{'n':'香港','v':'香港'},{'n':'台湾','v':'台湾'},{'n':'日本','v':'日本'},{'n':'美国','v':'美国'},{'n':'泰国','v':'泰国'},{'n':'英国','v':'英国'},{'n':'新加坡','v':'新加坡'},{'n':'其他','v':'其他'}]},{'key':'year','name':'年份','init':'','value':[{'n':'全部','v':''},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':'时间','v':'time'},{'n':'人气','v':'hits'},{'n':'评分','v':'score'}]}],
//     //     '3':[{'key':'class','name':'剧情','init':'','value':[{'n':'全部','v':''},{'n':'音乐','v':'音乐'},{'n':'情感','v':'情感'},{'n':'生活','v':'生活'},{'n':'职场','v':'职场'},{'n':'真人秀','v':'真人秀'},{'n':'搞笑','v':'搞笑'},{'n':'公益','v':'公益'},{'n':'艺术','v':'艺术'},{'n':'访谈','v':'访谈'},{'n':'益智','v':'益智'},{'n':'体育','v':'体育'},{'n':'少儿','v':'少儿'},{'n':'时尚','v':'时尚'},{'n':'人物','v':'人物'},{'n':'其他','v':'其他'}]},{'key':'area','name':'地区','init':'','value':[{'n':'全部','v':''},{'n':'中国大陆','v':'中国大陆'},{'n':'港台','v':'港台'},{'n':'韩国','v':'韩国'},{'n':'欧美','v':'欧美'},{'n':'其他','v':'其他'}]},{'key':'year','name':'年份','init':'','value':[{'n':'全部','v':''},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':'时间','v':'time'},{'n':'人气','v':'hits'},{'n':'评分','v':'score'}]}],
//     //     '4':[{'key':'class','name':'剧情','init':'','value':[{'n':'全部','v':''},{'n':'冒险','v':'冒险'},{'n':'战斗','v':'战斗'},{'n':'搞笑','v':'搞笑'},{'n':'经典','v':'经典'},{'n':'科幻','v':'科幻'},{'n':'玄幻','v':'玄幻'},{'n':'魔幻','v':'魔幻'},{'n':'武侠','v':'武侠'},{'n':'恋爱','v':'恋爱'},{'n':'推理','v':'推理'},{'n':'日常','v':'日常'},{'n':'校园','v':'校园'},{'n':'悬疑','v':'悬疑'},{'n':'真人','v':'真人'},{'n':'历史','v':'历史'},{'n':'竞技','v':'竞技'},{'n':'其他','v':'其他'}]},{'key':'area','name':'地区','init':'','value':[{'n':'全部','v':''},{'n':'中国大陆','v':'中国大陆'},{'n':'日本','v':'日本'},{'n':'韩国','v':'韩国'},{'n':'欧美','v':'欧美'},{'n':'其他','v':'其他'}]},{'key':'year','name':'年份','init':'','value':[{'n':'全部','v':''},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':'时间','v':'time'},{'n':'人气','v':'hits'},{'n':'评分','v':'score'}]}],
//     //     '63':[{'key':'by','name':'排序','value':[{'n':'时间','v':'time'},{'n':'人气','v':'hits'},{'n':'评分','v':'score'}]}],
//     // },// 筛选条件字典
//     // 默认筛选条件字典(不同分类可以指定同样筛选参数的不同默认值)
//     filter_def:{
//         douyu:{
//         area:'一起看',
//         other:'..'
//         },
//         huya:{
//         area:'影音馆',
//         other:'..'
//         }
//     }, 
//     // 筛选网站传参,会自动传到分类链接下(本示例中的url参数)-url里参数为fyfilter,可参考蓝莓影视.js
//     filter_url:'style={{fl.style}}&zone={{fl.zone}}&year={{fl.year}}&fee={{fl.fee}}&order={{fl.order}}',
//     // 注意,由于猫有配置缓存,搜索配置没法热加载，修改了js不需要重启服务器
//     // 但是需要tv_box进设置里换源使配置重新装载
//     headers:{//网站的请求头,完整支持所有的,常带ua和cookies
//         'User-Agent':'MOBILE_UA',
//         "Cookie": "searchneed=ok"
//     },
//     timeout:5000,//网站的全局请求超时,默认是3000毫秒
//     //class_name:'电影&电视剧&动漫',//静态分类名称拼接
//     //class_url:'1&2&3',//静态分类标识拼接
//     //动态分类获取 列表;标题;链接;正则提取 不需要正则的时候后面别加分号
//     class_parse:'div.homepage_main_tabs_new;a.homepage_main_tabs_title_new&&Text;a&&href&&vodtype\/(.*?).html',
//     // 除开全局过滤之外还需要过滤哪些标题不视为分类
//     cate_exclude:'',
//     // 除开全局动态线路名过滤之外还需要过滤哪些线路名标题不视为线路
//     tab_exclude:'夸克4K',
//     //移除某个线路及相关的选集|js1
//     tab_remove:['tkm3u8'],
//     //线路顺序,按里面的顺序优先，没写的依次排后面|js1
//     tab_order:['lzm3u8','wjm3u8','1080zyk','zuidam3u8','snm3u8'],
//     //线路名替换如:lzm3u8替换为量子资源|js1
//     tab_rename:{'lzm3u8':'量子','1080zyk':'1080看','zuidam3u8':'最大资源','kuaikan':'快看',
//     'bfzym3u8':'暴风','ffm3u8':'非凡','snm3u8':'索尼','tpm3u8':'淘片','tkm3u8':'天空',},

//     // 服务器解析播放
//     play_parse:true,
//     // play_json　传数组或者　类　true/false 比如 0,1 如果不传会内部默认处理 不传和传0可能效果不同
//     // 效果等同说明: play_json:[{re:'*', json:{jx:0, parse:1}}], 等同于 play_json:0,
//     play_json:[{
//         re:'*',
//         json:{
//             jx:1,
//             parse:1,
//         },
//     }],
//     //控制不同分类栏目下的总页面,不填就是默认999.哔哩影视大部分分类无法翻页，都需要指定页数为 1
//     pagecount:{"1":1,"2":1,"3":1,"4":1,"5":1,"7":1,"时间表":1},
//     // 自定义免嗅 
//     lazy:`
//         request('https://jx3.xn--1lq90i13mxk5bolhm8k.xn--fiqs8s/player/ec.php?code=zj&if=1&url=' + playUrl);||
//         json = html.match(/let ConFig = (.*?),box/)[1];
//         const jsConfig = JSON.parse(json.trim());
//         playUrl = decryptUrl(jsConfig);
//         function decryptUrl(jsConfig) {
//             const key = Crypto.enc.Utf8.parse('2890' + jsConfig.config.uid + 'tB959C');
//             const iv = Crypto.enc.Utf8.parse('2F131BE91247866E');
//             const mode = Crypto.mode.CBC;
//             const padding = Crypto.pad.Pkcs7;
//             const decrypted = Crypto.AES.decrypt(jsConfig.url, key, {
//                 'iv': iv,
//                 'mode': mode,
//                 'padding': padding
//             });
//             const decryptedUrl = Crypto.enc.Utf8.stringify(decrypted);
//             return decryptedUrl;
//         }
//     `,
//     // 首页推荐显示数量
//     limit:6,
//     double:true,//是否双层列表定位,默认false
//     // 对图片加了referer验证的有效,海阔专用,普通规则请勿填写此键值
//     图片来源:'@Referer=http://www.jianpianapp.com@User-Agent=jianpian-version350',
//     // 替换所有图片链接 欲替换文本=>替换为文本
//     图片替换:'https://www.keke6.app/=>https://vres.a357899.cn/',
    
//     // js写法，仅js模式1有效.可以用于代码动态获取全局cookie之类的
//     // 可操作变量有 rule_fetch_params,rule,以及基础的网页访问request,post等操作
//     预处理:'rule_fetch_params.headers.Cookie = "xxxx";',
//     // 类似海阔一级 列表;标题;图片;描述;链接;详情 其中最后一个参数选填
//     // 如果是双层定位的话,推荐的第2段分号代码也是第2层定位列表代码
//     推荐:'div.swiper-slide;a.jpgpic&&data-name;a.jpgpic&&href;a&&style&&\\((.*?)\\);a.jpgpic&&data-fname',
//     // 类似海阔一级 列表;标题;图片;描述;链接;详情 其中最后一个参数选填
//     一级:'div.module-item;a&&title;a&&href;img&&data-src;div.module-item-text&&Text',
//     //二级发起访问前进行js处理。解决特殊情况一级给出的链接非二级真实源码而是前端重定向链接的源码
//     二级访问前:'log(MY_URL);let jump=request(MY_URL).match(/href="(.*?)"/)[1];log(jump);MY_URL=urljoin2(MY_URL,jump)',
//     // 二级可以是*,表示规则无二级,直接拿一级的链接进行嗅探
//     // 二级 title: 片名;类型
//     // 二级 desc: 主要信息;年代;地区;演员;导演
//     // 或者 {title:'',img:'',desc:'',content:'',tabs:'',lists:'',tab_text:'body&&Text',list_text:'body&&Text',list_url:'a&&href'} 同海阔dr二级
//     二级: {
//         'content':'div.vod_content > span&&Text', 
//         'director': 'div.video-info-items:has(span:contains(导演)) > div.video-info-actor > a&&Text', 
//         'actor': 'div.video-info-items:has(span:contains(主演)) > div.video-info-actor > a&&Text', 
//         'year': 'div.video-info-items:has(span:contains(上映)) > div&&Text',
//         'type_name': 'div.tag-link > a&&Text', 
//         'remarks': 'div.video-info-items:has(span:contains(集数)) > div&&Text', 
//         'tabs': 'div.module-tab-item.tab-item > span&&Text',
//         'lists': '.module-blocklist .scroll-content',
//         'list_text': 'span:first&&Text',
//         'list_url': '&&href',
//     },
//     // 搜索可以是*,集成一级，或者跟一级一样的写法 列表;标题;图片;描述;链接;详情
//     搜索:'*',
//     // 本地代理规则，可用于修改m3u8文件文本去广告后返回代理文件地址，也可以代理加密图片
//     proxy_rule:`js:
//     log(input);
//     input = [200,'text;plain','hello drpy']
//     `,
//     //是否启用辅助嗅探: 1,0
//     sniffer:1,
//     // 辅助嗅探规则
//     isVideo:"http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp|rm|rmvb|asf|m4a|mp3|wma)",
//     // 辅助嗅探规则js写法
//     isVideo:`js:
//     log(input);
//     if(/m3u8/.test(input)){
//     input = true
//     }else{
//     input = false
//     }
//     `,
// }
var rule = {};
let ext;
let videos = [];
let playUrl = '';
async function request(reqUrl, timeout = 20000) {
    let res = await req(reqUrl, {
        method: 'get',
        headers: {
            'User-Agent': UA,
            'Referer': HOST,
            'Cookie': COOKIE
        },
        timeout: timeout,
    });
    return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) {
        await parseRule(cfg.ext);//解析规则
    }
    if (rule.initHost) {
        html = await request(HOST);
        if (html.indexOf('document.cookie = ')  > 0) {
            COOKIE = html.match(/document.cookie = "(.*?)"/)[1];
            html = await request(HOST);
        }
    }
    //await parseHost();//解析HOST主页地址
}

async function parseRule(ext) {
    let ruleText = '';
    if(typeof(ext) == 'string' && ext.startsWith('http')) {
        ruleText = await request(ext);
        eval(ruleText);        
    } else {
        rule = ext;
    }
    await parseHost();
    
    
}

async function parseHost() {
    if(rule.host) {
        HOST = rule.host;
    } 
    const initParse = rule.initJs || rule.hostJs;
     if(initParse) {       
        const split = initParse.split('||');
        for(let i = 0; i < split.length; i++) {
            if(split[i].indexOf('request(') >= 0) {
                html = await eval(split[i]);
            } else {
                eval(split[i]);
            }
        }
    }
}

async function home(filter) {
    let classes = [];
    let filterObj = {};
    if (rule.class_name) {
        let class_name = rule.class_name.split('&');
        for (let i = 0; i < class_name.length; i++) {
            let type_id = rule.class_url.split('&')[i];
            classes.push({'type_id':type_id,'type_name':class_name[i]});
        }
    } else if (rule.class_parse) {
        let homeUrl = rule.homeUrl;
        if (homeUrl) {
            if (homeUrl.startsWith('/')) {
                homeUrl = HOST + homeUrl;
            }
            html = await request(homeUrl);
            
        }
        const $ = load(html);
        const split = rule.class_parse.split(';');
        _.forEach($(split[0]), item => {
            let typeId = getCssVal($, item, split[2]);
            let typeName = getCssVal($, item, split[1]);
            classes.push({'type_id':typeId,'type_name':typeName});
        });
    }
    if (rule.filter) {
        filterObj = rule.filter;
    }
    if (rule.homeJS) {
        eval(rule.homeJS);
    }

    //let classes = [{'type_id':1,'type_name':'电影'},{'type_id':2,'type_name':'电视剧'},{'type_id':3,'type_name':'综艺'},{'type_id':4,'type_name':'动漫'},{'type_id':63,'type_name':'纪录片'}];
    //let filterObj = 

    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

/**
 * css选择器获取属性值方法
 * $: js选择器驱动
 * item: 父节点表达式
 * parse：子节点表达式&&值属性&&正则表达式
 */
function getCssVal($, item, parse) {
    if (!parse) return '';
    let xpa = parse.split('&&');
    if (!xpa || xpa.length < 2) return '';
    let el;
    if(item) {
        if (xpa[0]) {
            el = $(item).find(xpa[0]);
        } else {
            el = $(item);
        }
    } else {
        el = $(xpa[0]);
    }
    
    let v = '';
    if (xpa[1].indexOf('||') > 0) {
        const attrs = xpa[1].split('||');
        v = $(el).attr(attrs[0]) || $(el).attr(attrs[1]);
        
    } else if(xpa[1] == 'Text') {
        v = $(el).text().trim();
    } else {
        v = $(el).attr(xpa[1]);
    }
    
    if(xpa[2]) {
        const match = v.match(new RegExp(xpa[2]));
        if (match) v = match[1];
    }
    return v;
}

function getCssValArray($, item, parse) {
    if (!parse) return '';
    let xpa = parse.split('&&');
    if (!xpa || xpa.length < 2) return '';
    let val = [];
    let el;
    if(item) {
        if (xpa[0]) {
            el = $(item).find(xpa[0]);
        } else {
            el = $(item);
        }
    } else {
        el = $(xpa[0]);
    }
    _.forEach(el, item => {
        let v = '';
        if (xpa[1].indexOf('||') > 0) {
            const attrs = xpa[1].split('||');
            v = $(item).attr(attrs[0]) || $(item).attr(attrs[0]);
        } else if(xpa[1] == 'Text') {
            v = $(item).text().trim();
        } else {
            v = $(item).attr(xpa[1]);
        }
        
        if(xpa[2]) {
            const match = v.match(new RegExp(xpa[2]));
            if (match) v = match[1];
        }
        if (v) {
            val.push(v);
        }
        
    });
    return val;
}


async function homeVod() {
    const vodParse = rule.homeVod || rule.推荐;
    if (vodParse) {
        let url = HOST;
        if(rule.homeUrl && rule.homeUrl.startsWith('/')) {
            url = HOST + rule.homeUrl;
        } else if (rule.homeUrl && rule.homeUrl.startsWith('http')) {
            url = rule.homeUrl;
        }
        const $ = load(await request(url));
        let videos = getVideoByCssParse($, vodParse);
        return JSON.stringify({
            list: videos,
        });
    }
}

function getVideoByCssParse($, cssParse) {
    let videos = [];
    const split = cssParse.split(';');
    _.forEach($(split[0]), item => {
        let vod_id = getCssVal($, item, split[2]);
        if(vod_id) {
            videos.push({
                vod_id: vod_id,
                vod_name: getCssVal($, item, split[1]),
                vod_pic: getCssVal($, item, split[3]),
                vod_remarks: getCssVal($, item, split[4]),
            })
        }
    });
    return videos;
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    let page = pg;
    if (pg > 1) {
        page = pg;
    }
    if(rule.url) {
        let url = rule.url.replaceAll('fypage', page).replaceAll('fyclass', tid);
        if (!url.startsWith('http')) {
            url = HOST + url;
        }
        const regex = /\{\{(.*?)\}\}/g;
        const matches = url.match(regex);
        if(matches) {
            _.forEach(matches, match => {
                let param = match.replace(/\{\{(.*?)\}\}/, '$1').trim();
                url = url.replace(match, extend[param] || '');
            });
        }
        const res = await request(url);
        const vodParse = rule.一级 || rule.categoryVod;
        if (vodParse) {
            const $ = load(res);
            let videos = getVideoByCssParse($, vodParse);
            return JSON.stringify({
                list: videos,
                page: page,
            });
        }
    }
}

async function detail(id) {
    let url = id;
    if (rule.detailUrl) url = rule.detailUrl;
    if(url.startsWith('/')) url = HOST + url;
    url = url.replace('fyid', id); 

    const $ = load(await request(url));
    const vod = {
    }
    const parse = rule.二级 || rule.detailVod;
    if (parse) {
        if ('object' === typeof(parse)) {
            if (parse['director']) {
                vod.vod_director = getCssValArray($,'',parse['director']).join(' ');
            }
            if(parse['actor']) {
                vod.vod_actor = getCssValArray($,'',parse['actor']).join(' ');
            }
            if(parse['area']) {
                vod.vod_area = getCssVal($, '', parse['area']);
            }
            if(parse['year']) {
                vod.vod_year = getCssVal($, '', parse['year']);
            }
            if(parse['remarks']) {
                vod.vod_remarks = getCssVal($, '', parse['remarks']);
            }
            if(parse['content']) {
                vod.vod_content = getCssVal($, '', parse['content']);
            }
            if (parse['type_name']) {
                vod.type_name = getCssValArray($, '', parse['type_name']).join('/');
            }
            if (parse['playFrom'] && parse['playUrl']) {
                const playMap = {};
                const tabNames = getCssValArray($, '', parse['playFrom']);
                const split = parse['playUrl'].split(';');
                const tabs = $(split[0]);
                _.each(tabs, (tab,i) => {
                    if(rule['tab_exclude'] && rule['tab_exclude'].indexOf(tabNames[i]) > -1) {
                        return;
                    }
                    _.each($(tab).find(split[1] || 'a'), it => {
                        const title = getCssVal($, it, split[2]);
                        const playUrl = getCssVal($, it, split[3]);
                        if(!playMap.hasOwnProperty(tabNames[i])) {
                            playMap[tabNames[i]] = [];
                        }
                        playMap[tabNames[i]].push(title + '$' + playUrl);
                    });
                });
                vod.vod_play_from = _.keys(playMap).join('$$$');
                const urls = _.values(playMap);
                const vod_play_url = _.map(urls, (urlist) => {
                    return urlist.join('#');
                });
                vod.vod_play_url = vod_play_url.join('$$$');
            }
        }
    }
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    let url  = id;
    if (url.startsWith('magnet:')) {
        return JSON.stringify({
            parse: 0,
            url: url,
        }); 
    }
    if (url.startsWith('/')) {
        url = HOST + url;
    }
    playUrl = url;
    if(/\.(m3u8|mp4|mkv|flv|mp3|m4a|aac)$/.test(playUrl.split('?'))) {
        return {
            parse: 0,
            url: playUrl,
            header: {
                'User-Agent': UA,
            }
        }; 
    }
    try {
        html = await request(url);
        const json = getPlay4aJson(html);
        if (json) {
            let js = JSON.parse(json);
            playUrl = js.url;
            if (js.encrypt == 1) {
                playUrl = unescape(playUrl);
            } else if (js.encrypt == 2) {
                playUrl = unescape(base64Decode(playUrl));
            }
        }
        if(/\.(m3u8|mp4|mkv|flv|mp3|m4a|aac)$/.test(playUrl.split('?'))) {
            return JSON.stringify({
                parse: 0,
                url: playUrl,
                header: {
                    'User-Agent': UA,
                }
            }); 
        }
    } catch(error) {
        console.log(error);
    }
    if (rule.lazy) {
        try {
            await evalCustomerJs(rule.lazy);
            return {
                parse: 0,
                url: playUrl,
                header: {
                    'User-Agent': UA,
                }
            }; 
        } catch(error) {
            console.log(error);
        }
    }
    return JSON.stringify({
        parse: 1,
        url: playUrl,
    }); 
}

function getPlay4aJson(html) {
    let $ = load(html);
    return $('script:contains(player_aaaa)').text().replace('var player_aaaa=','');
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

async function search(wd, quick, pg) {
    try{
        if (!pg) pg = '';
        let url = '/search.php?searchword=' + wd;
        if(rule.searchUrl) url = rule.searchUrl;
        url = url.replace('**', wd).replace('fypage', pg);
        if(!url.startsWith('http')) url = HOST + url;
        let html = await request(url);
        let videos = [];
        if(rule.searchParse) {
            //执行自定义js
          if(rule.searchParse.startsWith('js:')){
            eval(rule.searchParse);
          } else {
            //按css选择器组装数据
            const $ = load(html);
            videos = getVideoByCssParse($, rule.searchParse)
          }
        } else {
            //默认搜索获取获取数据
        }
        return JSON.stringify({
            list: videos,
        });
        // const $ = load(html);
        // const title = $('title').text();
        // if(currentRetryTime >= maxRetryTime) {
        //     currentRetryTime = 0;
        //     return '{}';
        // }
        // if(title === '系统安全验证') {
        //     currentRetryTime = currentRetryTime + 1;
        //     if(currentRetryTime >= 1) {
        //         await sleep(5000);
        //     }
        //     await validCode(validUrl);
        //     return await search(wd, quick, pg);
        // } else {
        //     const cards = $('div.module-item-pic');
        //     let videos = _.map(cards, (n) => {
        //         let id = $($(n).find('a')[0]).attr('href');
        //         let name = $($(n).find('a')[0]).attr('title').replaceAll('立刻播放', '');
        //         let pic = $($(n).find('img')[0]).attr('data-src');
        //         return {
        //             vod_id: id,
        //             vod_name: name,
        //             vod_pic: pic,
        //             vod_remarks: '',
        //         };
        //     });
            return JSON.stringify({
                list: videos,
            });
        // }
        currentRetryTime = 0;
    } catch(error) {
        currentRetryTime = 0;
        return '{}';
    }
    
}

async function validCode(url) {
    try {
        //获取验证码的base64
        const res = await req(url, {
            buffer: 2,
            headers: {
                'User-Agent': UA,
                'Referer': HOST,
                'Cookie': COOKIE
            }
        });
        const response = await req('https://api.nn.ci/ocr/b64/text', {
          method: 'post',
          data: res.content,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
        if(response['code'] === 200) {
            let checkRes = await request(validCheckUrl + response.content);
        }
      } catch (error) {
        console.error(error);
      }
}

function randStr(len, withNum) {
    var _str = '';
    let containsNum = withNum === undefined ? true : withNum;
    for (var i = 0; i < len; i++) {
        let idx = _.random(0, containsNum ? charStr.length - 1 : charStr.length - 11);
        _str += charStr[idx];
    }
    return _str;
}

function sleep(ms) {
    //return new Promise(resolve => setTimeout(resolve, ms));
    let now = new Date();
    const exitTime = now.getTime() + ms;
    while(true) {
        now = new Date();
        if(now.getTime() > exitTime) return;
    }
}


export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search,
        validCode: validCode,
    };
}
