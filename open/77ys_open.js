import { Crypto, load, _ } from './lib/cat.js';

//发布地址 77ys.pro
let key = '77ys';
let HOST = 'https://www.777ys1.com';
let device = {};
let timeOffset = 0;
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    //'Referer': siteUrl + '/'
};

async function request(reqUrl, postData, post) {
    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: headers,
        data: postData || {},
        postType: post ? 'form' : '',
    });

    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
    if (cfg.ext) {
        siteUrl = cfg.ext;
    }
}

async function home() {
    let classes = [{
        type_id: 'dianying',
        type_name: '电影',
    },{
        type_id: 'dianshiju',
        type_name: '电视剧',
    },{
        type_id: 'zongyi',
        type_name: '综艺',
    },{
        type_id: 'dongman',
        type_name: '动漫',
    },{
        type_id: 'shaoer',
        type_name: '少儿',
    }];
    let filterObj = genFilterObj();
    return JSON.stringify({
        class: classes,
        filters: filterObj
    });
}

async function homeVod() {
    const $ = load(await request(HOST));
    const cards = $('div.module-items.module-poster-items-base > a');
    const videos = _.map(cards, item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $(item).attr('title'),
            vod_pic: $(item).find('img').attr('data-original'),
            vod_remarks: $(item).find('div.module-item-note').text()
        }
    });
    return JSON.stringify({
        list: videos
    });
}

async function category(tid, pg, filter, ext) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let url = `${HOST}/show/${tid}`;
    if(ext['class']) url = url + '/class/' + ext['class'];
    if(ext['area']) url = url + '/area/' + ext['area'];
    if(ext['year']) url = url + '/year/' + ext['year'];
    if(pg > 1) url = url + `/page/${pg}/`;
    const $ = load(await request(url));
    const cards = $('div.module-items.module-poster-items-base > a');
    const videos = _.map(cards, item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $(item).attr('title'),
            vod_pic: $(item).find('img').attr('data-original'),
            vod_remarks: $(item).find('div.module-item-note').text()
        }
    });
    return JSON.stringify({
        list: videos,
        page: pg,
    });
}

async function detail(id) {
    const url = HOST + id;
    const $ = load(await request(url));

    const vodYear = $('div.module-info-tag > div.module-info-tag-link:nth-child(1) > a').text();
    const vodArea = $('div.module-info-tag > div.module-info-tag-link:nth-child(2) > a').text();
    const typeName = _.map($('div.module-info-tag > div.module-info-tag-link:nth-child(3) > a'), item => {
        return $(item).text();
    }).join('/');
    const vodContent = $('div.module-info-item.module-info-introduction > div > p').text();
    const vodDirector = $('div.module-info-items > div.module-info-item:nth-child(2) > div.module-info-item-content > a').text();
    const vodActor = _.map($('div.module-info-items > div.module-info-item:nth-child(3) > div.module-info-item-content > a'), item => {return $(item).text()}).join('/');
    //const vodYear = $('div.module-info-items > div.module-info-item:nth-child(4) > div.module-info-item-content').text();
    const vodRemarks = $('div.module-info-items > div.module-info-item:nth-child(5) > div.module-info-item-content').text();

    const vodPlayFrom = _.map($('#y-playList > div.module-tab-item.tab-item'), item => {return $(item).attr('data-dropdown-value');}).join('$$$');
    const vodPlayUrl = _.map($('div.module-play-list'), item => {
        return _.map($(item).find('a.module-play-list-link'), item2 => {
            return $(item2).text() + '$' + $(item2).attr('href');
        }).join('#');
    }).join('$$$');
    const video = {
        vod_play_from: vodPlayFrom,
        vod_play_url: vodPlayUrl,
        vod_content: vodContent,
        vod_director: vodDirector,
        vod_actor: vodActor,
        vod_year: vodYear,
        vod_area: vodArea,
        vod_remarks: vodRemarks,
        type_name: typeName,
    };
    const list = [video];
    const result = { list };
    return JSON.stringify(result);
}

async function search(wd, quick, pg) {
    const url = `${HOST}/search/wd/${wd}/`;
    const $ = load(await request(url));
    const videos = _.map($('a.module-card-item-poster'), item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $($(item).find('img')).attr('alt'),
            vod_pic: $($(item).find('img')).attr('data-original'),
            vod_remarks: $($(item).find('div.module-item-note')).text(),
        }
    });
    //console.log('search', videos);
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    const playUrl = HOST + id;
    return JSON.stringify({
        parse: 1,
        url: playUrl,
    });
}



