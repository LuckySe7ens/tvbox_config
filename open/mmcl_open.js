import { Crypto,_} from './lib/cat.js';

let siteUrl = 'http://ys.changmengyun.com';
let baseUrl = 'https://ut.yishengguangmei.xyz/data/config/base-1.js';
let cateUrl = 'https://ut.yishengguangmei.xyz/data/site_cili/cili/categories.js';
let dataUrl = 'https://ut.yishengguangmei.xyz/data/site_cili/cili/list-srxl-1-1.js';
let imgHost = 'https://jnew.tlxxw.cc';
let detailUrl = 'https://ut.yishengguangmei.xyz/data/site_cili/cili/detail-410803.js';
let siteKey = '';
let siteType = 0;

const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';

async function request(reqUrl){
	let res = await req(reqUrl, {
		method: 'get',
    });
	return res.content;
}

async function init(cfg) {
    siteKey = cfg.skey;
    siteType = cfg.stype;
}

async function home(filter) {
   
    return JSON.stringify({
        'class': [{'type_id':'gcyc','type_name':'国产原创'},{'type_id':'dgym','type_name':'岛国有码'},{'type_id':'dgwm','type_name':'岛国无码'},{'type_id':'xfmr','type_name':'西方美人'},{'type_id':'dmzq','type_name':'动漫精品'},{'type_id':'sjll','type_name':'三级伦理'},{'type_id':'gqzw','type_name':'高清中文'},{'type_id':'srxl','type_name':'素人系列'}],
    });
}

async function homeVod() {
    return '{}';
}

async function category(tid, pg, filter, extend) {
	if(pg <= 0) pg = 1;
	let url = 'https://ut.yishengguangmei.xyz/data/site_cili/cili/list-'+tid+'-1-'+pg+'.js';
	let res = await decryptUrl(url);
	const js2Base = await js2Proxy(true, siteType, siteKey, 'img/', {});
	let videos = _.map(res['list']['data'], item => {
		return {
			vod_id: item.id,
			vod_name: item.title,
			vod_pic: js2Base + base64Encode(imgHost + item.thumb + '.txt'),
			vod_remarks: item.down_url[0].size,
		};
	});
    return JSON.stringify({
        page: res['current_page'],
        limit: res['per_page'],
        list: videos,
		total: res['total'],
    });
}

async function detail(id) {
	let url = 'https://ut.yishengguangmei.xyz/data/site_cili/cili/detail-'+id+'.js';
	let res = await decryptUrl(url);

	res = res['info'];
    let vod = {
		vod_id: res.id,
        vod_name: res.title,
		vod_actor: res.actors,
        vod_type_name: res.tags,
        vod_remarks: res.down_url[0].size,
        vod_content: 'Leospring免费分享',
		vod_play_from: 'Leospring',
		vod_play_url: '播放$' + res.down_url[0].down_url,
    };
    return JSON.stringify({
        list: [vod],
    });
}

async function play(flag, id, flags) {
	let url = id.split('&amp')[0];
    return JSON.stringify({
            parse: 0,
            url: url,
	});
}

async function proxy(segments, headers) {
    let what = segments[0];
    let url = base64Decode(segments[1]);
    if (what == 'img') {
        var resp = await req(url, {
            buffer: 0,
            headers: {
                Referer: 'https://api.douban.com/',
                'User-Agent': MOBILE_UA,
            },
        });
        return JSON.stringify({
            code: resp.code,
            buffer: 2,
            content: resp.content.replace(/^data:image\/\w+;base64,/,''),
            headers: resp.headers,
        });
    }
    return JSON.stringify({
        code: 500,
        content: '',
    });
}

function base64Encode(text) {
    return Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(text));
}

function base64Decode(text) {
    return Crypto.enc.Utf8.stringify(Crypto.enc.Base64.parse(text));
}

async function decryptUrl(url) {
	let res = JSON.parse(await request(url));
	let suffix = res['suffix'];
	let data = res['data'];
	
    const key = Crypto.enc.Utf8.parse('IdTJq0HklpuI6mu8iB%OO@!vd^4K&uXW');
    const iv = Crypto.enc.Utf8.parse('$0v@krH7V2' + suffix);
    const mode = Crypto.mode.CBC;
    const padding = Crypto.pad.Pkcs7;
    const decrypted = Crypto.AES.decrypt(data, key, {
        'iv': iv,
        'mode': mode,
        'padding': padding
    });
    const decryptData = Crypto.enc.Utf8.stringify(decrypted);
    return JSON.parse(decryptData);
}


export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        category: category,
        detail: detail,
        play: play,
		proxy: proxy,
    };
}