import { extend } from 'umi-request';
import u from '@/u'

const request = extend({
    prefix: u.LocalRootURL() + "api",
});

export async function GetKeys(query: any) {
    query.match = query.match ?? "";
    const url = '/servers/' + query.serverID + '/' + query.nodeID + '/' + query.db + '?Cursor=' + query.cursor + "&Count=" + query.count + "&Match=" + encodeURIComponent(query.match);
    const r = await request.get(url)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function GetKey(query: any) {
    const url = '/servers/' + query.serverID + '/' + query.nodeID + '/' + query.db + "/" + encodeURIComponent(query.key);
    const r = await request.get(url)
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}

export async function GetValue(query: any) {
    const url = '/servers/' + query.serverID + '/' + query.nodeID + '/' + query.db + "/" + encodeURIComponent(query.key) + "/" + encodeURIComponent(query.field);
    const r = await request.get(url, {
        responseType: "text",
    })
        .then(function (resp) {
            return resp;
        })
        .catch(function (err) {
            console.error(err);
        });

    return r;
}