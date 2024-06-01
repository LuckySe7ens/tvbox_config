import { Crypto, load, _ } from './lib/cat.js';

let siteUrl = 'https://ggys.me';
let getVideoUrl = 'https://ggys.me/wp-json/get_addr/v1/get_video_url';
let siteKey = '';
let siteType = 0;
let headers = {};

async function request(reqUrl, postData, get) {

    let res = await req(reqUrl, {
        method: get ? 'get' : 'post',
        headers: headers,
        data: postData || {},
        postType: get ? '' : 'form',
    });

    let content = res.content;
    return content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
    let classes = [{
        type_id: 'movies',
        type_name: '电影',
    },{
        type_id: 'tv-shows',
        type_name: '剧集',
    }];

    let filterObj = {
        'movies': [{
            key: 'id',
            name: '类型', 
            value: [{n:'全部',v:''},{n:'欧美电影',v:'/movie-tag/欧美电影/'},{n:'日韩电影',v:'/movie-tag/日韩电影/'},{n:'华语电影',v:'/movie-tag/华语电影/'},{n:'其他地区',v:'/movie-tag/其他地区/'},{n:'冒险',v:'/movie-genre/冒险/'},{n:'剧情',v:'/movie-genre/剧情/'},{n:'动画',v:'/movie-genre/动画/'},{n:'动作',v:'/movie-genre/动作/'},{n:'历史',v:'/movie-genre/历史/'},{n:'喜剧',v:'/movie-genre/喜剧/'},{n:'奇幻',v:'/movie-genre/奇幻/'},{n:'家庭',v:'/movie-genre/家庭/'},{n:'恐怖',v:'/movie-genre/恐怖/'},{n:'悬疑',v:'/movie-genre/悬疑/'},{n:'惊悚',v:'/movie-genre/惊悚/'},{n:'战争',v:'/movie-genre/战争/'},{n:'爱情',v:'/movie-genre/爱情/'},{n:'犯罪',v:'/movie-genre/犯罪/'},{n:'科幻',v:'/movie-genre/科幻/'},{n:'纪录',v:'/movie-genre/纪录/'},{n:'音乐',v:'/movie-genre/音乐/'}]
        }],
        'tv-shows':[{
            key: 'id',
            name: '类型', 
            value: [{n:'全部',v:''},{n:'欧美剧',v:'/tv-show-tag/欧美剧/'},{n:'日韩剧',v:'/tv-show-tag/日韩剧/'},{n:'国产剧',v:'/tv-show-tag/国产剧/'},{n:'其他地区',v:'/tv-show-tag/其他地区/'},{n:'剧情',v:'/tv-show-genre/剧情/'},{n:'动画',v:'/tv-show-genre/动画/'},{n:'动作',v:'/tv-show-genre/动作/'},{n:'喜剧',v:'/tv-show-genre/喜剧/'},{n:'家庭',v:'/tv-show-genre/家庭/'},{n:'悬疑',v:'/tv-show-genre/悬疑/'},{n:'犯罪',v:'/tv-show-genre/犯罪/'},{n:'科幻',v:'/tv-show-genre/科幻/'},{n:'西部',v:'/tv-show-genre/西部/'}]
        }],
    }
    //let filterObj = genFilterObj();
    return JSON.stringify({
        class: classes,
        filters: filterObj
    });
}

async function category(tid, pg, filter, extend) {
    if (!pg) pg = 1;
    if (pg <= 0) pg = 1;
    let url = siteUrl + '/' + tid + '/';
    if (extend['id'] && extend['id'].length > 0) {
        url = siteUrl + extend['id'];
    }
    if (pg > 1) {
        url = url + 'page/' + pg;
    }
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.vodi-archive-wrapper > div > div > div.status-publish.has-post-thumbnail')
    let videos = _.map(cards, (n) => {
        let id = $($(n).find('div > a')[0]).attr('href');
        let name = $($(n).find('h3')[0]).text();
        let pic = $($(n).find('img')[0]).attr('src');
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: '',
        };
    });
    return JSON.stringify({
        list: videos,
        page: pg,
    });
}

