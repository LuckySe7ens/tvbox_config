/*
import req from '../../util/req.js';
import { load } from 'cheerio';
import pkg from 'lodash';
const { _ } = pkg;
import JSDOM from 'jsdom';
import { URL } from 'url';
*/
import req from '../../util/req.js';

import CryptoJS from 'crypto-js';
import { load } from 'cheerio';

import pkg from 'lodash';
const { _ } = pkg;

const siteUrl = 'https://saohuo.us';
let url = 'https://saohuo.tv';

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
    cookie = {};
/*
    async function request(reqUrl, referer, data, method = 'get', postType = '') {
      let headers = {
          'User-Agent': UA,
          'Referer': referer ? encodeURIComponent(referer) : siteUrl,
          'Cookie': _.map(cookie, (value, key) => `${key}=${value}`).join(';')
      };
  */
  
  async function request(reqUrl, referer, data, method = 'get', postType = '') {
  let headers = {
      'User-Agent': UA,
      Referer: referer ? encodeURIComponent(referer) : siteUrl,
      Cookie: Object.keys(cookie)
      .map((key) => {
          return `${key}=${cookie[key]}`;
      })
      .join(';'), 
  };

  let response = await req(reqUrl, {
    method: method,
    headers: headers,
    data: data,
    postType: postType
});

  
      if (response.headers["set-cookie"]) {
          for (const c of (_.isArray(response.headers["set-cookie"]) ? response.headers["set-cookie"].join(";") : response.headers["set-cookie"]).split(";")) {
              let tmp = c.trim();
              if (tmp.startsWith("result=")) {
                  cookie.result = tmp.substring(7);
                  return request(reqUrl, reqUrl, data, 'post', { result: cookie.result });
              }
              if (tmp.startsWith("esc_search_captcha=1")) {
                  cookie.esc_search_captcha = 1;
                  delete cookie.result;
                  return request(reqUrl);
              }
          }
      }
      return response.data;
  }

async function init(inReq, _outResp) {
    // siteKey = cfg.skey, siteType = cfg.stype
    return {};
}

async function home(filter) {
  let classes = [{"type_id":"1","type_name":"电影"},{"type_id":"2","type_name":"电视剧"}];

  let filterObj = {
    1: [{"key": "type_id", "name": "类型", "value": [{"n": "全部", "v": "1"}, {"n": "喜剧", "v": "6"}, {"n": "爱情", "v": "7"}, {"n": "恐怖", "v": "8"}, {"n": "动作", "v": "9"}, {"n": "科幻", "v": "10"}, {"n": "战争", "v": "11"}, {"n": "犯罪", "v": "12"}, {"n": "动画", "v": "13"}, {"n": "奇幻", "v": "14"}, {"n": "剧情", "v": "15"}, {"n": "剧情", "v": "16"}, {"n": "悬疑", "v": "17"}, {"n": "惊悚", "v": "18"}, {"n": "其他", "v": "19"}]}],
    2: [{"key": "type_id", "name": "类型", "value": [{"n": "全部", "v": "2"}, {"n": "大陆", "v": "20"}, {"n": "TVB", "v": "21"}, {"n": "韩剧", "v": "22"}, {"n": "美剧", "v": "23"}, {"n": "日剧", "v": "24"}, {"n": "英剧", "v": "25"}, {"n": "台剧", "v": "26"}, {"n": "其他", "v": "27"}]}]
  };
  return {
    class: classes,
        filters: filterObj,
  };
}

async function category(inReq, _outResp) {
    let tid = inReq.body.id;
    let pg = inReq.body.page;
	if(pg <= 0) pg = 1;
    const url = `${siteUrl}/list/${tid}-${pg}.html`;
    const html = await request(url);
    const $ = load(html);
    const items = $('.v_list li');
    let videos = [];
    for (let item of items) {
      const vodId = $($(item).find('a')).attr('href');
      const vodName = $($(item).find('a')).attr('title');
      
      const vodPic = $($(item).find('a img')).attr('data-original');
     
      const vodRemarks = $($(item).find('[class=v_note]')).text();
      
    videos.push({ 
        vod_id: vodId, 
        vod_name: vodName, 
        vod_pic: vodPic, 
        vod_remarks: vodRemarks 
      });
    }
    var hasMore = $('.page a:contains(下一页)').length > 0;
    var pgCount = hasMore ? parseInt(pg) + 1 : parseInt(pg);
    return ({
        page: parseInt(pg),
        pagecount: pgCount,
        limit: 24,
        total: 24 * pgCount,
        list: videos,
    });
}


