import { Crypto, load, _ } from './lib/cat.js';

let siteKey = '';
let siteType = 0;

let siteUrl = 'https://gh.7761.cf/https://www.histar.tv/';
let apiUrl = 'https://aws.ulivetv.net/v3/web/api/filter';
let detailUrl = siteUrl + 'vod/detail/';
let data = '_next/data/';
let CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';
let headers = {
    'User-Agent': CHROME,
    'Cookie': 'userIP=127.0.0.1; aws-waf-token=',
    'Referer': siteUrl,
}
let ver = '';
let cates = {
    'movie': '电影',
    'drama': '电视剧',
    'animation': '动漫',
    'variety': '综艺',
    'documentary': '纪录片',
};
let recommendVideos = [];

async function request(reqUrl, postData, agentSp, get) {

    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers || {},
        data: postData || {},
        postType: get ? '' : 'form',
    });

    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) {
        siteUrl = cfg.ext;
        detailUrl = siteUrl + 'vod/detail/';
    }
    
    ver = await getVer();
}

async function getVer() {
    const $ = load(await request(siteUrl));
    let data = JSON.parse($($('script#__NEXT_DATA__')[0]).text()).props.pageProps.cards;
    let videos = [];
    data.forEach((e) => {
        if(e.name != '电视直播') {
            e.cards.forEach((vod) => {
                videos.push({
                    vod_id: vod.id,
                    vod_name: vod.name,
                    vod_pic: vod.img,
                    vod_remarks: vod.countStr,
                });
            })
        }
    });
    recommendVideos = videos;
    for(const n of $('script')) {
        if(n.attribs['src'].indexOf('buildManifest.js') > 0) {
            return n.attribs['src'].split('/')[3];
        }
    }
}

async function home(filter) {
    let classes = [];
    let filters = {};
    for(let cate in cates) {
        let condition = [];
        let labels = [];
        let areas = [];
        let years = [];
        labels.push({n: '全部',v: '',});
        areas.push({n: '全部',v: '',});
        years.push({n: '全部',v: '',});
        

        classes.push({
            type_id: cate,
            type_name: cates[cate],
        });
        const $ = load(await request(siteUrl + cate + '/all/all/all'));
        let data = JSON.parse($($('#__NEXT_DATA__')[0]).text()).props.pageProps.filterCondition;
        data.label.forEach((c) => {
            labels.push({n: c[0],v: c[1],});
        });
        data.country.forEach((c) => {
            areas.push({n: c,v: c,});
        });
        data.time.reverse().forEach((c) => {
            if (c > 2000) {
                years.push({n: c.toString(),v: c.toString(),});
            }
        });

        condition.push({
            key: 'type',
            name: '类型',
            value: labels, 
         },{
            key: 'area',
            name: '地区',
            value: areas, 
         },{
           key: 'year',
           name: '年份',
           value: years, 
        });
        filters[cate] = condition;
    }
    return JSON.stringify({
        class: classes,
        filters: filters,
    });
}

async function homeVod() {
    return JSON.stringify({
        list: recommendVideos,
    });
}

async function category(tid, pg, filter, ext){
    if (pg <= 0) pg = 1;
    let param = {pageSize: 16, page:parseInt(pg), chName:cates[tid],};
    if(ext['year']) {
        param['startTime'] = parseInt(ext['year']);
        param['endTime'] = parseInt(ext['year']);
    }
    if(ext['type']) param['label'] = ext['type'];
    if(ext['area']) param['area'] = ext['area'];
    let res = await req(apiUrl,{
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        data: param,
        postType: '',
    });
    // console.log('res ', res.content);
    let data = JSON.parse(res.content).data.list;
    let videos = [];
    data.forEach((vod) => {
        videos.push({
            vod_id: vod.id,
            vod_name: vod.name,
            vod_pic: vod.img,
            vod_remarks: vod.countStr,
        });
    });
    return JSON.stringify({
        list: videos
    });
}

async function detail(id) {
    const $ = load(await request(detailUrl + id));
    let dd = JSON.parse($($('#__NEXT_DATA__')[0]).text()).props.pageProps.pageData;
    let vod = {
        vod_id: id,
        vod_year: dd.time,
        vod_name: dd.name,
        vod_area: dd.country,
        vod_actor: dd.actor,
        vod_remarks: dd.countStr,
        vod_content: dd.desc,
        vod_director: dd.director,
        type_name: dd.label,
        vod_play_from: '蚂蚁科技杂谈',
    }
    if(dd.videos.length > 0) {
        let playUrls = [];
        dd.videos.forEach(e => {
            playUrls.push(e.eporder + '$' + e.purl);
        });
        vod.vod_play_url = playUrls.join('#');
    } else {
        let data = JSON.parse($($('#__NEXT_DATA__')[0]).text()).props.pageProps.videosGroup;
        let playUrls = [];
        let playFroms = [];
        data.forEach(e => {
            playFroms.push(e.name);
            let groupUrls = [];
            e.videos.forEach(item => {
                groupUrls.push(item.epInfo + '$' + item.purl);
            });
            playUrls.push(groupUrls.join('#'));
        });
        vod.vod_play_from = playFroms.join('$$$');
        vod.vod_play_url = playUrls.join('$$$');
    } 
    return JSON.stringify({
        list: [vod],
    })
}

async function search(wd, quick, pg) {
    let url = siteUrl + data + ver + '/search.json?word=' + encodeURIComponent(wd);
    let cards = JSON.parse(await request(url)).pageProps.initList;
    let videos = [];
    cards.forEach(e => {
        videos.push({
            vod_id: e.id,
            vod_name: e.name,
            vod_pic: e.picurl,
            vod_remarks: e.countStr,
        });
    });
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
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