import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Icon } from 'antd';
import Highlighter from 'react-highlight-words';
import u from '../utils/utils'

class SetTable extends Component {
    state = {
        searchText: '',
        searchedColumn: '',
    };
    
    componentDidUpdate(prevProps) {
        if (prevProps.key !== this.props.key) {
            this.getListElements()
        }
    }

    componentDidMount() {
        this.getListElements()
    }

    getListElements = () => {
        this.props.dispatch({
            type: 'set/getSetElements',
            redisKey: this.props.redisKey
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

    columns = [
        {
            title: 'Member',
            dataIndex: 'Field',
            key: 'Field',
            defaultSortOrder: "ascend",
            sorter: (a, b) => a.Field.localeCompare(b.Field),
            ...this.getColumnSearchProps('Field'),
        }
    ]

    render() {
        const data = []
        if (!u.isNoW(this.props.list)) {
            var list = this.props.list[this.props.redisKey]
            if (!u.isNoW(list)) {
                for (var i in list) {
                    data.push({ "Field": list[i] })
                }
            }
        }
        return (
            <Table rowKey={x => x.Field}
                className="sublist"
                columns={this.columns}
                dataSource={data}
                pagination={{ pageSize: 5 }}
                size="small"
                loading={this.props.isBusy} />
        )
    }
}

function mapStateToProps(state) {
    const s = state["set"]
    return { list: s.list, isBusy: s.isBusy };
}

export default connect(mapStateToProps)(SetTable)