async function detail(inReq, _outResp) {
  const ids = !Array.isArray(inReq.body.id) ? [inReq.body.id] : inReq.body.id;
 // console.log(ids);
  const videos = [];
  for (const id of ids) {
  const html = await request(siteUrl + id);
 // console.log(html);
  const $ = load(html);
  let vod = {
    vod_id: id,
    vod_name: $(' h1.v_title').text().trim(),
    vod_actor: $(('.grid_box:first p')).text().trim(),
    vod_content: $('p').text().trim(),
};
/*
    const playlist = _.map($(' ul.large_list li > a'), (a) => {
      return a.children[0].data + '$' + a.attribs.href.replace(/.*?\/play\/(.*).html/g, '$1');
  });
  vod.vod_play_from ='1号线路'; 
  vod.vod_play_url = playlist.join('#');
  console.log(vod.vod_play_url);
  videos.push(vod);
}
*/
  const playlist = $(' ul.large_list li > a')
  .map((_, a) => {
      return a.children[0].data + '$' + a.attribs.href.replace(/.*?\/play\/(.*).html/g, '$1');
  })
  .get();
   vod.vod_play_from ='1号线路'; 
  vod.vod_play_url = playlist.join('#');
  console.log(vod.vod_play_url);
  videos.push(vod);
}

return ({
  list: videos
})
}

async function play(inReq, _outResp) {
  const id = inReq.body.id;
  const response = await request(`${siteUrl}/play/${id}.html`);
  const $ = load(response);
    
    // const iframe = $('body iframe[src*=Cloud]');
  // const iframe = $('.videoplay iframe');

  const rand =  response.match(/<iframe src="(.*?)"/);
  if (!_.isEmpty(rand)) {
    return JSON.stringify({
      parse: 0,
      url: rand[1],
    });
  }

  /*
    if (iframe.length > 0) {
        const rUrl = iframe[0].attribs.src; }
  const iframeSrcMatch = /<iframe src="(.*?)"/.exec(response);
  const iframeSrc = iframeSrcMatch ? iframeSrcMatch[1] : '';
  console.log(iframeSrc);
  if (!iframeSrc) {
    console.error('iframe源地址未找到');
    return [];
  }*/

  /*
  const iframeResponse = await request(iframeSrc, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      'referer': iframeSrc
    }
  });

  const url = extractValue(iframeResponse.data, 'url = "(.*?)"');
  const t = extractValue(iframeResponse.data, 'var t = "(.*?)"');
  const key = extractValue(iframeResponse.data, 'var key = "(.*?)"');
  const act = extractValue(iframeResponse.data, 'var act = "(.*?)"');
  const play = extractValue(iframeResponse.data, 'var play = "(.*?)"');
  const domain = new URL(iframeSrc).hostname;

  const postData = { url, t, key, act, play };
  const postResponse = await request('url', postData, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'referer': domain
    }
  });

  let finalUrl = postResponse.data.url;
  if (!finalUrl.startsWith('http')) {
    finalUrl =  'url'; 
  }

  const videos = [finalUrl]; 
  return videos;*/
}

function extractValue(data, pattern) {
  const regex = new RegExp(pattern);
  const match = regex.exec(data);
  return match ? match[1] : '';
}

