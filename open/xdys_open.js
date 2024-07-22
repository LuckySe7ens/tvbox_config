import { Crypto, load, _ } from './lib/cat.js';

// 兄弟影视发布页 https://xdys.vip/
let key = 'xdys';
let HOST = 'https://www.brovod.com';
const parseUrl = 'https://play.brovod.com/?url=';
const parseUrl2 = 'https://pl.qcheng.cc/hktvpc.php?url=';
let parseMap = {};
let siteKey = '';
let siteType = 0;

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

async function request(reqUrl) {
    let res = await req(reqUrl, {
        method: 'get',
        headers: {
            'User-Agent': UA,
            'Referer': HOST
        },
    });
    return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    //await initParseMap();
    //console.log(parseMap);
}

/**
 * 构造筛选数据
 */
async function genFilterInfo(url) {
    const $ = load(await request(url));
    const list = _.map($('div.module-item-box > a'), item => {
        return {'n': $(item).text(), 'v': $(item).text().replace('全部', '')}
    });
    console.log('list', JSON.stringify(list));
}

async function initParseMap() {
    const date = new Date();
    const t = '' + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
    const js = await request(HOST + '/static/js/playerconfig.js?t=' + t);
    try {
        const playerList = JSON.parse(js.split('MacPlayerConfig.player_list=')[1].split(',MacPlayerConfig.downer_list')[0]);
        const players = _.values(playerList);
        _.each(players, (item) => {
            if (!item.ps || item.ps == '0') return;
            if (_.isEmpty(item.parse)) return;
            parseMap[item.show] = item.parse;
        });
    } catch(e) {
        console.log('error', e);
    }
}

