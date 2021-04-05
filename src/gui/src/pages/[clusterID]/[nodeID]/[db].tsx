import { PageContainer } from '@ant-design/pro-layout';
import { Table, Button, Space, Input, Form, Card } from 'antd';
import { connect } from 'umi'
import { MoreOutlined, SearchOutlined } from '@ant-design/icons'


const KeyListPage = (props: any) => {
    const { menuState, keyListState, keyListLoading, match, dispatch } = props;
    const { cluster } = menuState;

    let node: any;
    for (let i = 0; i < cluster.Nodes.length; i++) {
        node = cluster.Nodes[i];
        if (node.ID == match.params.nodeID) {
            break;
        }
    }
    let inited = node != undefined;

    let breadcrumbRoutes: any[] = [];
    let table: any = null;
    let searchBar: any = null;
    if (inited) {
        const [searchForm] = Form.useForm();

        breadcrumbRoutes = [
            { path: '', breadcrumbName: cluster.Name, },
            { path: '', breadcrumbName: node.Addr, },
            { path: '', breadcrumbName: 'db' + match.params.db, },
        ];

        ////////// search bar
        searchBar = <Card>

        </Card>;

        ////////// table
        const columns = [
            {
                title: "Key",
                dataIndex: "Key",
                // filterDropdown: () => (
                //     <Form form={searchForm}
                //         style={{ padding: 8 }}
                //         onFinish={(values) => {
                //             console.log(values);
                //             dispatch({ type: "keyListVM/getEntries", query: {} });
                //         }}>
                //         <Form.Item name="match">
                //             <Input />
                //         </Form.Item>
                //         {/* <Input style={{ width: 188, marginBottom: 8, display: 'block' }} /> */}
                //         <Space>
                //             <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
                //             <Button style={{ width: 90 }} size="small" onClick={() => searchForm.resetFields()}>Reset</Button>
                //         </Space>
                //     </Form >
                // ),
                filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            }
        ];
        const footer = keyListState.hasMore ? () => <div style={{ textAlign: "center" }}>
            <Button type="link" icon={<MoreOutlined />} onClick={() => dispatch({ type: "keyListVM/loadMore" })}>more...</Button>
        </div> : undefined;

        table = <Table
            dataSource={keyListState.entries}
            rowKey="Key"
            columns={columns}
            pagination={{ pageSize: 20 }}
            loading={keyListLoading}
            size="small"
            footer={footer}
        >
        </Table>;
    }

    return (
        <PageContainer
            loading={!inited}
            header={{ breadcrumb: { routes: breadcrumbRoutes, }, }}
        >
            {searchBar}
            {table}
        </PageContainer>
    );
};

export default connect(({ menuVM, keyListVM, loading }: any) => ({
    menuState: menuVM,
    keyListState: keyListVM,
    keyListLoading: loading.models.keyListVM,
}))(KeyListPage);