async function search(inReq, _outResp) {
  let pg = inReq.body.page;
    const wd = inReq.body.wd;
    let page = pg || 1;
    if (page == 0) page = 1;
  let searchURL = `${siteUrl}/search.php?searchword=${encodeURIComponent(wd)}`;
  let htmlContent = await request(searchURL);
  let html = htmlContent.then(response => response.data);
  if (html.includes("请输入正确的验证码继续访问")) {
    for (let i = 0; i < 2; i++) {
      let formData = new FormData();
      formData.append('url', `${siteUrl}/include/vdimgck.php`);
      formData.append('comp', 'alpha');

      let captchaResponse = await request('https://ocr.qlql.app', formData);
      let captchaResult = captchaResponse.data;

      if (captchaResult.code === 1) {
        let cookies = `PHPSESSID=${captchaResult.cookies.PHPSESSID}`;
        let params = new URLSearchParams({
          validate: captchaResult.result,
          searchword: str
        });

        htmlContent = await request(`${siteUrl}/search.php?scheckAC=check&page=&searchtype=&order=&tid=&area=&year=&letter=&yuyan=&state=&money=&ver=&jq`, {
          headers: { Cookie: cookies },
          params: params
        }).then(response => response.data);

        if (!html.includes("请输入正确的验证码继续访问")) {
          break;
        }
      }
    }
  }

  // const dom = new JSDOM(htmlContent);
 // const $ = jquery(dom.window);
  let items = $('.v_list li');
  let results = [];

  items.each((index, element) => {
    let vodId = $(element).find('div a').attr('href');
    let vodName = $(element).find('div a').attr('title');
    let vodPic = $(element).find('div a img').attr('data-original');
    let vodRemarks = $(element).find('.v_note').text();

    results.push({ vod_id: vodId, vod_name: vodName, vod_pic: vodPic, vod_remarks: vodRemarks });
  });

  return ({ list: results });
}



async function test(inReq, outResp) {
  try {
      const printErr = function (json) {
          if (json.statusCode && json.statusCode == 500) {
              console.error(json);
          }
      };
      const prefix = inReq.server.prefix;
      const dataResult = {};
      let resp = await inReq.server.inject().post(`${prefix}/init`);
      dataResult.init = resp.json();
      printErr(resp.json());
      resp = await inReq.server.inject().post(`${prefix}/home`);
      dataResult.home = resp.json();
      printErr(resp.json());
      if (dataResult.home.class.length > 0) {
          resp = await inReq.server.inject().post(`${prefix}/category`).payload({
              id: dataResult.home.class[0].type_id,
              page: 1,
              filter: true,
              filters: {},
          });
          dataResult.category = resp.json();
          printErr(resp.json());
          if (dataResult.category.list.length > 0) {
              resp = await inReq.server.inject().post(`${prefix}/detail`).payload({
                  id: dataResult.category.list[0].vod_id, // dataResult.category.list.map((v) => v.vod_id),
              });
              dataResult.detail = resp.json();
              printErr(resp.json());
              if (dataResult.detail.list && dataResult.detail.list.length > 0) {
                  dataResult.play = [];
                  for (const vod of dataResult.detail.list) {
                      const flags = vod.vod_play_from.split('$$$');
                      const ids = vod.vod_play_url.split('$$$');
                      for (let j = 0; j < flags.length; j++) {
                          const flag = flags[j];
                          const urls = ids[j].split('#');
                          for (let i = 0; i < urls.length && i < 2; i++) {
                              resp = await inReq.server
                                  .inject()
                                  .post(`${prefix}/play`)
                                  .payload({
                                      flag: flag,
                                      id: urls[i].split('$')[1],
                                  });
                              dataResult.play.push(resp.json());
                          }
                      }
                  }
              }
          }
      }
      resp = await inReq.server.inject().post(`${prefix}/search`).payload({
          wd: '爱',
          page: 1,
      });
      dataResult.search = resp.json();
      printErr(resp.json());
      return dataResult;
  } catch (err) {
      console.error(err);
      outResp.code(500);
      return { err: err.message, tip: 'check debug console output' };
  }
}

export default {
  meta: {
      key: 'saohuo',
      name: '骚火影视',
      type: 3,
  },
  api: async (fastify) => {
      fastify.post('/init', init);
      fastify.post('/home', home);
      fastify.post('/category', category);
      fastify.post('/detail', detail);
      fastify.post('/play', play);
      fastify.post('/search', search);
      fastify.get('/test', test);
  },
};