async function detail(id) {
    try {
        const html = await request(id);
        const $ = load(html);
        //电影
        if (id.indexOf('/movie/') > 0) {
            let actors = _.map($('a.person-name-link'), (n) => {
                return $(n).text().trim();
            });
            let actor = actors.join(' ');
            let title = $('h1.entry-title').text().trim();
            let content = $('section > div > div > div > p').text();
            let playFromStr = 'Leospring';

            let sourceId = $('div.ggys-video-player').attr('data-source-id');
            //console.log('sourceId', sourceId);
            let playUrlStr = JSON.parse(await request(getVideoUrl, {'video_id': sourceId}, false))['video_url'];
            //console.log('playUrl', playUrlStr);

            const video = {
                vod_actor: actor,
                vod_play_from: playFromStr,
                vod_play_url: playUrlStr,
                vod_content: content,
            };
            const list = [video];
            const result = { list };
            return JSON.stringify(result);
        } else {//剧集
            let actors = _.map($('a.person-name-link'), (n) => {
                return $(n).text().trim();
            });
            let actor = actors.join(' ');
            let title = $('h1.entry-title').text().trim();
            let content = $('div.tv-show-single-right > div.tv-show__info--body > p').text();

            let tabs = $('div.tv_show__season-tabs-wrap > div.masvideos-tabs > ul.nav > li.nav-item > a.nav-link');
            let playFroms = [];
            let playUrls = [];
            for(let i=0;i<tabs.length;i++) {
                let tabId = $(tabs[i]).attr('href');
                playFroms.push($(tabs[i]).text().trim());
                let nameUrls = _.map($('div' +tabId+ ' > div > div > div > div > div.episode__body > a'), (n) => {
                    return $($(n).find('p')).text() + '$' + $(n).attr('href');
                });
                playUrls.push(nameUrls.join('#'));
            }
            const video = {
                vod_actor: actor,
                vod_play_from: playFroms.join('$$$'),
                vod_play_url: playUrls.join('$$$'),
                vod_content: content,
            };
            const list = [video];
            const result = { list };
            return JSON.stringify(result);
        }
        
    } catch (e) {
       //console.log('err', e);
    }
    return null;
}

async function search(wd, quick, pg) {
    let url = siteUrl + '/search/' + wd
    //div.articles > article.article.has-post-thumbnail
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.articles > article.article.has-post-thumbnail')
    let videos = _.map(cards, (n) => {
        let id = $($(n).find('div.article__attachment > div > a')[0]).attr('href');
        let name = $($(n).find('div.article__summary > header > h2 > a')[0]).text();
        let pic = $($(n).find('img')[0]).attr('src');
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: '',
        };
    });
    return JSON.stringify({
        list: videos,
    });
}

async function play(flag, id, flags) {
    let playUrl = id;
    if (id.indexOf(siteUrl) >= 0) {
        //剧集
        const html = await request(id);
        const $ = load(html);
        let sourceId = $('div.ggys-video-player').attr('data-source-id');
        //console.log('sourceId', sourceId);
        playUrl = JSON.parse(await request(getVideoUrl, {'video_id': sourceId}, false))['video_url'];
    }

    return JSON.stringify({
        parse: 0,
        url: playUrl,
    });
}

async function getVideos(url) {
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.row.posts-wrapper >div > article > div.entry-media > div > a')
    let videos = _.map(cards, (n) => {
        let id = n.attribs['href'];
        let name = $($(n).find('img')[0]).attr('alt').replaceAll('<strong>','').replaceAll('</strong>', '').split(' ')[0];
        let pic = $($(n).find('img')[0]).attr('data-src');
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: '',
        };
    });
    return videos;
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        category: category,
        detail: detail,
        play: play,
        search: search,
    };
}