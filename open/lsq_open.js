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
var rule = {};
let ext = {};
let classes = [];
let videos = [];
let videoDetail = {};
let filterObj = {};
let pagecount = 999;
let page = 1;
let classId = '';
let flagParse = {};
let playFlag;
let playUrl = '';
let searchUrl = '';
let input = '';
let timeout = 10000;
let headers = {
    'User-Agent': PC_UA,
    'Referer': HOST,
    'Cookie': COOKIE
};

async function request(reqUrl, data, header, method) {
    let res = await req(reqUrl, {
        method: method || 'get',
        data: data || '',
        headers: header || headers,
        postType: method === 'post' ? 'form-data' : '',
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
            //console.log('cookie', COOKIE);
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
    //console.log('rule', rule);
    await parseHost();
    
    
}

async function parseHost() {
    //console.log('rule', rule);
    //rule.hostJs = 'const host = "http://baidu.com";request(host)||console.log("html", html)'
    //console.log('host', rule.host);
    if(rule.host) {
        HOST = rule.host;
    }
    if(rule.headers) {
        Object.assign(headers, rule.headers);
    } 
    if(rule.timeout) timeout = rule.timeout;
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
    //console.log('HOST', HOST);
}

async function home(filter) {
    classes = [];
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
        await evalCustomerJs(rule.homeJS);
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
    //console.log('xpa[1]', xpa[1]);
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
    videos = [];
    const vodParse = rule.homeVod || rule.推荐;
    const vodParseJS = rule.homeVodJS || rule.推荐JS;
    if (vodParse) {
        let url = HOST;
        if(rule.homeUrl && rule.homeUrl.startsWith('/')) {
            url = HOST + rule.homeUrl;
        } else if (rule.homeUrl && rule.homeUrl.startsWith('http')) {
            url = rule.homeUrl;
        }
        const $ = load(await request(url));
        videos = getVideoByCssParse($, vodParse);
        return JSON.stringify({
            list: videos,
        });
    } else if(vodParseJS) {
        await evalCustomerJs(vodParseJS);
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
            let pic = getCssVal($, item, split[3]);
            if(pic.startsWith('/')) pic = HOST + pic;
            videos.push({
                vod_id: vod_id,
                vod_name: getCssVal($, item, split[1]),
                vod_pic: pic,
                vod_remarks: getCssVal($, item, split[4]),
            })
        }
    });
    return videos;
}

async function category(tid, pg, filter, extend) {
    videos = [];
    if (pg <= 0) pg = 1;
    classId = tid;
    ext = extend;
    page = pg;
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

        //console.log('cate url', url);
        html = await request(url);
        //console.log('cate res', res);
        const vodParse = rule.一级 || rule.categoryVod;
        if (vodParse) {
            const $ = load(html);
            videos = getVideoByCssParse($, vodParse);
            return JSON.stringify({
                list: videos,
                filters: filterObj,
                page: page,
                pagecount: pagecount,
            });
        }
    }
    const vodParseJS = rule.一级JS || rule.categoryVodJS;
    if(vodParseJS) {
        await evalCustomerJs(vodParseJS);
        return JSON.stringify({
            list: videos,
            filters: filterObj,
            page: page,
            pagecount: pagecount,
        });
    }
    return '{}';
}

async function detail(id) {
    videos = [];
    input = id;
    let url = id;
    if (rule.detailUrl) url = rule.detailUrl;
    if(url.startsWith('/')) url = HOST + url;
    url = url.replace('fyid', id); 
    
    const vod = {
    }
    const parse = rule.二级 || rule.detailVod;
    const jsCode = rule.二级JS || rule.detailVodJS;
    if (parse) {
        html = await request(url);
        const $ = load(html);
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
                //console.log('playFrom', tabNames);
                const split = parse['playUrl'].split(';');
                const tabs = $(split[0]);
                _.each(tabs, (tab,i) => {
                    //console.log('tab_exclude', parse['tab_exclude'].indexOf(tabNames[i]));
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
        return JSON.stringify({
            list: [vod],
        });
    } else if(jsCode) {
        videoDetail = {};
        await evalCustomerJs(jsCode);
    }
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    let url  = id;
    playFlag = flag;
    input = id;
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
    if (rule.lazy) {
        try {
            await evalCustomerJs(rule.lazy);
            return JSON.stringify({
                parse: 0,
                url: playUrl,
                header: headers
            });
        } catch(error) {
            console.log(error);
        }
    }
    if(/\.(m3u8|mp4|mkv|flv|mp3|m4a|aac)$/.test(playUrl.split('?'))) {
        return JSON.stringify({
            parse: 0,
            url: playUrl,
            header: headers
        });
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
                header: headers
            }); 
        }
    } catch(error) {
        console.log(error);
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
 //aes加密
 function aesEncode(str, keyStr, ivStr, type) {
    const key = Crypto.enc.Utf8.parse(keyStr);
    let encData = Crypto.AES.encrypt(str, key, {
        iv: Crypto.enc.Utf8.parse(ivStr),
        mode: Crypto.mode.CBC,
        padding: Crypto.pad.Pkcs7
    });
    if (type === 'hex') return encData.ciphertext.toString(Crypto.enc.Hex);
    return encData.toString(Crypto.enc.Utf8);
 }
//aes解密
 function aesDecode(str, keyStr, ivStr, type) {
    const key = Crypto.enc.Utf8.parse(keyStr);
    if (type === 'hex') {
        str = Crypto.enc.Hex.parse(str);
        return Crypto.AES.decrypt({
            ciphertext: str
        }, key, {
            iv: Crypto.enc.Utf8.parse(ivStr),
            mode: Crypto.mode.CBC,
            padding: Crypto.pad.Pkcs7
        }).toString(Crypto.enc.Utf8);
    } else {
        return Crypto.AES.decrypt(str, key, {
            iv: Crypto.enc.Utf8.parse(ivStr),
            mode: Crypto.mode.CBC,
            padding: Crypto.pad.Pkcs7
        }).toString(Crypto.enc.Utf8);
    }
 }
function md5(text) {
    return Crypto.MD5(text).toString();
}

function sha1(text) {
    return Crypto.SHA1(text).toString();
}

async function search(wd, quick, pg) {
    try{
        videos = [];
        input = wd;
        if (!pg) pg = '';
        let url = '/search.php?searchword=' + wd;
        if(rule.searchUrl) url = rule.searchUrl;
        url = url.replace('**', wd).replace('fypage', page); 
        if(!url.startsWith('http')) url = HOST + url;
        searchUrl = url;
        if(rule.searchVodJS) {
            //执行自定义js
            await evalCustomerJs(rule.searchVodJS);
        } else if (rule.searchVod) {
            let html = await request(url);
            //按css选择器组装数据
            const $ = load(html);
            videos = getVideoByCssParse($, rule.searchVod)
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
            // return JSON.stringify({
            //     list: videos,
            // });
        // }
        currentRetryTime = 0;
    } catch(error) {
        console.log(error);
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

async function evalCustomerJs(jsCode) {
    const split = jsCode.split('|||');
    for(let i = 0; i < split.length; i++) {
        if(split[i].indexOf('request(') >= 0) {
            html = await eval(split[i]);
        } else {
            eval(split[i]);
        }
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
