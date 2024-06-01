import { Crypto, load, _ } from './lib/cat.js';

//发布页 4kvm.site
//let siteUrl ='https://www.4kvm.org';
let siteUrl ='https://www.4kvm.net';
let siteKey = '';
let siteType = 0;
let headers = {
    'User-Agent': 'MMozilla/5.0 (Linux; Android 9; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.90 Mobile Safari/537.36; xvdizhi',
};

async function request(reqUrl, postData, post) {

    let res = await req(reqUrl, {
        method: post ? 'post' : 'get',
        headers: headers,
        data: postData || {},
        //postType: post ? 'form' : '',
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

async function home(filter) {
    let classes = [{
        type_id: 'movies',
        type_name: '电影',
    },{
        type_id: 'tvshows',
        type_name: '电视',
    }];
    let filters = {
        'tvshows': [{
            'key': 'type', 
            'name': '类型', 
            'value': [{'n': '美剧', 'v': 'classify/meiju'},{'n': '国产剧', 'v': 'classify/guochan'},{'n': '韩剧', 'v': 'classify/hanju'},{'n': '番剧', 'v': 'classify/fanju'}]
         }]
    }
    return JSON.stringify({
        class: classes,
        filters: filters,
    });
}

async function homeVod() {
}

async function category(tid, pg, filter, ext) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;

    let type = ext['type'] || tid;
    let url = `${siteUrl}/${type}/page/${pg}`;
    const videos = await getVideos(url);
    return JSON.stringify({
        list: videos,
        page: pg,
        limit: 30,
    });
}

async function detail(id) {
    try {
        const $ = load(await request(id));
        const content = $('div.wp-content').text();
        const actor = _.map($('div[itemprop="actor"] > div.data > div.name > a'), item => $(item).text()).join(' ');
        let vod = {
            vod_actor: actor,
            vod_content: content,
            vod_play_from: 'Leospring',
        };
        if (id.indexOf('movies') > 0) {
            const movieId = $('#player-option-1').attr('data-post');
            console.log('movieId', movieId);
            const url = `${siteUrl}/artplayer?mvsource=0&id=${movieId}&type=hls`;
            console.log('url', url);
            const html = await request(url);
            const playUrl = html.split('Artplayer(')[1].split("url:'")[1].split("',")[0];
            vod.type_name = '电影';
            vod.vod_play_url = '播放$' + playUrl;
        } else {
            const url = $('div.se-q > a').attr('href');
            //console.log('url', url);
            const playUrls = await getTvPlayList(url);
            vod.type_name = '电视';
            vod.vod_play_url = playUrls;
            
        }
        return JSON.stringify({
            list: [vod],
        });
    } catch (e) {
    console.log('err', e);
    }
    return null;
}

async function getTvPlayList(url) {
    const html = await request(url);
    //console.log('html', html);
    
    const vid = html.split('seasonsid:')[1].split(',')[0];
    //console.log('vid', vid);
    const urls = JSON.parse(html.split('videourls:[')[1].split('],')[0]);
    const playUrls = _.map(urls, item => {
        return item.name + '$' + vid + '__' + item.url;
    }).join('#');
    return playUrls;
}

async function search(wd, quick, pg) {
    let url = siteUrl + '/xssearch?s=' + wd;
    const $ = load(await request(url));
    const videos = _.map($('div.thumbnail > a'), item => {
        return {
            vod_id: $(item).attr('href'),
            vod_name: $(item).find('img').attr('alt'),
            vod_pic: $(item).find('img').attr('src'),
            vod_remarks: $(item).find('span').text().trim(),
        }
    })
    return JSON.stringify({
        list: videos,
        page: pg,
        limit: 20,
    });
}

async function play(flag, id, flags) {
    let playUrl = id;
    if (id.indexOf(':') > 0) {
        const vid = id.split('__')[0];
        const num = id.split('__')[1];
        const url = `https://www.4kvm.org/artplayer?id=${vid}&source=0&ep=${num}`;
        const html = await request(url);
        playUrl = html.split('Artplayer(')[1].split("url:'")[1].split("',")[0];
    } 
    return JSON.stringify({
        parse: 0,
        url: playUrl,
    });
}

async function getVideos(url) {
    let $ = load(await request(url));
    return _.map($('div.poster'), item => {
        return {
            vod_id: $($(item).find('a')).attr('href'),
            vod_name: $($(item).find('img')).attr('alt'),
            vod_pic: $($(item).find('img')).attr('src'),
            vod_remarks: $($(item).find('div.update')).text(),
        }
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