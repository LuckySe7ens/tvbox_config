import { Crypto, load, _ } from './lib/cat.js';
//代理地址
//let siteUrl = 'https://gh.7761.cf/https://zz123.com';
let siteUrl = 'https://zz123.com';
let imgUrl = 'https://music.jsbaidu.com';
let siteKey = '';
let siteType = 0;
let headers = {};

async function request(reqUrl, postData, agentSp, get) {

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
    if (cfg.ext) {
        siteUrl = cfg.ext;
    }
}

async function home(filter) {
    let classes = [];
    classes.push({ type_id: 'tuijian', type_name: '推荐' });
    const html = await request(siteUrl);
    const $ = load(html);
    const cates = $('ul.aside-menu-list.channel > li')
    _.forEach(cates, (n) => {
        let id = n.attribs['data-id'];
        let name = $($(n).find('a > span')[0]).text();
        classes.push({
            type_id: id,
            type_name: name
        });
    });
    return JSON.stringify({
        class: classes
    });
}

async function cateVod(id) {
    const html = await request(siteUrl + '/list/' + id + '.htm');
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
        list: videos,
        pagecount: 1,
    });
}

async function category(tid, pg, filter, extend) {
    if (pg <= 0) pg = 1;
    if (tid == 'tuijian') {
        let url = siteUrl + '/ajax/';
        let res = await req(url, {
            method: 'post',
            data: {
                act: 'tag_music',
                type: 'tuijian',
                tid: 'qdk',
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
                vod_remarks: item['sname'],
                vod_year: item['play_time']
            })
        }
        return JSON.stringify({
            list: videos
        });
    } else {
        return await cateVod(tid);
    }
}

async function detail(id) {
    try {
        let playUrl = id;
        let video = {
            vod_id: id,
            vod_actor: 'Leospring',
            vod_play_from: 'Leospring',
            vod_play_url: '播放$' + playUrl,
            vod_director: 'Leospring',
            vod_content: '该音乐由公众号【蚂蚁科技杂谈】用爱发电制作，欢迎收听！',
        };
        if(!id.startsWith('http')) {
            let data = JSON.parse(await request(siteUrl + '/ajax/', {act:'songinfo',id:id,lang:''},'', false)).data;
            //console.log('data', data);
            //playUrl = JSON.parse(data).data.mp3;
            video = {
                vod_id: id,
                vod_name: data.mname,
                vod_actor: data.sname,
                vod_pic: data.pic,
                vod_play_from: 'Leospring',
                vod_play_url: '播放$' + data.mp3,
                vod_director: 'Leospring',
                vod_content: '该音乐由公众号【蹲街捏蚂蚁】用爱发电制作，欢迎收听！\r\n' + data.lrc,
            };
        }

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
    let url = siteUrl + '/search/?key=' + wd;
    const html = await request(url);
    const $ = load(html);
    const cards = $('div.tab-item.tab-song > div.card-list.d-none.d-md-block > div')
    let videos = _.map(cards, (n) => {
        let id = n.attribs['data-id'];
        let name = $($(n).find('div.item-info > div > div.songname.text-ellipsis.color-link-content-primary > a')[0]).text();
        let pic = $($(n).find('div.item-cover-wrap > a > img')[0]).attr('data-src').replace('/img', imgUrl);
        let remark = $($(n).find('div.item-cover-wrap > div.item-time')[0]).text();

        return {
            vod_id: id,
            vod_name: name,
            vod_pic: pic,
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
        category: category,
        detail: detail,
        play: play,
        search: search,
    };
}
