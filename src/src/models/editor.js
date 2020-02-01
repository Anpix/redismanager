import { getEntry, saveEntry } from '../services/api';
import vkbeautify from 'vkbeautify'
import u from '../utils/utils';

export default {
    namespace: 'editor',

    state: {
        backupEntry: {},    // Backup entry, for undo using
        editingEntry: {},   // Editing entry, for editing using
        valueEditorMode: 'text',
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
            const resp = yield call(saveEntry, state.editingEntry, state.backupEntry);
            yield put({ type: 'setBusy', payload: { isBusy: false } });
            if (resp === "") {
                yield put({ type: 'hide' });
            }
        },
        *show({ editingEntry }, { call, put, select }) {
            yield put({ type: 'init', editingEntry });
            if (!editingEntry.isNew) {
                // load from db
                yield put({ type: 'setLoading', payload: { isLoading: true } });
                const resp = yield call(getEntry, editingEntry.Key, editingEntry.Field);
                yield put({ type: 'setLoading', payload: { isLoading: false } });
                yield put({ type: 'setEntry', payload: { entry: resp } });
            }
        },
    },

    reducers: {
        init(state, { editingEntry }) {

            if (editingEntry.isNew) {
                state.editingEntry.Type = editingEntry.Type;
                state.editingEntry.Key = '';
                state.editingEntry.Value = '';
                state.editingEntry.Field = '';
                if (editingEntry.Type === "string") {
                    state.fieldEditorEnabled = false;
                    state.ttlEditorEnabled = true;
                } else {
                    state.fieldEditorEnabled = true;
                    state.ttlEditorEnabled = false;
                }
            } else {
                if (editingEntry.Type === "string") {
                    state.fieldEditorEnabled = false;
                    state.ttlEditorEnabled = true;
                    state.valueEditorEnabled = true;
                } else {
                    state.ttlEditorEnabled = true;
                    state.valueEditorEnabled = state.editingEntry.Field !== "";
                    state.fieldEditorEnabled = state.valueEditorEnabled;
                }
            }


            return {
                ...state,
                editingEntry,
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
            let newValue = state.editingEntry.Value;
            if (valueEditorMode === "javascript") {
                newValue = vkbeautify.json(newValue, 2);
            } else if (valueEditorMode === "xml") {
                newValue = vkbeautify.xml(newValue, 2);
            }

            return {
                ...state,
                editingEntry: {
                    ...state.editingEntry,
                    Value: newValue
                }
            }
        },
        minify(state, { payload: { valueEditorMode } }) {
            let newValue = state.editingEntry.Value;
            if (valueEditorMode === "javascript") {
                newValue = vkbeautify.jsonmin(newValue);
            } else if (valueEditorMode === "xml") {
                newValue = vkbeautify.xmlmin(newValue);
            }

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
            let valueEditorMode = 'text';
            if (u.isJson(value)) {
                valueEditorMode = "javascript";
            } else if (u.isXml(value)) {
                valueEditorMode = "xml";
            }

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
            let valueEditorMode = 'text';
            if (u.isJson(entry.Value)) {
                valueEditorMode = "javascript";
            } else if (u.isXml(entry.Value)) {
                valueEditorMode = "xml";
            }

            entry.isNew = false;
            return {
                ...state,
                backupEntry: entry,
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