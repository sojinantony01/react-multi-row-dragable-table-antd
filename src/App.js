import React from "react";
import "antd/dist/antd.css";

import { Table } from "antd";
import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from "react-sortable-hoc";
import { MenuOutlined } from "@ant-design/icons";
import data from './data.json'

const DragHandle = sortableHandle(({active}) => (
  <MenuOutlined style={{ cursor: "grab", color: active ? "blue":"#999" }} />
));


const SortableItem = sortableElement((props) =><tr {...props} />);
const SortableContainer = sortableContainer((props) => <tbody {...props} />);

class SortableTable extends React.Component {
  state = {
    dataSource: data,
    selectedItems: []
  };

  getColumns() {
    return [
      {
        title: "Sort",
        dataIndex: "",
        width: 30,
        className: "drag-visible",
        render: (d, dd, i) => (
          <>

            <DragHandle active={this.state.selectedItems.includes(i)}/>
          </>
        )
      },
      {
        title: "Name",
        dataIndex: "name",
        className: "drag-visible"
      },
      {
        title: "Age",
        dataIndex: "age"
      },
      {
        title: "Address",
        dataIndex: "address"
      }
    ];
  }
  merge(a, b, i = 0) {
    let aa = [...a];
    return [...a.slice(0, i), ...b, ...aa.slice(i, aa.length)];
  }
  onSortEnd = ({ oldIndex, newIndex }) => {
    const { dataSource, selectedItems } = this.state;
    let tempDataSource = dataSource;

    if (oldIndex !== newIndex) {
      if (!selectedItems.length) {
        let movingItem = tempDataSource[oldIndex]
        tempDataSource.splice(oldIndex, 1)
        tempDataSource = this.merge(tempDataSource, [movingItem], newIndex)
      } else {
        let filteredItems = [];
        selectedItems.forEach((d) => {
          filteredItems.push(tempDataSource[d]);
        });
        let newData = [];
        tempDataSource.forEach((d, i) => {
          if (!selectedItems.includes(i)) {
            newData.push(d);
          }
        });
        tempDataSource = [...newData];
        tempDataSource = this.merge(tempDataSource, filteredItems, newIndex);
      }
      this.setState({ dataSource: tempDataSource, selectedItems: [] });
    }
  };

  DraggableContainer = (props) => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={this.onSortEnd}
      {...props}
    />
  );

  DraggableBodyRow = ({ className, style, ...restProps }) => {
    const { dataSource } = this.state;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x) => x.index === restProps["data-row-key"]
    );
    return (
      <SortableItem
        index={index}
        {...restProps}
        selected={this.state.selectedItems.length}
        onClick={(e) => {
            if(e.ctrlKey || e.metaKey) {
              let {selectedItems} = this.state;
              selectedItems.includes(index)
                ? selectedItems.splice(
                    selectedItems.indexOf(index),
                    1
                  )
                : selectedItems.push(index);
                this.setState({...selectedItems}) 
              } else {this.setState({selectedItems:[]})}
        }}
      />
    );
  };

  render() {
    const { dataSource, selectedItems } = this.state;
    return (
        <>

      <h3>"CNTRL + Click" to select multiple items</h3>

      <Table
        pagination={false}
        dataSource={dataSource}
        columns={this.getColumns()}
        rowKey="index"

        components={{
          body: {
            wrapper: this.DraggableContainer,
            row: this.DraggableBodyRow
          }
        }}
      />
      {selectedItems.length ? <>{selectedItems.length} items selected </> : ''}
      </>
    );
  }
}

export default SortableTable