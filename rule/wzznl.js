rule = {
  host: 'https://wzznl.buzz',
  class_name: '电影&电视&综艺&动漫',
  class_url: '1&2&3&4',
  homeVod: '.myui-vodlist__box;a&&title;a&&href;a&&style||data-original&&\\((.*?)\\);span.text-right&&Text',
  url: '/list/?fyclass-fypage.html',
  categoryVod: '.myui-vodlist__box;a&&title;a&&href;a&&style||data-original&&\\((.*?)\\);span.text-right&&Text',
  detailVod: {
    content: '#jq div div.tab-content.myui-panel_bd&&Text',
    playFrom: '.bottom-line:has(h3:contains(播放地址)) > ul > li > a&&Text',
    playUrl: '.tab-pane .myui-content__list;li a;&&Text;&&href',
  },
  lazy: 'let match = html.match(/var now="(.*?)";/);if(match) playUrl = match[1];',
  searchUrl: '/search.php?page=fypage&searchword=**&searchtype=',
  searchParse: 'a.myui-vodlist__thumb;&&title;&&href;&&data-original;span.text-right&&Text'
}