async function home(filter) {
    const classes = [{'type_id':'1','type_name':'电影'},{'type_id':'2','type_name':'电视剧'},{'type_id':'3','type_name':'综艺'},{'type_id':'4','type_name':'动漫'},{'type_id':'5','type_name':'纪录片'},{'type_id':'6','type_name':'短剧'}];
    const filterObj = {
        '1':[{'key':'cateId','name':'类型','init':'','value':[{'n':"全部","v":""},{'n':"喜剧","v":"喜剧"},{'n':"爱情","v":"爱情"},{'n':"恐怖","v":"恐怖"},{'n':"动作","v":"动作"},{'n':"科幻","v":"科幻"},{'n':"灾难","v":"灾难"},{'n':"剧情","v":"剧情"},{'n':"战争","v":"战争"},{'n':"警匪","v":"警匪"},{'n':"犯罪","v":"犯罪"},{'n':"动画","v":"动画"},{'n':"奇幻","v":"奇幻"},{'n':"武侠","v":"武侠"},{'n':"冒险","v":"冒险"},{'n':"枪战","v":"枪战"},{'n':"恐怖","v":"恐怖"},{'n':"悬疑","v":"悬疑"},{'n':"惊悚","v":"惊悚"}]},{'key':'area','name':'地区','init':'','value':[{'n':"全部","v":""},{'n':"大陆","v":"大陆"},{'n':"香港","v":"香港"},{'n':"美国","v":"美国"},{'n':"法国","v":"法国"},{'n':"英国","v":"英国"},{'n':"日本","v":"日本"},{'n':"韩国","v":"韩国"},{'n':"德国","v":"德国"},{'n':"泰国","v":"泰国"},{'n':"印度","v":"印度"},{'n':"意大利","v":"意大利"},{'n':"西班牙","v":"西班牙"},{'n':"加拿大","v":"加拿大"},{'n':"其他","v":"其他"}]},{'key':'lan','name':'语言','init':'','value':[{'n':"全部","v":""},{'n':"国语","v":"国语"},{'n':"英语","v":"英语"},{'n':"粤语","v":"粤语"},{'n':"韩语","v":"韩语"},{'n':"日语","v":"日语"},{'n':"法语","v":"法语"},{'n':"德语","v":"德语"},{'n':"其它","v":"其它"}]},{'key':'year','name':'年代','init':'','value':[{'n':'全部','v':''},{'n':'2024','v':'2024'},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':"时间排序","v":"time"},{'n':"人气排序","v":"hits"},{'n':"评分排序","v":"score"}]}],
        '2':[{'key':'cateId','name':'类型','init':'','value':[{'n':"全部","v":""},{'n':"古装","v":"古装"},{'n':"战争","v":"战争"},{'n':"青春偶像","v":"青春偶像"},{'n':"喜剧","v":"喜剧"},{'n':"家庭","v":"家庭"},{'n':"犯罪","v":"犯罪"},{'n':"动作","v":"动作"},{'n':"奇幻","v":"奇幻"},{'n':"剧情","v":"剧情"},{'n':"历史","v":"历史"},{'n':"经典","v":"经典"},{'n':"乡村","v":"乡村"},{'n':"情景","v":"情景"},{'n':"商战","v":"商战"},{'n':"网剧","v":"网剧"},{'n':"其他","v":"其他"}]},{'key':'area','name':'地区','init':'','value':[{'n':"全部","v":""},{'n':"大陆","v":"大陆"},{'n':"美国","v":"美国"},{'n':"韩国","v":"韩国"},{'n':"香港","v":"香港"},{'n':"台湾","v":"台湾"},{'n':"日本","v":"日本"},{'n':"泰国","v":"泰国"},{'n':"英国","v":"英国"},{'n':"新加坡","v":"新加坡"},{'n':"其他","v":"其他"},{'n':"全部","v":""}]},{'key':'lan','name':'语言','init':'','value':[{'n':"国语","v":"国语"},{'n':"英语","v":"英语"},{'n':"粤语","v":"粤语"},{'n':"韩语","v":"韩语"},{'n':"日语","v":"日语"},{'n':"其它","v":"其它"},{'n':"全部","v":""}]},{'key':'year','name':'年代','init':'','value':[{'n':'全部','v':''},{'n':'2024','v':'2024'},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':"时间排序","v":"time"},{'n':"人气排序","v":"hits"},{'n':"评分排序","v":"score"}]}],
        '3':[{'key':'cateId','name':'类型','init':'','value':[{'n':"全部","v":""},{'n':"选秀","v":"选秀"},{'n':"情感","v":"情感"},{'n':"访谈","v":"访谈"},{'n':"播报","v":"播报"},{'n':"旅游","v":"旅游"},{'n':"音乐","v":"音乐"},{'n':"美食","v":"美食"},{'n':"纪实","v":"纪实"},{'n':"曲艺","v":"曲艺"},{'n':"生活","v":"生活"},{'n':"游戏互动","v":"游戏互动"},{'n':"财经","v":"财经"},{'n':"求职","v":"求职"},{'n':"全部","v":""}]},{'key':'area','name':'地区','init':'','value':[{'n':"大陆","v":"大陆"},{'n':"港台","v":"港台"},{'n':"日韩","v":"日韩"},{'n':"欧美","v":"欧美"}]},{'key':'lan','name':'语言','init':'','value':[{'n':"全部","v":""},{'n':"国语","v":"国语"},{'n':"英语","v":"英语"},{'n':"粤语","v":"粤语"},{'n':"韩语","v":"韩语"},{'n':"日语","v":"日语"},{'n':"其它","v":"其它"}]},{'key':'year','name':'年代','init':'','value':[{'n':'全部','v':''},{'n':'2024','v':'2024'},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':"时间排序","v":"time"},{'n':"人气排序","v":"hits"},{'n':"评分排序","v":"score"}]}],
        '4':[{'key':'cateId','name':'类型','init':'','value':[{'n':"全部","v":""},{'n':"情感","v":"情感"},{'n':"科幻","v":"科幻"},{'n':"热血","v":"热血"},{'n':"推理","v":"推理"},{'n':"搞笑","v":"搞笑"},{'n':"冒险","v":"冒险"},{'n':"萝莉","v":"萝莉"},{'n':"校园","v":"校园"},{'n':"动作","v":"动作"},{'n':"机战","v":"机战"},{'n':"运动","v":"运动"},{'n':"战争","v":"战争"},{'n':"少年","v":"少年"},{'n':"少女","v":"少女"},{'n':"社会","v":"社会"},{'n':"原创","v":"原创"},{'n':"亲子","v":"亲子"},{'n':"益智","v":"益智"},{'n':"励志","v":"励志"},{'n':"其他","v":"其他"}]},{'key':'area','name':'地区','init':'','value':[{'n':"全部","v":""},{'n':"大陆","v":"大陆"},{'n':"日本","v":"日本"},{'n':"欧美","v":"欧美"},{'n':"其他","v":"其他"}]},{'key':'lan','name':'语言','init':'','value':[{'n':"全部","v":""},{'n':"国语","v":"国语"},{'n':"英语","v":"英语"},{'n':"粤语","v":"粤语"},{'n':"韩语","v":"韩语"},{'n':"日语","v":"日语"},{'n':"其它","v":"其它"}]},{'key':'year','name':'年代','init':'','value':[{'n':'全部','v':''},{'n':'2024','v':'2024'},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':"时间排序","v":"time"},{'n':"人气排序","v":"hits"},{'n':"评分排序","v":"score"}]}],
        '5':[{'key':'cateId','name':'类型','init':'','value':[{'n':"全部","v":""},{'n':"BBC","v":"BBC"},{'n':"Discovery","v":"Discovery"},{'n':"历史","v":"历史"},{'n':"人物","v":"人物"},{'n':"美食","v":"美食"},{'n':"节日","v":"节日"}]},{'key':'area','name':'地区','init':'','value':[{'n':"全部","v":""},{'n':"大陆","v":"大陆"},{'n':"海外","v":"海外"}]},{'key':'lan','name':'语言','init':'','value':[{'n':"全部","v":""},{'n':"国语","v":"国语"},{'n':"英语","v":"英语"},{'n':"粤语","v":"粤语"},{'n':"韩语","v":"韩语"},{'n':"日语","v":"日语"},{'n':"法语","v":"法语"},{'n':"德语","v":"德语"},{'n':"其它","v":"其它"}]},{'key':'year','name':'年代','init':'','value':[{'n':'全部','v':''},{'n':'2024','v':'2024'},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':"时间排序","v":"time"},{'n':"人气排序","v":"hits"},{'n':"评分排序","v":"score"}]}],
        '6':[{'key':'cateId','name':'类型','init':'','value':[{'n':"全部","v":""},{'n':"爽文","v":"爽文"},{'n':"重生","v":"重生"},{'n':"甜宠","v":"甜宠"},{'n':"逆袭","v":"逆袭"},{'n':"虐恋","v":"虐恋"},{'n':"穿越","v":"穿越"}]},{'key':'area','name':'地区','init':'','value':[{'n':"全部","v":""},{'n':"大陆","v":"大陆"},{'n':"香港","v":"香港"},{'n':"美国","v":"美国"},{'n':"法国","v":"法国"},{'n':"英国","v":"英国"},{'n':"日本","v":"日本"},{'n':"韩国","v":"韩国"},{'n':"德国","v":"德国"},{'n':"泰国","v":"泰国"},{'n':"印度","v":"印度"},{'n':"意大利","v":"意大利"},{'n':"西班牙","v":"西班牙"},{'n':"加拿大","v":"加拿大"},{'n':"其他","v":"其他"}]},{'key':'lan','name':'语言','init':'','value':[{'n':"全部","v":""},{'n':"国语","v":"国语"}]},{'key':'year','name':'年代','init':'','value':[{'n':'全部','v':''},{'n':'2024','v':'2024'},{'n':'2023','v':'2023'},{'n':'2022','v':'2022'},{'n':'2021','v':'2021'},{'n':'2020','v':'2020'},{'n':'2019','v':'2019'},{'n':'2018','v':'2018'},{'n':'2017','v':'2017'},{'n':'2016','v':'2016'},{'n':'2015','v':'2015'},{'n':'2014','v':'2014'},{'n':'2013','v':'2013'},{'n':'2012','v':'2012'},{'n':'2011','v':'2011'},{'n':'2010','v':'2010'}]},{'key':'by','name':'排序','value':[{'n':"时间排序","v":"time"},{'n':"人气排序","v":"hits"},{'n':"评分排序","v":"score"}]}], 
    };
    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    const link = HOST + '/show/' + (extend.cateId || tid) + '-' + (extend.area || '') + '-' + (extend.by || '') + '-' + (extend.cateId || '') + '-' + (extend.lan || '') + '----' + pg + '---' + (extend.year || '') + '/';
    const html = await request(link);
    const $ = load(html);
    const items = $('a.module-item');
    const videos = _.map(items, (item) => {
        const $item = $(item);
        const a = $item;
        const img = $item.find('img:first');
        const remarks = $item.find('div.module-item-note').text().trim();
        return {
            vod_id: a.attr('href').replace(/.*?\/detail\/(.*).html/g, '$1'),
            vod_name: a.attr('title'),
            vod_pic: img.attr('data-original'),
            vod_remarks: remarks,
        };
    });
    const limit = 72;
    const hasMore = $('div#page > a:contains(下一页)').length > 0;
    const pgCount = hasMore ? parseInt(pg) + 1 : parseInt(pg);
    return JSON.stringify({
        page: parseInt(pg),
        pagecount: pgCount,
        limit: limit,
        total: limit * pgCount,
        list: videos,
    });
}

async function detail(id) {
    const html = await request(HOST + id);
    const $ = load(html);
    const vod = {
        vod_id: id,
        vod_name: $('h1:first').text().trim(),
        vod_type: $('.module-info-tag a:eq(2)').text().trim(),
        vod_year: $('.module-info-tag a:eq(0)').text().trim(),
        vod_area: $('.module-info-tag a:eq(1)').text().trim(),
        vod_actor: $('.module-info-item:contains(主演：)').text().trim().substring(3).replace(/\/$/, ''),
        vod_director: $('.module-info-item:contains(导演：)').text().trim().substring(3).replace(/\/$/, ''),
        vod_pic: $('.module-info-poster img:first').attr('data-original'),
        vod_remarks : $('.module-info-item:contains(备注：)').text(),
        vod_content: $('.module-info-introduction-content').text().trim(),
    };
    const playMap = {};
    const tabs = $('.module-tab .module-tab-item span');
    const playlists = $('.module-play-list');
    _.each(tabs, (tab, i) => {
        const $tab = $(tab);
        const from = $tab.text().trim();
        let list = playlists[i];
        list = $(list).find('a');
        _.each(list, (it) => {
            const $it = $(it);
            let title = $it.find('span').text();
            const playUrl = $it.attr('href');
            if (_.isEmpty(title)) title = $it.text();
            if (!playMap.hasOwnProperty(from)) {
                playMap[from] = [];
            }
            playMap[from].push(title + '$' + playUrl);
        });
    });
    vod.vod_play_from = _.keys(playMap).join('$$$');
    const urls = _.values(playMap);
    const vod_play_url = _.map(urls, (urlist) => {
        return urlist.join('#');
    });
    vod.vod_play_url = vod_play_url.join('$$$');
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    const link = HOST + id;
    const html = await request(link);
    const $ = load(html);
    const js = JSON.parse($('script:contains(player_)').html().replace('var player_aaaa=',''));
    let playUrl = js.url;
    if (js.encrypt == 1) {
        playUrl = unescape(playUrl);
    } else if (js.encrypt == 2) {
        playUrl = unescape(base64Decode(playUrl));
    }
    
    //const parseUrl = parseMap[from];
    if (parseUrl) {
        if (js.from == 'mytv') {
            const reqUrl = parseUrl2 + playUrl;
            const parseHtml = await request(reqUrl);
            const matches = parseHtml.match(/innerHTML = '<video src="([\w\W]*)" controls=/);
            if (!_.isEmpty(matches)) {
                playUrl = matches[1].trim();
            }
        } else {
            const reqUrl = parseUrl + playUrl;
            let html = await request(reqUrl);
            //console.log(html);
            //"dmkey": "a97b811c47cb503f5ab45aa6c8a9628d",
            let dmkey = html.split('dmkey":"')[1].split('",')[0];
            //console.log('json', dmkey);

            let key = sha256(parseInt(new Date().getTime()/1000/3600)*3600 + 'brovod');
            const res = await req('https://jx.xdys.vip/v1/jx', {
                data: {
                    dmkey: dmkey,
                    url: playUrl,
                    pbgjz: 'A',
                    key: key
                }, 
                method: 'post', 
                headers: {
                    'Content-Type': 'text/plain'
                },
            });
            //console.log('res', res);
            if (res) {
                playUrl = JSON.parse(res.content).jarod;
            }
            // const parseHtml = await request(reqUrl);
            // const matches = parseHtml.match(/let ConFig = {([\w\W]*)},box/);
            // if (!_.isEmpty(matches)) {
            //     const configJson = '{' + matches[1].trim() + '}';
            //     const config = JSON.parse(configJson);
            //     playUrl = decryptUrl(config);
            // }
        }
        
    }
    return JSON.stringify({
        parse: 0,
        url: playUrl,
        header: {
            'User-Agent': UA,
        }
    });
}

function decryptUrl(jsConfig) {
    const key = Crypto.enc.Utf8.parse('2890' + jsConfig.config.uid + 'tB959C');
    const iv = Crypto.enc.Utf8.parse('2F131BE91247866E');
    const mode = Crypto.mode.CBC;
    const padding = Crypto.pad.Pkcs7;
    const decrypted = Crypto.AES.decrypt(jsConfig.url, key, {
        iv: iv,
        mode: mode,
        padding: padding
    });
    const decryptedUrl = Crypto.enc.Utf8.stringify(decrypted);
    return decryptedUrl;
}

function sha256(str) {
    return Crypto.SHA256(str).toString(Crypto.enc.Hex);
}

async function search(wd, quick) {
    const data = JSON.parse(await request(HOST + '/index.php/ajax/suggest?mid=1&limit=50&wd=' + wd)).list;
    const videos = _.map(data, (vod) => {
        return {
            vod_id: '/detail/'+vod.id,
            vod_name: vod.name,
            vod_pic: vod.pic,
            vod_remarks: '',
        };
    });
    return JSON.stringify({
        list: videos,
    });
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
    };
}
