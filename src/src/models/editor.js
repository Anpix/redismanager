import { getEntry, saveEntry } from '../services/api';
import vkbeautify from 'vkbeautify'
import u from '../utils/utils';

const format = (mode, input, min) => {
    if (min) {
        if (mode === "javascript") {
            input = vkbeautify.jsonmin(input);
        } else if (mode === "xml") {
            input = vkbeautify.xmlmin(input);
        }
    } else {
        if (mode === "javascript") {
            input = vkbeautify.json(input, 2);
        } else if (mode === "xml") {
            input = vkbeautify.xml(input, 2);
        }
    }

    return input;
};

const getMode = (value) => {
    let valueEditorMode = 'text';
    if (u.isJson(value)) {
        valueEditorMode = "javascript";
    } else if (u.isXml(value)) {
        valueEditorMode = "xml";
    }
    return valueEditorMode;
};

export default {
    namespace: 'editor',

    state: {
        db: 0,
        backupEntry: {},    // Backup entry, for undo using
        editingEntry: {},   // Editing entry, for editing using
        valueEditorMode: 'text',
        fieldCaption: '',
        isLoading: false,
        isBusy: false,
        visible: false,

        keyEditorEnabled: true,
        fieldEditorEnabled: true,
        ttlEditorEnabled: false,
        valueEditorEnabled: true,
        valueEditorWidth: '88vw',
    },

    effects: {
        *save({ _ }, { call, put, select }) {
            const state = yield select(states => states["editor"]);

            yield put({ type: 'setBusy', payload: { isBusy: true } });
            const msgCode = yield call(saveEntry, state.db, state.editingEntry, state.backupEntry);
            yield put({ type: 'setBusy', payload: { isBusy: false } });

            if (u.isSuccess(msgCode)) {
                yield put({ type: 'hide' });
                yield put({ type: 'keyList/refreshEntry', key: state.editingEntry.Key });
            }
        },
        *show({ payload: { db, editingEntry } }, { call, put }) {
            yield put({ type: 'init', payload: { db, editingEntry } });
            if (!editingEntry.isNew) {
                // load from db
                yield put({ type: 'setLoading', payload: { isLoading: true } });
                const resp = yield call(getEntry, db, editingEntry.Key, editingEntry.Field);
                yield put({ type: 'setLoading', payload: { isLoading: false } });
                yield put({ type: 'setEntry', payload: { entry: resp } });
            }
        },
    },

    reducers: {
        init(state, { payload: { db, editingEntry } }) {
            if (u.isNoW(db)) {
                db = 0;
                console.warn("db does not set.");
            }
            state.db = db;

            if (editingEntry.Type === "string") {
                state.ttlEditorEnabled = true;
                state.keyEditorEnabled = true;
                state.fieldEditorEnabled = false;
                state.valueEditorEnabled = true;
            }
            else {
                state.valueEditorEnabled = !u.isNoW(editingEntry.Field);
                state.ttlEditorEnabled = !state.valueEditorEnabled;
                state.keyEditorEnabled = !state.valueEditorEnabled;
                state.fieldEditorEnabled = state.valueEditorEnabled && (editingEntry.Type === "hash" || editingEntry.Type === "zset");
            }

            ////////// field caption
            if (editingEntry.Type === "zset") {
                state.fieldCaption = "score";
            } else if (editingEntry.Type === "list") {
                state.fieldCaption = "index";
            } else {
                state.fieldCaption = "filed";
            }

            ////////// new
            if (editingEntry.isNew) {
                state.editingEntry.IsNew = true;
                state.editingEntry.Type = editingEntry.Type;
                state.editingEntry.Key = editingEntry.Key;
                state.editingEntry.Value = '';
                state.editingEntry.Field = '';
                state.editingEntry.TTL = -1;

                state.keyEditorEnabled = true;
                state.valueEditorEnabled = true;
                state.ttlEditorEnabled = editingEntry.Type === "string";
                state.fieldEditorEnabled = editingEntry.Type === "hash" || editingEntry.Type === "zset";
            }

            return {
                ...state,
                editingEntry: state.editingEntry,
                visible: true,
            }
        },
        hide(state, { _ }) {
            return {
                ...state,
                visible: false,
            }
        },
        beautify(state, { payload: { valueEditorMode } }) {
            const newValue = format(valueEditorMode, state.editingEntry.Value, false);

            return {
                ...state,
                editingEntry: {
                    ...state.editingEntry,
                    Value: newValue
                }
            }
        },
        minify(state, { payload: { valueEditorMode } }) {
            const newValue = format(valueEditorMode, state.editingEntry.Value, true);

            return {
                ...state,
                editingEntry: {
                    ...state.editingEntry,
                    Value: newValue
                }
            }
        },
        setKey(state, { payload: { key } }) {
            return {
                ...state,
                editingEntry: {
                    ...state.editingEntry,
                    Key: key
                }
            }
        },
        setField(state, { payload: { field } }) {
            return {
                ...state,
                editingEntry: {
                    ...state.editingEntry,
                    Field: field
                }
            }
        },
        setTTL(state, { payload: { ttl } }) {
            let newValue = parseInt(ttl);
            if (isNaN(newValue) || newValue <= 0) {
                newValue = -1;
            }
            return {
                ...state,
                editingEntry: {
                    ...state.editingEntry,
                    TTL: newValue
                }
            }
        },
        setValue(state, { payload: { value } }) {
            const valueEditorMode = getMode(value);

            if (state.valueEditorMode !== valueEditorMode) {
                return {
                    ...state,
                    valueEditorMode,
                    editingEntry: {
                        ...state.editingEntry,
                        Value: value
                    }
                }
            } else {
                state.editingEntry.Value = value;
                return state;
            }
        },
        setEntry(state, { payload: { entry } }) {
            const valueEditorMode = getMode(entry.Value);

            entry.isNew = false;
            return {
                ...state,
                backupEntry: u.deepClone(entry),
                editingEntry: entry,
                valueEditorMode,
            }
        },
        setBusy(state, { payload: { isBusy } }) {
            return {
                ...state,
                isBusy
            }
        },
        setLoading(state, { payload: { isLoading } }) {
            return {
                ...state,
                isLoading
            }
        },
    },
};