import cssClass from '@/components/common/overview.component.module.scss';
import { twMerge } from 'tailwind-merge';
import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface itemProps {
  text: string;
  content: string;
  type: 'usd' | 'percent' | 'health' | string;
}

interface itemsProps extends Array<itemProps> {}

interface overviewProps {
  itemLeft: itemsProps;
  itemRight: itemsProps;
}

export default function OverviewComponent(props: overviewProps) {
  const renderItem = (item: itemProps) => {
    return (
      <div className={`item ${item.type === 'health' ? 'highlight' : ''}`}>
        <div className="overview-title">{item.text}</div>
        <div className="overview-content">
          {item.type === 'usd' && <span className="overview-symbol mr-1">$</span>}
          {item.content}
          {item.type === 'percent' && <span className="overview-symbol ml-1">%</span>}
          {item.type === 'health' && (
            <span className="flex">
              B
              <Tooltip placement="top" title={'a'} className="ml-1">
                <InfoCircleOutlined />
              </Tooltip>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={twMerge(cssClass.overviewComponent)}>
      <div className="overview-container">
        <article>{props.itemLeft?.map((item: itemProps) => renderItem(item))}</article>
        <aside>{props.itemRight?.map((item: itemProps) => renderItem(item))}</aside>
      </div>
    </div>
  );
}