function genFilterObj() {
    return {
        'dianying': [{'key': 'class', 'name': '类型', 'value': [{'n': '全部类型', 'v': ''}, {'n': '动作', 'v': '动作'}, {'n': '喜剧', 'v': '喜剧'}, {'n': '爱情', 'v': '爱情'}, {'n': '奇幻', 'v': '奇幻'}, {'n': '古装', 'v': '古装'}, {'n': '剧情', 'v': '剧情'}, {'n': '谍战', 'v': '谍战'},{'n': '伦理', 'v': '伦理'},{'n': '悬疑', 'v': '悬疑'}, {'n': '犯罪', 'v': '犯罪'}, {'n': '历史', 'v': '历史'}, {'n': '家庭', 'v': '家庭'},{'n': '青春', 'v': '青春'},{'n': '冒险', 'v': '冒险'},{'n': '其他', 'v': '其他'}]}, 
            {'key': 'area', 'name': '地区', 'value': [{'n': '全部地区', 'v': ''}, {'n': '中国大陆', 'v': '中国大陆'}, {'n': '中国香港', 'v': '中国香港'}, {'n': '中国台湾', 'v': '中国台湾'}, {'n': '欧美', 'v': '欧美'}, {'n': '韩国', 'v': '韩国'},{'n': '日本', 'v': '日本'}, {'n': '泰国', 'v': '泰国'}, {'n': '印度', 'v': '印度'},{'n': '马来西亚', 'v': '马来西亚'},{'n':'其他','v':'其他'}]}, 
            {'key': 'year', 'name': '年份', 'value': [{'n': '全部年份', 'v': ''}, {'n': '2024', 'v': '2024'}, {'n': '2023', 'v': '2023'}, {'n': '2022', 'v': '2022'}, {'n': '2021', 'v': '2021'}, {'n': '2020', 'v': '2020'}, {'n': '2019', 'v': '2019'}, {'n': '2018', 'v': '2018'}, {'n': '2017', 'v': '2017'}, {'n': '2016', 'v': '2016'}, {'n': '2015', 'v': '2015'}, {'n': '2014', 'v': '2014'}, {'n': '2013', 'v': '2013'}, {'n': '2012', 'v': '2012'}, {'n': '2011', 'v': '2011'}, {'n': '2010', 'v': '2010'}, {'n': '2009', 'v': '2009'}, {'n': '2008', 'v': '2008'}, {'n': '2006', 'v': '2006'}, {'n': '2005', 'v': '2005'}, {'n': '2004', 'v': '2004'}, {'n': '2003', 'v': '2003'}, {'n': '2002', 'v': '2002'}, {'n': '2001', 'v': '2001'}, {'n': '2000', 'v': '2000'}, {'n': '90年代', 'v': '90年代'}, {'n': '80年代', 'v': '80年代'}, {'n': '70年代', 'v': '70年代'}]}
        ], 
        'dianshiju': [{'key': 'class', 'name': '类型', 'value': [{'n': '全部类型', 'v': ''}, {'n': '爱情', 'v': '爱情'}, {'n': '古装', 'v': '古装'},{'n': '悬疑', 'v': '悬疑'}, {'n': '都市', 'v': '都市'}, {'n': '喜剧', 'v': '喜剧'}, {'n': '战争', 'v': '战争'}, {'n': '剧情', 'v': '剧情'}, {'n': '青春', 'v': '青春'}, {'n': '历史', 'v': '历史'}, {'n': '网剧', 'v': '网剧'}, {'n': '奇幻', 'v': '奇幻'}, {'n': '冒险', 'v': '冒险'}, {'n': '励志', 'v': '励志'}, {'n': '犯罪', 'v': '犯罪'}, {'n': '商战', 'v': '商战'}, {'n': '恐怖', 'v': '恐怖'}, {'n': '穿越', 'v': '穿越'}, {'n': '农村', 'v': '农村'}, {'n': '人物', 'v': '人物'}, {'n': '商业', 'v': '商业'}, {'n': '生活', 'v': '生活'}, {'n': '其他', 'v': '其他'}]}, 
            {'key': 'area', 'name': '地区', 'value': [{'n': '全部地区', 'v': ''}, {'n': '中国大陆', 'v': '中国大陆'}, {'n': '中国台湾', 'v': '中国台湾'}, {'n': '中国香港', 'v': '中国香港'}, {'n': '韩国', 'v': '韩国'}, {'n': '日本', 'v': '日本'}, {'n': '欧美', 'v': '欧美'}, {'n': '泰国', 'v': '泰国'},{'n': '新加坡', 'v': '新加坡'}, {'n': '其他', 'v': '其他'}]},
            {'key': 'year', 'name': '年份', 'value': [{'n': '全部年份', 'v': ''}, {'n': '2024', 'v': '2024'}, {'n': '2023', 'v': '2023'}, {'n': '2022', 'v': '2022'}, {'n': '2021', 'v': '2021'}, {'n': '2020', 'v': '2020'}, {'n': '2019', 'v': '2019'}, {'n': '2018', 'v': '2018'}, {'n': '2017', 'v': '2017'}, {'n': '2016', 'v': '2016'}, {'n': '2015', 'v': '2015'}, {'n': '2014', 'v': '2014'}, {'n': '2013', 'v': '2013'}, {'n': '2012', 'v': '2012'}, {'n': '2011', 'v': '2011'}, {'n': '2010', 'v': '2010'}, {'n': '2009', 'v': '2009'}, {'n': '2008', 'v': '2008'}, {'n': '2006', 'v': '2006'}, {'n': '2005', 'v': '2005'}, {'n': '2004', 'v': '2004'}, {'n': '2003', 'v': '2003'}, {'n': '2002', 'v': '2002'}, {'n': '2001', 'v': '2001'}, {'n': '2000', 'v': '2000'}, {'n': '90年代', 'v': '90年代'}, {'n': '80年代', 'v': '80年代'}, {'n': '70年代', 'v': '70年代'}]}
        ]
    };
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