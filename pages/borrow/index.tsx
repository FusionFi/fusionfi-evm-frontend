import cssClass from '@/pages/borrow/index.module.scss';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { twMerge } from 'tailwind-merge';
import SelectComponent from '@/components/common/select.component';
import TitleComponent from '@/components/common/title.component';
import OverviewComponent from '@/components/common/overview.component';
import { useTranslation } from 'next-i18next';
import { TYPE_COMMON } from '@/constants/common.constant';
import LoansComponent from '@/components/borrow/loans.component';
import AssetComponent from '@/components/borrow/asset.component';

export default function BorrowPage() {
  const { t } = useTranslation('common');

  const itemLeft = [
    {
      text: t('BORROW_OVERVIEW_BALANCE'),
      content: ' 1,875.00',
      type: TYPE_COMMON.USD,
    },
    {
      text: t('BORROW_OVERVIEW_COLLATERAL'),
      content: ' 1,875.00',
      type: TYPE_COMMON.USD,
    },
  ];

  const itemRight = [
    {
      text: t('BORROW_OVERVIEW_APR'),
      content: '0.07',
      type: TYPE_COMMON.PERCENT,
    },
    {
      text: t('BORROW_OVERVIEW_FINANCE_HEALTH'),
      content: '1.66',
      type: TYPE_COMMON.FINANCE_HEALTH,
    },
  ];

  return (
    <div className={twMerge('borrow-page-container', cssClass.borrowPage)}>
      <div className="borrow-header">
        <TitleComponent text={t('BORROW_OVERVIEW_TITLE')}>
          <SelectComponent />
        </TitleComponent>
      </div>
      <div className="mb-4">
        <OverviewComponent itemLeft={itemLeft} itemRight={itemRight} />
      </div>
      <div className="flex gap-6 borrow-inner">
        <div className="xl:basis-1/2 basis-full">
          <LoansComponent />
        </div>
        <div className="xl:basis-1/2 basis-full">
          <AssetComponent />
        </div>
      </div>
    </div>
  );
}
export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
