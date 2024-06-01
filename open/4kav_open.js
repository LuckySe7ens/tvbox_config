import { load, _ } from './lib/cat.js';
//发布地址：https://abc.hdys.xyz/
let key = 'hdys';
let HOST = 'https://4k-av.com';
let siteKey = '';
let siteType = 0;

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';

async function request(reqUrl, method, data) {
    const res = await req(reqUrl, {
        method: method || 'get',
        headers: {
            'User-Agent': UA,
            'Referer': HOST,
        },
        data: data,
        postType: method === 'post' ? 'form' : '',
    });
    return res.content;
}

// cfg = {skey: siteKey, ext: extend}
async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    let classes = [{'type_id':'1','type_name':'有码'},{'type_id':'2','type_name':'无码'},{'type_id':'3','type_name':'国产'},{'type_id':'4','type_name':'欧美'},{'type_id':'5','type_name':'动漫'}];
    let filterObj = {
        '1':[{'key':'class','name':'类型','init':'1','value':[{'n':'全部','v':'1'},{'n':'中文有码','v':'6'},{'n':'骑兵有码','v':'7'}]}],
        '2':[{'key':'class','name':'类型','init':'2','value':[{'n':'全部','v':'2'},{'n':'中文无码','v':'8'},{'n':'步兵无码','v':'9'},{'n':'FC2PPV','v':'13'},{'n':'无码破解','v':'16'}]}],
        '3':[{'key':'class','name':'类型','init':'3','value':[{'n':'全部','v':'3'},{'n':'国产精品','v':'10'},{'n':'传媒原创','v':'11'}]}],
        '4':[{'key':'class','name':'类型','init':'4','value':[{'n':'全部','v':'4'},{'n':'欧美中文','v':'12'}]}],
        '5':[{'key':'class','name':'类型','init':'5','value':[{'n':'全部','v':'5'},{'n':'中文动漫','v':'14'}]}],
       };

    return JSON.stringify({
        class: classes,
        filters: filterObj,
    });
}

async function homeVod() {
    const videos = await getVideos(HOST);
    return JSON.stringify({
        list: videos,
    })
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    const clazz = extend['class'];
    const link = HOST + `/vodshow/${clazz}--------${pg}---.html`;
    const videos = await getVideos(link);
    return JSON.stringify({
        page: parseInt(pg),
        list: videos,
    });
}

async function detail(id) {
    const html = await request(HOST + id);
    const $ = load(html);
    const vod = {
        vod_id: id,
        vod_name: $('li:nth-child(2) > span').text(),
        vod_content: '该影视由leospring采集分享，公众号【蚂蚁科技杂谈】，请勿传播分享，仅供技术学习使用，请在学习后24小时内删除；由此产生的任何法律风险自行承担，与本作者无关！',
        vod_play_from: 'Leospring',
        vod_play_url: $('h5 > a.btn.btn-primary')[0].attribs['href'],
    };
    
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
    const html = await request(HOST + id);
    const $ = load(html);
    const js = JSON.parse($('script:contains(player_)').html().replace('var player_aaaa=',''));
    return JSON.stringify({
        parse: 0,
        url: js.url,
    });
}

async function getVideos(link) {
    const html = await request(link);
    const $ = load(html);
    const items = $('a.stui-vodlist__thumb.picture.w-thumb.img-shadow');
    let videos = _.map(items, (it) => {
        const img = $(it).find('img:first')[0];
        const remarks = $(it).find('span.pic-tag.pic-tag-b').text().trim();
        return {
            vod_id: it.attribs['href'],
            vod_name: it.attribs.title,
            vod_pic: img.attribs['data-original'],
            vod_remarks: remarks || '',
        };
    });
    return videos;
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
    };
}