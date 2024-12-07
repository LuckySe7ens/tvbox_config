rule = {
    name: '独播库',
    host: 'https://tv.gboku.com',
    class_name: '电视剧&电影&综艺&动漫&港剧',
    class_url: '2&1&3&4&20',
    url: '/vodtype/fyclass-fypage.html',
    proxyHeader: {'Referer':'https://tv.gboku.com/'},
    categoryVod: '.myui-vodlist__box > a;&&title;&&href;&&data-original;span.text-right&&Text',
    detailVodJS: `
      request('https://duboku.xoxoys.eu.org/vod?ids=' + input.split('/')[2].split('.')[0]);|||
      videos = JSON.parse(html).list;
    `,
    lazy: `
      request('https://duboku.xoxoys.eu.org/vod?play=' + input);|||
      playUrl = JSON.parse(html).url;
    `,
    searchUrl: '/vodsearch/-------------.html?wd=**&submit=',
    searchVod: '#searchList > li > div > a;&&title;&&href;&&data-original;span.text-right&&Text'
  }
