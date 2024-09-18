import cssClass from '@/components/common/overview.component.module.scss';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { TYPE_COMMON } from '@/constants/common.constant';

interface ItemProps {
  text: any;
  content: any;
  type: any;
}

interface ItemsProps extends Array<ItemProps> {}

interface OverviewProps {
  itemLeft: ItemsProps;
  itemRight: ItemsProps;
}

export default function OverviewComponent(props: OverviewProps) {
  const renderItem = (item: ItemProps) => {
    return (
      <div
        key={item.text}
        className={`item ${item.type === TYPE_COMMON.FINANCE_HEALTH ? 'highlight' : ''}`}>
        <div className="overview-title">{item.text}</div>
        <div className="overview-content">
          {item.type === TYPE_COMMON.USD && <span className="overview-symbol mr-1">$</span>}
          {parseFloat(item.content).toFixed(2) ?? 0}
          {item.type === TYPE_COMMON.PERCENT && <span className="overview-symbol ml-1">%</span>}
          {item.type === TYPE_COMMON.FINANCE_HEALTH && (
            <span className="flex">
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
        <article>{props.itemLeft?.map((item: ItemProps) => renderItem(item))}</article>
        <aside>{props.itemRight?.map((item: ItemProps) => renderItem(item))}</aside>
      </div>
    </div>
  );
}
