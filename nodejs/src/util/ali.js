import dayjs from 'dayjs';
import CryptoJS from 'crypto-js';
import { IOS_UA } from './misc.js';
import req from './req.js';

// https://www.alipan.com/s/8stgXuDFsLy
export function getShareData(url) {
    let regex = /https:\/\/www\.alipan\.com\/s\/([^\\/]+)(\/folder\/([^\\/]+))?|https:\/\/www\.aliyundrive\.com\/s\/([^\\/]+)(\/folder\/([^\\/]+))?/;
    let matches = regex.exec(url);
    if (matches) {
        return {
            shareId: matches[1] || matches[4],
            folderId: matches[3] || matches[6] || 'root',
        };
    }
    return null;
}

const apiUrl = 'https://api.aliyundrive.com';
const openApiUrl = 'https://open.aliyundrive.com/adrive/v1.0';

let config = null;
const shareTokenCache = {};
let user = {};
let oauth = {};
let oriCfg = {};
let localDb = null;
const localTokenPath = '/alipan/tokens';
const saveDirName = 'CatVodOpen';
let saveDirId = null;

const baseHeaders = {
    'User-Agent': IOS_UA,
    Referer: 'https://www.aliyundrive.com/',
};

export async function initAli(db, cfg) {
    if (config) return;
    localDb = db;
    oriCfg = cfg;
    config = cfg;
    const localCfg = await db.getObjectDefault(localTokenPath, {});
    if (localCfg[oriCfg.token]) {
        config.token = localCfg[oriCfg.token];
    }
    if (localCfg[oriCfg.token280]) {
        config.token280 = localCfg[oriCfg.token280];
    }
}

/**
 * 字符串相似度匹配
 * @returns
 */
function lcs(str1, str2) {
    if (!str1 || !str2) {
        return {
            length: 0,
            sequence: '',
            offset: 0,
        };
    }

    var sequence = '';
    var str1Length = str1.length;
    var str2Length = str2.length;
    var num = new Array(str1Length);
    var maxlen = 0;
    var lastSubsBegin = 0;

    for (var i = 0; i < str1Length; i++) {
        var subArray = new Array(str2Length);
        for (var j = 0; j < str2Length; j++) {
            subArray[j] = 0;
        }
        num[i] = subArray;
    }
    var thisSubsBegin = null;
    for (i = 0; i < str1Length; i++) {
        for (j = 0; j < str2Length; j++) {
            if (str1[i] !== str2[j]) {
                num[i][j] = 0;
            } else {
                if (i === 0 || j === 0) {
                    num[i][j] = 1;
                } else {
                    num[i][j] = 1 + num[i - 1][j - 1];
                }

                if (num[i][j] > maxlen) {
                    maxlen = num[i][j];
                    thisSubsBegin = i - num[i][j] + 1;
                    if (lastSubsBegin === thisSubsBegin) {
                        // if the current LCS is the same as the last time this block ran
                        sequence += str1[i];
                    } else {
                        // this block resets the string builder if a different LCS is found
                        lastSubsBegin = thisSubsBegin;
                        sequence = ''; // clear it
                        sequence += str1.substr(lastSubsBegin, i + 1 - lastSubsBegin);
                    }
                }
            }
        }
    }
    return {
        length: maxlen,
        sequence: sequence,
        offset: thisSubsBegin,
    };
}

