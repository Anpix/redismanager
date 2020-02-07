import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Icon } from 'antd';
import Highlighter from 'react-highlight-words';
import u from '../utils/utils';

class ZSetTable extends Component {
    state = {
        searchText: '',
        searchedColumn: '',
    };

    componentDidUpdate(prevProps) {
        if (prevProps.key !== this.props.key) {
            this.getListElements();
        }
    }

    componentDidMount() {
        this.getListElements();
    }

    getListElements = () => {
        this.props.dispatch({
            type: 'zset/getZSetElements',
            redisKey: this.props.redisKey,
            db: this.props.selectedDB,
        });
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
            </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
            </Button>
            </div>
        ),
        filterIcon: filtered => (
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text.toString()}
                />
            ) : (
                    text
                ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    showEditor = (record) => {
        this.props.dispatch({
            type: 'editor/show',
            payload: {
                editingEntry: {
                    Key: this.props.redisKey,
                    Type: 'zset',
                    Field: record.Value,
                    isNew: false,
                },
            },
        });
    }

    onRow = (record) => {
        return {
            onClick: event => this.showEditor(record), // 点击行
        };
    };

    columns = [
        {
            title: 'Score',
            dataIndex: 'Field',
            key: 'Field',
            defaultSortOrder: "ascend",
            sorter: (a, b) => a.Field - b.Field,
            ...this.getColumnSearchProps('Field'),
        },
        {
            title: 'Member',
            dataIndex: 'Value',
            key: 'Value',
            sorter: (a, b) => a.Value.localeCompare(b.Value),
            ...this.getColumnSearchProps('Value'),
        }
    ]

    render() {
        const data = []
        if (!u.isNoW(this.props.list)) {
            var list = this.props.list[this.props.redisKey]
            if (!u.isNoW(list)) {
                for (var i in list) {
                    data.push({ "Field": list[i].Score, "Value": list[i].Member })
                }
            }
        }
        let pageSize = 10
        if (!u.isNoW(this.props.configs) && !u.isNoW(this.props.configs.PageSize) && !u.isNoW(this.props.configs.PageSize.SubList)) {
            pageSize = this.props.configs.PageSize.SubList
        }
        return (
            <Table rowKey={x => x.Value}
                className="sublist"
                rowClassName="pointer"
                onRow={this.onRow}
                columns={this.columns}
                dataSource={data}
                pagination={{ pageSize: pageSize }}
                size="small"
                loading={this.props.isBusy} />
        )
    }
}

function mapStateToProps(state) {
    const s = state["zset"];
    const layout = state["layout"];
    return { list: s.list, isBusy: s.isBusy, configs: layout.configs };
}

export default connect(mapStateToProps)(ZSetTable)