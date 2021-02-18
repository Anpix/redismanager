import { Breadcrumb, Button, Modal, Space, Table } from 'antd';
import { HomeOutlined, EditOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';
import React from 'react';
import { connect, Dispatch, ILayoutModelState, Loading } from 'umi';
import { ColumnProps } from 'antd/lib/table';
import ServerEditor from '@/components/ServerEditor';

interface IPageProps {
  model: ILayoutModelState;
  loading: boolean;
  dispatch: Dispatch;
}

class Dashboard extends React.Component<IPageProps> {

  showEditor = (record: any) => {
    this.props.dispatch({
      type: 'serverEditor/show',
      payload: {
        Server: record,
      },
    });
  }

  deleteServer = (record: any) => {
    const { dispatch } = this.props;
    Modal.confirm({
      title: 'Do you want to delete this server?',
      content: 'This operation cannot be undone.',
      onOk() {
        dispatch({
          type: 'layout/deleteServer',
          payload: {
            ID: record.ID,
          },
        });
      },
    });
  }

  _columns: ColumnProps<any>[] = [
    {
      title: 'Name',
      dataIndex: 'Name',
      // defaultSortOrder: "ascend",
      // sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
      // ...this.getColumnSearchProps("Key"),
      // onCell: this.showEditor,
      // className: "pointer",
    },
    {
      title: 'Server Node(s)',
      dataIndex: 'Addrs',
      render: addrs => <span>{addrs.join(", ")}</span>,
      // defaultSortOrder: "ascend",
      // sorter: (a: any, b: any) => a.Key.localeCompare(b.Key),
      // ...this.getColumnSearchProps("Key"),
      // onCell: this.showEditor,
      // className: "pointer",
    },
    // {
    //   title: 'Type',
    //   dataIndex: 'Type',
    //   sorter: (a: any, b: any) => a.Type.localeCompare(b.Type),
    //   width: 100,
    //   filters: [{ text: 'hash', value: 'hash' }, { text: 'string', value: 'string' }, { text: 'list', value: 'list' }, { text: 'set', value: 'set' }, { text: 'zset', value: 'zset' }],
    //   onFilter: (value: any, record: any) => record.Type.includes(value),
    // },
    // {
    //   title: 'Length',
    //   dataIndex: 'Length',
    //   width: 100,
    //   align: "right",
    //   sorter: (a: any, b: any) => a.Length - b.Length,
    // },127.0.0.1:6381, 192.168.188.166:6380
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: "right",
      render: (_, record) => (
        <Space size="small" direction="horizontal">
          <Button size="small" type="primary" title="Edit" onClick={() => this.showEditor(record)}><EditOutlined /></Button>
          <Button size="small" type="primary" danger title="Delete" onClick={() => this.deleteServer(record)}><DeleteOutlined /></Button>
        </Space>
      ),
    },
  ];

  render() {
    const { model, loading } = this.props;
    return (
      <div>
        <Breadcrumb style={{ marginBottom: 10 }}>
          <Breadcrumb.Item><HomeOutlined /> Servers</Breadcrumb.Item>
        </Breadcrumb>
        <div className="toolbar">
          <Button size="small" type="primary" onClick={() => this.showEditor({
            ID: "",
            Name: "",
            Addrs: [],
            Password: "",
          })}><FileAddOutlined /> New Server(s)</Button>
          {/* <Button size="small" type="default" title="Refresh" onClick={this.refresh}><RedoOutlined /></Button>
          <Button size="small" type="default" title="Export" disabled={!hasSelection} onClick={this.exportFile}><ExportOutlined /></Button>
          <Button size="small" type="primary" danger title="Delete" disabled={!hasSelection} onClick={this.deleteKeys}><DeleteOutlined /></Button> */}
        </div>
        <Table
          rowKey="ID"
          dataSource={model.Servers}
          columns={this._columns}
          loading={loading}
          bordered={true}
          size="small"
        />

        <ServerEditor />
      </div>
    );
  }
}

export default connect(({ layout, loading }: { layout: ILayoutModelState; loading: Loading }) => ({
  model: layout,
  loading: loading.models.layout,
}))(Dashboard);