function findBestLCS(mainItem, targetItems) {
    const results = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetItems.length; i++) {
        const currentLCS = lcs(mainItem.name, targetItems[i].name);
        results.push({ target: targetItems[i], lcs: currentLCS });
        if (currentLCS.length > results[bestMatchIndex].lcs.length) {
            bestMatchIndex = i;
        }
    }

    const bestMatch = results[bestMatchIndex];

    return { allLCS: results, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(url, data, headers, retry) {
    headers = headers || {};
    const auth = url.startsWith('adrive/');
    Object.assign(headers, baseHeaders);
    if (auth) {
        Object.assign(headers, {
            Authorization: user.auth,
        });
    }

    const resp = await req
        .post(`${apiUrl}/${url}`, data, {
            headers: headers,
        })
        .catch((err) => {
            console.error(err);
            return err.response || { status: 500, data: {} };
        });
    const leftRetry = retry || 3;
    if (resp.status === 429 && leftRetry > 0) {
        await delay(1000);
        return await api(url, data, headers, leftRetry - 1);
    }
    return resp.data || {};
}

async function openApi(url, data, headers, retry) {
    headers = headers || {};
    Object.assign(headers, {
        Authorization: oauth.auth,
    });
    const resp = await req
        .post(`${openApiUrl}/${url}`, data, {
            headers: headers,
        })
        .catch((err) => {
            console.error(err);
            return err.response || { status: 500, data: {} };
        });
    const leftRetry = retry || 3;
    if (resp.status === 429 && leftRetry > 0) {
        await delay(1000);
        return await openApi(url, data, headers, leftRetry - 1);
    }
    return resp.data || {};
}

async function login() {
    if (!user.user_id || user.expire_time - dayjs().unix() < 120) {
        let loginResp = await req
            .post(
                'https://auth.aliyundrive.com/v2/account/token',
                {
                    refresh_token: config.token,
                    grant_type: 'refresh_token',
                },
                { headers: baseHeaders }
            )
            .catch((err) => {
                return err.response || { status: 500, data: {} };
            });
        if (loginResp.status == 200) {
            user = loginResp.data;
            user.expire_time = dayjs(loginResp.data.expire_time).unix();
            user.auth = `${user.token_type} ${user.access_token}`;
            config.token = user.refresh_token;
            await localDb.push(localTokenPath + '/' + oriCfg.token, user.refresh_token);
        }
    }
}

async function openAuth() {
    if (!oauth.access_token || oauth.expire_time - dayjs().unix() < 120) {
        let openResp = await req
            .post(
                'https://aliyundrive-oauth.messense.me/oauth/access_token',
                {
                    grant_type: 'refresh_token',
                    refresh_token: config.token280,
                },
                {
                    headers: baseHeaders,
                }
            )
            .catch((err) => {
                return err.response || { status: 500, data: {} };
            });
        if (openResp.status == 200) {
            oauth = openResp.data;
            const info = JSON.parse(CryptoJS.enc.Base64.parse(openResp.data.access_token.split('.')[1]).toString(CryptoJS.enc.Utf8));
            oauth.expire_time = info.exp;
            oauth.auth = `${oauth.token_type} ${oauth.access_token}`;
            config.token280 = oauth.refresh_token;
            await localDb.push(localTokenPath + '/' + oriCfg.token280, oauth.refresh_token);
        }
    }
}

async function clearSaveDir() {
    const listData = await openApi(`openFile/list`, {
        drive_id: user.drive.resource_drive_id,
        parent_file_id: saveDirId,
        limit: 100,
        order_by: 'updated_at',
        order_direction: 'DESC',
    });
    if (listData.items) {
        for (const item of listData.items) {
            const del = await openApi(`openFile/delete`, {
                drive_id: user.drive.resource_drive_id,
                file_id: item.file_id,
            });
            console.log(del);
        }
    }
}

async function createSaveDir(clean) {
    if (!user.device_id) return;
    if (saveDirId) {
        // 删除所有子文件
        if (clean) await clearSaveDir();
        return;
    }
    let driveInfo = await openApi(`user/getDriveInfo`, {});
    if (driveInfo.resource_drive_id) {
        user.drive = driveInfo;
        const resource_drive_id = driveInfo.resource_drive_id;
        const listData = await openApi(`openFile/list`, {
            drive_id: resource_drive_id,
            parent_file_id: 'root',
            limit: 100,
            order_by: 'updated_at',
            order_direction: 'DESC',
        });
        if (listData.items) {
            for (const item of listData.items) {
                if (item.name === saveDirName) {
                    saveDirId = item.file_id;
                    await clearSaveDir();
                    break;
                }
            }
            if (!saveDirId) {
                const create = await openApi(`openFile/create`, {
                    check_name_mode: 'refuse',
                    drive_id: resource_drive_id,
                    name: saveDirName,
                    parent_file_id: 'root',
                    type: 'folder',
                });
                console.log(create);
                if (create.file_id) {
                    saveDirId = create.file_id;
                }
            }
        }
    }
}

async function getShareToken(shareData) {
    if (!shareTokenCache[shareData.shareId] || shareTokenCache[shareData.shareId].expire_time - dayjs().unix() < 120) {
        delete shareTokenCache[shareData.shareId];
        const shareToken = await api(`v2/share_link/get_share_token`, {
            share_id: shareData.shareId,
            share_pwd: shareData.sharePwd || '',
        });
        if (shareToken.expire_time) {
            shareToken.expire_time = dayjs(shareToken.expire_time).unix();
            shareTokenCache[shareData.shareId] = shareToken;
        }
    }
}

const subtitleExts = ['srt', 'ass', 'scc', 'stl', 'ttml'];

export async function getFilesByShareUrl(shareInfo) {
    const shareData = typeof shareInfo === 'string' ? getShareData(shareInfo) : shareInfo;
    if (!shareData) return [];
    await getShareToken(shareData);
    if (!shareTokenCache[shareData.shareId]) return [];

    const videos = [];
    const subtitles = [];
    const listFile = async function (shareId, folderId, nextMarker) {
        const listData = await api(
            `adrive/v2/file/list_by_share`,
            {
                share_id: shareId,
                parent_file_id: folderId,
                limit: 200,
                order_by: 'name',
                order_direction: 'ASC',
                marker: nextMarker || '',
            },
            {
                'X-Share-Token': shareTokenCache[shareId].share_token,
            }
        );

        const items = listData.items;
        if (!items) return [];

        if (listData.next_marker) {
            const nextItems = await listFile(shareId, folderId, listData.next_marker);
            for (const item of nextItems) {
                items.push(item);
            }
        }

        const subDir = [];

        for (const item of items) {
            if (item.type === 'folder') {
                subDir.push(item);
            } else if (item.type === 'file' && item.category === 'video') {
                if (item.size < 1024 * 1024 * 5) continue;
                item.name = item.name.replace(/玩偶哥.*【神秘的哥哥们】/g, '');
                videos.push(item);
            } else if (item.type === 'file' && subtitleExts.some((x) => item.file_extension.endsWith(x))) {
                subtitles.push(item);
            }
        }

        for (const dir of subDir) {
            const subItems = await listFile(dir.share_id, dir.file_id);
            for (const item of subItems) {
                items.push(item);
            }
        }

        return items;
    };
    await listFile(shareData.shareId, shareData.folderId);
    if (subtitles.length > 0) {
        videos.forEach((item) => {
            var matchSubtitle = findBestLCS(item, subtitles);
            if (matchSubtitle.bestMatch) {
                item.subtitle = matchSubtitle.bestMatch.target;
            }
        });
    }

    return videos;
}

const saveFileIdCaches = {};

async function save(shareId, fileId, clean) {
    await login();
    await openAuth();
    await createSaveDir(clean);
    if (clean) {
        const saves = Object.keys(saveFileIdCaches);
        for (const save of saves) {
            delete saveFileIdCaches[save];
        }
    }
    if (!saveDirId) return null;
    await getShareToken({
        shareId: shareId,
    });
    if (!shareTokenCache[shareId]) return null;

    const saveResult = await api(
        `adrive/v2/file/copy`,
        {
            file_id: fileId,
            share_id: shareId,
            auto_rename: true,
            to_parent_file_id: saveDirId,
            to_drive_id: user.drive.resource_drive_id,
        },
        {
            'X-Share-Token': shareTokenCache[shareId].share_token,
        }
    );
    if (saveResult.file_id) return saveResult.file_id;
    return false;
}

export async function getLiveTranscoding(shareId, fileId) {
    if (!saveFileIdCaches[fileId]) {
        const saveFileId = await save(shareId, fileId, true);
        if (!saveFileId) return null;
        saveFileIdCaches[fileId] = saveFileId;
    }
    const transcoding = await openApi(`openFile/getVideoPreviewPlayInfo`, {
        file_id: saveFileIdCaches[fileId],
        drive_id: user.drive.resource_drive_id,
        category: 'live_transcoding',
        url_expire_sec: '14400',
    });
    if (transcoding.video_preview_play_info && transcoding.video_preview_play_info.live_transcoding_task_list) {
        return transcoding.video_preview_play_info.live_transcoding_task_list;
    }
    return null;
}

export async function getDownload(shareId, fileId) {
    if (!saveFileIdCaches[fileId]) {
        const saveFileId = await save(shareId, fileId, true);
        if (!saveFileId) return null;
        saveFileIdCaches[fileId] = saveFileId;
    }
    const down = await openApi(`openFile/getDownloadUrl`, {
        file_id: saveFileIdCaches[fileId],
        drive_id: user.drive.resource_drive_id,
    });
    if (down.url) {
        return down;
    }
    return null;
}
