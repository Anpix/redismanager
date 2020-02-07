import { getZSetElements } from '../services/api';

export default {
    namespace: 'zset',

    state: {
        // db: 0,
        list: {},
        isBusy: false
    },

    effects: {
        *getZSetElements({ db, redisKey }, { call, put }) {
            // yield put({ type: 'setDB', payload: { db } });
            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const resp = yield call(getZSetElements, db, redisKey);
            yield put({ type: 'saveList', payload: { redisKey: redisKey, list: resp } });
            yield put({ type: 'setBusy', payload: { isBusy: false } });
        }
    },

    reducers: {
        saveList(state, { payload: { redisKey, list } }) {
            state.list[redisKey] = list;
            return state
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            }
        },
        // setDB(state, { payload: { db } }) {
        //     return {
        //         ...state,
        //         db
        //     }
        // }
    },
};