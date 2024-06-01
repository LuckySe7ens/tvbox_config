import { Crypto, load, _ } from './lib/cat.js';
/**
 * author: leospring
 * 公众号：蚂蚁科技杂谈
 */
let key = '23yun';
let siteUrl = 'http://tv.ersanyun.cn'; // 地址
let siteKey = '';
let siteType = 0;

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';
let headers = {
    'User-Agent': MOBILE_UA,
    'Referer': siteUrl + 'text/index.html',
};
async function request(reqUrl) {
    const res = await req(reqUrl, {
        method: 'get',
        headers: headers,
    });
    return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if(cfg.ext) {
        siteUrl = cfg.ext;
    }
}

async function home(filter) {
    let classes = [{
        type_id: '1',
        type_name: '电影',
    },{
        type_id: '2',
        type_name: '电视剧',
    },{
        type_id: '3',
        type_name: '综艺',
    },{
        type_id: '4',
        type_name: '动漫',
    },{
        type_id: '5',
        type_name: '短剧',
    },{
        type_id: '6',
        type_name: '体育赛事',
    }];
    const filterObj = {
        '1':[{'key':'cate_id','name':'类型','value':[{'n':'全部','v':'0'},{'n':'电影','v':'39'},{'n':'动作片','v':'9'},{'n':'喜剧片','v':'10'},{'n':'爱情片','v':'11'},{'n':'恐怖片','v':'12'},{'n':'剧情片','v':'13'},{'n':'科幻片','v':'14'},{'n':'惊悚片','v':'15'},{'n':'奇幻片','v':'16'},{'n':'动画片','v':'17'},{'n':'悬疑片','v':'18'},{'n':'冒险片','v':'19'},{'n':'纪录片','v':'20'},{'n':'战争片','v':'21'},{'n':'犯罪片','v':'43'},{'n':'灾难片','v':'55'}]}],
        '2':[{'key':'cate_id','name':'类型','value':[{'n':'全部','v':'0'},{'n':'电视剧','v':'40'},{'n':'国产剧','v':'22'},{'n':'香港剧','v':'23'},{'n':'台湾剧','v':'24'},{'n':'欧美剧','v':'25'},{'n':'日本剧','v':'26'},{'n':'韩国剧','v':'27'},{'n':'泰国剧','v':'28'},{'n':'海外剧','v':'29'}]}],
        '3':[{'key':'cate_id','name':'类型','value':[{'n':'全部','v':'0'},{'n':'综艺','v':'41'},{'n':'大陆综艺','v':'30'},{'n':'港台综艺','v':'31'},{'n':'日韩综艺','v':'32'},{'n':'欧美综艺','v':'33'},{'n':'海外综艺','v':'34'},{'n':'演唱会','v':'47'}]}],
        '4':[{'key':'cate_id','name':'类型','value':[{'n':'全部','v':'0'},{'n':'动漫','v':'42'},{'n':'国产动漫','v':'35'},{'n':'日韩动漫','v':'36'},{'n':'欧美动漫','v':'37'},{'n':'海外动漫','v':'38'},{'n':'港台动漫','v':'46'}]}],
        '48':[{'key':'cate_id','name':'类型','value':[{'n':'全部','v':'0'},{'n':'短剧','v':'54'}]}],
        '44':[{'key':'cate_id','name':'类型','value':[{'n':'全部','v':'0'},{'n':'影视解说','v':'45'}]}],
        '49':[{'key':'cate_id','name':'类型','value':[{'n':'全部','v':'0'},{'n':'体育赛事','v':'50'},{'n':'篮球赛事','v':'51'},{'n':'足球赛事','v':'52'},{'n':'斯诺克','v':'53'}]}]
    };
    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {
    const html = await request(siteUrl);
    const $ = load(html);
    const items = $('.myui-vodlist .myui-vodlist__box');
    let videos = _.map(items, (item) => {
        return {
            vod_id: $($(item).find('a:first')[0]).attr('href'),
            vod_name: $($(item).find('.myui-vodlist__detail .title a')[0]).text().trim(),
            vod_pic: siteUrl + $(item).find('.myui-vodlist__thumb').attr('data-original'),
            vod_remarks: '',
        };
    });
    return JSON.stringify({
        list: videos,
    });
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0 || typeof (pg) == 'undefined') pg = 1;
    let cateId = '0';
    if(extend['cate_id']) cateId = extend['cate_id'];
    const url = siteUrl + `/vod/index.html?cate_id=${cateId}&type_id=${tid}&page=${pg}`;
    console.log('url', url);
    const html = await request(url);
    const $ = load(html);
    const items = $('ul.myui-vodlist >li');
    let videos = _.map(items, (item) => {
        return {
            vod_id: $($(item).find('.myui-vodlist__box >a')[0]).attr('href'),
            vod_name: $($(item).find('.myui-vodlist__detail .title >a')[0]).text().trim(),
            vod_pic: siteUrl + $(item).find('.myui-vodlist__box >a .myui-vodlist__thumb').attr('data-original'),
            vod_remarks: '',
        };
    });
    return JSON.stringify({
        page: parseInt(pg),
        list: videos,
        pagecount: 999,
    });
}

async function detail(id) {
    const url = siteUrl + id;
    const html = await request(url);
    const $ = load(html);
    const name = $('.myui-content__detail .title').text().trim();
    const actor = $('p.data:has(span.text-muted:contains(主演))').text().replaceAll('主演：','').replaceAll('\n       ','').trim();
    const director = $('p.data:has(span.text-muted:contains(导演))').text().replaceAll('导演：','').replaceAll('\n       ','').trim();
    const content = $('p.data:has(span.text-muted:contains(简介)) > span.jianjie').text().trim();
    const playFroms = _.map($('ul.nav > li'), n => {
        return $(n).text().trim();
    }).join('$$$');

    const playUrls = _.map($('ul.myui-content__list'), n => {
        return _.map($(n).find('a'), m => {
            return $(m).text().trim() + '$' + $(m).attr('href');
        }).join('#');
    }).join('$$$');

    const vod = {
        vod_id: id,
        vod_name: name,
        vod_actor: actor,
        vod_director: director,
        vod_content: content,
        vod_play_from: playFroms,
        vod_play_url: playUrls,
    };
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    try {
        const url = siteUrl + id;
        const html = await request(url);
        const playUrl = html.split('var temCurVodFile = "')[1].split('";')[0];
        return JSON.stringify({
            parse: 0,
            url: playUrl,
        });
    } catch (error) {
        console.log(error);
    }
    return JSON.stringify({
        parse: 1,
        url: url,
    });
}

async function search(wd, quick) {
    const url = siteUrl + '/search/index.html?keyword=' + wd;
    const html = await request(url);
    const $ = load(html);
    const cards = $('ul.myui-vodlist__media >li.clearfix');
    let videos = _.map(cards, item => {
        return {
            vod_id: $($(item).find('.thumb >a')[0]).attr('href'),
            vod_name: $($(item).find('.detail .title >a')[0]).text().trim(),
            vod_pic: siteUrl + $(item).find('.thumb >a .myui-vodlist__thumb').attr('data-original'),
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