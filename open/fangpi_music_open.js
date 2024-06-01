import { Crypto, load, _ } from './lib/cat.js';
//代理地址
let siteUrl = 'https://www.fangpi.net/';
let imgUrl = 'https://music.jsbaidu.com';
let siteKey = '';
let siteType = 0;
let headers = {};

async function request(reqUrl, postData, agentSp, post) {

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

async function home(filter) {
    const html = await request(siteUrl);
    const $ = load(html);
    const cates = $('ul.aside-menu-list.channel > li')
    let classes = _.map(cates, (n) => {
        let id = n.attribs['data-id'];
        let name = $($(n).find('a > span')[0]).text();
        return {
            type_id: id,
            type_name: name
        };
    });
    return JSON.stringify({
        class: classes
    });
}

async function homeVod() {
    const html = await request(siteUrl);
    const $ = load(html);
    const cards = $('div.page-main-wrap > div > div > div.card-list.d-none.d-md-block > div');
    let videos = _.map(cards, (n) => {
        let id = n.attribs['data-id'];
        let name = $($(n).find('div.item-info > div > div.songname.text-ellipsis.color-link-content-primary > a')[0]).text();
        let pic = $($(n).find('div.item-cover-wrap > a > img')[0]).attr('data-src').replace('/img', imgUrl);
        let remark = $($(n).find('div.item-cover-wrap > div.item-time')[0]).text();
        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remark
        };
    });
    return JSON.stringify({
        list: videos
    });
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    let url = siteUrl + '/ajax/';
    let res = await req(url, {
        method: 'post',
        data: {
            act: 'tag_music',
            type: 'tuijian',
            tid: tid,
            page: pg,
            lang: ''
        },
        postType: 'form'
    });
    //console.log('catedata:', res);
    let data = JSON.parse(res.content).data;
    let videos = [];
    for(let i=0;i<data.length;i++){
        const item = data[i];
        videos.push({
            vod_id: item['mp3'],
            vod_name: item['mname'],
            vod_pic: item['pic'].replace('/img', imgUrl),
            vod_remarks: item['play_time']
        })
    }
    return JSON.stringify({
        list: videos
    });
}

async function detail(id) {
    try {
        let playUrl = siteUrl + `api/play_url?id=${id}&json=1`;
        let url = JSON.parse(await request(playUrl)).data.url
        const video = {
            vod_id: id,
            vod_actor: 'Leospring',
            vod_play_from: 'Leospring',
            vod_play_url: '播放$' + url,
            vod_director: 'Leospring',
            vod_content: '该音乐由公众号【蚂蚁科技杂谈】用爱发电制作，欢迎收听！',
        };
        const list = [video];
        const result = { list };
        return JSON.stringify(result);
    } catch (e) {}
    return null;
}

async function play(flag, id, flags) {
    return JSON.stringify({
        parse: 0,
        url: id,
    });
}

async function search(wd, quick, pg) {
    let url = siteUrl + 's/' + wd;
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.card-text > div.row').slice(1)
    let videos = _.map(cards, (n) => {
        let id = $($(n).find('a')[0]).attr('href').split('/')[2];
        let name = $($(n).find('a')[0]).text().trim();
        //let pic = $($(n).find('div.item-cover-wrap > a > img')[0]).attr('data-src').replace('/img', imgUrl);
        let remark = $($(n).find('div.col-4')[0]).text().trim();

        return {
            vod_id: id,
            vod_name: name,
            //vod_pic: pic,
            vod_remarks: remark,
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

